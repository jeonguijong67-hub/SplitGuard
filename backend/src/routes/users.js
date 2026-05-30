const express = require('express');
const router = express.Router();
const db = require('../config/DB');

// [GET] /users - 전체 유저 목록
router.get('/', (req, res, next) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY id').all();
    res.json(users);
  } catch (err) { next(err); }
});

// [POST] /users - 유저 생성
router.post('/', (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ message: '이름은 필수입니다.' });

    const result = db.prepare('INSERT INTO users (name, phone) VALUES (?, ?)').run(name, phone || null);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(user);
  } catch (err) { next(err); }
});

// [GET] /users/:id - 유저 상세
router.get('/:id', (req, res, next) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    res.json(user);
  } catch (err) { next(err); }
});

module.exports = router;