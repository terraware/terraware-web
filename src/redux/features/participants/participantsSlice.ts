import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { requestParticipantsList } from 'src/redux/features/participants/participantsAsyncThunks';
import { Participant } from 'src/types/Participant';

/**
 * Participant list
 */
const initialStateParticipantsList: { [key: string]: StatusT<Participant[]> } = {};

export const participantsListSlice = createSlice({
  name: 'participantsListSlice',
  initialState: initialStateParticipantsList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestParticipantsList)(builder);
  },
});

export const participantsListReducer = participantsListSlice.reducer;
