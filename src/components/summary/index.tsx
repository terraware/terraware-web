import { createStyles, makeStyles } from "@material-ui/core/styles";
import React, { useEffect } from "react";
import PageHeader from "../PageHeader";
import { getSummaryUpdates } from "../../api/summary";

const useStyles = makeStyles(() =>
  createStyles({
    container: {},
    content: {},
  })
);

export default function Summary(): JSX.Element {
  const classes = useStyles();

  useEffect(() => {
    (async () => {
      const response = await getSummaryUpdates();
      // eslint-disable-next-line no-console
      console.log(response);
    })();
  })
  return (
    <main className={classes.container}>
      <PageHeader title="Summary" subtitle="Welcome and happy seeding!" />
      <div className={classes.content}>Content</div>
    </main>
  );
}
