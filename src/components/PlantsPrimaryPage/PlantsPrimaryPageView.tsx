import React, { useMemo, useRef } from 'react';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import { Box, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, IconName } from '@terraware/web-components';
import { PlantingSite } from 'src/types/Tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PageSnackbar from 'src/components/PageSnackbar';

export type ButtonProps = {
  title: string;
  onClick: () => void;
  icon: IconName;
};

export type PlantsPrimaryPageViewProps = {
  title: string;
  text?: string; // optional text to show at the bottom of the header
  children: React.ReactNode; // primary content for this page
  plantingSites: PlantingSite[] | undefined;
  selectedPlantingSiteId?: number;
  onSelect: (plantingSite: PlantingSite) => void; // planting site selected, id of -1 refers to All
  isEmptyState?: boolean; // optional boolean to indicate this is an empty state view
  actionButton?: ButtonProps;
};

export default function PlantsPrimaryPageView({
  title,
  text,
  children,
  plantingSites,
  selectedPlantingSiteId,
  onSelect,
  isEmptyState,
  actionButton,
}: PlantsPrimaryPageViewProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);

  const onChangePlantingSite = (siteId: any) => {
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
    <TfMain backgroundImageVisible={isEmptyState}>
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
                    onChange={onChangePlantingSite}
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
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      <Box ref={contentRef}>{children}</Box>
    </TfMain>
  );
}
