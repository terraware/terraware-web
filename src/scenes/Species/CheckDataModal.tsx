import React, { type JSX, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import strings from 'src/strings';
import { Species } from 'src/types/Species';

import DialogBox from '../../components/common/DialogBox/DialogBox';
import ProgressCircle from '../../components/common/ProgressCircle/ProgressCircle';
import Button from '../../components/common/button/Button';
import Icon from '../../components/common/icon/Icon';

export type CheckDataModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  species: Species[];
  reviewErrors: (hasErrors: boolean) => void;
  reloadData: () => void;
};

export default function CheckDataModal(props: CheckDataModalProps): JSX.Element {
  const theme = useTheme();
  const { open, onClose, species, reviewErrors, reloadData } = props;
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [speciesWithProblems, setSpeciesWithProblems] = useState<Species[]>();

  const iconStyles = {
    height: '120px',
    width: '120px',
  };

  const loadingTextStyles = {
    fontSie: '16px',
    margin: 0,
    color: theme.palette.TwClrTxt,
  };

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const handleCancel = () => {
    onClose(completed);
    setError(undefined);
    setCompleted(false);
    setLoading(false);
  };

  const reviewErrorsHandler = () => {
    handleCancel();
    reviewErrors(speciesWithProblems !== undefined && speciesWithProblems.length > 0);
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
          id={error ? 'cancelDataCheck' : 'cancelSpeciesCheck'}
          label={error ? strings.CANCEL_DATA_CHECK : strings.CANCEL}
          priority='secondary'
          type='passive'
          key='mb-1'
          sx={{ marginRight: theme.spacing(2) }}
        />,
        <Button
          id={error ? 'tryAgainCheckData' : 'runDataCheck'}
          onClick={startDataCheck}
          label={error ? strings.TRY_AGAIN : strings.RUN_A_DATABASE_CHECK}
          key='mb-2'
        />,
      ];
    }
    if (completed && !speciesWithProblems?.length) {
      return [<Button onClick={handleCancel} label={strings.NICE} key='mb-1' />];
    }
    if (completed && speciesWithProblems?.length) {
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
          <Box sx={containerStyles}>
            <p style={loadingTextStyles}>{strings.CHECK_DATA_DESCRIPTION}</p>
            <Icon name='blobbyIconLibrary' style={iconStyles} />
          </Box>
        )}
        {completed && (
          <Box sx={containerStyles}>
            <p style={loadingTextStyles}>
              {speciesWithProblems && speciesWithProblems.length
                ? strings.formatString(strings.DATA_CHECK_WITH_PROBLEMS, speciesWithProblems.length)
                : strings.DATA_CHECK_COMPLETED}
            </p>
            {speciesWithProblems ? (
              <Icon name='blobbyIconWrench' style={iconStyles} />
            ) : (
              <Icon name='blobbyIconHappy' style={iconStyles} />
            )}
          </Box>
        )}
        {loading && (
          <Box sx={containerStyles}>
            <p style={loadingTextStyles}>{strings.CHECKING_DATA}</p>
            <Box sx={{ margin: '40px auto' }}>
              <ProgressCircle determinate={false} />
            </Box>
          </Box>
        )}
      </>
    </DialogBox>
  );
}
