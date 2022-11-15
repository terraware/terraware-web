import { Typography, Grid, Box, CircularProgress } from '@mui/material';
import { Button, theme } from '@terraware/web-components';
import strings from 'src/strings';
import { TERRAWARE_SUPPORT_LINK } from 'src/constants';
import { PlantingSite } from 'src/api/types/tracking';
import { PlantingSiteMap } from '../Map';

type BondariesAndPlotsProps = {
  plantingSite: PlantingSite;
};

export default function BondariesAndPlots(props: BondariesAndPlotsProps): JSX.Element {
  const { plantingSite } = props;

  return (
    <>
      <Grid item xs={12}>
        <Typography fontSize='20px' fontWeight={600} margin={theme.spacing(3, 0)}>
          {strings.BOUNDARIES_AND_PLOTS}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {plantingSite ? (
          <>
            {plantingSite.boundary ? (
              <PlantingSiteMap plantingSite={plantingSite} />
            ) : (
              <Box
                sx={{
                  border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                  maxWidth: '800px',
                  margin: '0 auto',
                  textAlign: 'center',
                  paddingX: 5,
                }}
              >
                <Typography fontSize='20px' fontWeight={600} margin={theme.spacing(3, 0)}>
                  {strings.IMPORT_BOUNDARIES_AND_PLOTS}
                </Typography>
                <Typography fontSize='16px' fontWeight={400} padding={theme.spacing(1, 0)}>
                  {strings.IMPORT_BOUNDARIES_AND_PLOTS_DESCRIPTION}
                </Typography>
                <Box sx={{ paddingY: 2 }}>
                  <Button
                    label={strings.CONTACT_US}
                    onClick={() => window.open(TERRAWARE_SUPPORT_LINK, '_blank')}
                    size='medium'
                  />
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
            <CircularProgress />
          </Box>
        )}
      </Grid>
    </>
  );
}
