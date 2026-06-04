import { Users, ReceiptText, Calculator, CircleDollarSign } from 'lucide-react';

const steps = [
  { key: 'users', label: '사용자 관리', api: 'GET/POST /users', icon: Users },
  { key: 'moim', label: '모임 생성', api: 'POST /moims', icon: ReceiptText },
  { key: 'members', label: '멤버 추가', api: 'POST /members', icon: Users },
  { key: 'settle', label: '정산 계산', api: 'POST /settle', icon: Calculator },
  { key: 'result', label: '결과 확인', api: 'GET /settlements', icon: CircleDollarSign },
] as const;

export type StepKey = typeof steps[number]['key'];

export function StepFlow({ active }: { active: StepKey }) {
  return (
    <div className="panel flow">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.key === active;
        return (
          <div key={step.key} className={`flow-step ${isActive ? 'active' : ''}`}>
            <div className="flow-index">{isActive ? <Icon size={15} /> : index + 1}</div>
            <div>
              <div className="flow-text">{step.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
