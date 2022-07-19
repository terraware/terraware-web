import { Container, Grid, Theme } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import Icon from '../common/icon/Icon';
import TfDivisor from '../common/TfDivisor';
import { getAllSeedBanks } from 'src/utils/organization';
import TextField from '../common/Textfield/Textfield';
import Button from '../common/button/Button';
import { Facility } from 'src/api/types/facilities';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    height: '-webkit-fill-available',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    background: '#ffffff',
  },
  backIcon: {
    fill: '#007DF2',
    marginRight: theme.spacing(1),
  },
  back: {
    display: 'flex',
    textDecoration: 'none',
    color: '#0067C8',
    fontSize: '20px',
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

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Link id='back' to={APP_PATHS.SEED_BANKS} className={classes.back}>
            <Icon name='caretLeft' className={classes.backIcon} />
            {strings.SEED_BANKS}
          </Link>
        </Grid>
        <Grid item xs={12} className={classes.titleWithButton}>
          <h2>{seedBank?.name}</h2>
          <Button label={strings.EDIT} priority='secondary' onClick={goToEditSeedBank} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.NAME_REQUIRED} id='name' type='text' value={seedBank?.name} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={strings.DESCRIPTION_REQUIRED}
            id='description'
            type='text'
            value={seedBank?.description}
            display={true}
          />
        </Grid>
        <Grid item xs={12}>
          <h2>{strings.SENSOR_KIT}</h2>
          <p>
            {seedBank?.connectionState === 'Configured'
              ? strings.formatString(
                  strings.SENSOR_KIT_HAS_BEEN_SET_UP,
                  <Link to={APP_PATHS.MONITORING}>{strings.MONITORING}</Link>
                )
              : strings.formatString(
                  strings.SENSOR_KIT_READY_TO_SET_UP,
                  <Link to={`${APP_PATHS.MONITORING}/${seedBankId}`}>{strings.MONITORING}</Link>
                )}
          </p>
        </Grid>
        <Grid item xs={12}>
          <TfDivisor />
        </Grid>
      </Grid>
    </Container>
  );
}
