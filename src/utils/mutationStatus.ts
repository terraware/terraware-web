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
