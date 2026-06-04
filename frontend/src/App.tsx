import { useEffect, useMemo, useState } from 'react';
import { Calculator, Plus, ReceiptText, RefreshCcw, Send, Trash2, Users } from 'lucide-react';
import './App.css';
import { addMoimMembers, createMoim, createUser, fetchSettlements, fetchUsers, settleMoim, updateSettlementStatus } from './api/splitguardApi';
import { getApiError } from './api/client';
import { StepFlow, type StepKey } from './components/StepFlow';
import { StatusBadge } from './components/StatusBadge';
import { UserPicker } from './components/UserPicker';
import type { Moim, RoundInput, Settlement, SettlementSummary, User } from './types';
import { formatWon, initials } from './utils/format';

const defaultRound = (roundNumber: number): RoundInput => ({
  round_number: roundNumber,
  location_name: '',
  total_amount: 0,
  participant_ids: [],
});

function App() {
  const [activeStep, setActiveStep] = useState<StepKey>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newUser, setNewUser] = useState({ name: '', phone: '' });
  const [leaderId, setLeaderId] = useState<number | ''>('');
  const [moimName, setMoimName] = useState('');
  const [moim, setMoim] = useState<Moim | null>(null);
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [rounds, setRounds] = useState<RoundInput[]>([defaultRound(1)]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [summary, setSummary] = useState<SettlementSummary | null>(null);

  const selectedMembers = useMemo(
    () => users.filter((u) => memberIds.includes(u.id)),
    [users, memberIds]
  );

  const leader = users.find((u) => u.id === Number(leaderId));
  const totalAmount = rounds.reduce((sum, round) => sum + Number(round.total_amount || 0), 0);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers();
      setUsers(data);
      if (!leaderId && data.length > 0) setLeaderId(data[0].id);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateUser() {
    if (!newUser.name.trim()) return setError('사용자 이름을 입력해 주세요.');
    setLoading(true);
    setError('');
    try {
      const user = await createUser({ name: newUser.name.trim(), phone: newUser.phone.trim() });
      setUsers((prev) => [...prev, user]);
      setNewUser({ name: '', phone: '' });
      if (!leaderId) setLeaderId(user.id);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMoim() {
    if (!leaderId) return setError('총대를 선택해 주세요.');
    if (!moimName.trim()) return setError('모임 이름을 입력해 주세요.');
    setLoading(true);
    setError('');
    try {
      const created = await createMoim({ leader_id: Number(leaderId), moim_name: moimName.trim() });
      setMoim(created);
      setMemberIds([created.leader_id]);
      setActiveStep('members');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function toggleMember(userId: number) {
    setMemberIds((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  }

  async function handleAddMembers() {
    if (!moim) return setError('먼저 모임을 생성해 주세요.');
    if (memberIds.length === 0) return setError('멤버를 1명 이상 선택해 주세요.');
    setLoading(true);
    setError('');
    try {
      await addMoimMembers(moim.moim_id, memberIds);
      setRounds([defaultRound(1)]);
      setActiveStep('settle');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function updateRound(index: number, patch: Partial<RoundInput>) {
    setRounds((prev) => prev.map((round, i) => i === index ? { ...round, ...patch } : round));
  }

  function toggleRoundParticipant(roundIndex: number, userId: number) {
    const round = rounds[roundIndex];
    const participant_ids = round.participant_ids.includes(userId)
      ? round.participant_ids.filter((id) => id !== userId)
      : [...round.participant_ids, userId];
    updateRound(roundIndex, { participant_ids });
  }

  function addRound() {
    setRounds((prev) => [...prev, defaultRound(prev.length + 1)]);
  }

  function removeRound(index: number) {
    setRounds((prev) => prev.filter((_, i) => i !== index).map((round, i) => ({ ...round, round_number: i + 1 })));
  }

  async function handleSettle() {
    if (!moim) return setError('모임 정보가 없습니다.');
    const invalid = rounds.find((round) => !round.total_amount || round.participant_ids.length === 0);
    if (invalid) return setError('각 차수에는 금액과 참여자가 반드시 필요합니다.');
    setLoading(true);
    setError('');
    try {
      const result = await settleMoim(moim.moim_id, rounds);
      setSettlements(result.settlements);
      await handleFetchSettlements(false);
      setActiveStep('result');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchSettlements(moveStep = true) {
    if (!moim) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchSettlements(moim.moim_id);
      setSummary(data.summary);
      setSettlements(data.settlements);
      if (moveStep) setActiveStep('result');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(settlementId: number, status: 'CONFIRMED' | 'EXPIRED') {
    setLoading(true);
    setError('');
    try {
      await updateSettlementStatus(settlementId, status);
      await handleFetchSettlements(false);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="header">
        <div className="logo"><ReceiptText size={23} /></div>
        <div>
          <div className="title">N빵 가드 · SplitGuard Frontend</div>
          <div className="subtitle">사용자 관리 → 모임 생성 → 멤버 추가 → 차수별 정산 계산</div>
        </div>
        <div className="badge">React MVP</div>
      </header>

      <div className="grid">
        <StepFlow active={activeStep} />

        <section className="content">
          {error && <div className="error">{error}</div>}

          <section className="panel">
            <div className="screen-header">
              <div>
                <div className="screen-title"><Users size={18} /> 사용자 관리</div>
              </div>
              <button className="btn btn-secondary" onClick={loadUsers} disabled={loading}><RefreshCcw size={15} /> 새로고침</button>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>이름</label>
                <input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="예: 오정빈" />
              </div>
              <div className="field">
                <label>연락처</label>
                <input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} placeholder="010-0000-0000" />
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-primary" onClick={handleCreateUser} disabled={loading}><Plus size={16} /> 사용자 추가</button>
            </div>
          </section>

          <section className="panel">
            <div className="screen-header">
              <div>
                <div className="screen-title"><ReceiptText size={18} /> 모임 생성</div>
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>모임 이름</label>
                <input value={moimName} onChange={(e) => setMoimName(e.target.value)} placeholder="예: 강남역 불금 모임" />
              </div>
              <div className="field">
                <label>총대 선택</label>
                <input value={leader ? `${leader.name} · ID ${leader.id}` : ''} readOnly placeholder="아래 사용자 목록에서 선택" />
              </div>
            </div>
            <div className="chips" style={{ marginTop: 12 }}>
              {users.map((user) => (
                <button key={user.id} className={`chip ${leaderId === user.id ? 'active' : ''}`} onClick={() => setLeaderId(user.id)}>{user.name}</button>
              ))}
            </div>
            <div className="actions">
              <button className="btn btn-primary" onClick={handleCreateMoim} disabled={loading || !leaderId}><Plus size={16} /> 모임 개설하기</button>
            </div>
            {moim && <div className="api-card"> 완료 · moim_id: {moim.moim_name}</div>}
          </section>

          <section className="panel">
            <div className="screen-header">
              <div>
                <div className="screen-title"><Users size={18} /> 모임 멤버 추가</div>
                <div className="screen-desc">총대는 자동 포함되며, 추가 멤버를 선택합니다.</div>
              </div>
              <div className="badge">{selectedMembers.length}명 선택</div>
            </div>
            <UserPicker users={users} selectedIds={memberIds} onToggle={toggleMember} />
            <div className="actions">
              <button className="btn btn-primary" onClick={handleAddMembers} disabled={loading || !moim}><Send size={16} /> 멤버 확정</button>
            </div>
          </section>

          <section className="panel">
            <div className="screen-header">
              <div>
                <div className="screen-title"><Calculator size={18} /> 차수별 정산 계산</div>
                <div className="screen-desc">각 차수별 장소, 금액, 참여자를 입력하면 총대를 제외한 정산 내역이 생성됩니다.</div>
              </div>
              <button className="btn btn-secondary" onClick={addRound}><Plus size={15} /> 차수 추가</button>
            </div>

            <div className="list">
              {rounds.map((round, index) => (
                <div className="round-card" key={index}>
                  <div className="round-top">
                    <span className="round-num">{round.round_number}차</span>
                    {rounds.length > 1 && <button className="btn btn-danger" onClick={() => removeRound(index)}><Trash2 size={15} /> 삭제</button>}
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>장소</label>
                      <input value={round.location_name} onChange={(e) => updateRound(index, { location_name: e.target.value })} placeholder="예: 1차 고깃집" />
                    </div>
                    <div className="field">
                      <label>총 금액</label>
                      <input type="number" value={round.total_amount || ''} onChange={(e) => updateRound(index, { total_amount: Number(e.target.value) })} placeholder="120000" />
                    </div>
                    <div className="field full">
                      <label>참여자 선택</label>
                      <div className="chips">
                        {selectedMembers.map((user) => (
                          <button key={user.id} className={`chip ${round.participant_ids.includes(user.id) ? 'active' : ''}`} onClick={() => toggleRoundParticipant(index, user.id)}>{user.name}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="api-card">총 입력 금액: <b>{formatWon(totalAmount)}</b></div>
            <div className="actions">
              <button className="btn btn-primary" onClick={handleSettle} disabled={loading || !moim}><Calculator size={16} /> 정산 계산하기</button>
            </div>
          </section>

          <section className="panel">
            <div className="screen-header">
              <div>
                <div className="screen-title">정산 결과 및 현황</div>
                <div className="screen-desc">계산 결과와 현재 입금 상태를 확인합니다.</div>
              </div>
              <button className="btn btn-secondary" onClick={() => handleFetchSettlements(true)} disabled={loading || !moim}><RefreshCcw size={15} /> 현황 조회</button>
            </div>

            {summary && (
              <div className="summary-grid">
                <div className="stat"><div className="stat-num">{summary.total}</div><div className="stat-label">전체</div></div>
                <div className="stat"><div className="stat-num">{summary.confirmed}</div><div className="stat-label">완료</div></div>
                <div className="stat"><div className="stat-num">{summary.pending}</div><div className="stat-label">대기</div></div>
                <div className="stat"><div className="stat-num">{summary.expired}</div><div className="stat-label">만료</div></div>
              </div>
            )}

            <div className="list" style={{ marginTop: 12 }}>
              {settlements.length === 0 && <div className="notice">아직 정산 결과가 없습니다. 차수별 정산을 먼저 계산해 주세요.</div>}
              {settlements.map((item) => (
                <div className="settlement-row" key={item.settlement_id}>
                  <div className="avatar">{initials(item.sender_name || users.find((u) => u.id === item.sender_id)?.name || String(item.sender_id))}</div>
                  <div className="row-main">
                    <div className="row-title">{item.sender_name || users.find((u) => u.id === item.sender_id)?.name || `사용자 ${item.sender_id}`} → 총대</div>
                    <div className="row-sub">입금메모 {item.deposit_memo} · {formatWon(item.amount)}</div>
                  </div>
                  <StatusBadge status={item.status} />
                  {item.status === 'PENDING' && (
                    <>
                      <button className="btn btn-secondary" onClick={() => handleStatus(item.settlement_id, 'CONFIRMED')}>완료</button>
                      <button className="btn btn-danger" onClick={() => handleStatus(item.settlement_id, 'EXPIRED')}>만료</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

export default App;
