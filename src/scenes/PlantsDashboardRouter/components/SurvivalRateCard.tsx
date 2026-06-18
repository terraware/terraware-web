import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLatestSiteObservationResult, useProjectSiteObservationResults } from 'src/hooks/observations';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { useKnowledgeBaseLinks } from 'src/knowledgeBaseLinks';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import strings from 'src/strings';

import HighestAndLowestSurvivalRateSpeciesCard from './HighestAndLowestSurvivalRateSpeciesCard';
import HighestAndLowestSurvivalRateStrataCard from './HighestAndLowestSurvivalRateStrataCard';
import LiveDeadPlantsPerSpeciesCard from './LiveDeadPlantsPerSpeciesCard';

type SurvivalRateCardProps = {
  plantingSiteId?: number;
  projectId?: number | 'all';
};

export default function SurvivalRateCard({ plantingSiteId, projectId }: SurvivalRateCardProps): JSX.Element {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const isProjectView = !plantingSiteId && typeof projectId === 'number';
  const knowledgeBaseLinks = useKnowledgeBaseLinks();
  const trackEvent = useTrackEvent();

  useEffect(() => {
    trackEvent(MIXPANEL_EVENTS.SURVIVAL_RATE_VIEWED, { is_project_view: !!isProjectView });
  }, [isProjectView, trackEvent]);

  const { observation: latestObservationResult, isLoading: isLoadingObservation } = useLatestSiteObservationResult(
    plantingSiteId,
    'Stratum'
  );

  const projectSiteResults = useProjectSiteObservationResults(
    typeof projectId === 'number' ? projectId : undefined,
    isProjectView
  );

  const weightedSurvivalRate = useMemo(() => {
    const validStrata = projectSiteResults.flatMap(({ site, result }) =>
      (result?.strata ?? [])
        .map((stratum) => {
          const areaHa = site.strata?.find((s) => s.id === stratum.stratumId)?.areaHa;
          return { areaHa, survivalRate: stratum.survivalRate };
        })
        .filter(
          (entry): entry is { areaHa: number; survivalRate: number } =>
            entry.survivalRate !== undefined && entry.areaHa !== undefined && entry.areaHa > 0
        )
    );
    const totalArea = validStrata.reduce((sum, stratum) => sum + stratum.areaHa, 0);
    if (totalArea === 0) {
      return undefined;
    }
    return Math.round(validStrata.reduce((sum, stratum) => sum + stratum.survivalRate * stratum.areaHa, 0) / totalArea);
  }, [projectSiteResults]);

  const separatorStyles = {
    width: '1px',
    height: 'auto',
    backgroundColor: theme.palette.TwClrBrdrTertiary,
    marginRight: '24px',
    marginLeft: '24px',
  };

  return (
    <Card
      busy={isLoadingObservation}
      radius='8px'
      style={{ display: 'flex', 'justify-content': 'space-between', flexDirection: isDesktop ? 'row' : 'column' }}
    >
      <Box flexBasis='100%'>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {isProjectView ? strings.AVERAGE_PROJECT_STRATA_SURVIVAL_RATE : strings.AVERAGE_STRATA_SURVIVAL_RATE}
          </Typography>
          <Tooltip
            title={strings.formatString(
              strings.WEIGHTED_SURVIVAL_RATE_TOOLTIP,
              <Link
                to={knowledgeBaseLinks['/observations.*/survival-rate-settings']}
                fontSize={'11px'}
                target='_blank'
                style={{ color: '#FFF', lineHeight: '16,5px' }}
              >
                {strings.KNOWLEDGE_BASE_ARTICLE_SURVIVAL_RATES}
              </Link>
            )}
          >
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box data-testid='survival-rate-value' display='flex' sx={{ flexFlow: 'row wrap' }} marginTop={1}>
          {(() => {
            const displayValue = isProjectView ? weightedSurvivalRate : latestObservationResult?.survivalRate;
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

        {latestObservationResult?.survivalRate === undefined && (
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
      {(plantingSiteId || isProjectView) && (
        <>
          <div style={separatorStyles} />
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
              <HighestAndLowestSurvivalRateStrataCard plantingSiteId={plantingSiteId} projectId={projectId} />
            </Box>
          </Box>
        </>
      )}
      {plantingSiteId && (
        <>
          <div style={separatorStyles} />
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
          <div style={separatorStyles} />
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
        </>
      )}
    </Card>
  );
}
