import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { getShortDate } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';
import { useAppSelector } from 'src/redux/store';
import { searchObservationDetails } from 'src/redux/features/observations/observationDetailsSelectors';
import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import Search, { SearchInputProps } from 'src/components/Observations/search';
import DetailsPage from 'src/components/Observations/common/DetailsPage';
import AggregatedPlantsStats from 'src/components/Observations/common/AggregatedPlantsStats';
import ObservationDetailsRenderer from './ObservationDetailsRenderer';

const columns = (): TableColumnType[] => [
  { key: 'plantingZoneName', name: strings.ZONE, type: 'string' },
  { key: 'completedDate', name: strings.DATE, type: 'string' },
  { key: 'totalPlants', name: strings.PLANTS, type: 'number' },
  { key: 'totalSpecies', name: strings.SPECIES, type: 'number' },
  { key: 'plantingDensity', name: strings.PLANTING_DENSITY, type: 'number' },
  { key: 'mortalityRate', name: strings.MORTALITY_RATE, type: 'number' },
];

export type ObservationDetailsProps = SearchInputProps;

export default function ObservationDetails({ search, onSearch }: ObservationDetailsProps): JSX.Element {
  const { plantingSiteId, observationId } = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const defaultTimeZone = useDefaultTimeZone();

  const details = useAppSelector((state) =>
    searchObservationDetails(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
        search,
      },
      defaultTimeZone.get().id
    )
  );

  const title = useMemo(() => {
    const plantingSiteName = details?.plantingSiteName ?? '';
    const completionDate = details?.completedDate ? getShortDate(details.completedDate, activeLocale) : '';
    return `${completionDate} (${plantingSiteName})`;
  }, [activeLocale, details]);

  return (
    <DetailsPage title={title} plantingSiteId={plantingSiteId}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AggregatedPlantsStats {...(details ?? {})} />
        </Grid>
        <Grid item xs={12}>
          <Card style={isMobile ? { borderRadius: 0, marginLeft: -3, marginRight: -3 } : {}}>
            <Search search={search} onSearch={onSearch} />
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
        </Grid>
      </Grid>
    </DetailsPage>
  );
}
