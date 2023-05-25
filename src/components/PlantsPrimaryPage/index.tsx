import React, { useCallback, useEffect, useRef, useState } from 'react';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import { Box, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import { Select } from '@terraware/web-components';
import { PlantingSite } from 'src/types/Tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { useHistory, useParams } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import { PreferencesService, TrackingService } from 'src/services';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PageSnackbar from 'src/components/PageSnackbar';
import { useOrganization } from 'src/providers/hooks';

export type PlantsPrimaryPageProps = {
  title: string;
  children: React.ReactNode; // primary content for this page
  onSelect: (plantingSite: PlantingSite) => void; // planting site selected, id of -1 refers to All
  pagePath: string;
  lastVisitedPreferenceName: string;
  plantsSitePreferences?: Record<string, unknown>;
  setPlantsSitePreferences: (preferences: Record<string, unknown>) => void;
  allowAllAsSiteSelection?: boolean; // whether to support 'All' as a planting site selection
};

const allSitesOption = () => ({
  name: strings.ALL,
  id: -1,
});

export default function PlantsPrimaryPage({
  title,
  children,
  onSelect,
  pagePath,
  lastVisitedPreferenceName,
  plantsSitePreferences,
  setPlantsSitePreferences,
  allowAllAsSiteSelection,
}: PlantsPrimaryPageProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const history = useHistory();
  const snackbar = useSnackbar();
  const contentRef = useRef(null);

  useEffect(() => {
    if (plantsSitePreferences) {
      PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
        [lastVisitedPreferenceName]: plantsSitePreferences,
      });
    }
  }, [plantsSitePreferences, lastVisitedPreferenceName, selectedOrganization.id]);

  useEffect(() => {
    const populatePlantingSites = async () => {
      const serverResponse = await TrackingService.listPlantingSites(selectedOrganization.id);
      if (serverResponse.requestSucceeded) {
        if (allowAllAsSiteSelection && serverResponse.sites?.length) {
          setPlantingSites([allSitesOption(), ...serverResponse.sites]);
        } else {
          setPlantingSites(serverResponse.sites ?? []);
        }
      } else {
        snackbar.toastError();
      }
    };
    populatePlantingSites();
  }, [selectedOrganization.id, snackbar, allowAllAsSiteSelection]);

  const setActivePlantingSite = useCallback(
    (site: PlantingSite | undefined) => {
      if (site) {
        history.push(pagePath.replace(':plantingSiteId', site.id.toString()));
      }
    },
    [history, pagePath]
  );

  useEffect(() => {
    const initializePlantingSite = async () => {
      if (plantingSites && plantingSites.length) {
        let lastVisitedPlantingSite: any = {};
        const response = await PreferencesService.getUserOrgPreferences(selectedOrganization.id);
        if (response.requestSucceeded && response.preferences && response.preferences[lastVisitedPreferenceName]) {
          lastVisitedPlantingSite = response.preferences[lastVisitedPreferenceName];
        }
        const plantingSiteIdToUse = plantingSiteId || lastVisitedPlantingSite.plantingSiteId;
        const requestedPlantingSite = plantingSites.find(
          (plantingSite) => plantingSite?.id === parseInt(plantingSiteIdToUse, 10)
        );
        const plantingSiteToUse = requestedPlantingSite || plantingSites[0];

        if (plantingSiteToUse.id !== lastVisitedPlantingSite.plantingSiteId) {
          lastVisitedPlantingSite = { plantingSiteId: plantingSiteToUse.id };
          PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
            [lastVisitedPreferenceName]: lastVisitedPlantingSite,
          });
        }
        setPlantsSitePreferences(lastVisitedPlantingSite);
        if (plantingSiteToUse.id.toString() === plantingSiteId) {
          setSelectedPlantingSite(plantingSiteToUse);
          onSelect(plantingSiteToUse);
        } else {
          setActivePlantingSite(plantingSiteToUse);
        }
      }
    };
    initializePlantingSite();
  }, [
    onSelect,
    plantingSites,
    plantingSiteId,
    setActivePlantingSite,
    selectedOrganization.id,
    lastVisitedPreferenceName,
    setPlantsSitePreferences,
  ]);

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
        {children}
      </Box>
    </TfMain>
  );
}
