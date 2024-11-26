import { RootState } from 'src/redux/rootReducer';

export const selectUserRequest = (userId: number) => (state: RootState) => state.users[userId];

export const selectUser = (userId?: number) => (state: RootState) => state.users[userId || -1]?.data?.user;

export const selectUsers = (state: RootState) =>
  Object.values(state.users)
    .map((user) => user?.data?.user)
    .filter(Boolean);

export const selectUserByEmailRequest = (email: string) => (state: RootState) => state.usersByEmail[email];
