import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useKnowledgeBaseLinks } from 'src/knowledgeBaseLinks';
import { useListObservationSummariesQuery } from 'src/queries/generated/observations';
import { useListAcceleratorReportsQuery } from 'src/queries/generated/reports';
import strings from 'src/strings';

import HighestAndLowestSurvivalRateSpeciesCard from './HighestAndLowestSurvivalRateSpeciesCard';
import HighestAndLowestSurvivalRateStrataCard from './HighestAndLowestSurvivalRateStrataCard';
import LiveDeadPlantsPerSpeciesCard from './LiveDeadPlantsPerSpeciesCard';

type SurvivalRateCardProps = {
  plantingSiteId?: number;
  projectId?: number;
};

export default function SurvivalRateCard({ plantingSiteId, projectId }: SurvivalRateCardProps): JSX.Element {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const isWeightedSurvivalRatesEnabled = isEnabled('Weighted Survival Rates');
  const isProjectView = !plantingSiteId && projectId;
  const knowledgeBaseLinks = useKnowledgeBaseLinks();

  const observationSummariesQuery = useListObservationSummariesQuery(
    { plantingSiteId: plantingSiteId || -1 },
    { skip: plantingSiteId === -1 || !plantingSiteId }
  );
  const observationSummaries = observationSummariesQuery.data?.summaries;

  const acceleratorReportsQuery = useListAcceleratorReportsQuery(
    { projectId: projectId || -1, includeIndicators: true },
    { skip: !(isWeightedSurvivalRatesEnabled && isProjectView) }
  );

  const weightedSurvivalRate = useMemo(() => {
    const reports = acceleratorReportsQuery.data?.reports;
    if (!reports?.length) {
      return undefined;
    }
    const latestReport = [...reports].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
    const survivalRateIndicator = latestReport.autoCalculatedIndicators?.find(
      (indicator) => indicator.indicator === 'Survival Rate'
    );
    return survivalRateIndicator?.systemValue;
  }, [acceleratorReportsQuery.data?.reports]);

  const separatorStyles = {
    width: '1px',
    height: 'auto',
    backgroundColor: theme.palette.TwClrBrdrTertiary,
    marginRight: '24px',
    marginLeft: '24px',
  };

  const latestSummary = useMemo(
    () => (observationSummaries && observationSummaries.length > 0 ? observationSummaries[0] : undefined),
    [observationSummaries]
  );

  return (
    <Card
      busy={observationSummariesQuery.isFetching}
      radius='8px'
      style={{ display: 'flex', 'justify-content': 'space-between', flexDirection: isDesktop ? 'row' : 'column' }}
    >
      <Box flexBasis='100%'>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.SURVIVAL_RATE}
          </Typography>
          <Tooltip
            title={
              isWeightedSurvivalRatesEnabled && isProjectView
                ? strings.formatString(
                    strings.WEIGHTED_SURVIVAL_RATE_TOOLTIP,
                    <Link
                      to={knowledgeBaseLinks['/observations.*/survival-rate-settings']}
                      fontSize={'11px'}
                      target='_blank'
                      style={{ color: '#FFF', lineHeight: '16,5px' }}
                    >
                      {strings.KNOWLEDGE_BASE_ARTICLE_SURVIVAL_RATES}
                    </Link>
                  )
                : strings.SURVIVAL_RATE_TOOLTIP
            }
          >
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box data-testid='survival-rate-value' display='flex' sx={{ flexFlow: 'row wrap' }} marginTop={1}>
          {(() => {
            const displayValue =
              isWeightedSurvivalRatesEnabled && isProjectView ? weightedSurvivalRate : latestSummary?.survivalRate;
            return displayValue !== undefined ? (
              <>
                <Typography fontSize='48px' fontWeight={600} lineHeight={1}>
                  <FormattedNumber value={displayValue} />
                </Typography>
                <Typography fontSize='48px' fontWeight={600} lineHeight={1}>
                  %
                </Typography>
              </>
            ) : (
              <Typography fontSize='20px' fontWeight={500}>
                {strings.CANNOT_BE_CALCULATED}
              </Typography>
            );
          })()}
        </Box>

        {latestSummary?.survivalRate === undefined && (
          <Box>
            {plantingSiteId && (
              <Typography>
                {strings.formatString(
                  strings.SET_T0_DATA_IN_THE,
                  <Link
                    fontSize='16px'
                    to={APP_PATHS.SURVIVAL_RATE_SETTINGS_V2.replace(':plantingSiteId', plantingSiteId.toString())}
                  >
                    {strings.SURVIVAL_RATE_SETTINGS}
                  </Link>
                )}
              </Typography>
            )}
          </Box>
        )}
      </Box>
      <div style={separatorStyles} />
      {plantingSiteId && (
        <Box flexBasis='100%' marginTop={isDesktop ? 0 : 4}>
          <Box display={'flex'} alignItems={'center'}>
            <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
              {strings.STRATUM_SURVIVAL}
            </Typography>
            <Tooltip title={strings.STRATUM_SURVIVAL_TOOLTIP}>
              <Box display='flex'>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
              </Box>
            </Tooltip>
          </Box>
          <Box paddingTop={2}>
            <HighestAndLowestSurvivalRateStrataCard plantingSiteId={plantingSiteId} />
          </Box>
        </Box>
      )}
      <div style={separatorStyles} />
      {plantingSiteId && (
        <Box flexBasis='100%' marginTop={isDesktop ? 0 : 6}>
          <Box display={'flex'} alignItems={'center'}>
            <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
              {strings.SPECIES_SURVIVAL}
            </Typography>
            <Tooltip title={strings.SPECIES_SURVIVAL_TOOLTIP}>
              <Box display='flex'>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
              </Box>
            </Tooltip>
          </Box>
          <Box paddingTop={2}>
            <HighestAndLowestSurvivalRateSpeciesCard plantingSiteId={plantingSiteId} />
          </Box>
        </Box>
      )}
      <div style={separatorStyles} />
      {plantingSiteId && (
        <Box flexBasis='100%' marginTop={isDesktop ? 0 : 6}>
          <Box display={'flex'} alignItems={'center'}>
            <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
              {strings.SPECIES_SURVIVAL_BREAKDOWN}
            </Typography>
            <Tooltip title={strings.SPECIES_SURVIVAL_BREAKDOWN_TOOLTIP}>
              <Box display='flex'>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
              </Box>
            </Tooltip>
          </Box>
          <Box paddingTop={2}>
            <LiveDeadPlantsPerSpeciesCard plantingSiteId={plantingSiteId} />
          </Box>
        </Box>
      )}
    </Card>
  );
}
