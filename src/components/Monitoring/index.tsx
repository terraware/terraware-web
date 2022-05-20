import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';

const useStyles = makeStyles((theme) =>
  createStyles({
    placeholder: {
      display: 'flex',
      height: '100%',
    },
    text: {
      fontSize: '24px',
      margin: 'auto auto',
    },
  })
);

type MonitoringProps = {
  organization: ServerOrganization;
};

export default function Monitoring(props: MonitoringProps): JSX.Element {
  const classes = useStyles();
  const { organization } = props;

  return (
    <>
      <div className={classes.placeholder}>
        <span className={classes.text}>Monitoring placeholder for {organization.name}</span>
      </div>
    </>
  );
}
