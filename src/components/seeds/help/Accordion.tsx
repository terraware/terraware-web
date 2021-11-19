import { Typography } from '@material-ui/core';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles((theme) =>
  createStyles({
    header: {
      fontWeight: theme.typography.fontWeightBold,
    },
  })
);

export const Accordion = withStyles((theme) =>
  createStyles({
    root: {
      padding: 0,
      border: theme.palette.neutral[100],
      boxShadow: 'none',
      '&:not(:last-child)': {
        borderBottom: 0,
      },
      '&:before': {
        display: 'none',
      },
    },
    expanded: {},
  })
)(MuiAccordion);

export const AccordionSummary = withStyles((theme) =>
  createStyles({
    root: {
      padding: 0,
      backgroundColor: theme.palette.neutral[100],
      border: 0,
      minHeight: 56,
      '&$expanded': {
        minHeight: 56,
      },
    },
    content: {
      '&$expanded': {
        margin: '0',
      },
    },
    expanded: {},
  })
)(MuiAccordionSummary);

export const AccordionDetails = withStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.neutral[100],
    padding: 0,
  },
}))(MuiAccordionDetails);

interface Props {
  id: string;
  title: string;
  expanded: string | false;
  onChange: (id: string, isExpanded: boolean) => void;
  children: React.ReactNode;
}

export default function HelpAccordion({ id, expanded, onChange, title, children }: Props): JSX.Element {
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<Record<string, unknown>>, isExpanded: boolean) => {
    onChange(id, isExpanded);
  };

  return (
    <Accordion id={id} expanded={expanded === id} onChange={handleChange}>
      <AccordionSummary expandIcon={<AddIcon />} aria-controls={`${id}bh-content`} id={`${id}bh-header'`}>
        <Typography variant='h5' className={classes.header}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}
