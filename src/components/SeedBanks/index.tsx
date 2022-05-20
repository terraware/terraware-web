import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
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

type SeedBanksProps = {
  organization: ServerOrganization;
};

export default function SeedBanks(props: SeedBanksProps): JSX.Element {
  const classes = useStyles();
  const { organization } = props;

  return (
    <>
      <div className={classes.placeholder}>
        <span className={classes.text}>Seed Banks placeholder for {organization.name}</span>
      </div>
    </>
  );
}
