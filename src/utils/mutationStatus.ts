import { Statuses } from 'src/redux/features/asyncUtils';

type MutationState = { isLoading: boolean; isSuccess: boolean; isError: boolean };

export const mutationStatus = ({ isLoading, isSuccess, isError }: MutationState): Statuses | undefined => {
  if (isLoading) {
    return 'pending';
  }
  if (isError) {
    return 'error';
  }
  return isSuccess ? 'success' : undefined;
};

export const toWorkflowState = <T>(state: MutationState & { data?: T }) => {
  const status = mutationStatus(state);
  return status ? { status, data: state.data } : undefined;
};
