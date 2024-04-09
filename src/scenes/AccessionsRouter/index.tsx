import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import Accession2CreateView from 'src/scenes/AccessionsRouter/Accession2CreateView';
import Accession2View from 'src/scenes/AccessionsRouter/Accession2View';
import AccessionsView from 'src/scenes/AccessionsRouter/AccessionsView';

interface AccessionsRouterProps {
  setWithdrawalCreated: (value: boolean) => void;
}

const AccessionsRouter = ({ setWithdrawalCreated }: AccessionsRouterProps) => {
  return (
    <Routes>
      <Route path={APP_PATHS.ACCESSIONS} element={<AccessionsView setWithdrawalCreated={setWithdrawalCreated} />} />
      <Route path={APP_PATHS.ACCESSIONS2_NEW} element={<Accession2CreateView />} />
      <Route path={APP_PATHS.ACCESSIONS2_ITEM} element={<Accession2View />} />
    </Routes>
  );
};

export default AccessionsRouter;
