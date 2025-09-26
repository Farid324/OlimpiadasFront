// src/config/security.ts
export const PUBLIC_ROUTES = ['/', '/public', '/auth'];
export const PRIVATE_ROOT = '/private';

export const ROLE_HOME: Record<'ADMINISTRADOR'|'EVALUADOR'|'RESPONSABLE_DE_AREA', string> = {
  ADMINISTRADOR: '/private?role=ADMINISTRADOR',
  EVALUADOR: '/private?role=EVALUADOR',
  RESPONSABLE_DE_AREA: '/private?role=RESPONSABLE_DE_AREA',
};
