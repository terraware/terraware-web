import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Grid, Typography, useTheme } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { OrganizationUserService } from 'src/services';
import strings from 'src/strings';
import { OrganizationUser } from 'src/types/User';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import TfMain from '../../components/common/TfMain';
import { useOrganization } from '../../providers/hooks';
import { roleName } from '../../types/Organization';

const useStyles = makeStyles((theme: Theme) => ({
  back: {
    marginBottom: theme.spacing(3),
  },
  titleWithButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    float: 'right',
  },
}));

export default function PersonDetailsView(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { personId } = useParams<{ personId: string }>();
  const [person, setPerson] = useState<OrganizationUser>();
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    const populatePersonData = async () => {
      const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
      if (response.requestSucceeded) {
        const selectedUser = response.users.find((user) => user.id.toString() === personId);
        if (selectedUser) {
          setPerson(selectedUser);
        } else {
          history.push(APP_PATHS.PEOPLE);
        }
      }
    };
    populatePersonData();
  }, [personId, selectedOrganization, history]);

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
    <TfMain>
      <Grid container padding={theme.spacing(0, 0, 4, 0)}>
        <Grid item xs={12}>
          <BackToLink id='back' to={APP_PATHS.PEOPLE} className={classes.back} name={strings.PEOPLE} />
        </Grid>
        <Grid item xs={12} padding={theme.spacing(0, 3)} className={classes.titleWithButton}>
          <Grid item xs={9}>
            <Typography
              fontSize='20px'
              fontWeight={600}
              margin={0}
              sx={{
                wordBreak: 'break-all',
              }}
            >
              {person?.email}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            {isMobile ? (
              <Button
                icon='iconEdit'
                priority='primary'
                size='medium'
                onClick={goToEditPerson}
                className={classes.editButton}
              />
            ) : (
              <Button
                label={strings.EDIT_PERSON}
                icon='iconEdit'
                priority='primary'
                size='medium'
                onClick={goToEditPerson}
                className={classes.editButton}
              />
            )}
          </Grid>
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
        }}
      >
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
          <TextField label={strings.EMAIL} id='email' type='text' value={person?.email} display={true} />
        </Grid>
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
          <TextField label={strings.FIRST_NAME} id='firstName' type='text' value={person?.firstName} display={true} />
        </Grid>
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
          <TextField label={strings.LAST_NAME} id='lastName' type='text' value={person?.lastName} display={true} />
        </Grid>
        <Grid item xs={gridSize()} paddingBottom={isMobile ? theme.spacing(2) : 0}>
          <TextField
            label={strings.ROLE}
            id='role'
            type='text'
            value={person ? roleName(person.role) : ''}
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField label={strings.DATE_ADDED} id='addedTime' type='text' value={getDateAdded()} display={true} />
        </Grid>
      </Grid>
    </TfMain>
  );
}
