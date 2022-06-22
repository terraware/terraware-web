import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import Icon from '../common/icon/Icon';
import ProgressCircle from '../common/ProgressCircle/ProgressCircle';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    spacing: {
      marginRight: theme.spacing(2),
    },
    dropContainer: {
      background: '#F9FAFA',
      border: '1px dashed #A9B7B8',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px',
    },
    hiddenInput: {
      display: 'none',
    },
    title: {
      color: '#3A4445',
      fontSize: '14px',
      fontWeight: 600,
      margin: '0 0 8px 0',
    },
    description: {
      color: '#3A4445',
      fontSize: '12px',
      fontWeight: 400,
      margin: 0,
    },
    link: {
      color: '#0067C8',
      fontSize: '12px',
      fontWeight: 400,
      margin: 0,
    },
    icon: {
      height: '120px',
      width: '120px',
    },
    importButton: {
      marginTop: '24px',
    },
    loadingText: {
      fontSie: '16px',
      margin: 0,
      color: '#3A4445',
    },
    spinnerContainer: {
      margin: '40px auto',
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    warningContent: {
      textAlign: 'left',
    },
  })
);

export type CheckDataModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  species: Species[];
  reviewErrors: () => void;
  reloadData: () => void;
};

export default function CheckDataModal(props: CheckDataModalProps): JSX.Element {
  const classes = useStyles();
  const { open, onClose, species, reviewErrors, reloadData } = props;
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [speciesWithProblems, setSpeciesWithProblems] = useState<Species[]>();

  const handleCancel = () => {
    onClose(completed);
    setError(undefined);
    setCompleted(false);
    setLoading(false);
  };

  const reviewErrorsHandler = () => {
    handleCancel();
    reviewErrors();
  };

  useEffect(() => {
    const getErrors = () => {
      const speciesWithProblemsArray = species.filter((iSpecies) => iSpecies.problems && iSpecies.problems.length > 0);
      setSpeciesWithProblems(speciesWithProblemsArray);
    };

    getErrors();
  }, [species]);

  const finishDataCheck = () => {
    setLoading(false);
    setCompleted(true);
  };

  const startDataCheck = () => {
    setLoading(true);
    reloadData();
    setTimeout(finishDataCheck, 1000);
  };

  const getMiddleButtons = () => {
    if (!completed && !loading) {
      return [
        <Button
          onClick={handleCancel}
          id='cancel'
          label={error ? strings.CANCEL_DATA_CHECK : strings.CANCEL}
          priority='secondary'
          type='passive'
          className={classes.spacing}
          key='mb-1'
        />,
        <Button onClick={startDataCheck} label={error ? strings.TRY_AGAIN : strings.RUN_A_DATABASE_CHECK} key='mb-2' />,
      ];
    }
    if (completed && !speciesWithProblems) {
      return [<Button onClick={handleCancel} label={strings.NICE} key='mb-1' />];
    }
    if (completed && speciesWithProblems) {
      return [<Button onClick={reviewErrorsHandler} label={strings.REVIEW_ERRORS} key='mb-1' />];
    }
  };

  const getSize = () => {
    if (loading || error) {
      return 'medium';
    }
    if (completed) {
      return 'small';
    }
    return 'large';
  };

  return (
    <DialogBox
      onClose={handleCancel}
      open={open}
      title={strings.CHECK_DATA}
      size={getSize()}
      middleButtons={getMiddleButtons()}
    >
      <>
        {error && !loading && <p>{error}</p>}
        {!error && !loading && !completed && (
          <div className={classes.container}>
            <p className={classes.loadingText}>{strings.CHECK_DATA_DESCRIPTION}</p>
            <Icon name='blobbyIconLibrary' className={classes.icon} />
          </div>
        )}
        {completed && (
          <div className={classes.container}>
            <p className={classes.loadingText}>
              {speciesWithProblems
                ? strings.formatString(strings.DATA_CHECK_WITH_PROBLEMS, speciesWithProblems.length)
                : strings.DATA_CHECK_COMPLETED}
            </p>
            {speciesWithProblems ? (
              <Icon name='blobbyIconWrench' className={classes.icon} />
            ) : (
              <Icon name='blobbyIconHappy' className={classes.icon} />
            )}
          </div>
        )}
        {loading && (
          <div className={classes.container}>
            <p className={classes.loadingText}>{strings.CHECKING_DATA}</p>
            <div className={classes.spinnerContainer}>
              <ProgressCircle determinate={false} />
            </div>
          </div>
        )}
      </>
    </DialogBox>
  );
}
