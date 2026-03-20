export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  method: string;
  path: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Paginação
// ---------------------------------------------------------------------------

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  access_token: string;
  user: User;
}

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCategoryPayload = {
  name: string;
  description?: string;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

// ---------------------------------------------------------------------------
// Transações
// ---------------------------------------------------------------------------

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  category: Pick<Category, 'id' | 'name'>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTransactionPayload = {
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
};

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface TopCategory {
  categoryId: string;
  categoryName: string;
  total: number;
}

export interface DashboardData {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  topExpenseCategories: TopCategory[];
}
