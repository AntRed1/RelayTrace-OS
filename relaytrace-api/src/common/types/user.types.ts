export type UserRole =
  | 'SUPER_ADMIN'
  | 'COMPANY_ADMIN'
  | 'DISPATCHER'
  | 'DRIVER';

export interface JwtPayload {
  sub: string; // user.id
  companyId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RequestUser {
  id: string;
  companyId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
