import { Roles } from '@prisma/client';

export interface TokenPayload {
  email: string;
  sub: string;
  role: Roles;
}
