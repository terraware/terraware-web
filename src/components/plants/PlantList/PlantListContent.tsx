import React, { useMemo } from 'react';
import { Grid } from '@material-ui/core';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import AllPlantsCellRenderer from './TableCellRenderer';
import strings from 'src/strings';
import { Plant } from 'src/types/Plant';
import { SpeciesById } from 'src/types/Species';

type PlantForTable = {
  featureId: number;
  date?: string;
  species?: string;
  geolocation?: string;
  notes?: string;
};

const columns: TableColumnType[] = [
  { key: 'date', name: strings.DATE, type: 'date' },
  { key: 'species', name: strings.SPECIES, type: 'string' },
  { key: 'geolocation', name: strings.GEOLOCATION, type: 'string' },
  { key: 'notes', name: strings.NOTES, type: 'string' },
];

type PlantListContentProps = {
  plants: Plant[];
  speciesById: SpeciesById;
  selectPlant: (id: number) => void;
};

export default function PlantListContent(props: PlantListContentProps): JSX.Element {
  const { plants, speciesById, selectPlant } = props;

  const plantsForTable = useMemo(() => {
    let plantsToReturn: PlantForTable[] = [];

    if (plants && speciesById) {
      plantsToReturn = plants.map((plant) => {
        return {
          featureId: plant.featureId!,
          date: plant.enteredTime,
          species: plant.speciesId ? speciesById.get(plant.speciesId)?.name : undefined,
          geolocation: plant.coordinates
            ? `${plant.coordinates.latitude.toFixed(6)}, ${plant.coordinates.longitude.toFixed(6)}`
            : undefined,
          notes: plant.notes,
        };
      });
    }

    return plantsToReturn;
  }, [plants, speciesById]);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Table
          id='all-plants-table'
          columns={columns}
          rows={plantsForTable}
          orderBy='species'
          Renderer={AllPlantsCellRenderer}
          onSelect={(plant: PlantForTable) => selectPlant(plant.featureId!)}
        />
      </Grid>
    </Grid>
  );
}
