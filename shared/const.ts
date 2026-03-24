export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
export const NOT_GERENTE_ERR_MSG = 'Acesso restrito a gerentes ou superior (10003)';

/** Role hierarchy: admin > gerente > operador */
export const ROLE_LEVELS: Record<string, number> = {
  admin: 3,
  gerente: 2,
  operador: 1,
};
