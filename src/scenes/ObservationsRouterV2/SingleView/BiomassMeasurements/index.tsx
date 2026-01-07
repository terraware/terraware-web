import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import useStickyTabs from 'src/utils/useStickyTabs';

import BiomassObservationDataTab from './BiomassObservationDataTab';
import InvasiveAndThreatenedSpeciesTab from './InvasiveAndThreatenedSpeciesTab';

const BiomassMeasurementsView = (): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
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

  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);

  const title = (
    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
      {results?.adHocPlot?.monitoringPlotNumber}
    </Typography>
  );

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
    ];
  }, [strings.INVASIVE_AND_THREATENED_SPECIES, strings.OBSERVATION_DATA]);

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

export default BiomassMeasurementsView;
