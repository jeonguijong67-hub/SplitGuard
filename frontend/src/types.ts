export type User = {
  id: number;
  name: string;
  phone?: string | null;
  created_at?: string;
};

export type Moim = {
  moim_id: number;
  moim_name: string;
  leader_id: number;
  created_at?: string;
};

export type RoundInput = {
  round_number: number;
  location_name: string;
  total_amount: number;
  participant_ids: number[];
};

export type Settlement = {
  settlement_id: number;
  sender_id: number;
  receiver_id?: number;
  sender_name?: string;
  amount: number;
  deposit_memo: string;
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED';
  updated_at?: string;
};

export type SettlementSummary = {
  total: number;
  confirmed: number;
  pending: number;
  expired: number;
};
