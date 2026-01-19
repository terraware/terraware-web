import React, { type JSX, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import DescriptionModal from 'src/scenes/ObservationsRouter/biomass/DescriptionModal';
import TreesAndShrubsRenderer from 'src/scenes/ObservationsRouter/biomass/TreesAndShrubsRenderer';
import strings from 'src/strings';
import { ExistingTreePayload } from 'src/types/Observations';

type TreesAndShrubsTableProps = {
  trees?: ExistingTreePayload[];
};

export default function TreesAndShrubsTable({ trees }: TreesAndShrubsTableProps): JSX.Element {
  const { species: availableSpecies } = useSpeciesData();
  const [selectedRows, setSelectedRows] = useState<ExistingTreePayload[]>([]);
  const [selectedTree, setSelectedTree] = useState<ExistingTreePayload | undefined>();

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
      name: strings.CROWN_DIAMETER_CM,
      type: 'string',
    },
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
    {
      key: 'isDead',
      name: strings.DEAD,
      type: 'boolean',
    },
    {
      key: 'description',
      name: '',
      type: 'string',
    },
  ];

  const treesWithData = useMemo(() => {
    return trees?.map((tree) => {
      const foundSpecies = availableSpecies.find((avSpecies) => avSpecies.id === tree.speciesId);
      return {
        ...tree,
        speciesName: tree.speciesName || foundSpecies?.scientificName,
      };
    });
  }, [trees, availableSpecies]);

  const [openDescriptionModal, setOpenDescriptionModal] = useState(false);

  const onRowClick = (tree: ExistingTreePayload) => {
    setSelectedTree(tree);
    setOpenDescriptionModal(true);
  };

  return (
    <Box>
      {openDescriptionModal && (
        <DescriptionModal description={selectedTree?.description} onClose={() => setOpenDescriptionModal(false)} />
      )}
      <Table
        id={'trees-and-shrubs-table'}
        orderBy={'speciesName'}
        rows={treesWithData || []}
        columns={columns}
        Renderer={TreesAndShrubsRenderer}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        onSelect={onRowClick}
        controlledOnSelect={true}
        isClickable={() => false}
      />
    </Box>
  );
}
