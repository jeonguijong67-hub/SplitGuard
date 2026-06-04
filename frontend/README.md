# SplitGuard Frontend

React + Vite 기반 SplitGuard MVP 프론트엔드입니다.

## 기능

- 사용자 목록 조회 / 사용자 생성: `GET /users`, `POST /users`
- 모임 생성: `POST /moims`
- 모임 멤버 추가: `POST /moims/:moim_id/members`
- 차수별 정산 계산: `POST /moims/:moim_id/settle`
- 정산 현황 조회: `GET /moims/:moim_id/settlements`
- 정산 상태 변경: `PATCH /settlements/:settlement_id/status`

## 실행

```bash
npm install
cp .env.example .env
npm run dev
```

기본 API 주소는 다음과 같습니다.

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## 백엔드 주의사항

현재 백엔드 `app.js`에서 다음 라인이 있으면 실행 오류가 날 수 있습니다.

```js
const settlementsRouter = require('./routes/settlements');
```

실제 파일명이 `settlement.js`라면 아래처럼 수정하세요.

```js
const settlementsRouter = require('./routes/settlement');
```
