import { Grid, Theme, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import Icon from '../common/icon/Icon';
import { getAllSeedBanks } from 'src/utils/organization';
import TextField from '../common/Textfield/Textfield';
import Button from '../common/button/Button';
import { Facility } from 'src/api/types/facilities';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import TfMain from '../common/TfMain';

const useStyles = makeStyles((theme: Theme) => ({
  backIcon: {
    fill: theme.palette.TwClrIcnBrand,
    marginRight: theme.spacing(1),
  },
  back: {
    display: 'flex',
    textDecoration: 'none',
    color: theme.palette.TwClrTxtBrand,
    alignItems: 'center',
  },
  titleWithButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

type SeedBankDetailsProps = {
  organization?: ServerOrganization;
};
export default function SeedBankDetails({ organization }: SeedBankDetailsProps): JSX.Element {
  const theme = useTheme();
  const { seedBankId } = useParams<{ seedBankId: string }>();
  const [seedBank, setSeedBank] = useState<Facility>();
  const history = useHistory();

  useEffect(() => {
    if (organization) {
      const selectedSeedBank = getAllSeedBanks(organization).find((sb) => sb?.id.toString() === seedBankId);
      if (selectedSeedBank) {
        setSeedBank(selectedSeedBank);
      } else {
        history.push(APP_PATHS.SEED_BANKS);
      }
    }
  }, [seedBankId, organization, history]);

  const classes = useStyles();

  const goToEditSeedBank = () => {
    const editSeedBankLocation = {
      pathname: APP_PATHS.SEED_BANKS_EDIT.replace(':seedBankId', seedBankId),
    };
    history.push(editSeedBankLocation);
  };

  const { isMobile } = useDeviceInfo();
  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <TfMain>
      <Grid container padding={theme.spacing(0, 0, 4, 0)}>
        <Grid item xs={12} marginBottom={theme.spacing(3)}>
          <Link id='back' to={APP_PATHS.SEED_BANKS} className={classes.back}>
            <Icon name='caretLeft' className={classes.backIcon} size='small' />
            <Typography fontSize='14px' fontWeight={500}>
              {strings.SEED_BANKS}
            </Typography>
          </Link>
        </Grid>
        <Grid item xs={12} padding={theme.spacing(0, 3)} className={classes.titleWithButton}>
          <Typography fontSize='20px' fontWeight={600} margin={0}>
            {seedBank?.name}
          </Typography>
          <Button
            icon='iconEdit'
            label={isMobile ? undefined : strings.EDIT}
            priority='primary'
            size='medium'
            onClick={goToEditSeedBank}
          />
        </Grid>
        <Grid item xs={12}>
          <PageSnackbar />
        </Grid>
      </Grid>
      <Grid
        container
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '32px',
          padding: theme.spacing(3),
          margin: 0,
        }}
      >
        <Grid item xs={gridSize()}>
          <TextField label={strings.NAME_REQUIRED} id='name' type='text' value={seedBank?.name} display={true} />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.DESCRIPTION_REQUIRED}
            id='description'
            type='text'
            value={seedBank?.description}
            display={true}
          />
        </Grid>
      </Grid>
    </TfMain>
  );
}
