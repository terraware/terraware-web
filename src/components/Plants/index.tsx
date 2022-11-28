import React, { useCallback, useEffect, useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import { Box, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import { Select } from '@terraware/web-components';
import { listPlantingSites } from 'src/api/tracking/tracking';
import { PlantingSite } from 'src/api/types/tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { useHistory, useParams } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import { APP_PATHS } from 'src/constants';
import PlantingSiteDetails from './PlantingSiteDetails';

type PlantsDashboardProps = {
  organization: ServerOrganization;
};

export default function PlantsDashboard(props: PlantsDashboardProps): JSX.Element {
  const { organization } = props;
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const history = useHistory();
  const [snackbar] = useState(useSnackbar());

  useEffect(() => {
    const populatePlantingSites = async () => {
      const serverResponse = await listPlantingSites(organization.id);
      if (serverResponse.requestSucceeded) {
        setPlantingSites(serverResponse.sites ?? []);
      } else {
        snackbar.toastError(serverResponse.error);
      }
    };
    populatePlantingSites();
  }, [organization.id, snackbar]);

  const setActivePlantingSite = useCallback(
    (site: PlantingSite | undefined) => {
      if (site) {
        history.push(APP_PATHS.PLANTING_SITE_DASHBOARD.replace(':plantingSiteId', site.id.toString()));
      }
    },
    [history]
  );

  useEffect(() => {
    if (plantingSites && plantingSites.length) {
      const plantingSiteIdToUse = plantingSiteId;
      const requestedPlantingSite = plantingSites.find((ps) => ps?.id === parseInt(plantingSiteIdToUse, 10));
      const plantingSiteToUse = requestedPlantingSite || plantingSites[0];
      if (plantingSiteToUse.id.toString() === plantingSiteId) {
        setSelectedPlantingSite(plantingSiteToUse);
      } else {
        setActivePlantingSite(plantingSiteToUse);
      }
    }
  }, [plantingSites, plantingSiteId, setActivePlantingSite]);

  const onChangePlantingSite = (newValue: string) => {
    if (plantingSites) {
      setActivePlantingSite(plantingSites.find((ps) => ps.name === newValue));
    }
  };

  return (
    <TfMain>
      {plantingSites ? (
        <>
          <Grid item xs={12} display={isMobile ? 'block' : 'flex'}>
            <Typography sx={{ fontSize: '24px', fontWeight: 600, alignItems: 'center' }}>
              {strings.DASHBOARD}
            </Typography>
            {!isMobile && (
              <Box
                sx={{ margin: '0 1%', width: '1px', height: '32px', backgroundColor: theme.palette.TwClrBgTertiary }}
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
          </Grid>
          <PlantingSiteDetails selectedPlantingSite={selectedPlantingSite} />
        </>
      ) : (
        <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
          <CircularProgress />
        </Box>
      )}
    </TfMain>
  );
}
