import type { User } from '../types';
import { initials } from '../utils/format';

export function UserPicker({
  users,
  selectedIds,
  onToggle,
}: {
  users: User[];
  selectedIds: number[];
  onToggle: (userId: number) => void;
}) {
  return (
    <div className="list">
      {users.map((user) => {
        const active = selectedIds.includes(user.id);
        return (
          <button
            type="button"
            className="user-row"
            key={user.id}
            onClick={() => onToggle(user.id)}
            style={{ borderColor: active ? 'var(--purple-200)' : undefined, background: active ? 'var(--purple-50)' : undefined }}
          >
            <div className="avatar">{initials(user.name)}</div>
            <div className="row-main" style={{ textAlign: 'left' }}>
              <div className="row-title">{user.name}</div>
              <div className="row-sub">{user.phone || '연락처 없음'} · ID {user.id}</div>
            </div>
            <span className={`chip ${active ? 'active' : ''}`}>{active ? '선택됨' : '선택'}</span>
          </button>
        );
      })}
    </div>
  );
}
