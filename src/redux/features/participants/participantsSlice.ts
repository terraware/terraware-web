import { createSlice } from '@reduxjs/toolkit';
import { Participant } from 'src/types/Participant';
import { buildReducers, StatusT } from 'src/redux/features/asyncUtils';
import { requestParticipantsList } from 'src/redux/features/participants/participantsAsyncThunks';

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
