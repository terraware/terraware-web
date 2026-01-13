import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { Participant } from 'src/types/Participant';

import { requestGetParticipant } from './participantsAsyncThunks';

/**
 * Get Participant
 */
const initialStateParticipant: { [key: string]: StatusT<Participant> } = {};

export const participantSlice = createSlice({
  name: 'participantSlice',
  initialState: initialStateParticipant,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetParticipant, true)(builder);
  },
});

const participantsReducers = {
  participant: participantSlice.reducer,
};

export default participantsReducers;
