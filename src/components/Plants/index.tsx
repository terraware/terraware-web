import React, { useCallback, useEffect, useRef, useState } from 'react';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import { Box, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import { Select } from '@terraware/web-components';
import { PlantingSite } from 'src/types/Tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { useHistory, useParams } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import { APP_PATHS } from 'src/constants';
import PlantingSiteDetails from './PlantingSiteDetails';
import { PreferencesService, TrackingService } from 'src/services';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PageSnackbar from 'src/components/PageSnackbar';
import { useOrganization } from 'src/providers/hooks';

export default function PlantsDashboard(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [plantsDashboardPreferences, setPlantsDashboardPreferences] = useState<{ [key: string]: unknown }>();
  const contentRef = useRef(null);

  useEffect(() => {
    if (plantsDashboardPreferences) {
      PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
        lastDashboardPlantingSite: plantsDashboardPreferences,
      });
    }
  }, [plantsDashboardPreferences, selectedOrganization]);

  useEffect(() => {
    const populatePlantingSites = async () => {
      const serverResponse = await TrackingService.listPlantingSites(selectedOrganization.id);
      if (serverResponse.requestSucceeded) {
        setPlantingSites(serverResponse.sites ?? []);
      } else {
        snackbar.toastError();
      }
    };
    populatePlantingSites();
  }, [selectedOrganization, snackbar]);

  const setActivePlantingSite = useCallback(
    (site: PlantingSite | undefined) => {
      if (site) {
        history.push(APP_PATHS.PLANTING_SITE_DASHBOARD.replace(':plantingSiteId', site.id.toString()));
      }
    },
    [history]
  );

  useEffect(() => {
    const initializePlantingSite = async () => {
      if (plantingSites && plantingSites.length) {
        let lastDashboardPlantingSite: any = {};
        const response = await PreferencesService.getUserOrgPreferences(selectedOrganization.id);
        if (response.requestSucceeded && response.preferences?.lastDashboardPlantingSite) {
          lastDashboardPlantingSite = response.preferences.lastDashboardPlantingSite;
        }
        const plantingSiteIdToUse = plantingSiteId || lastDashboardPlantingSite.plantingSiteId;
        const requestedPlantingSite = plantingSites.find(
          (plantingSite) => plantingSite?.id === parseInt(plantingSiteIdToUse, 10)
        );
        const plantingSiteToUse = requestedPlantingSite || plantingSites[0];

        if (plantingSiteToUse.id !== lastDashboardPlantingSite.plantingSiteId) {
          lastDashboardPlantingSite = { plantingSiteId: plantingSiteToUse.id };
          PreferencesService.updateUserOrgPreferences(selectedOrganization.id, { lastDashboardPlantingSite });
        }
        setPlantsDashboardPreferences(lastDashboardPlantingSite);
        if (plantingSiteToUse.id.toString() === plantingSiteId) {
          setSelectedPlantingSite(plantingSiteToUse);
        } else {
          setActivePlantingSite(plantingSiteToUse);
        }
      }
    };
    initializePlantingSite();
  }, [plantingSites, plantingSiteId, setActivePlantingSite, selectedOrganization]);

  const onChangePlantingSite = (newValue: string) => {
    if (plantingSites) {
      setActivePlantingSite(plantingSites.find((ps) => ps.name === newValue));
    }
  };

  if (!plantingSites || (plantingSites.length && !selectedPlantingSite)) {
    return (
      <TfMain>
        <CircularProgress sx={{ margin: 'auto' }} />
      </TfMain>
    );
  }

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Grid
          item
          xs={12}
          display={isMobile ? 'block' : 'flex'}
          paddingLeft={theme.spacing(3)}
          marginBottom={theme.spacing(4)}
        >
          <Typography sx={{ fontSize: '24px', fontWeight: 600, alignItems: 'center' }}>{strings.DASHBOARD}</Typography>
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
                <Select
                  options={plantingSites.map((ps) => ps?.name || '')}
                  onChange={onChangePlantingSite}
                  selectedValue={selectedPlantingSite?.name}
                  placeholder={strings.SELECT}
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
        <PlantingSiteDetails
          plantingSite={selectedPlantingSite}
          plantsDashboardPreferences={plantsDashboardPreferences}
          setPlantsDashboardPreferences={(newPreferences) => {
            setPlantsDashboardPreferences((oldPreferences) => ({ ...oldPreferences, ...newPreferences }));
          }}
        />
      </Box>
    </TfMain>
  );
}
