import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';

import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import { SpeciesProblemElement } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';

import Button from '../../components/common/button/Button';

type ProblemTooltipProps = {
  problems: SpeciesProblemElement[];
  openedTooltip: boolean;
  onClose: () => void;
  reloadData?: () => void;
  onRowClick?: () => void;
};

export default function ProblemTooltip({
  problems,
  onClose,
  reloadData,
  onRowClick,
}: ProblemTooltipProps): JSX.Element {
  const theme = useTheme();
  const snackbar = useSnackbar();

  const spacingStyles = {
    marginRight: theme.spacing(1),
  };

  const valueStyles = {
    fontSize: '14px',
    color: theme.palette.TwClrTxt,
    fontWeight: 400,
    paddingTop: '4px',
  };

  const noBoldStyles = {
    fontWeight: 400,
  };

  const ignoreFix = async (problemId: number) => {
    await SpeciesService.ignoreProblemSuggestion(problemId);
    onClose();
    if (reloadData) {
      reloadData();
    }
  };

  const acceptFix = async (problemId: number) => {
    const response = await SpeciesService.acceptProblemSuggestion(problemId);
    if (!response.requestSucceeded) {
      snackbar.toastError(strings.UNEXPECTED_ERROR, strings.GENERIC_ERROR);
    }
    onClose();
    if (reloadData) {
      reloadData();
    }
  };

  const handleIgnore = (problemId: number, e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.stopPropagation();
    void ignoreFix(problemId);
  };

  const handleAccept = (problemId: number, e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.stopPropagation();
    void acceptFix(problemId);
  };

  const handleEdit = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.stopPropagation();
    if (onRowClick) {
      onRowClick();
    }
    onClose();
  };

  const handleCancel = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.stopPropagation();
    onClose();
  };

  let problemType;
  switch (problems[0].type) {
    case 'Name Is Synonym':
      problemType = strings.SPECIES_PROBLEM_NAME_IS_SYNONYM;
      break;
    case 'Name Misspelled':
      problemType = strings.SPECIES_PROBLEM_NAME_MISSPELLED;
      break;
    case 'Name Not Found':
      problemType = strings.SPECIES_PROBLEM_NAME_NOT_FOUND;
      break;
  }

  return (
    <div>
      <Box
        sx={{
          padding: '24px',
          '& p': {
            margin: 0,
          },
        }}
      >
        <p style={noBoldStyles}>{strings.ISSUE}</p>
        <p style={valueStyles}>{problemType}</p>
        {problems[0].suggestedValue ? (
          <Box sx={{ marginTop: theme.spacing(1) }}>
            <p style={noBoldStyles}>{strings.SUGGESTION}</p>
            <p style={valueStyles}>{strings.formatString(strings.CHANGE_TO, <b>{problems[0].suggestedValue}</b>)}</p>
          </Box>
        ) : null}
      </Box>
      <Box
        sx={{
          background: theme.palette.TwClrBgSecondary,
          display: 'flex',
          borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          padding: theme.spacing(2, 3),
          borderRadius: '0 0 6px 6px',
        }}
      >
        {problems[0].suggestedValue ? (
          <>
            <Button
              onClick={(event) => handleCancel(event)}
              id='cancelSpeciesFix'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              style={spacingStyles}
            />
            <Button
              onClick={(event) => handleIgnore(problems[0].id, event)}
              id='ignoreSpeciesFix'
              label={strings.IGNORE}
              priority='secondary'
              type='passive'
              style={spacingStyles}
            />
            <Button
              onClick={(event) => handleAccept(problems[0].id, event)}
              id='acceptSpeciesFix'
              label={strings.ACCEPT}
              priority='secondary'
            />
          </>
        ) : (
          <>
            <Button
              onClick={(event) => handleIgnore(problems[0].id, event)}
              label={strings.IGNORE}
              priority='secondary'
              type='passive'
              style={spacingStyles}
            />
            <Button
              onClick={(event) => handleEdit(event)}
              label={strings.EDIT}
              priority='secondary'
              type='passive'
              style={spacingStyles}
            />
          </>
        )}
      </Box>
    </div>
  );
}
