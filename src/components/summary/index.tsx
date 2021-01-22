import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { getSummaryUpdates } from '../../api/summary';
import PageHeader from '../PageHeader';

const useStyles = makeStyles(() =>
  createStyles({
    container: {},
    content: {},
  })
);

export default function Summary(): JSX.Element {
  const classes = useStyles();
  const [res, setResponse] = React.useState();

  useEffect(() => {
    (async () => {
      const response = await getSummaryUpdates();
      setResponse(response);
    })();
  }, []);

  return (
    <main className={classes.container}>
      <PageHeader title='Summary' subtitle='Welcome and happy seeding!' />
      <div className={classes.content}>Content</div>
      <div id='result' className={classes.content}>
        {JSON.stringify(res)}
      </div>
    </main>
  );
}
