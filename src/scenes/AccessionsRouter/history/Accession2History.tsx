import React, { type JSX } from 'react';
import { useParams } from 'react-router';

import AccessionEventLog from './AccessionEventLog';

const Accession2History = (): JSX.Element | null => {
  const { accessionId: accessionIdParam } = useParams<{ accessionId: string }>();

  const accessionId = Number(accessionIdParam);

  if (!Number.isFinite(accessionId) || accessionId <= 0) {
    return null;
  }

  return <AccessionEventLog accessionId={accessionId} />;
};

export default Accession2History;
