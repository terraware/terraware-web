import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import { useSpecies } from 'src/scenes/InventoryRouter/form/useSpecies';
import strings from 'src/strings';

type QuadratSpeciesTableProps = {
  species?: {
    abundancePercent?: number;
    speciesId?: number;
    speciesName?: string;
    scientificName?: string;
  }[];
  quadrat?: string;
};

export default function QuadratSpeciesTable({ species, quadrat }: QuadratSpeciesTableProps): JSX.Element {
  const { availableSpecies } = useSpecies();
  const columns = (): TableColumnType[] =>
    quadrat
      ? [
          { key: 'speciesName', name: strings.SPECIES, type: 'string' },
          { key: 'abundancePercent', name: strings.HERBACEOUS_ABUNDANCE_PERCENT, type: 'string' },
          {
            key: 'isInvasive',
            name: strings.INVASIVE,
            type: 'boolean',
          },
          {
            key: 'isThreatened',
            name: strings.THREATENED,
            type: 'boolean',
          },
        ]
      : [
          { key: 'speciesName', name: strings.SPECIES, type: 'string' },
          {
            key: 'isInvasive',
            name: strings.INVASIVE,
            type: 'boolean',
          },
          {
            key: 'isThreatened',
            name: strings.THREATENED,
            type: 'boolean',
          },
        ];

  const speciesWithData = useMemo(() => {
    return species?.map((sp) => {
      const foundSpecies = availableSpecies?.find((avSpecies) => avSpecies.id === sp.speciesId);
      return {
        ...sp,
        speciesName: foundSpecies?.scientificName || sp.scientificName || sp.speciesName,
      };
    });
  }, [species, availableSpecies]);

  return (
    <Box minHeight={'160px'} padding={2}>
      <Table
        id={quadrat ? `quadrat-species-${quadrat}` : 'additional-species'}
        orderBy={'speciesName'}
        rows={speciesWithData || []}
        columns={columns}
      />
    </Box>
  );
}
