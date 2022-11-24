import React, { useEffect, useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Select } from '@terraware/web-components';
import { listPlantingSites } from 'src/api/tracking/tracking';
import { PlantingSite } from 'src/api/types/tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';

type PlantsDashboardProps = {
  organization: ServerOrganization;
};

export default function PlantsDashboard(props: PlantsDashboardProps): JSX.Element {
  const { organization } = props;
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>([]);
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    const populatePlantingSites = async () => {
      const serverResponse = await listPlantingSites(organization.id);
      if (serverResponse.requestSucceeded) {
        setPlantingSites(serverResponse.sites ?? []);
      }
    };
    populatePlantingSites();
  }, [organization]);

  const onChangePlantingSite = (newValue: string) => {
    setSelectedPlantingSite(plantingSites.find((ps) => ps.name === newValue));
  };

  return (
    <TfMain>
      <Grid item xs={12} display={isMobile ? 'block' : 'flex'}>
        <Typography sx={{ fontSize: '24px', fontWeight: 600, alignItems: 'center' }}>{strings.DASHBOARD}</Typography>
        {!isMobile && (
          <Box sx={{ margin: '0 1%', width: '1px', height: '32px', backgroundColor: theme.palette.TwClrBgTertiary }} />
        )}
        <Box display='flex' alignItems='center' paddingTop={isMobile ? 2 : 0}>
          <Typography sx={{ paddingRight: 1, fontSize: '16px', fontWeight: 500 }}>{strings.PLANTING_SITE}</Typography>
          <Select
            options={plantingSites.map((ps) => ps?.name || '')}
            onChange={onChangePlantingSite}
            selectedValue={selectedPlantingSite?.name}
            placeholder={strings.SELECT}
          />
        </Box>
      </Grid>
    </TfMain>
  );
}
