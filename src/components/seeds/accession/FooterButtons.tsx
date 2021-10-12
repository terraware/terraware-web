import { Chip, Link } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import strings from '../../../strings';

const useStyles = makeStyles((theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    disabled: {
      background: theme.palette.neutral[600],
    },
    cancel: {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.neutral[400],
      borderWidth: 1,
    },
  })
);

interface Props {
  isEditing: boolean;
  isSaving: boolean;
  isSaved: boolean;
  updating?: boolean;
  onSubmitHandler: () => void;
  handleCancel: () => void;
  nextStep: string;
  nextStepTo: string;
  errors?: boolean;
  pendingCheckIn?: boolean;
  isCheckingIn?: boolean;
  isCheckedIn?: boolean;
}

export default function FooterButtons({
  isEditing,
  isSaving,
  isSaved,
  updating,
  onSubmitHandler,
  handleCancel,
  nextStep,
  nextStepTo,
  errors,
  pendingCheckIn,
  isCheckingIn,
  isCheckedIn,
}: Props): JSX.Element {
  const classes = useStyles();

  const showCheckIn = pendingCheckIn || isCheckedIn;

  return (
    <>
      {showCheckIn && (
        <Chip
          id='checkIn'
          classes={{
            root: classes.submit,
            disabled: classes.disabled,
          }}
          label={isCheckedIn ? strings.CHECKED_IN : isCheckingIn ? strings.CHECKING_IN : strings.CHECK_IN}
          clickable
          color='primary'
          onClick={() => onSubmitHandler()}
        />
      )}
      {!showCheckIn && !updating && (
        <Link component={RouterLink} to='/'>
          <Chip id='cancelButton' className={classes.cancel} label={strings.CANCEL} clickable variant='outlined' />
        </Link>
      )}
      {!showCheckIn && (isEditing || isSaving || isSaved) && updating && (
        <Chip
          id='cancelAccession'
          label={strings.CANCEL}
          clickable
          variant='outlined'
          onClick={handleCancel}
          disabled={isSaving || isSaved}
        />
      )}
      {!showCheckIn && !isSaved && (
        <Chip
          id='saveAccession'
          classes={{
            root: classes.submit,
            disabled: classes.disabled,
          }}
          label={updating ? (isSaving ? strings.SAVING : strings.SAVE_CHANGES) : strings.CREATE_ACCESSION}
          clickable
          color='primary'
          onClick={() => onSubmitHandler()}
          disabled={errors || ((!isEditing || isSaving) && updating)}
        />
      )}
      {!showCheckIn && ((!isEditing && !isSaving) || isSaved) && updating && (
        <Link component={RouterLink} to={nextStepTo}>
          <Chip
            id='nextStep'
            className={classes.submit}
            label={isSaved ? strings.CHANGES_SAVED : nextStep}
            clickable
            color='primary'
          />
        </Link>
      )}
    </>
  );
}
