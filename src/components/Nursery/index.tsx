import { Container, Grid, Theme, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import Icon from '../common/icon/Icon';
import { getAllNurseries } from 'src/utils/organization';
import TextField from '../common/Textfield/Textfield';
import Button from '../common/button/Button';
import { Facility } from 'src/api/types/facilities';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
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

type NurseryDetailsProps = {
  organization?: ServerOrganization;
};
export default function NurseryDetails({ organization }: NurseryDetailsProps): JSX.Element {
  const { nurseryId } = useParams<{ nurseryId: string }>();
  const [nursery, setNursery] = useState<Facility>();
  const history = useHistory();

  useEffect(() => {
    if (organization) {
      const selectedNursery = getAllNurseries(organization).find((n) => n?.id.toString() === nurseryId);
      if (selectedNursery) {
        setNursery(selectedNursery);
      } else {
        history.push(APP_PATHS.SEED_BANKS);
      }
    }
  }, [nurseryId, organization, history]);

  const classes = useStyles();

  const goToEditNursery = () => {
    const editNurseryLocation = {
      pathname: APP_PATHS.NURSERIES_EDIT.replace(':nurseryId', nurseryId),
    };
    history.push(editNurseryLocation);
  };

  const { isMobile } = useDeviceInfo();
  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <Container maxWidth={false}>
      <Grid container spacing={3}>
        <Grid item xs={12} marginTop={3}>
          <Link id='back' to={APP_PATHS.NURSERIES} className={classes.back}>
            <Icon name='caretLeft' className={classes.backIcon} />
            {strings.NURSERIES}
          </Link>
        </Grid>
        <Grid item xs={12} className={classes.titleWithButton}>
          <Typography fontSize='20px' fontWeight={600}>
            {nursery?.name}
          </Typography>
          {isMobile ? (
            <Button icon='iconEdit' priority='secondary' onClick={goToEditNursery} />
          ) : (
            <Button icon='iconEdit' label={strings.EDIT} priority='secondary' onClick={goToEditNursery} />
          )}
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField label={strings.NAME} id='name' type='text' value={nursery?.name} display={true} />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.DESCRIPTION}
            id='description'
            type='text'
            value={nursery?.description}
            display={true}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
