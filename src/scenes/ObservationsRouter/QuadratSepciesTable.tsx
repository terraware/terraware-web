import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import strings from 'src/strings';
import { BiomassSpeciesPayload } from 'src/types/Observations';

import { useSpecies } from '../InventoryRouter/form/useSpecies';

type QuadratSpeciesTableProps = {
  species?: {
    abundancePercent: number;
    speciesId?: number;
    speciesName?: string;
  }[];
  quadrat: string;
  allSpecies?: BiomassSpeciesPayload[];
};

export default function QuadratSpeciesTable({ species, quadrat, allSpecies }: QuadratSpeciesTableProps): JSX.Element {
  const { availableSpecies } = useSpecies();
  const columns = (): TableColumnType[] => [
    { key: 'speciesName', name: strings.SPECIES, type: 'string' },
    { key: 'abundancePercent', name: strings.HERBACEOUS_ABUNDANCE_PERCENT, type: 'string' },
    {
      key: 'invasive',
      name: strings.INVASIVE,
      type: 'boolean',
    },
    {
      key: 'threatened',
      name: strings.THREATENED,
      type: 'boolean',
    },
  ];

  const speciesWithData = useMemo(() => {
    return species?.map((sp) => {
      const foundSpecies = availableSpecies?.find((avSpecies) => avSpecies.id === sp.speciesId);
      const foundBiomassSpecies = allSpecies?.find((bmSpecies) => bmSpecies.speciesId === sp.speciesId);
      return {
        ...sp,
        speciesName: foundSpecies?.scientificName || sp.speciesName,
        invasive: foundBiomassSpecies?.isInvasive,
        threatened: foundBiomassSpecies?.isThreatened,
      };
    });
  }, [availableSpecies, allSpecies]);

  return (
    <Box minHeight={'160px'} padding={2}>
      <Table id={`quadrat-species-${quadrat}`} orderBy={'speciesName'} rows={speciesWithData || []} columns={columns} />
    </Box>
  );
}
