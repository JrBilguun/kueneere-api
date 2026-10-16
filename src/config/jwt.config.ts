import { registerAs } from '@nestjs/config';

/**
 * JWT Configuration
 * - Access token: богино хугацаатай (default 1 өдөр)
 * - Refresh token: урт хугацаатай (default 30 өдөр)
 */
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  algorithm: 'HS256',
}));
