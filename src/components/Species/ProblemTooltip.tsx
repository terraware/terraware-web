import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { acceptProblemSuggestion, ignoreProblemSuggestion } from 'src/api/species/species';
import strings from 'src/strings';
import { SpeciesProblemElement } from 'src/types/Species';
import Button from '../common/button/Button';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
      background: '#F2F4F5',
      display: 'flex',
      boderTop: '1px solid #A9B7B8',
      padding: '16px',
      borderRadius: '0 0 6px 6px',
    },
    value: {
      fontSize: '14px',
      color: '#000000',
    },
  })
);

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
  const ignoreFix = async (problemId: number) => {
    await ignoreProblemSuggestion(problemId);
    setOpenedTooltip(false);
    if (reloadData) {
      reloadData();
    }
  };

  const acceptFix = async (problemId: number) => {
    await acceptProblemSuggestion(problemId);
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

  return (
    <div>
      <div className={classes.tooltipContainer}>
        <p>{strings.ISSUE}</p>
        <p className={classes.value}>{problems[0].type}</p>
        {problems[0].suggestedValue ? (
          <div className={classes.verticalSpacing}>
            <p>{strings.SUGGESTION}</p>
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
              id='cancel'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              className={classes.spacing}
            />
            <Button
              onClick={(event) => handleIgnore(problems[0].id, event)}
              label={strings.IGNORE}
              priority='secondary'
              type='passive'
              className={classes.spacing}
            />
            <Button
              onClick={(event) => handleAccept(problems[0].id, event)}
              label={strings.ACCEPT}
              priority='secondary'
            />
            ,
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
