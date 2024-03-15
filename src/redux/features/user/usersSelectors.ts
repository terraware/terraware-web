import { RootState } from 'src/redux/rootReducer';

export const selectUserRequest = (userId: number) => (state: RootState) => state.users[userId];

export const selectUserByEmailRequest = (email: string) => (state: RootState) => state.usersByEmail[email];
