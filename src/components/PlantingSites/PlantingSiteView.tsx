import TfMain from 'src/components/common/TfMain';
import { Typography, Container, Grid, Box } from '@mui/material';
import { Button, Icon, theme } from '@terraware/web-components';
import strings from 'src/strings';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { getPlantingSite } from 'src/api/tracking/tracking';
import { APP_PATHS, TERRAWARE_SUPPORT_LINK } from 'src/constants';
import { Link, useParams } from 'react-router-dom';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useEffect, useState } from 'react';
import PageSnackbar from '../PageSnackbar';
import { makeStyles } from '@mui/styles';
import { PlantingSite } from 'src/api/types/tracking';

const useStyles = makeStyles(() => ({
  backIcon: {
    fill: theme.palette.TwClrIcnBrand,
    marginRight: theme.spacing(1),
  },
  back: {
    display: 'flex',
    textDecoration: 'none',
    color: theme.palette.TwClrTxtBrand,
    fontSize: '20px',
    alignItems: 'center',
  },
}));

export default function PlantingSiteView(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const [plantingSite, setPlantingSite] = useState<PlantingSite>();

  useEffect(() => {
    const loadPlantingSite = async () => {
      const response = await getPlantingSite(Number.parseInt(plantingSiteId, 10));
      if (response.requestSucceeded) {
        setPlantingSite(response.site);
      }
    };

    loadPlantingSite();
  }, [plantingSiteId]);

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <TfMain>
      <Container maxWidth={false}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Link id='back' to={APP_PATHS.PLANTING_SITES} className={classes.back}>
              <Icon name='caretLeft' className={classes.backIcon} />
              {strings.PLANTING_SITES}
            </Link>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography fontSize='20px' fontWeight={600} margin={theme.spacing(1, 0)}>
              {plantingSite?.name}
            </Typography>
            {isMobile ? (
              <Button icon='iconEdit' onClick={() => true} priority='secondary' />
            ) : (
              <Button icon='iconEdit' label={strings.EDIT} onClick={() => true} priority='secondary' />
            )}
          </Grid>
          <PageSnackbar />
          <Grid item xs={gridSize()}>
            <TextField id='name' label={strings.NAME} type='text' value={plantingSite?.name} display={true} />
          </Grid>
          <Grid item xs={gridSize()}>
            <TextField
              id='description'
              label={strings.DESCRIPTION}
              type='textarea'
              value={plantingSite?.description}
              display={true}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography fontSize='20px' fontWeight={600} margin={theme.spacing(3, 0)}>
              {strings.BOUNDARIES_AND_PLOTS}
            </Typography>
          </Grid>
          <Grid item xs={12}>
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
          </Grid>
        </Grid>
      </Container>
    </TfMain>
  );
}
