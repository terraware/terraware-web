import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { getOrganizationUsers } from 'src/api/organization/organization';
import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import TextField from 'src/components/common/Textfield/Textfield';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { ServerOrganization } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';

const useStyles = makeStyles((theme) =>
  createStyles({
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
  })
);

type PersonDetailsProps = {
  organization?: ServerOrganization;
};

export default function PersonDetails({ organization }: PersonDetailsProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { personId } = useParams<{ personId: string }>();
  const [person, setPerson] = useState<OrganizationUser>();

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
      return new Date(person.addedTime).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  };

  const goToEditPerson = () => {
    const newLocation = {
      pathname: APP_PATHS.PEOPLE_EDIT.replace(':personId', personId),
    };
    history.push(newLocation);
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
          <h2>{person?.email}</h2>
          <Button label={dictionary.EDIT_PERSON} priority='secondary' onClick={goToEditPerson} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.EMAIL} id='email' type='text' value={person?.email} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.FIRST_NAME} id='firstName' type='text' value={person?.firstName} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.LAST_NAME} id='lastName' type='text' value={person?.lastName} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.ROLE} id='role' type='text' value={person?.role} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.DATE_ADDED} id='addedTime' type='text' value={getDateAdded()} display={true} />
        </Grid>
        <Grid item xs={4} />
      </Grid>
    </Container>
  );
}
