const express = require('express');
const router = express.Router();
const db = require('../config/DB');
const { calcAndSaveSettlements } = require('../services/settlementService');

// ────────────────────────────────────────────────
// [POST] /moims  - 모임 방 생성
// ────────────────────────────────────────────────
router.post('/', (req, res, next) => {
  try {
    const { leader_id, moim_name } = req.body;

    if (!leader_id || !moim_name) {
      return res.status(400).json({ message: 'leader_id와 moim_name은 필수입니다.' });
    }

    const leader = db.prepare('SELECT * FROM users WHERE id = ?').get(leader_id);
    if (!leader) return res.status(404).json({ message: '존재하지 않는 유저입니다.' });

    const result = db.prepare(`
      INSERT INTO moims (moim_name, leader_id) VALUES (?, ?)
    `).run(moim_name, leader_id);

    // 총대도 자동으로 멤버에 추가
    db.prepare('INSERT OR IGNORE INTO moim_members (moim_id, user_id) VALUES (?, ?)').run(result.lastInsertRowid, leader_id);

    const moim = db.prepare('SELECT * FROM moims WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      moim_id: moim.id,
      moim_name: moim.moim_name,
      leader_id: moim.leader_id,
      created_at: moim.created_at,
    });
  } catch (err) { next(err); }
});

// ────────────────────────────────────────────────
// [POST] /moims/:moim_id/members  - 멤버 추가
// ────────────────────────────────────────────────
router.post('/:moim_id/members', (req, res, next) => {
  try {
    const moimId = Number(req.params.moim_id);
    const { user_ids } = req.body;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ message: 'user_ids 배열이 필요합니다.' });
    }

    const moim = db.prepare('SELECT * FROM moims WHERE id = ?').get(moimId);
    if (!moim) return res.status(404).json({ message: '모임을 찾을 수 없습니다.' });

    const insertMember = db.prepare('INSERT OR IGNORE INTO moim_members (moim_id, user_id) VALUES (?, ?)');
    const addMembers = db.transaction(() => {
      for (const uid of user_ids) insertMember.run(moimId, uid);
    });
    addMembers();

    const totalCount = db.prepare('SELECT COUNT(*) as cnt FROM moim_members WHERE moim_id = ?').get(moimId).cnt;

    res.status(200).json({
      moim_id: moimId,
      added_members: user_ids,
      total_member_count: totalCount,
    });
  } catch (err) { next(err); }
});

// ────────────────────────────────────────────────
// [POST] /moims/:moim_id/settle  - 차수별 정산 요청 ⭐
// ────────────────────────────────────────────────
router.post('/:moim_id/settle', (req, res, next) => {
  try {
    const moimId = Number(req.params.moim_id);
    const { rounds } = req.body;

    if (!Array.isArray(rounds) || rounds.length === 0) {
      return res.status(400).json({ message: 'rounds 배열이 필요합니다.' });
    }

    // 각 round 유효성 검사
    for (const r of rounds) {
      if (!r.total_amount || !Array.isArray(r.participant_ids) || r.participant_ids.length === 0) {
        return res.status(400).json({
          message: '각 round에 total_amount와 participant_ids가 필요합니다.',
          round: r,
        });
      }
    }

    const settlements = calcAndSaveSettlements(moimId, rounds);

    res.status(200).json({
      moim_id: moimId,
      settlements,
    });
  } catch (err) { next(err); }
});

// ────────────────────────────────────────────────
// [GET] /moims/:moim_id/settlements  - 정산 현황 조회
// ────────────────────────────────────────────────
router.get('/:moim_id/settlements', (req, res, next) => {
  try {
    const moimId = Number(req.params.moim_id);

    const moim = db.prepare('SELECT * FROM moims WHERE id = ?').get(moimId);
    if (!moim) return res.status(404).json({ message: '모임을 찾을 수 없습니다.' });

    const settlements = db.prepare(`
      SELECT s.id as settlement_id, s.sender_id, u.name as sender_name,
             s.amount, s.deposit_memo, s.status, s.updated_at
      FROM settlements s
      JOIN users u ON u.id = s.sender_id
      WHERE s.moim_id = ?
      ORDER BY s.id
    `).all(moimId);

    const summary = {
      total: settlements.length,
      confirmed: settlements.filter(s => s.status === 'CONFIRMED').length,
      pending: settlements.filter(s => s.status === 'PENDING').length,
      expired: settlements.filter(s => s.status === 'EXPIRED').length,
    };

    res.status(200).json({ moim_id: moimId, summary, settlements });
  } catch (err) { next(err); }
});

module.exports = router;