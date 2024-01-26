import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import strings from 'src/strings';
import { SpeciesProblemElement } from 'src/types/Species';
import Button from '../../components/common/button/Button';
import useSnackbar from 'src/utils/useSnackbar';
import { SpeciesService } from 'src/services';

const useStyles = makeStyles((theme: Theme) => ({
  tooltipContainer: {
    padding: '24px',

    '& p': {
      margin: 0,
    },
  },
  spacing: {
    marginRight: theme.spacing(1),
  },
  verticalSpacing: {
    marginTop: theme.spacing(1),
  },
  buttonsContainer: {
    background: theme.palette.TwClrBgSecondary,
    display: 'flex',
    borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    padding: theme.spacing(2, 3),
    borderRadius: '0 0 6px 6px',
  },
  value: {
    fontSize: '14px',
    color: theme.palette.TwClrTxt,
    fontWeight: 400,
    paddingTop: '4px',
  },
  noBold: {
    fontWeight: 400,
  },
}));

type ProblemTooltipProps = {
  problems: SpeciesProblemElement[];
  openedTooltip: boolean;
  setOpenedTooltip: React.Dispatch<React.SetStateAction<boolean>>;
  reloadData?: () => void;
  onRowClick?: () => void;
};

export default function ProblemTooltip({
  problems,
  openedTooltip,
  setOpenedTooltip,
  reloadData,
  onRowClick,
}: ProblemTooltipProps): JSX.Element {
  const classes = useStyles();
  const snackbar = useSnackbar();
  const ignoreFix = async (problemId: number) => {
    await SpeciesService.ignoreProblemSuggestion(problemId);
    setOpenedTooltip(false);
    if (reloadData) {
      reloadData();
    }
  };

  const acceptFix = async (problemId: number) => {
    const response = await SpeciesService.acceptProblemSuggestion(problemId);
    if (!response.requestSucceeded) {
      snackbar.toastError(strings.UNEXPECTED_ERROR, strings.GENERIC_ERROR);
    }
    setOpenedTooltip(false);
    if (reloadData) {
      reloadData();
    }
  };

  const handleIgnore = (problemId: number, e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.stopPropagation();
    ignoreFix(problemId);
  };

  const handleAccept = (problemId: number, e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.stopPropagation();
    acceptFix(problemId);
  };

  const handleEdit = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.stopPropagation();
    if (onRowClick) {
      onRowClick();
    }
    setOpenedTooltip(false);
  };

  const handleCancel = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.stopPropagation();
    setOpenedTooltip(false);
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
      <div className={classes.tooltipContainer}>
        <p className={classes.noBold}>{strings.ISSUE}</p>
        <p className={classes.value}>{problemType}</p>
        {problems[0].suggestedValue ? (
          <div className={classes.verticalSpacing}>
            <p className={classes.noBold}>{strings.SUGGESTION}</p>
            <p className={classes.value}>
              {strings.formatString(strings.CHANGE_TO, <b>{problems[0].suggestedValue}</b>)}
            </p>
          </div>
        ) : null}
      </div>
      <div className={classes.buttonsContainer}>
        {problems[0].suggestedValue ? (
          <>
            <Button
              onClick={(event) => handleCancel(event)}
              id='cancelSpeciesFix'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              className={classes.spacing}
            />
            <Button
              onClick={(event) => handleIgnore(problems[0].id, event)}
              id='ignoreSpeciesFix'
              label={strings.IGNORE}
              priority='secondary'
              type='passive'
              className={classes.spacing}
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
              className={classes.spacing}
            />
            <Button
              onClick={(event) => handleEdit(event)}
              label={strings.EDIT}
              priority='secondary'
              type='passive'
              className={classes.spacing}
            />
          </>
        )}
      </div>
    </div>
  );
}
