import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { useAppSelector } from 'src/redux/store';
import { searchObservationPlantingZone } from 'src/redux/features/observations/observationPlantingZoneSelectors';
import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import Search from 'src/components/Observations/search';
import DetailsPage from 'src/components/Observations/common/DetailsPage';
import ObservationPlantingZoneRenderer from './ObservationPlantingZoneRenderer';

const columns = (): TableColumnType[] => [
  { key: 'monitoringPlotName', name: strings.MONITORING_PLOT, type: 'string' },
  { key: 'completedTime', name: strings.DATE, type: 'string' },
  { key: 'isPermanent', name: strings.MONITORING_PLOT_TYPE, type: 'string' },
  { key: 'totalPlants', name: strings.PLANTS, type: 'number' },
  { key: 'totalSpecies', name: strings.SPECIES, type: 'number' },
  { key: 'plantingDensity', name: strings.PLANTING_DENSITY, type: 'number' },
  { key: 'mortalityRate', name: strings.MORTALITY_RATE, type: 'number' },
];

export default function ObservationPlantingZone(): JSX.Element {
  const { plantingSiteId, observationId, plantingZoneId } = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneId: string;
  }>();
  const { isMobile } = useDeviceInfo();
  const defaultTimeZone = useDefaultTimeZone();
  const [search, onSearch] = useState<string>('');

  const plantingZone = useAppSelector((state) =>
    searchObservationPlantingZone(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
        plantingZoneId: Number(plantingZoneId),
        search,
      },
      defaultTimeZone.get()
    )
  );

  return (
    <DetailsPage
      title={plantingZone?.plantingZoneName ?? ''}
      plantingSiteId={plantingSiteId}
      observationId={observationId}
    >
      <Box display='flex' flexGrow={1} flexDirection='column'>
        <Box margin={1}>TODO: add info cards and charts here</Box>
        <Box>
          <Card style={isMobile ? { borderRadius: 0, marginLeft: -3, marginRight: -3 } : {}}>
            <Search search={search} onSearch={(value: string) => onSearch(value)} />
            <Box marginTop={2}>
              <Table
                id='observation-details-table'
                columns={columns}
                rows={plantingZone?.plantingSubzones?.flatMap((subzone) => subzone.monitoringPlots) ?? []}
                orderBy='plantingZoneName'
                Renderer={ObservationPlantingZoneRenderer(
                  Number(plantingSiteId),
                  Number(observationId),
                  Number(plantingZoneId)
                )}
              />
            </Box>
          </Card>
        </Box>
      </Box>
    </DetailsPage>
  );
}
