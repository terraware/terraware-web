import React, { type JSX, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Tabs, Tooltip } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useGetOneObservationResults } from 'src/hooks/observations';
import { useLocalization } from 'src/providers';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { getShortDate } from 'src/utils/dateFormatter';
import useStickyTabs from 'src/utils/useStickyTabs';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import BiomassObservationDataTab from './BiomassObservationDataTab';
import BiomassPhotosTab from './BiomassPhotosTab';
import InvasiveAndThreatenedSpeciesTab from './InvasiveAndThreatenedSpeciesTab';

const BiomassMeasurementsDetails = (): JSX.Element => {
  const theme = useTheme();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const { activeLocale, strings } = useLocalization();
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

  const crumbs: Crumb[] = useMemo(() => {
    const crumbsData: Crumb[] = [
      {
        name: strings.OBSERVATIONS,
        to: `${APP_PATHS.OBSERVATIONS}`,
      },
    ];

    return crumbsData;
  }, [strings.OBSERVATIONS]);

  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  useEffect(() => {
    if (results?.plantingSiteId) {
      void getPlantingSite({ id: results.plantingSiteId, includeZones: false }, true);
    }
  }, [getPlantingSite, results?.plantingSiteId]);

  const title = useMemo(() => {
    if (results) {
      const completedDate = results.completedTime
        ? getDateDisplayValue(results.completedTime, plantingSite?.timeZone ?? defaultTimezone)
        : undefined;
      const observationDate = getShortDate(completedDate ?? results.startDate, activeLocale);
      const swCoordinatesLat = results.adHocPlot?.boundary?.coordinates?.[0]?.[0]?.[0];
      const swCoordinatesLong = results.adHocPlot?.boundary?.coordinates?.[0]?.[0]?.[1];
      const hasLocation = swCoordinatesLat !== undefined && swCoordinatesLong !== undefined;
      return (
        <Box display='flex' alignItems={'end'}>
          <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {observationDate} ({plantingSite?.name ?? ''})
          </Typography>
          {hasLocation && (
            <Tooltip
              placement='bottom'
              title={
                <Box>
                  <Typography>
                    {strings.LOCATION}: {swCoordinatesLat}, {swCoordinatesLong}
                  </Typography>
                  <Typography>
                    {strings.ELEVATION}: {results.adHocPlot?.elevationMeters} {strings.METERS}
                  </Typography>
                </Box>
              }
            >
              <Typography
                fontSize='16px'
                color={theme.palette.TwClrTxtBrand}
                fontWeight={400}
                paddingLeft={theme.spacing(1)}
              >
                {strings.PLOT_INFO}
              </Typography>
            </Tooltip>
          )}
        </Box>
      );
    } else {
      return undefined;
    }
  }, [activeLocale, defaultTimezone, plantingSite?.name, plantingSite?.timeZone, results, strings, theme]);

  const tabs = useMemo(() => {
    return [
      {
        id: 'observationData',
        label: strings.OBSERVATION_DATA,
        children: <BiomassObservationDataTab />,
      },
      {
        id: 'invasiveAndThreatenedSpecies',
        label: strings.INVASIVE_AND_THREATENED_SPECIES,
        children: <InvasiveAndThreatenedSpeciesTab />,
      },
      {
        id: 'photosAndVideos',
        label: strings.PHOTOS_AND_VIDEOS,
        children: <BiomassPhotosTab />,
      },
    ];
  }, [strings.INVASIVE_AND_THREATENED_SPECIES, strings.OBSERVATION_DATA, strings.PHOTOS_AND_VIDEOS]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'observationData',
    tabs,
    viewIdentifier: 'biomassObservation',
  });

  return (
    <Page crumbs={crumbs} title={title} titleContainerStyle={{ paddingTop: 3, paddingBottom: 1 }}>
      <Box width='100%'>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default BiomassMeasurementsDetails;
