import { Box, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { createOrganization } from 'src/api/organization/organization';
import Button from 'src/components/common/button/Button';
import DialogCloseButton from 'src/components/common/DialogCloseButton';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import Select from './common/Select/Select';
import TextField from './common/Textfield/Textfield';
import { snackbarAtoms } from 'src/state/snackbar';
import { searchCountries } from 'src/api/country/country';
import { Country } from 'src/types/Country';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import { APP_PATHS } from '../constants';
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainModal: {
      '& .MuiDialog-scrollPaper': {
        '& .MuiDialog-paper': {
          overflow: 'visible',
        },
      },
    },
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(3),
    },
    paper: {
      minWidth: '515px',
    },
    container: {
      border: `1px solid ${theme.palette.grey[400]}`,
      borderRadius: '4px',
      display: 'block',
      padding: theme.spacing(1),
    },
    deleteSpecies: {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.secondary.main,
      color: theme.palette.secondary.main,
      borderWidth: 1,
    },
    spacing: {
      marginRight: theme.spacing(2),
    },
    content: {
      overflow: 'visible',
    },
  })
);

export type AddNewOrganizationModalProps = {
  open: boolean;
  onCancel: () => void;
  reloadOrganizationData: (selectedOrgId?: number) => void;
};

export default function AddNewOrganizationModal(props: AddNewOrganizationModalProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { onCancel, open, reloadOrganizationData } = props;
  const setPageSnackbar = useSetRecoilState(snackbarAtoms.page);
  const setToastSnackbar = useSetRecoilState(snackbarAtoms.toast);
  const [nameError, setNameError] = useState('');
  const [countries, setCountries] = useState<Country[]>();
  const [newOrganization, setNewOrganization, onChange] = useForm<ServerOrganization>({
    id: -1,
    name: '',
    role: 'Owner',
    totalUsers: 0,
  });

  useEffect(() => {
    const populateCountries = async () => {
      const response = await searchCountries();
      if (response) {
        setCountries(response);
      }
    };
    populateCountries();
  }, []);

  useEffect(() => {
    setNewOrganization({
      id: -1,
      name: '',
      role: 'Owner',
      totalUsers: 0,
    });
  }, [open, setNewOrganization]);

  const onChangeCountry = (newValue: string) => {
    const found = countries?.find((country) => country.name === newValue);
    if (found) {
      setNewOrganization((previousNewOrganization: ServerOrganization): ServerOrganization => {
        return { ...previousNewOrganization, countryCode: found.code.toString(), countrySubdivisionCode: undefined };
      });
    }
  };

  const onChangeSubdivision = (newValue: string) => {
    if (countries && newOrganization.countryCode) {
      const selectedCountry = getCountryByCode(countries, newOrganization.countryCode);
      const found = selectedCountry?.subdivisions.find((subdivision) => subdivision.name === newValue);
      if (found) {
        onChange('countrySubdivisionCode', found.code);
      }
    }
  };

  const saveOrganization = async () => {
    if (newOrganization.name === '') {
      setNameError(strings.REQUIRED_FIELD);
      return;
    }
    const response = await createOrganization(newOrganization);
    if (response.requestSucceeded && response.organization) {
      setPageSnackbar({
        priority: 'success',
        title: strings.formatString(strings.ORGANIZATION_CREATED_TITLE, response.organization.name),
        msg: strings.ORGANIZATION_CREATED_MSG,
        onCloseCallback: undefined, // placeholder to update user preference when available
      });
      reloadOrganizationData(response.organization.id);
      history.push({ pathname: APP_PATHS.HOME });
    } else {
      setToastSnackbar({
        priority: 'critical',
        title: strings.ORGANIZATION_CREATE_FAILED,
        msg: strings.GENERIC_ERROR,
        type: 'toast',
      });
    }
    onCancel();
  };

  const getSelectedCountry = () => {
    if (countries && newOrganization.countryCode) {
      const selectedCountry = getCountryByCode(countries, newOrganization.countryCode);
      if (selectedCountry) {
        return selectedCountry;
      }
    }
  };

  const getSelectedSubdivision = () => {
    if (countries && newOrganization.countryCode && newOrganization.countrySubdivisionCode) {
      const selectedSubdivision = getSubdivisionByCode(
        countries,
        newOrganization.countryCode,
        newOrganization.countrySubdivisionCode
      );
      if (selectedSubdivision) {
        return selectedSubdivision;
      }
    }
  };

  const onCancelWrapper = () => {
    setNameError('');
    onCancel();
  };

  return (
    <Dialog
      onClose={onCancelWrapper}
      disableEscapeKeyDown
      maxWidth='md'
      className={classes.mainModal}
      open={open}
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>
        <Typography variant='h6'>{strings.ADD_NEW_ORGANIZATION}</Typography>
        <DialogCloseButton onClick={onCancelWrapper} />
      </DialogTitle>
      <DialogContent dividers className={classes.content}>
        <Grid item xs={12}>
          <TextField
            label={strings.ORGANIZATION_NAME}
            type='text'
            id='name'
            onChange={onChange}
            errorText={newOrganization.name ? '' : nameError}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField label={strings.DESCRIPTION_OPTIONAL} type='text' id='description' onChange={onChange} />
        </Grid>
        <Grid item xs={12}>
          <Select
            label={strings.COUNTRY_OPTIONAL}
            id='countyCode'
            onChange={onChangeCountry}
            options={countries?.map((country) => country.name)}
            selectedValue={getSelectedCountry()?.name}
          />
        </Grid>
        {getSelectedCountry()?.subdivisions && (
          <Grid item xs={12}>
            <Select
              label={strings.STATE_OPTIONAL}
              id='countySubdivisionCode'
              onChange={onChangeSubdivision}
              options={getSelectedCountry()?.subdivisions.map((subdivision) => subdivision.name)}
              selectedValue={getSelectedSubdivision()?.name}
            />
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Button
            onClick={onCancelWrapper}
            id='cancel'
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            className={classes.spacing}
          />
          <Button onClick={saveOrganization} id='saveSpecies' label={strings.CREATE} />
        </Box>
      </DialogActions>
    </Dialog>
  );
}
