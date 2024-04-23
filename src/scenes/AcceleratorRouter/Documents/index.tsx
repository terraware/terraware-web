import React, { Route, Routes } from 'react-router-dom';

import DocumentView from './DocumentView';
import DocumentsAddView from './DocumentsAddView';
import DocumentsView from './DocumentsView';
import PreviewView from './PreviewView';

const DocumentsRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/:documentId'} element={<DocumentView />} />
      <Route path={'/*'} element={<DocumentsView />} />
      <Route path={'/new'} element={<DocumentsAddView />} />
      <Route path={':documentId/preview'} element={<PreviewView />} />
    </Routes>
  );
};

export default DocumentsRouter;
