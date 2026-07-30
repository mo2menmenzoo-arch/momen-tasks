export interface JwtPayload {
  sub: string;
  email: string;
  username?: string | null;
  role: string;
  type: 'access' | 'refresh';
}
