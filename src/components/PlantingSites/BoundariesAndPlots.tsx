import { Typography, Box, CircularProgress } from '@mui/material';
import { Button, theme } from '@terraware/web-components';
import strings from 'src/strings';
import { TERRAWARE_SUPPORT_LINK } from 'src/constants';
import { PlantingSite } from 'src/api/types/tracking';
import { PlantingSiteMap } from '../Map';

type BoundariesAndPlotsProps = {
  plantingSite: PlantingSite;
};

export default function BoundariesAndPlots(props: BoundariesAndPlotsProps): JSX.Element {
  const { plantingSite } = props;

  return (
    <Box display='flex' flexGrow={plantingSite?.boundary ? 1 : 0} flexDirection='column' paddingTop={theme.spacing(3)}>
      <Box display='flex' flexGrow={0}>
        <Typography fontSize='20px' fontWeight={600} margin={theme.spacing(3, 0)}>
          {strings.BOUNDARIES_AND_PLOTS}
        </Typography>
      </Box>
      <Box display='flex' sx={{ flexGrow: 1 }}>
        {plantingSite ? (
          <>
            {plantingSite.boundary ? (
              <PlantingSiteMap plantingSite={plantingSite} style={{ borderRadius: '24px' }} />
            ) : (
              <Box
                sx={{
                  border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                  maxWidth: '800px',
                  margin: '0 auto',
                  textAlign: 'center',
                  marginTop: 3,
                  backgroundColor: theme.palette.TwClrBg,
                  borderRadius: '32px',
                  padding: theme.spacing(3),
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
      </Box>
    </Box>
  );
}
