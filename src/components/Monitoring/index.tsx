import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { HighOrganizationRolesValues, ServerOrganization } from 'src/types/Organization';
import EmptyMessage from '../common/EmptyMessage';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { useHistory } from 'react-router-dom';

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
    message: {
      margin: '0 auto',
      width: '50%',
      marginTop: '10%',
    },
  })
);

type MonitoringProps = {
  organization: ServerOrganization;
  hasSeedBanks: boolean;
};

export default function Monitoring(props: MonitoringProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { organization, hasSeedBanks } = props;

  const goToSeedBanks = () => {
    const seedBanksLocation = {
      pathname: APP_PATHS.SEED_BANKS,
    };
    history.push(seedBanksLocation);
  };

  return (
    <>
      {hasSeedBanks ? (
        <div className={classes.placeholder}>
          <span className={classes.text}>Monitoring placeholder for {organization.name}</span>
        </div>
      ) : HighOrganizationRolesValues.includes(organization?.role || '') ? (
        <EmptyMessage
          className={classes.message}
          title={emptyMessageStrings.NO_SEEDBANKS_ADMIN_TITLE}
          text={emptyMessageStrings.NO_SEEDBANKS_MONITORING_ADMIN_MSG}
          buttonText={strings.GO_TO_SEED_BANKS}
          onClick={goToSeedBanks}
        />
      ) : (
        <EmptyMessage
          className={classes.message}
          title={emptyMessageStrings.NO_SEEDBANKS_NON_ADMIN_TITLE}
          text={emptyMessageStrings.NO_SEEDBANKS_MONITORING_NON_ADMIN_MSG}
        />
      )}
    </>
  );
}
