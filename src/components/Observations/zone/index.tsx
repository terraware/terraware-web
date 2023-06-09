import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { getShortDate } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';
import { useAppSelector } from 'src/redux/store';
import { searchObservationPlantingZone } from 'src/redux/features/observations/observationPlantingZoneSelectors';
import { selectObservationDetails } from 'src/redux/features/observations/observationDetailsSelectors';
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
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const defaultTimeZone = useDefaultTimeZone();
  const [search, onSearch] = useState<string>('');

  const urlSite = APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString());

  const urlDetails = `/${observationId}`;

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

  const details = useAppSelector((state) =>
    selectObservationDetails(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
      },
      defaultTimeZone.get()
    )
  );

  const crumbName = useMemo(() => {
    const plantingSiteName = details?.plantingSiteName ?? '';
    const completionDate = details?.completedTime ? getShortDate(details.completedTime, activeLocale) : '';
    return `${completionDate} (${plantingSiteName})`;
  }, [activeLocale, details]);

  return (
    <DetailsPage
      title={plantingZone?.plantingZoneName ?? ''}
      crumbs={[
        { name: strings.OBSERVATIONS, to: urlSite },
        { name: crumbName, to: urlDetails },
      ]}
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
