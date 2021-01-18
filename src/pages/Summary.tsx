import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { summaryData } from '../recoil/atoms';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(3),
    },
  })
);

export default function Summary(): JSX.Element {
  const classes = useStyles();
  const data = useRecoilValue(summaryData);

  return (
    <main className={classes.content}>
      <div className={classes.toolbar} />
      <Typography variant="h2">Summary</Typography>
      {JSON.stringify(data)}
    </main>
  );
}
