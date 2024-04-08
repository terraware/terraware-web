import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export type Message = {
  key: string;
  data: any;
};

type MessageState = {
  messages: Record<string, any>;
};

const initialState: MessageState = {
  messages: {},
};

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    sendMessage: (state, action: PayloadAction<Message>) => {
      const m = action.payload;
      state.messages[m.key] = m.data;
    },
  },
});

export const { sendMessage } = messageSlice.actions;

export const messageReducer = messageSlice.reducer;
