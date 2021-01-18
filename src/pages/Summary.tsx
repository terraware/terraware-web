import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { getSummaryUpdates } from '../api/summary';
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
  const [data, setData] = useRecoilState(summaryData);

  useEffect(() => {
    (async () => {
      const res = await getSummaryUpdates();
      setData(res);
    })();
  }, []);

  return (
    <main className={classes.content}>
      <div className={classes.toolbar} />
      <Typography variant="h2">Summary</Typography>
      {JSON.stringify(data)}
    </main>
  );
}
