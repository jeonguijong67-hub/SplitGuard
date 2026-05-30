const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/splitguard.db';

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- 유저
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    phone      TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 모임
  CREATE TABLE IF NOT EXISTS moims (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    moim_name  TEXT    NOT NULL,
    leader_id  INTEGER NOT NULL REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 모임 멤버
  CREATE TABLE IF NOT EXISTS moim_members (
    moim_id INTEGER NOT NULL REFERENCES moims(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (moim_id, user_id)
  );

  -- 차수
  CREATE TABLE IF NOT EXISTS rounds (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    moim_id       INTEGER NOT NULL REFERENCES moims(id) ON DELETE CASCADE,
    round_number  INTEGER NOT NULL,
    location_name TEXT,
    total_amount  INTEGER NOT NULL DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 차수 참여자
  CREATE TABLE IF NOT EXISTS round_participants (
    round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (round_id, user_id)
  );

  -- 정산 내역
  -- deposit_memo: "이름+랜덤2자리숫자" (e.g. 오정빈77)
  -- status: PENDING | CONFIRMED | EXPIRED
  CREATE TABLE IF NOT EXISTS settlements (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    moim_id      INTEGER NOT NULL REFERENCES moims(id) ON DELETE CASCADE,
    sender_id    INTEGER NOT NULL REFERENCES users(id),   -- 돈 보내는 사람
    receiver_id  INTEGER NOT NULL REFERENCES users(id),   -- 총대 (돈 받는 사람)
    amount       INTEGER NOT NULL,
    deposit_memo TEXT    NOT NULL,
    status       TEXT    NOT NULL DEFAULT 'PENDING',       -- PENDING | CONFIRMED | EXPIRED
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log(`✅ DB 연결 완료: ${DB_PATH}`);

module.exports = db;