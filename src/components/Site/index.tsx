import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization, Site } from 'src/types/Organization';
import Icon from '../common/icon/Icon';
import TfDivisor from '../common/TfDivisor';
import { getSitesById } from 'src/utils/organization';
import TextField from '../common/Textfield/Textfield';
import Button from '../common/button/Button';

const useStyles = makeStyles((theme) =>
  createStyles({
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
  })
);

type SiteDetailsProps = {
  organization?: ServerOrganization;
};
export default function SiteDetails({ organization }: SiteDetailsProps): JSX.Element {
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<Site>();
  const history = useHistory();

  useEffect(() => {
    if (organization) {
      setSite(getSitesById(organization).get(parseInt(siteId, 10)));
    }
  }, [siteId, organization]);

  const classes = useStyles();

  const goToEditSite = () => {
    const editSiteLocation = {
      pathname: APP_PATHS.SITES_EDIT.replace(':siteId', siteId),
    };
    history.push(editSiteLocation);
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Link id='back' to={APP_PATHS.SITES} className={classes.back}>
            <Icon name='caretLeft' className={classes.backIcon} />
            {strings.SITES}
          </Link>
        </Grid>
        <Grid item xs={12} className={classes.titleWithButton}>
          <h2>{site?.name}</h2>
          <Button label={strings.EDIT_SITE} priority='secondary' onClick={goToEditSite} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.NAME} id='name' type='text' value={site?.name} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={strings.DESCRIPTION}
            id='description'
            type='text'
            value={site?.description}
            display={true}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.PROJECT} id='projectName' type='text' value={site?.projectName} display={true} />
        </Grid>
        <Grid item xs={12} />
        <Grid item xs={12}>
          <TfDivisor />
        </Grid>
      </Grid>
    </Container>
  );
}
