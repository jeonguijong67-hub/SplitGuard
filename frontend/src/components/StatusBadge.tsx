import type { Settlement } from '../types';

const labels: Record<Settlement['status'], string> = {
  PENDING: '대기중',
  CONFIRMED: '확인완료',
  EXPIRED: '만료',
};

export function StatusBadge({ status }: { status: Settlement['status'] }) {
  return <span className={`status ${status}`}>{labels[status]}</span>;
}
