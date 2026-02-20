import React, { type JSX, useMemo } from 'react';

import { Box } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { ExistingTreePayload, useGetObservationResultsQuery } from 'src/queries/generated/observations';

type MapTreeDrawerProps = {
  observationId: number;
  tree: ExistingTreePayload;
};

const MapTreeDrawer = ({ observationId, tree }: MapTreeDrawerProps): JSX.Element | undefined => {
  const { strings } = useLocalization();
  const { data } = useGetObservationResultsQuery({ observationId, includePlants: true });

  const { species } = useSpeciesData();

  const result = useMemo(() => {
    return data?.observation;
  }, [data?.observation]);

  const treeGrowthForm = useMemo(() => {
    switch (tree.treeGrowthForm) {
      case 'Tree':
      case 'Trunk':
        return strings.TREE;
      case 'Shrub':
        return strings.SHRUB;
    }
  }, [tree.treeGrowthForm, strings.TREE, strings.SHRUB]);

  const treeSpecies = useMemo(() => {
    if (tree.speciesId) {
      return species.find((_species) => _species.id === tree.speciesId)?.scientificName ?? strings.UNKNOWN;
    } else {
      return tree.speciesName ?? strings.UNKNOWN;
    }
  }, [tree.speciesId, tree.speciesName, species, strings.UNKNOWN]);

  const rows = useMemo((): MapDrawerTableRow[] => {
    if (result) {
      return [
        {
          key: strings.SPECIES,
          value: treeSpecies,
        },
        {
          key: strings.GROWTH_FORM,
          value: treeGrowthForm,
        },
        {
          key: strings.DBH_CM,
          value: tree.diameterAtBreastHeight ? `${tree.diameterAtBreastHeight}` : '',
        },
        {
          key: strings.POM_M,
          value: tree.pointOfMeasurement ? `${tree.pointOfMeasurement}` : '',
        },
        {
          key: strings.HEIGHT_M,
          value: tree.height ? `${tree.height}` : '',
        },
        {
          key: strings.CROWN_DIAMETER_CM,
          value: tree.shrubDiameter ? `${tree.shrubDiameter}` : '',
        },
        {
          key: strings.INVASIVE,
          value: tree.isInvasive ? strings.YES : strings.NO,
        },
        {
          key: strings.THREATENED,
          value: tree.isThreatened ? strings.YES : strings.NO,
        },
        {
          key: strings.DEAD,
          value: tree.isDead ? strings.YES : strings.NO,
        },
      ];
    } else {
      return [];
    }
  }, [
    result,
    strings,
    treeSpecies,
    treeGrowthForm,
    tree.diameterAtBreastHeight,
    tree.pointOfMeasurement,
    tree.height,
    tree.shrubDiameter,
    tree.isInvasive,
    tree.isThreatened,
    tree.isDead,
  ]);

  return (
    <Box display={'flex'} flexDirection={'column'} width={'100%'}>
      <MapDrawerTable rows={rows} />
    </Box>
  );
};

export default MapTreeDrawer;
