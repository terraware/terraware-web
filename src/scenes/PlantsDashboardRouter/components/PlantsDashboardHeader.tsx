import React, { type JSX, useEffect, useState } from 'react';

import { Box, CircularProgress, GlobalStyles, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Message } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import SurvivalRateMessageV2 from 'src/components/SurvivalRate/SurvivalRateMessageV2';
import Card from 'src/components/common/Card';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import TfMain from 'src/components/common/TfMain';
import PlantsDashboardEmptyMessage from 'src/components/emptyStatePages/PlantsDashboardEmptyMessage';
import { APP_PATHS } from 'src/constants';
import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization } from 'src/providers';

export type PlantsDashboardHeaderProps = {
  title: string;
  text?: string;
  children: React.ReactNode;
  style?: Record<string, string | number>;

  isAcceleratorRoute: boolean;
  hasSites: boolean;
  isLoading: boolean;

  // Planting-site selector
  selectedPlantingSiteId: PlantingSiteId;
  plantingSiteOptions: DropdownItem[];
  onSelectPlantingSite: (plantingSiteId: PlantingSiteId) => void;
  // Show the divider above the leading 'all' option.
  showAllSitesDivider: boolean;

  // Project selector
  projectId: number | typeof ALL_PLANTING_SITES;
  projectOptions?: DropdownItem[];
  onSelectProject?: (projectId: number | typeof ALL_PLANTING_SITES) => void;

  // Total planting area to display in the header card.
  displayAreaHa: number;

  // Messages
  showGeometryNote?: boolean;
  latestObservationId?: number;
  geometryChangedDate?: string;
  latestObservationDate?: string;
  showSurvivalRateMessage?: boolean;
};

export default function PlantsDashboardHeader({
  title,
  text,
  children,
  style,
  isAcceleratorRoute,
  hasSites,
  isLoading,
  selectedPlantingSiteId,
  plantingSiteOptions,
  onSelectPlantingSite,
  showAllSitesDivider,
  projectId,
  projectOptions,
  onSelectProject,
  displayAreaHa,
  showGeometryNote,
  latestObservationId,
  geometryChangedDate,
  latestObservationDate,
  showSurvivalRateMessage,
}: PlantsDashboardHeaderProps): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

  const singleSiteMode = isAcceleratorRoute && plantingSiteOptions.length === 1;
  const isSiteSelected = typeof selectedPlantingSiteId === 'number';

  // Mirror the legacy 1s settle delay before revealing content, so the dashboard does not flicker
  // between loading and empty/ready states while the planting site payload is resolving.
  const isReady = (isAcceleratorRoute || plantingSiteOptions.length > 0) && hasSites;
  const [delayedIsReady, setDelayedIsReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDelayedIsReady(isReady), 1000);
    return () => clearTimeout(timer);
  }, [isReady]);

  const showProjectSelector = !isAcceleratorRoute && (projectOptions?.length ?? 0) > 1 && !!onSelectProject;
  const showSelectorCard = (isAcceleratorRoute || plantingSiteOptions.length > 0) && isReady;

  const Wrapper = typeof projectId === 'number' ? Box : TfMain;

  return (
    <Wrapper>
      {title && (
        <Grid item xs={12} paddingLeft={theme.spacing(3)} marginBottom={theme.spacing(2)}>
          <Typography sx={{ fontSize: '24px', fontWeight: 600, alignItems: 'center' }}>{title}</Typography>
        </Grid>
      )}
      {showGeometryNote && isSiteSelected && latestObservationId && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={
              <span>
                <b>{strings.PLEASE_NOTE}</b>{' '}
                {strings.formatString(
                  strings.GEOMETRY_CHANGED_WARNING_MESSAGE,
                  <span>{geometryChangedDate ?? ''}</span>,
                  !isAcceleratorRoute ? (
                    <Link
                      fontSize={'16px'}
                      to={APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', latestObservationId.toString())}
                      target='_blank'
                    >
                      {latestObservationDate ?? ''}
                    </Link>
                  ) : (
                    <Typography fontSize={'16px'} display={'inline'}>
                      {latestObservationDate ?? ''}
                    </Typography>
                  )
                )}
              </span>
            }
            priority='info'
            type='page'
          />
        </Box>
      )}
      {showSurvivalRateMessage && isSiteSelected && (
        <SurvivalRateMessageV2 selectedPlantingSiteId={selectedPlantingSiteId} />
      )}
      {showSelectorCard && (
        <Card radius={'8px'} style={{ 'margin-bottom': '32px' }}>
          <Grid container alignItems={'center'} spacing={4}>
            <Grid item xs={isDesktop ? 3 : 12}>
              {showProjectSelector && (
                <Box marginBottom={1}>
                  <Dropdown
                    placeholder={strings.NO_PROJECT_SELECTED}
                    id='project-selector'
                    onChange={(newValue) =>
                      onSelectProject?.(newValue === ALL_PLANTING_SITES ? ALL_PLANTING_SITES : Number(newValue))
                    }
                    options={projectOptions}
                    selectedValue={projectId}
                    fullWidth
                  />
                </Box>
              )}
              {singleSiteMode ? (
                <Typography fontSize={'20px'} fontWeight={600}>
                  {plantingSiteOptions[0].label}
                </Typography>
              ) : (
                <>
                  {showAllSitesDivider && (
                    <GlobalStyles
                      styles={{
                        '.planting-site-selector-container .options-container li:first-of-type': {
                          borderBottom: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
                        },
                      }}
                    />
                  )}
                  <Dropdown
                    placeholder={strings.SELECT}
                    id='planting-site-selector'
                    onChange={(newValue) =>
                      onSelectPlantingSite(newValue === ALL_PLANTING_SITES ? ALL_PLANTING_SITES : Number(newValue))
                    }
                    options={plantingSiteOptions}
                    selectedValue={selectedPlantingSiteId}
                    fullWidth
                    disabled={isAcceleratorRoute && plantingSiteOptions.length === 0}
                    className='planting-site-selector-container'
                  />
                </>
              )}
            </Grid>
            <Grid item xs={isDesktop ? 3 : 12}>
              <Box>
                <Typography fontWeight={600}>{strings.TOTAL_PLANTING_AREA}</Typography>
                <Typography fontSize='28px' fontWeight={600}>
                  {strings.formatString(strings.X_HA, <FormattedNumber decimals={1} value={displayAreaHa} />)}
                </Typography>
              </Box>
            </Grid>
            {!delayedIsReady ? (
              <CircularProgress sx={{ margin: 'auto' }} />
            ) : (
              <Grid item xs={isDesktop ? 6 : 12}>
                <Typography fontSize='16px' marginTop={theme.spacing(1)}>
                  {text}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Card>
      )}
      {!hasSites && !isAcceleratorRoute && !isLoading && delayedIsReady && <PlantsDashboardEmptyMessage />}
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      {!delayedIsReady || isLoading ? <CircularProgress sx={{ margin: 'auto' }} /> : <Box sx={style}>{children}</Box>}
    </Wrapper>
  );
}
