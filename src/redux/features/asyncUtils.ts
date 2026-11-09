export type Statuses = 'error' | 'partial-success' | 'pending' | 'success';

export type StatusT<T> = { status: Statuses; data?: T };
