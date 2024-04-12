import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Accession2CreateView from 'src/scenes/AccessionsRouter/Accession2CreateView';
import Accession2View from 'src/scenes/AccessionsRouter/Accession2View';
import AccessionsView from 'src/scenes/AccessionsRouter/AccessionsView';

interface AccessionsRouterProps {
  setWithdrawalCreated: (value: boolean) => void;
}

const AccessionsRouter = ({ setWithdrawalCreated }: AccessionsRouterProps) => {
  return (
    <Routes>
      <Route path='/*' element={<AccessionsView setWithdrawalCreated={setWithdrawalCreated} />} />
      <Route path='/new' element={<Accession2CreateView />} />
      <Route path='/:accessionId' element={<Accession2View />} />
    </Routes>
  );
};

export default AccessionsRouter;
