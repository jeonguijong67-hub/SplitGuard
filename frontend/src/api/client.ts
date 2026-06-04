import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return '알 수 없는 오류가 발생했습니다.';
}
