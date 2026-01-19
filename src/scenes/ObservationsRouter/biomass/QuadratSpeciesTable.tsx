import React, { type JSX, useMemo } from 'react';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
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
  const { species: availableSpecies } = useSpeciesData();

  const columns = useMemo(
    (): TableColumnType[] => [
      { key: 'speciesName', name: strings.SPECIES, type: 'string' },
      ...(quadrat
        ? [
            { key: 'abundancePercent', name: strings.HERBACEOUS_ABUNDANCE_SQUARE_COUNT, type: 'string' as const },
            { key: 'abundancePercentCalculated', name: strings.HERBACEOUS_ABUNDANCE_PERCENT, type: 'string' as const },
          ]
        : []),
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
    ],
    [quadrat]
  );

  const speciesWithData = useMemo(() => {
    return species?.map((sp) => {
      const foundSpecies = availableSpecies.find((avSpecies) => avSpecies.id === sp.speciesId);
      return {
        ...sp,
        abundancePercentCalculated: sp.abundancePercent ? `${sp.abundancePercent * 4}` : undefined,
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
