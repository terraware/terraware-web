import React from 'react';
import { Accession, NewAccession } from '../../api/types/accessions';
import { NewAccessionForm } from '../newAccession';

interface Props {
  accession: Accession;
  onSubmit: (record: NewAccession | Accession) => Promise<void>;
}

export default function AccessionProfile({
  accession,
  onSubmit,
}: Props): JSX.Element {
  return <NewAccessionForm accession={accession} onSubmit={onSubmit} />;
}
