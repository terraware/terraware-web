import React, { useCallback, useMemo, useRef } from 'react';

import { Box, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, IconName, Message } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

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
}: PlantsPrimaryPageViewProps): JSX.Element {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
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

  if (!plantingSites || (plantingSites.length && !selectedPlantingSiteId)) {
    return (
      <TfMain>
        <CircularProgress sx={{ margin: 'auto' }} />
      </TfMain>
    );
  }

  const Wrapper = projectId ? Box : TfMain;
  return (
    <Wrapper>
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
      </>
      {isEmptyState && !isAcceleratorRoute && <PlantsDashboardEmptyMessage />}
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      <Box ref={contentRef} sx={style}>
        {children}
      </Box>
    </Wrapper>
  );
}
