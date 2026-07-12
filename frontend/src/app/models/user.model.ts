export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'FLEET_MANAGER' | 'DRIVER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';
  fullName: string;
}

export interface SessionState {
  accessToken: string;
  refreshToken: string;
  user: User | null;
}
