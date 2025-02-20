import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import strings from 'src/strings';
import { BiomassSpeciesPayload, ExistingTreePayload } from 'src/types/Observations';

import { useSpecies } from '../InventoryRouter/form/useSpecies';

type TreesAndShrubsTableProps = {
  trees?: ExistingTreePayload[];
  allSpecies?: BiomassSpeciesPayload[];
};

export default function TreesAndShrubsTable({ trees, allSpecies }: TreesAndShrubsTableProps): JSX.Element {
  const { availableSpecies } = useSpecies();
  const columns = (): TableColumnType[] => [
    { key: 'treeNumber', name: strings.ID, type: 'string' },
    { key: 'speciesName', name: strings.SPECIES, type: 'string' },
    {
      key: 'treeGrowthForm',
      name: strings.GROWTH_FORM,
      type: 'string',
    },
    {
      key: 'diameterAtBreastHeight',
      name: strings.DBH_CM,
      type: 'string',
    },
    {
      key: 'pointOfMeasurement',
      name: strings.POM_M,
      type: 'string',
    },
    {
      key: 'height',
      name: strings.HEIGHT_M,
      type: 'string',
    },
    {
      key: 'shrubDiameter',
      name: strings.DIAMETER_CM,
      type: 'string',
    },
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
    {
      key: 'isDead',
      name: strings.DEAD,
      type: 'boolean',
    },
  ];

  const treessWithData = useMemo(() => {
    return trees?.map((tree) => {
      const foundSpecies = availableSpecies?.find((avSpecies) => avSpecies.id === tree.speciesId);
      const biomassSpecies = allSpecies?.find((bmSpecies) => bmSpecies.speciesId === tree.speciesId);
      return {
        ...tree,
        speciesName: foundSpecies?.scientificName || tree.speciesName,
        invasive: biomassSpecies?.isInvasive,
        threatened: biomassSpecies?.isThreatened,
      };
    });
  }, [availableSpecies, allSpecies]);

  return (
    <Box>
      <Table id={'trees-and-shrubs-table'} orderBy={'speciesName'} rows={treessWithData || []} columns={columns} />
    </Box>
  );
}
