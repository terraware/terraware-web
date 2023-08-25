import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/rootReducer';

export const selectMessages = (state: RootState) => state.message.messages;

export const selectMessage = (key: string) => createSelector(selectMessages, (messages) => messages[key]);
