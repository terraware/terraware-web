import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import AccessionsView from 'src/scenes/AccessionsRouter/AccessionsView';
import Accession2CreateView from 'src/scenes/AccessionsRouter/Accession2CreateView';
import Accession2View from 'src/scenes/AccessionsRouter/Accession2View';

interface AccessionsRouterProps {
  setWithdrawalCreated: (value: boolean) => void;
}

const AccessionsRouter = ({ setWithdrawalCreated }: AccessionsRouterProps) => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.ACCESSIONS}>
        <AccessionsView setWithdrawalCreated={setWithdrawalCreated} />
      </Route>
      <Route exact path={APP_PATHS.ACCESSIONS2_NEW}>
        <Accession2CreateView />
      </Route>
      <Route path={APP_PATHS.ACCESSIONS2_ITEM}>
        <Accession2View />
      </Route>
    </Switch>
  );
};

export default AccessionsRouter;
