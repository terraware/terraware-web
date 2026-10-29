import { Statuses } from 'src/redux/features/asyncUtils';

type MutationState = { isLoading: boolean; isSuccess: boolean; isError: boolean; error?: unknown };

export const mutationStatus = ({ isLoading, isSuccess, isError }: MutationState): Statuses | undefined => {
  if (isLoading) {
    return 'pending';
  }
  if (isError) {
    return 'error';
  }
  return isSuccess ? 'success' : undefined;
};

const serverErrorMessage = (error: unknown): string | undefined => {
  const message = (error as { data?: { error?: { message?: unknown } } } | undefined)?.data?.error?.message;
  return typeof message === 'string' ? message : undefined;
};

export const toWorkflowState = <T>(state: MutationState & { data?: T }) => {
  const status = mutationStatus(state);
  return status ? { status, data: state.data, error: serverErrorMessage(state.error) } : undefined;
};
