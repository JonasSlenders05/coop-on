export interface JwtPayload {
  sub: number;
  email: string;
  publicRoles: string[];
  privateRoles: string[];
}

export interface Session {
  id: number;
  email: string;
  organiserId?: number;
  publicRoles: string[];
  privateRoles: string[];
}
