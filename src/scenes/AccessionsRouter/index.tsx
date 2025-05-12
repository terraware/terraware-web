import React from 'react';
import { Route, Routes } from 'react-router';

import Accession2CreateView from 'src/scenes/AccessionsRouter/Accession2CreateView';
import Accession2View from 'src/scenes/AccessionsRouter/Accession2View';
import AccessionsView from 'src/scenes/AccessionsRouter/AccessionsView';

const AccessionsRouter = () => {
  return (
    <Routes>
      <Route path='/*' element={<AccessionsView />} />
      <Route path='/new' element={<Accession2CreateView />} />
      <Route path='/:accessionId' element={<Accession2View />} />
    </Routes>
  );
};

export default AccessionsRouter;
