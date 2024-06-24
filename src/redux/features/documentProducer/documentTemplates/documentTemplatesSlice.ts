import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { DocumentTemplate } from 'src/types/documentProducer/DocumentTemplate';

// Define a type for the slice state
export type DocumentTemplatesData = {
  documentTemplates?: DocumentTemplate[];
  error?: string;
};

// Define the initial state
export type DocumentTemplatesState = {
  listDocumentTemplates: DocumentTemplatesData;
};

const initialState: DocumentTemplatesState = {
  listDocumentTemplates: {},
};

const documentTemplatesSlice = createSlice({
  name: 'documentTemplatesSlice',
  initialState,
  reducers: {
    setDocumentTemplates: (state, action: PayloadAction<DocumentTemplatesData>) => {
      const data: DocumentTemplatesData = action.payload;
      state.listDocumentTemplates = { ...data };
    },
  },
});

export const { setDocumentTemplates } = documentTemplatesSlice.actions;

export const documentProducerDocumentTemplatesReducers = {
  documentProducerDocumentTemplates: documentTemplatesSlice.reducer,
};
