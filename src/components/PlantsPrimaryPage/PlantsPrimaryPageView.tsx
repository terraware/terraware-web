import React, { useCallback, useMemo, useRef } from 'react';

import { Box, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, IconName, Message } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

import PageHeaderWrapper from '../common/PageHeaderWrapper';
import PlantsDashboardEmptyMessage from '../emptyStatePages/PlantsDashboardEmptyMessage';

export type ButtonProps = {
  title: string;
  onClick: () => void;
  icon: IconName;
};

export type PlantsPrimaryPageViewProps = {
  actionButton?: ButtonProps;
  children: React.ReactNode; // primary content for this page
  isEmptyState?: boolean; // optional boolean to indicate this is an empty state view
  onSelect: (plantingSite?: PlantingSite) => void; // planting site selected, id of -1 refers to All
  plantingSites: PlantingSite[] | undefined;
  selectedPlantingSiteId?: number;
  style?: Record<string, string | number>;
  text?: string; // optional text to show at the bottom of the header
  title: string;
  newHeader?: boolean;
  showGeometryNote?: boolean;
  latestObservationId?: number;
  projectId?: number;
  isLoading?: boolean;
};

export default function PlantsPrimaryPageView({
  children,
  onSelect,
  plantingSites,
  selectedPlantingSiteId,
  style,
  text,
  showGeometryNote,
  latestObservationId,
  projectId,
  isEmptyState,
  newHeader,
  title,
  actionButton,
  isLoading,
}: PlantsPrimaryPageViewProps): JSX.Element {
  const theme = useTheme();
  const { isDesktop, isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const isRolledUpView = useMemo(() => {
    return projectId !== undefined && selectedPlantingSiteId === -1;
  }, [projectId, selectedPlantingSiteId]);

  const onChangePlantingSiteId = useCallback(
    (siteId: number) => {
      const selectedPlantingSite = plantingSites?.find((ps) => ps.id === siteId);
      if (selectedPlantingSite) {
        onSelect(selectedPlantingSite);
      }
    },
    [onSelect, plantingSites]
  );

  const options = useMemo(
    () => plantingSites?.map((site) => ({ label: site.name, value: site.id })) ?? [],
    [plantingSites]
  );

  const totalArea = useMemo(() => {
    return plantingSites?.reduce((sum, site) => sum + (site?.areaHa ?? 0), 0) || 0;
  }, [plantingSites]);

  if (!plantingSites || (plantingSites.length && !selectedPlantingSiteId) || isLoading) {
    return (
      <TfMain>
        <CircularProgress sx={{ margin: 'auto' }} />
      </TfMain>
    );
  }

  const Wrapper = projectId ? Box : TfMain;
  return (
    <Wrapper>
      {newHeader ? (
        <>
          {showGeometryNote && selectedPlantingSiteId && latestObservationId && (
            <Box marginBottom={theme.spacing(4)}>
              <Message
                body={
                  <span>
                    <b>{strings.PLEASE_NOTE}</b>
                    {strings.formatString(
                      strings.GEOMETRY_CHANGED_WARNING_MESSAGE,
                      <Link
                        fontSize={'16px'}
                        to={`${APP_PATHS.OBSERVATION_DETAILS.replace(
                          ':plantingSiteId',
                          selectedPlantingSiteId.toString()
                        ).replace(':observationId', latestObservationId.toString())}?map=true`}
                        target='_blank'
                      >
                        {strings.HAS_CHANGED}
                      </Link>
                    )}
                  </span>
                }
                priority='info'
                type='page'
              />
            </Box>
          )}
          <Card radius={'8px'} style={{ 'margin-bottom': '32px' }}>
            <Grid container alignItems={'center'} spacing={4}>
              <Grid item xs={isDesktop ? 3 : 12}>
                <Dropdown
                  placeholder={strings.SELECT}
                  id='planting-site-selector'
                  onChange={(newValue) => onChangePlantingSiteId(Number(newValue))}
                  options={options}
                  selectedValue={selectedPlantingSiteId}
                  fullWidth
                  disabled={isAcceleratorRoute && options.length === 1}
                />
              </Grid>
              <Grid item xs={isDesktop ? 3 : 12}>
                <Box>
                  <Typography fontWeight={600}>{strings.TOTAL_PLANTING_AREA}</Typography>
                  <Typography fontSize='28px' fontWeight={600}>
                    {strings.formatString(
                      strings.X_HA,
                      isRolledUpView
                        ? Math.round(totalArea * 100) / 100
                        : plantingSites.find((ps) => ps.id === selectedPlantingSiteId)?.areaHa?.toString() || ''
                    )}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={isDesktop ? 6 : 12}>
                <Typography fontSize='16px' marginTop={theme.spacing(1)}>
                  {text}
                </Typography>
              </Grid>
            </Grid>
          </Card>
          {isEmptyState && !isAcceleratorRoute && <PlantsDashboardEmptyMessage />}
        </>
      ) : (
        <PageHeaderWrapper nextElement={contentRef.current}>
          <Grid item xs={12} paddingLeft={theme.spacing(3)} marginBottom={theme.spacing(4)}>
            <Grid item xs={12} display={isMobile ? 'block' : 'flex'} alignItems='center'>
              <Box display='flex' alignItems='center'>
                <Typography sx={{ fontSize: '24px', fontWeight: 600, alignItems: 'center' }}>{title}</Typography>
                {actionButton && isMobile && (
                  <Box marginLeft='auto' display='flex'>
                    <Button
                      id={`${actionButton.title}_id`}
                      icon={actionButton.icon}
                      onClick={actionButton.onClick}
                      size='medium'
                    />
                  </Box>
                )}
              </Box>
              {plantingSites.length > 0 && (
                <>
                  {!isMobile && (
                    <Box
                      sx={{
                        margin: theme.spacing(0, 2),
                        width: '1px',
                        height: '32px',
                        backgroundColor: theme.palette.TwClrBgTertiary,
                      }}
                    />
                  )}
                  <Box display='flex' alignItems='center' padding={theme.spacing(2, 0)}>
                    <Typography sx={{ paddingRight: 1, fontSize: '16px', fontWeight: 500 }}>
                      {strings.PLANTING_SITE}
                    </Typography>
                    <Dropdown
                      placeholder={strings.SELECT}
                      id='planting-site-selector'
                      onChange={(newValue: string) => onChangePlantingSiteId(Number(newValue))}
                      options={options}
                      selectedValue={selectedPlantingSiteId}
                    />
                  </Box>
                </>
              )}
              {actionButton && !isMobile && (
                <Box marginLeft='auto' display='flex'>
                  <Button
                    id={`${actionButton.title}_id`}
                    label={actionButton.title}
                    onClick={actionButton.onClick}
                    size='medium'
                  />
                </Box>
              )}
            </Grid>
            {text && (
              <Typography fontSize='14px' marginTop={theme.spacing(1)}>
                {text}
              </Typography>
            )}
          </Grid>
        </PageHeaderWrapper>
      )}
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      <Box ref={contentRef} sx={style}>
        {children}
      </Box>
    </Wrapper>
  );
}
