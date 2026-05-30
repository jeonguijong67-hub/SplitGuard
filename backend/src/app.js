require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

require('./config/DB'); // DB 초기화

const moimsRouter       = require('./routes/Moims');
const settlementsRouter = require('./routes/settlements');
const usersRouter       = require('./routes/users');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── 미들웨어 ─────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── 라우터  (Base URL: /api/v1) ──────────────
app.use('/api/v1/moims',       moimsRouter);
app.use('/api/v1/settlements', settlementsRouter);
app.use('/api/v1/users',       usersRouter);   // 개발/테스트용

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SplitGuard API', timestamp: new Date().toISOString() });
});

// ── 에러 핸들러 ──────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
🛡️  SplitGuard Backend
🚀  http://localhost:${PORT}
📋  API Base: http://localhost:${PORT}/api/v1
🌿  환경: ${process.env.NODE_ENV || 'development'}

[라우트]
  POST   /api/v1/moims                          모임 생성
  POST   /api/v1/moims/:id/members              멤버 추가
  POST   /api/v1/moims/:id/settle               정산 계산 ⭐
  GET    /api/v1/moims/:id/settlements          정산 현황 조회
  POST   /api/v1/settlements/:id/remind         AI 독촉 알림
  PATCH  /api/v1/settlements/:id/status         상태 변경 (배치용)
  POST   /api/v1/users                          유저 생성 (개발용)
  `);
});

module.exports = app;