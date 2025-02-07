import React, { useMemo } from 'react';

import { Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { selectAdHocObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

export type BiomassMeasurementProps = {
  selectedPlantingSite?: PlantingSite;
};

export default function BiomassMeasurement({ selectedPlantingSite }: BiomassMeasurementProps): JSX.Element {
  const theme = useTheme();

  const allAdHocObservationsResults = useAppSelector(selectAdHocObservationsResults);
  const adHocObservationsResults = useMemo(() => {
    if (!allAdHocObservationsResults || !selectedPlantingSite?.id) {
      return [];
    }

    return allAdHocObservationsResults?.filter((observationResult) => {
      const matchesSite =
        selectedPlantingSite.id !== -1 ? observationResult.plantingSiteId === selectedPlantingSite.id : true;
      const isBiomassMeasurement = observationResult.type === 'Biomass Measurements';
      return matchesSite && isBiomassMeasurement;
    });
  }, [allAdHocObservationsResults, selectedPlantingSite]);

  const columns = (): TableColumnType[] => {
    return [
      {
        key: 'plotNumber',
        name: strings.PLOT,
        type: 'string',
      },
      {
        key: 'plantingSiteName',
        name: strings.PLANTING_SITE,
        type: 'string',
      },
      {
        key: 'startDate',
        name: strings.DATE,
        type: 'date',
      },
      {
        key: 'totalPlants',
        name: strings.PLANTS,
        type: 'number',
      },
      {
        key: 'totalSpecies',
        name: strings.SPECIES,
        type: 'number',
      },
    ];
  };

  return (
    <Card>
      <Typography
        sx={{
          fontSize: '20px',
          fontWeight: 600,
          color: theme.palette.TwClrTxt,
          marginBottom: theme.spacing(2),
        }}
      >
        {strings.BIOMASS_MEASUREMENT}
      </Typography>
      <Card style={{ margin: '56px auto 0', borderRadius: '24px', height: 'fit-content' }}>
        {adHocObservationsResults ? (
          <Table
            id='biomass-measurement-table'
            columns={columns}
            rows={adHocObservationsResults || []}
            orderBy='startDate'
          />
        ) : (
          <EmptyStateContent
            title={''}
            subtitle={[strings.BIOMASS_EMPTY_STATE_MESSAGE_1, strings.BIOMASS_EMPTY_STATE_MESSAGE_2]}
          />
        )}
      </Card>
    </Card>
  );
}
