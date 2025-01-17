import React, { useMemo, useRef } from 'react';

import { Box, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, IconName, Message, PopoverMenu } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

import Link from '../common/Link';

export type ButtonProps = {
  title: string;
  onClick: () => void;
  icon: IconName;
};

export type PlantsPrimaryPageViewProps = {
  actionButton?: ButtonProps;
  children: React.ReactNode; // primary content for this page
  isEmptyState?: boolean; // optional boolean to indicate this is an empty state view
  onSelect: (plantingSite: PlantingSite) => void; // planting site selected, id of -1 refers to All
  plantingSites: PlantingSite[] | undefined;
  selectedPlantingSiteId?: number;
  style?: Record<string, string | number>;
  text?: string; // optional text to show at the bottom of the header
  title: string;
  newHeader?: boolean;
  showGeometryNote?: boolean;
  previousObservationId?: number;
};

export default function PlantsPrimaryPageView({
  actionButton,
  children,
  onSelect,
  plantingSites,
  selectedPlantingSiteId,
  style,
  text,
  title,
  newHeader,
  showGeometryNote,
  previousObservationId,
}: PlantsPrimaryPageViewProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);

  const onChangePlantingSite = (selectedSite: DropdownItem) => {
    const selectedPlantingSite = plantingSites?.find((ps) => ps.id === selectedSite.value);
    if (selectedPlantingSite) {
      onSelect(selectedPlantingSite);
    }
  };

  const onChangePlantingSiteId = (siteId: any) => {
    const selectedPlantingSite = plantingSites?.find((ps) => ps.id === siteId);
    if (selectedPlantingSite) {
      onSelect(selectedPlantingSite);
    }
  };

  const options = useMemo(
    () => plantingSites?.map((site) => ({ label: site.name, value: site.id })) ?? [],
    [plantingSites]
  );

  if (!plantingSites || (plantingSites.length && !selectedPlantingSiteId)) {
    return (
      <TfMain>
        <CircularProgress sx={{ margin: 'auto' }} />
      </TfMain>
    );
  }

  return (
    <TfMain>
      {newHeader && plantingSites.length > 0 ? (
        <>
          {showGeometryNote && selectedPlantingSiteId && previousObservationId && (
            <Box marginBottom={theme.spacing(4)}>
              <Message
                body={
                  <span>
                    <b>{strings.PLEASE_NOTE}</b>{' '}
                    {strings.formatString(
                      strings.GEOMETRY_CHANGED_WARNING_MESSAGE,
                      <Link
                        fontSize={'16px'}
                        to={APP_PATHS.OBSERVATION_DETAILS.replace(
                          ':plantingSiteId',
                          selectedPlantingSiteId.toString()
                        ).replace(':observationId', previousObservationId.toString())}
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
              <Grid item xs={4}>
                <PopoverMenu
                  anchor={
                    <p style={{ fontSize: '24px', fontWeight: 600, color: theme.palette.TwClrTxt }}>
                      {plantingSites.find((ps) => ps.id === selectedPlantingSiteId)?.name || strings.SELECT}
                    </p>
                  }
                  menuSections={[
                    options?.map((opt) => ({
                      label: opt.label,
                      value: opt.value,
                    })),
                  ]}
                  onClick={onChangePlantingSite}
                />
              </Grid>
              <Grid item xs={2}>
                <Box>
                  <Typography fontWeight={600}>{strings.TOTAL_PLANTING_AREA}</Typography>
                  <Typography fontSize='28px' fontWeight={600}>
                    {strings.formatString(
                      strings.X_HA,
                      plantingSites.find((ps) => ps.id === selectedPlantingSiteId)?.areaHa?.toString() || ''
                    )}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography fontSize='16px' marginTop={theme.spacing(1)}>
                  {text}
                </Typography>
              </Grid>
            </Grid>
          </Card>
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
                      id={`${actionButton.title}_id}`}
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
                      onChange={onChangePlantingSiteId}
                      options={options}
                      selectedValue={selectedPlantingSiteId}
                    />
                  </Box>
                </>
              )}
              {actionButton && !isMobile && (
                <Box marginLeft='auto' display='flex'>
                  <Button
                    id={`${actionButton.title}_id}`}
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
    </TfMain>
  );
}
