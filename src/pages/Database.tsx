import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import PageHeader from '../components/PageHeader';

const useStyles = makeStyles(() =>
  createStyles({
    container: {},
    content: {},
  })
);

export default function Summary(): JSX.Element {
  const classes = useStyles();

  return (
    <main className={classes.container}>
      <PageHeader title="Database" subtitle="" />
      <div className={classes.content}>Content</div>
    </main>
  );
}
