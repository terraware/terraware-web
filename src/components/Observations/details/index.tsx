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
import { searchObservationDetails } from 'src/redux/features/observations/observationDetailsSelectors';
import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import Search from 'src/components/Observations/search';
import DetailsPage from 'src/components/Observations/common/DetailsPage';
import ObservationDetailsRenderer from './ObservationDetailsRenderer';

const columns = (): TableColumnType[] => [
  { key: 'plantingZoneName', name: strings.ZONE, type: 'string' },
  { key: 'completedTime', name: strings.DATE, type: 'string' },
  { key: 'totalPlants', name: strings.PLANTS, type: 'number' },
  { key: 'totalSpecies', name: strings.SPECIES, type: 'number' },
  { key: 'plantingDensity', name: strings.PLANTING_DENSITY, type: 'number' },
  { key: 'mortalityRate', name: strings.MORTALITY_RATE, type: 'number' },
];

export default function ObservationDetails(): JSX.Element {
  const { plantingSiteId, observationId } = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const defaultTimeZone = useDefaultTimeZone();
  const [search, setSearch] = useState<string>('');

  const urlSite = APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString());

  const details = useAppSelector((state) =>
    searchObservationDetails(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
        search,
      },
      defaultTimeZone.get()
    )
  );

  const title = useMemo(() => {
    const plantingSiteName = details?.plantingSiteName ?? '';
    const completionDate = details?.completedTime ? getShortDate(details.completedTime, activeLocale) : '';
    return `${completionDate} (${plantingSiteName})`;
  }, [activeLocale, details]);

  return (
    <DetailsPage title={title} crumbs={[{ name: strings.OBSERVATIONS, to: urlSite }]}>
      <Box display='flex' flexGrow={1} flexDirection='column'>
        <Box margin={1}>TODO: add info cards and charts here</Box>
        <Box>
          <Card style={isMobile ? { borderRadius: 0, marginLeft: -3, marginRight: -3 } : {}}>
            <Search value={search} onSearch={(val) => setSearch(val)} />
            <Box marginTop={2}>
              <Table
                id='observation-details-table'
                columns={columns}
                rows={details?.plantingZones ?? []}
                orderBy='plantingZoneName'
                Renderer={ObservationDetailsRenderer(Number(plantingSiteId), Number(observationId))}
              />
            </Box>
          </Card>
        </Box>
      </Box>
    </DetailsPage>
  );
}
