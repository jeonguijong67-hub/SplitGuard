const express = require('express');
const router = express.Router();
const db = require('../config/DB');
const { generateRemindMessage } = require('../services/NudgeService');

// ────────────────────────────────────────────────
// [POST] /settlements/:settlement_id/remind  - AI 독촉 알림
// ────────────────────────────────────────────────
router.post('/:settlement_id/remind', async (req, res, next) => {
  try {
    const settlementId = Number(req.params.settlement_id);

    const settlement = db.prepare(`
      SELECT s.*, u.name as sender_name, m.moim_name
      FROM settlements s
      JOIN users u ON u.id = s.sender_id
      JOIN moims m ON m.id = s.moim_id
      WHERE s.id = ?
    `).get(settlementId);

    if (!settlement) {
      return res.status(404).json({ message: '정산 내역을 찾을 수 없습니다.' });
    }

    if (settlement.status !== 'PENDING') {
      return res.status(400).json({
        message: `이미 ${settlement.status} 상태입니다. PENDING 상태만 독촉 가능합니다.`,
      });
    }

    const message = await generateRemindMessage({
      senderName: settlement.sender_name,
      amount: settlement.amount,
      depositMemo: settlement.deposit_memo,
      moimName: settlement.moim_name,
    });

    res.status(200).json({
      settlement_id: settlementId,
      sender_id: settlement.sender_id,
      sender_name: settlement.sender_name,
      message,
      remind_sent_at: new Date().toISOString(),
    });
  } catch (err) { next(err); }
});

// ────────────────────────────────────────────────
// [PATCH] /settlements/:settlement_id/status  - 상태 변경 (배치 스케줄러용)
// PENDING → CONFIRMED | EXPIRED
// ────────────────────────────────────────────────
router.patch('/:settlement_id/status', (req, res, next) => {
  try {
    const settlementId = Number(req.params.settlement_id);
    const { status } = req.body;

    const allowed = ['CONFIRMED', 'EXPIRED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status는 ${allowed.join(', ')} 중 하나여야 합니다.` });
    }

    const result = db.prepare(`
      UPDATE settlements
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, settlementId);

    if (result.changes === 0) {
      return res.status(404).json({ message: '정산 내역을 찾을 수 없습니다.' });
    }

    const updated = db.prepare('SELECT * FROM settlements WHERE id = ?').get(settlementId);
    res.status(200).json({
      settlement_id: updated.id,
      status: updated.status,
      updated_at: updated.updated_at,
    });
  } catch (err) { next(err); }
});

module.exports = router;