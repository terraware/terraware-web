import React, { useMemo, useRef } from 'react';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import { Box, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import { PlantingSite } from 'src/types/Tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PageSnackbar from 'src/components/PageSnackbar';

export type PlantsPrimaryPageViewProps = {
  title: string;
  children: React.ReactNode; // primary content for this page
  plantingSites: PlantingSite[] | undefined;
  selectedPlantingSiteId?: number;
  onSelect: (plantingSite: PlantingSite) => void; // planting site selected, id of -1 refers to All
  isEmptyState?: boolean; // optional boolean to indicate this is an empty state view
};

export default function PlantsPrimaryPageView({
  title,
  children,
  plantingSites,
  selectedPlantingSiteId,
  onSelect,
  isEmptyState,
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
        <Grid
          item
          xs={12}
          display={isMobile ? 'block' : 'flex'}
          paddingLeft={theme.spacing(3)}
          marginBottom={theme.spacing(4)}
        >
          <Typography sx={{ fontSize: '24px', fontWeight: 600, alignItems: 'center' }}>{title}</Typography>
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
              <Box display='flex' alignItems='center' paddingTop={isMobile ? 2 : 0}>
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
        </Grid>
      </PageHeaderWrapper>
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      <Box ref={contentRef} display='flex' flexGrow={1}>
        {children}
      </Box>
    </TfMain>
  );
}
