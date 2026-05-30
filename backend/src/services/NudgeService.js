/**
 * AI 독촉 메시지 서비스
 * settlement 상태가 PENDING인 미입금자에게 위트 있는 메시지 생성
 */

/**
 * @param {Object} param
 * @param {string} param.senderName    - 미입금자 이름
 * @param {number} param.amount        - 미입금 금액
 * @param {string} param.depositMemo   - 입금 메모 (e.g. 이수아91)
 * @param {string} param.moimName      - 모임 이름
 * @returns {string} 카톡 독촉 메시지
 */
async function generateRemindMessage({ senderName, amount, depositMemo, moimName }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다.');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `카카오톡 정산 독촉 메시지를 작성해주세요. 메시지 텍스트만 출력하세요.

조건:
- 받는 사람 이름: ${senderName}
- 모임명: ${moimName}
- 미납 금액: ${amount.toLocaleString()}원
- 입금 메모: "${depositMemo}" (입금 시 이 메모를 꼭 써달라고 언급)
- 톤: 유머러스하고 친근하게, 살짝 애절함 섞기
- 이모지 적절히 사용
- 3문장 이내
- 카카오톡 말투`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API 오류: ${err}`);
  }

  const data = await response.json();
  return data.content[0].text.trim();
}

module.exports = { generateRemindMessage };