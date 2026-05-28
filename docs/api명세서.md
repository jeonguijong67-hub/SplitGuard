# 🚀 N빵 가드 API 명세서

- **Base URL:** `https://api.n-bbang-guard.com/api/v1`
- **Data Format:** `JSON`

---

## 1. [POST] 모임 방 생성

- **Endpoint:** `POST /moims`
- **설명:** 정산 총대(Leader)가 새로운 N빵 모임 방을 개설합니다.

**Request Body**

```json
{
  "leader_id": 1,
  "moim_name": "강남역 불금 모임"
}
```

**Response `201 Created`**

```json
{
  "moim_id": 101,
  "moim_name": "강남역 불금 모임",
  "leader_id": 1,
  "created_at": "2026-05-25T19:00:00Z"
}
```

---

## 2. [POST] 모임 멤버 추가

- **Endpoint:** `POST /moims/{moim_id}/members`
- **설명:** 생성된 모임 방에 참여하는 대학생 친구들(전체 인원)을 등록합니다.

**Request Body**

```json
{
  "user_ids": [2, 3, 4, 5]
}
```

**Response `200 OK`**

```json
{
  "moim_id": 101,
  "added_members": [2, 3, 4, 5],
  "total_member_count": 5
}
```

---

## 3. [POST] 차수별 정산 요청 및 알고리즘 가동 ⭐ 핵심

- **Endpoint:** `POST /moims/{moim_id}/settle`
- **설명:** 총대가 차수별 금액과 실참여자를 던지면, 인원 변동을 계산해 최종 이체 최적화 경로를 뱉어냅니다.

**Request Body**

```json
{
  "rounds": [
    {
      "round_number": 1,
      "location_name": "1차 고깃집",
      "total_amount": 120000,
      "participant_ids": [1, 2, 3, 4, 5]
    },
    {
      "round_number": 2,
      "location_name": "2차 역삼맥주",
      "total_amount": 60000,
      "participant_ids": [1, 2, 3]
    }
  ]
}
```

**Response `200 OK`**

```json
{
  "moim_id": 101,
  "settlements": [
    {
      "settlement_id": 201,
      "sender_id": 2,
      "receiver_id": 1,
      "amount": 44000,
      "deposit_memo": "오정빈77",
      "status": "PENDING"
    },
    {
      "settlement_id": 202,
      "sender_id": 3,
      "receiver_id": 1,
      "amount": 44000,
      "deposit_memo": "김민준42",
      "status": "PENDING"
    },
    {
      "settlement_id": 203,
      "sender_id": 4,
      "receiver_id": 1,
      "amount": 24000,
      "deposit_memo": "이수아91",
      "status": "PENDING"
    },
    {
      "settlement_id": 204,
      "sender_id": 5,
      "receiver_id": 1,
      "amount": 24000,
      "deposit_memo": "박지후55",
      "status": "PENDING"
    }
  ]
}
```

---

## 4. [GET] 정산 현황 및 입금 확인 조회

- **Endpoint:** `GET /moims/{moim_id}/settlements`
- **설명:** 배치 스케줄러가 총대 계좌를 실시간 추적하여 업데이트한 현재 정산 입금 완료 현황을 보여줍니다.

**Response `200 OK`**

```json
{
  "moim_id": 101,
  "summary": {
    "total": 4,
    "confirmed": 2,
    "pending": 1,
    "expired": 1
  },
  "settlements": [
    {
      "settlement_id": 201,
      "sender_id": 2,
      "sender_name": "오정빈",
      "amount": 44000,
      "deposit_memo": "오정빈77",
      "status": "CONFIRMED",
      "updated_at": "2026-05-25T21:15:00Z"
    },
    {
      "settlement_id": 202,
      "sender_id": 3,
      "sender_name": "김민준",
      "amount": 44000,
      "deposit_memo": "김민준42",
      "status": "CONFIRMED",
      "updated_at": "2026-05-25T21:30:00Z"
    },
    {
      "settlement_id": 203,
      "sender_id": 4,
      "sender_name": "이수아",
      "amount": 24000,
      "deposit_memo": "이수아91",
      "status": "PENDING",
      "updated_at": "2026-05-25T22:00:00Z"
    },
    {
      "settlement_id": 204,
      "sender_id": 5,
      "sender_name": "박지후",
      "amount": 24000,
      "deposit_memo": "박지후55",
      "status": "EXPIRED",
      "updated_at": "2026-05-25T23:59:00Z"
    }
  ]
}
```

---

## 5. [POST] AI 미입금자 자동 독촉 알림

- **Endpoint:** `POST /settlements/{settlement_id}/remind`
- **설명:** 약속한 정산 시간이 지났을 때, 아직 `PENDING` 상태인 친구에게 AI가 위트 있는 카톡 멘트를 발송합니다.

**Response `200 OK`**

```json
{
  "settlement_id": 203,
  "sender_id": 4,
  "sender_name": "이수아",
  "message": "이수아야~ 🥺 혹시 어제 같이 먹은 고깃집 기억나? 24,000원만 '이수아91'로 입금해주면 우리 우정 완성이야 ㅋㅋ 빨리 보내줘!",
  "remind_sent_at": "2026-05-26T10:00:00Z"
}
```

---

## Status 코드 정의

| Status | 설명 |
|--------|------|
| `PENDING` | 입금 대기 중 |
| `CONFIRMED` | 자동 입금 확인 완료 |
| `EXPIRED` | 미입금 만료 |
