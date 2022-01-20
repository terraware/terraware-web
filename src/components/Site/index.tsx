import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import strings from 'src/strings';
import { ServerOrganization, Site } from 'src/types/Organization';
import Icon from '../common/icon/Icon';
import TfDivisor from '../common/TfDivisor';
import { getSitesById } from 'src/utils/organization';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
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
    value: {
      fontSize: '16px',
    },
  })
);

type SiteDetailsProps = {
  organization?: ServerOrganization;
};
export default function SiteDetails({ organization }: SiteDetailsProps): JSX.Element {
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<Site>();

  useEffect(() => {
    if (organization) {
      setSite(getSitesById(organization).get(parseInt(siteId, 10)));
    }
  }, [siteId, organization]);

  const classes = useStyles();

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Link id='back' to='/sites' className={classes.back}>
            <Icon name='caretLeft' className={classes.backIcon} />
            {strings.SITES}
          </Link>
        </Grid>
        <Grid item xs={12}>
          <h2>{site?.name}</h2>
        </Grid>
        <Grid item xs={4}>
          <p>{strings.NAME}</p>
          <p className={classes.value}>{site?.name}</p>
        </Grid>
        <Grid item xs={4}>
          <p>{strings.DESCRIPTION}</p>
          <p className={classes.value}>{site?.description}</p>
        </Grid>
        <Grid item xs={4}>
          <p>{strings.PROJECT}</p>
          <p className={classes.value}>{site?.projectName}</p>
        </Grid>
        <Grid item xs={12} />
        <Grid item xs={12}>
          <TfDivisor />
        </Grid>
      </Grid>
    </Container>
  );
}
