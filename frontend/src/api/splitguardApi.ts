import { api } from './client';
import type { Moim, RoundInput, Settlement, SettlementSummary, User } from '../types';

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users');
  return data;
}

export async function createUser(payload: { name: string; phone?: string }): Promise<User> {
  const { data } = await api.post<User>('/users', payload);
  return data;
}

export async function createMoim(payload: { leader_id: number; moim_name: string }): Promise<Moim> {
  const { data } = await api.post<Moim>('/moims', payload);
  return data;
}

export async function addMoimMembers(moimId: number, userIds: number[]) {
  const { data } = await api.post(`/moims/${moimId}/members`, { user_ids: userIds });
  return data;
}

export async function settleMoim(moimId: number, rounds: RoundInput[]): Promise<{ moim_id: number; settlements: Settlement[] }> {
  const { data } = await api.post(`/moims/${moimId}/settle`, { rounds });
  return data;
}

export async function fetchSettlements(moimId: number): Promise<{ moim_id: number; summary: SettlementSummary; settlements: Settlement[] }> {
  const { data } = await api.get(`/moims/${moimId}/settlements`);
  return data;
}

export async function updateSettlementStatus(settlementId: number, status: 'CONFIRMED' | 'EXPIRED') {
  const { data } = await api.patch(`/settlements/${settlementId}/status`, { status });
  return data;
}
