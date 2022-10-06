import { Container, Grid } from '@mui/material';
import { Theme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { getOrganizationUsers } from 'src/api/organization/organization';
import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import TextField from 'src/components/common/Textfield/Textfield';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';
import { makeStyles } from '@mui/styles';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    height: '100%',
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
  email: {
    wordBreak: 'break-all',
  },
  editButton: {
    float: 'right',
  },
}));

type PersonDetailsProps = {
  organization?: ServerOrganization;
};

export default function PersonDetails({ organization }: PersonDetailsProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { personId } = useParams<{ personId: string }>();
  const [person, setPerson] = useState<OrganizationUser>();
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    const populatePersonData = async () => {
      const response = await getOrganizationUsers(organization!);
      if (response.requestSucceeded) {
        const selectedUser = response.users.find((user) => user.id.toString() === personId);
        if (selectedUser) {
          setPerson(selectedUser);
        } else {
          history.push(APP_PATHS.PEOPLE);
        }
      }
    };
    if (organization) {
      populatePersonData();
    }
  }, [personId, organization, history]);

  const getDateAdded = () => {
    if (person?.addedTime) {
      return getDateDisplayValue(person.addedTime);
    }
  };

  const goToEditPerson = () => {
    const newLocation = {
      pathname: APP_PATHS.PEOPLE_EDIT.replace(':personId', personId),
    };
    history.push(newLocation);
  };

  const gridSize = (defaultSize?: number) => {
    if (isMobile) {
      return 12;
    }
    return defaultSize || 4;
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Link id='back' to={APP_PATHS.PEOPLE} className={classes.back}>
            <Icon name='caretLeft' className={classes.backIcon} />
            {strings.PEOPLE}
          </Link>
        </Grid>
        <Grid item xs={12} className={classes.titleWithButton}>
          <Grid item xs={9}>
            {isMobile ? <h3 className={classes.email}>{person?.email}</h3> : <h2>{person?.email}</h2>}
          </Grid>
          <Grid item xs={3}>
            {isMobile ? (
              <Button icon='iconEdit' priority='secondary' onClick={goToEditPerson} className={classes.editButton} />
            ) : (
              <Button
                label={strings.EDIT}
                icon='iconEdit'
                priority='secondary'
                onClick={goToEditPerson}
                className={classes.editButton}
              />
            )}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <PageSnackbar />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField label={strings.EMAIL} id='email' type='text' value={person?.email} display={true} />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField label={strings.FIRST_NAME} id='firstName' type='text' value={person?.firstName} display={true} />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField label={strings.LAST_NAME} id='lastName' type='text' value={person?.lastName} display={true} />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField label={strings.ROLE} id='role' type='text' value={person?.role} display={true} />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField label={strings.DATE_ADDED} id='addedTime' type='text' value={getDateAdded()} display={true} />
        </Grid>
        <Grid item xs={gridSize()} />
      </Grid>
    </Container>
  );
}
