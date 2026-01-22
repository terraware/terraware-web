import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import DocumentProducerProvider from 'src/providers/DocumentProducer/Provider';

import DocumentView from './DocumentView';
import DocumentsAddView from './DocumentsAddView';
import DocumentsView from './DocumentsView';
import PreviewView from './PreviewView';

const DocumentsRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route
        path={'/:documentId/*'}
        element={
          <DocumentProducerProvider>
            <Routes>
              <Route path={'/'} element={<DocumentView />} />
              <Route path={'/preview'} element={<PreviewView />} />
            </Routes>
          </DocumentProducerProvider>
        }
      />

      {/* <Route path={'/:documentId/preview'} element={<PreviewView />} /> */}
      <Route path={'/new'} element={<DocumentsAddView />} />
      <Route path={'/*'} element={<DocumentsView />} />
    </Routes>
  );
};

export default DocumentsRouter;
