import { User } from '../../users/entities/user.entity';

/** Payload codificado dentro do JWT */
export interface JwtPayload {
  sub: string;  // userId
  email: string;
}

/** Shape retornado pelo endpoint /auth/me — sem campos sensíveis */
export type AuthUserResponse = Omit<User, 'password'>;
