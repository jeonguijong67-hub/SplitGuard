# 🛡️ SplitGuard

> 총대의 정산 고통을 없애주는 AI 기반 모임 정산 자동화 서비스

---

## 📌 서비스 개요

모임 후 가장 번거로운 일, 정산.  
SplitGuard는 **AI 영수증 스캔 → 차수별 정산 계산 → 자동 입금 확인 → AI 독촉**까지  
총대가 해야 할 모든 과정을 자동화합니다.

---

## ✨ 핵심 기능

| 기능 | 설명 |
|------|------|
| 📸 AI 영수증 스캔 | OCR로 장소명·총액·술값 자동 추출 |
| 🧮 차수별 정산 계산 | 인원 변동·비음주자 처리 포함한 최적 이체 경로 도출 |
| 🏦 오픈뱅킹 자동 확인 | 배치 스케줄러로 입금 실시간 감지 |
| 🤖 AI 독촉 메시지 | 미입금자에게 위트 있는 카톡 자동 발송 |

---

## 🗂️ 레포 구조

```
SplitGuard/
├── README.md
├── docs/
│   ├── api명세서.md       # REST API 명세
│   └── n빵_erd.html       # DB ERD
├── backend/
│   └── src/
│       ├── routes/        # API 라우터
│       ├── services/      # 비즈니스 로직 (정산 알고리즘 등)
│       ├── models/        # DB 모델
│       ├── middlewares/   # 에러 핸들러 등
│       └── config/        # DB, 환경변수 설정
└── frontend/
    └── src/
        ├── pages/         # 화면 단위
        ├── components/    # 공용 컴포넌트
        └── lib/           # API 클라이언트, 유틸
```

---

## 🛠️ 기술 스택

| 영역 | 스택 |
|------|------|
| Frontend | (결정 예정) |
| Backend | (결정 예정) |
| DB | (결정 예정) |

---

## 🚀 로컬 실행

### 백엔드
```bash
cd backend
npm install
cp .env.example .env   # 환경변수 설정
npm run dev
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

---

## 🌿 브랜치 전략

```
main     ← 최종 (직접 push 금지 🚫)
develop  ← PR 기준 브랜치
feat/*   ← 기능 개발
fix/*    ← 버그 수정
docs/*   ← 문서 작업
```

### 작업 순서
```bash
# 1. 최신 코드 받기
git checkout develop
git pull origin develop

# 2. 내 브랜치 만들기
git checkout -b feat/기능이름

# 3. 작업 후 push
git add .
git commit -m "feat: 기능 설명"
git push origin feat/기능이름

# 4. GitHub에서 PR → base: develop 으로 올리기
```

### 커밋 메시지 규칙
| 타입 | 예시 |
|------|------|
| `feat:` | `feat: 정산 알고리즘 구현` |
| `fix:` | `fix: 비음주자 계산 버그 수정` |
| `docs:` | `docs: API 명세서 업데이트` |
| `chore:` | `chore: 패키지 설치` |

---

## 👥 팀원 및 역할

| 이름 | 역할 | 담당 |
|------|------|------|
| 기획/PM | 요구사항 정의, API 명세, 일정 관리 |
| Frontend | 화면 구현 |
| Backend | API, DB, 정산 알고리즘 |

---

## 📎 참고 문서

- [API 명세서](./docs/api명세서.md)
- [ERD](./docs/n빵_erd.html)