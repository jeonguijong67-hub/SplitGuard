export function formatWon(value: number) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`;
}

export function initials(name: string) {
  return name?.slice(0, 1) || '?';
}
