import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, CircularProgress, GlobalStyles, Grid, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, IconName, Message } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization, useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

import SurvivalRateMessage from '../SurvivalRate/SurvivalRateMessage';
import FormattedNumber from '../common/FormattedNumber';
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
  onSelect: (plantingSite?: PlantingSite) => void; // planting site selected, id of -1 refers to All
  plantingSites: PlantingSite[] | undefined;
  selectedPlantingSiteId?: number;
  style?: Record<string, string | number>;
  text?: string; // optional text to show at the bottom of the header
  title: string;
  newHeader?: boolean;
  showGeometryNote?: boolean;
  showSurvivalRateMessage?: boolean;
  latestObservationId?: number;
  projectId?: number;
  onSelectProjectId?: (projectId: number) => void;
  allowAllAsSiteSelection?: boolean;
};

export default function PlantsPrimaryPageView({
  children,
  onSelect,
  plantingSites,
  selectedPlantingSiteId,
  style,
  text,
  showGeometryNote,
  showSurvivalRateMessage,
  latestObservationId,
  projectId,
  onSelectProjectId,
  newHeader,
  title,
  actionButton,
  allowAllAsSiteSelection,
}: PlantsPrimaryPageViewProps): JSX.Element {
  const theme = useTheme();
  const { isDesktop, isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const projects = useAppSelector(selectProjects);
  const dispatch = useAppDispatch();
  const { allPlantingSites, isLoading, isInitiated, plantingSite } = usePlantingSiteData();
  const [delayedIsPlantingSiteSet, setDelayedIsPlantingSiteSet] = useState(false);

  const hasSites = useMemo(() => {
    return (
      (!isAcceleratorRoute && (allPlantingSites?.length ?? 0) > 1) ||
      (isAcceleratorRoute && (plantingSites?.length ?? 0) > 0)
    );
  }, [allPlantingSites, isAcceleratorRoute, plantingSites]);

  const plantingSiteSelected = useMemo(() => {
    return plantingSite !== undefined;
  }, [plantingSite]);

  const isPlantingSiteSet = useMemo(() => {
    return isInitiated && ((hasSites && plantingSiteSelected) || (!hasSites && !plantingSiteSelected));
  }, [isInitiated, hasSites, plantingSiteSelected]);

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestProjects(selectedOrganization.id, activeLocale || undefined));
    }
  }, [activeLocale, dispatch, selectedOrganization]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedIsPlantingSiteSet(isPlantingSiteSet);
    }, 1000);

    return () => clearTimeout(timer); // Cancel timeout if dependencies change
  }, [isPlantingSiteSet]);

  const projectsWithPlantingSites = useMemo(() => {
    if (!allPlantingSites) {
      return [];
    }

    const projectIds = allPlantingSites.map((ps) => ps.projectId);
    const uniqueProjectIds = Array.from(new Set(projectIds));

    return uniqueProjectIds;
  }, [allPlantingSites]);

  const projectsOptions = useMemo(() => {
    const iOptions = projects
      ?.filter((p) => projectsWithPlantingSites.includes(p.id))
      .map((proj) => ({ label: proj.name, value: proj.id }));
    iOptions?.unshift({ label: strings.NO_PROJECT, value: -1 });
    return iOptions;
  }, [projects, projectsWithPlantingSites]);

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

  if (
    !plantingSites ||
    (!isAcceleratorRoute && (allPlantingSites?.length ?? 0) > 1 && !selectedPlantingSiteId) ||
    (isAcceleratorRoute && (plantingSites?.length ?? 0) > 0 && !selectedPlantingSiteId)
  ) {
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
          {title && (
            <Grid item xs={12} paddingLeft={theme.spacing(3)} marginBottom={theme.spacing(4)}>
              <Typography sx={{ fontSize: '24px', fontWeight: 600, alignItems: 'center' }}>{title}</Typography>
            </Grid>
          )}
          {showGeometryNote && selectedPlantingSiteId && latestObservationId && (
            <Box marginBottom={theme.spacing(4)}>
              <Message
                body={
                  <span>
                    <b>{strings.PLEASE_NOTE}</b>{' '}
                    {strings.formatString(
                      strings.GEOMETRY_CHANGED_WARNING_MESSAGE,
                      !isAcceleratorRoute ? (
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
                      ) : (
                        <Typography fontSize={'16px'} display={'inline'}>
                          {strings.HAS_CHANGED}
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
          {showSurvivalRateMessage && selectedPlantingSiteId && (
            <SurvivalRateMessage selectedPlantingSiteId={selectedPlantingSiteId} />
          )}
          {(isAcceleratorRoute || (!isAcceleratorRoute && options.length > 0)) && isPlantingSiteSet && (
            <Card radius={'8px'} style={{ 'margin-bottom': '32px' }}>
              <Grid container alignItems={'center'} spacing={4}>
                <Grid item xs={isDesktop ? 3 : 12}>
                  {!isAcceleratorRoute && (projectsOptions?.length ?? 0) > 1 && onSelectProjectId && (
                    <Box marginBottom={1}>
                      <Dropdown
                        placeholder={strings.NO_PROJECT_SELECTED}
                        id='project-selector'
                        onChange={(newValue) => onSelectProjectId(Number(newValue))}
                        options={projectsOptions}
                        selectedValue={projectId}
                        fullWidth
                      />
                    </Box>
                  )}
                  {isAcceleratorRoute && options.length === 1 ? (
                    <Typography fontSize={'20px'} fontWeight={600}>
                      {options[0].label}
                    </Typography>
                  ) : (
                    <>
                      {allowAllAsSiteSelection && options.length > 2 && (
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
                        onChange={(newValue) => onChangePlantingSiteId(Number(newValue))}
                        options={options}
                        selectedValue={selectedPlantingSiteId}
                        fullWidth
                        disabled={isAcceleratorRoute && options.length === 0}
                        className='planting-site-selector-container'
                      />
                    </>
                  )}
                </Grid>
                <Grid item xs={isDesktop ? 3 : 12}>
                  <Box>
                    <Typography fontWeight={600}>{strings.TOTAL_PLANTING_AREA}</Typography>
                    <Typography fontSize='28px' fontWeight={600}>
                      {strings.formatString(
                        strings.X_HA,
                        isRolledUpView ? (
                          <FormattedNumber value={Math.round(totalArea * 100) / 100} />
                        ) : (
                          <FormattedNumber
                            value={plantingSites.find((ps) => ps.id === selectedPlantingSiteId)?.areaHa || 0}
                          />
                        )
                      )}
                    </Typography>
                  </Box>
                </Grid>
                {!delayedIsPlantingSiteSet ? (
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
          {!hasSites && !isAcceleratorRoute && !isLoading && delayedIsPlantingSiteSet && (
            <PlantsDashboardEmptyMessage />
          )}
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
                    {allowAllAsSiteSelection && options.length > 2 && (
                      <GlobalStyles
                        styles={{
                          '.planting-site-selector-container .options-container li:first-of-type': {
                            borderBottom: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
                          },
                        }}
                      />
                    )}
                    <Typography sx={{ paddingRight: 1, fontSize: '16px', fontWeight: 500 }}>
                      {strings.PLANTING_SITE}
                    </Typography>
                    <Dropdown
                      placeholder={strings.SELECT}
                      id='planting-site-selector'
                      onChange={(newValue: string) => onChangePlantingSiteId(Number(newValue))}
                      options={options}
                      selectedValue={selectedPlantingSiteId}
                      className='planting-site-selector-container'
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
      {newHeader && (!delayedIsPlantingSiteSet || isLoading) ? (
        <CircularProgress sx={{ margin: 'auto' }} />
      ) : (
        <Box ref={contentRef} sx={style}>
          {children}
        </Box>
      )}
    </Wrapper>
  );
}
