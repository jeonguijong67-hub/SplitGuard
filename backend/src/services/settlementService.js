const db = require('../config/DB');

/**
 * deposit_memo 생성: "이름 + 랜덤 2자리 숫자"
 * e.g. 오정빈77
 */
function generateDepositMemo(userName) {
  const suffix = String(Math.floor(Math.random() * 90) + 10); // 10~99
  return `${userName}${suffix}`;
}

/**
 * 차수별 정산 계산 + settlements 저장
 *
 * 알고리즘:
 * 1. 각 차수의 total_amount / 해당 차수 참여자 수 = 1인당 금액 (올림)
 * 2. 참여자별 차수 금액 합산
 * 3. 총대(leader)는 자신의 몫을 제외한 나머지를 수령
 *
 * @param {number} moimId
 * @param {Array}  rounds - [{ round_number, location_name, total_amount, participant_ids }]
 * @returns {Array} settlements
 */
function calcAndSaveSettlements(moimId, rounds) {
  const moim = db.prepare('SELECT * FROM moims WHERE id = ?').get(moimId);
  if (!moim) throw Object.assign(new Error('모임을 찾을 수 없습니다.'), { status: 404 });

  const leaderId = moim.leader_id;

  // 참여자별 누적 금액 Map: userId -> amount
  const amountMap = new Map();

  // 차수 저장 + 참여자별 금액 계산
  const processRounds = db.transaction(() => {
    // 기존 차수/정산 초기화
    db.prepare('DELETE FROM rounds WHERE moim_id = ?').run(moimId);
    db.prepare('DELETE FROM settlements WHERE moim_id = ?').run(moimId);

    for (const round of rounds) {
      const { round_number, location_name, total_amount, participant_ids } = round;

      if (!participant_ids?.length) continue;

      // 차수 저장
      const roundResult = db.prepare(`
        INSERT INTO rounds (moim_id, round_number, location_name, total_amount)
        VALUES (?, ?, ?, ?)
      `).run(moimId, round_number, location_name || null, total_amount);

      const roundId = roundResult.lastInsertRowid;

      // 차수 참여자 저장
      const insertRP = db.prepare('INSERT INTO round_participants (round_id, user_id) VALUES (?, ?)');
      for (const uid of participant_ids) insertRP.run(roundId, uid);

      // 1인당 금액 (올림)
      const perPerson = Math.ceil(total_amount / participant_ids.length);

      // 총대를 제외한 참여자만 납부 대상
      for (const uid of participant_ids) {
        if (uid === leaderId) continue; // 총대는 자기 돈 안 보냄
        amountMap.set(uid, (amountMap.get(uid) || 0) + perPerson);
      }
    }
  });

  processRounds();

  // settlements 생성
  const settlements = [];
  const insertSettlement = db.prepare(`
    INSERT INTO settlements (moim_id, sender_id, receiver_id, amount, deposit_memo, status)
    VALUES (?, ?, ?, ?, ?, 'PENDING')
  `);

  const saveSettlements = db.transaction(() => {
    for (const [userId, amount] of amountMap.entries()) {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (!user) continue;

      const depositMemo = generateDepositMemo(user.name);
      const result = insertSettlement.run(moimId, userId, leaderId, amount, depositMemo);

      settlements.push({
        settlement_id: result.lastInsertRowid,
        sender_id: userId,
        receiver_id: leaderId,
        amount,
        deposit_memo: depositMemo,
        status: 'PENDING',
      });
    }
  });

  saveSettlements();
  return settlements;
}

module.exports = { calcAndSaveSettlements, generateDepositMemo };