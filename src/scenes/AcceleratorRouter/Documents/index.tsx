import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import DocumentView from './DocumentView';
import DocumentsAddView from './DocumentsAddView';
import DocumentsView from './DocumentsView';
import PreviewView from './PreviewView';

const DocumentsRouter = (): JSX.Element => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENT_VIEW}>
        <DocumentView />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENTS}>
        <DocumentsView />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENT_NEW}>
        <DocumentsAddView />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENT_PREVIEW}>
        <PreviewView />
      </Route>
      <Route path={'*'}>
        <Redirect to={APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENTS} />
      </Route>
    </Switch>
  );
};

export default DocumentsRouter;
