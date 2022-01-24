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
import snackbarAtom from 'src/state/snackbar';
import { searchCountries } from 'src/api/country/country';
import { Country, Subdivision } from 'src/types/Country';

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
      minWidth: '500px',
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
      margin: '0 auto',
      overflow: 'visible',
    },
  })
);

export type AddNewOrganizationModalProps = {
  open: boolean;
  onCancel: () => void;
  reloadOrganizationData: () => void;
};

export default function AddNewOrganizationModal(props: AddNewOrganizationModalProps): JSX.Element {
  const classes = useStyles();
  const { onCancel, open, reloadOrganizationData } = props;
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const [countries, setCountries] = useState<Country[]>();
  const [selectedCountry, setSelectedCountry] = useState<Country>();
  const [selectedSubdivision, setSelectedSubdivision] = useState<Subdivision>();
  const [newOrganization, setNewOrganization, onChange] = useForm<ServerOrganization>({
    id: -1,
    name: '',
    role: 'Admin',
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

  const onChangeCountry = (newValue: string) => {
    const found = countries?.find((country) => country.name === newValue);
    if (found) {
      setSelectedCountry(found);
      setSelectedSubdivision(undefined);
      setNewOrganization({ ...newOrganization, countryCode: found.code.toString(), countrySubdivisionCode: undefined });
    }
  };

  const onChangeSubdivision = (newValue: string) => {
    const found = selectedCountry?.subdivisions.find((subdivision) => subdivision.name === newValue);
    if (found) {
      setSelectedSubdivision(found);
      onChange('countrySubdivisionCode', found.code);
    }
  };

  const saveOrganization = async () => {
    const response = await createOrganization(newOrganization);
    if (response.requestSucceeded) {
      setSnackbar({
        type: 'success',
        msg: `You have created ${response.organization?.name}. You can access the organizations you’re in by clicking the arrow in the top right corner next to your profile.`,
      });
    } else {
      setSnackbar({
        type: 'delete',
        msg: strings.GENERIC_ERROR,
      });
    }
    reloadOrganizationData();
    onCancel();
  };

  return (
    <Dialog onClose={onCancel} disableEscapeKeyDown maxWidth='md' className={classes.mainModal} open={open}>
      <DialogTitle>
        <Typography variant='h6'>{strings.ADD_NEW_ORGANIZATION}</Typography>
        <DialogCloseButton onClick={onCancel} />
      </DialogTitle>
      <DialogContent dividers className={classes.content}>
        <Grid item xs={12}>
          <TextField label={strings.ORGANIZATION_NAME} type='text' id='name' onChange={onChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField label={strings.DESCRIPTION} type='text' id='description' onChange={onChange} />
        </Grid>
        <Grid item xs={12}>
          <Select
            label={strings.COUNTRY_OPTIONAL}
            id='countyCode'
            onChange={onChangeCountry}
            options={countries?.map((country) => country.name)}
            selectedValue={selectedCountry?.name}
          />
        </Grid>
        {selectedCountry?.subdivisions && (
          <Grid item xs={12}>
            <Select
              label={strings.STATE_OPTIONAL}
              id='countySubdivisionCode'
              onChange={onChangeSubdivision}
              options={selectedCountry.subdivisions.map((subdivision) => subdivision.name)}
              selectedValue={selectedSubdivision?.name}
            />
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Button
            onClick={onCancel}
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
