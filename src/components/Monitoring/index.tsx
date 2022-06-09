import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState, useCallback } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import EmptyMessage from '../common/EmptyMessage';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { useHistory, useParams } from 'react-router-dom';
import { getAllSeedBanks, isAdmin } from 'src/utils/organization';
import TfMain from '../common/TfMain';
import Select from '../common/Select/Select';
import { Facility } from 'src/api/types/facilities';
import SeedBankMonitoring from './SeedBankMonitoring';
import Button from '../common/button/Button';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainTitle: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    pageTitle: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 600,
      margin: 0,
    },
    message: {
      margin: '0 auto',
      width: '50%',
      marginTop: '10%',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    divider: {
      margin: '0 16px',
      width: '1px',
      height: '32px',
      backgroundColor: '#A9B7B8',
    },
    seedBankLabel: {
      margin: '0 8px 0 0',
      fontWeight: 500,
      fontSize: '16px',
    },
  })
);

type MonitoringProps = {
  organization: ServerOrganization;
  hasSeedBanks: boolean;
  reloadData: () => void;
};

export default function Monitoring(props: MonitoringProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { organization, hasSeedBanks, reloadData } = props;
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const [seedBanks, setSeedBanks] = useState<Facility[]>([]);
  const { seedBankId } = useParams<{ seedBankId: string }>();

  const goToSeedBanks = () => {
    const seedBanksLocation = {
      pathname: APP_PATHS.SEED_BANKS,
    };
    history.push(seedBanksLocation);
  };

  const setActiveSeedBank = useCallback(
    (seedBank: Facility | undefined) => {
      if (seedBank) {
        history.push(APP_PATHS.SEED_BANK_MONITORING.replace(':seedBankId', seedBank.id.toString()));
      }
    },
    [history]
  );

  const onChangeSeedBank = (newValue: string) => {
    setActiveSeedBank(seedBanks.find((sb) => sb?.name === newValue));
  };

  useEffect(() => {
    const facilities: Facility[] = [];
    getAllSeedBanks(organization).forEach((facility) => {
      if (facility !== undefined) {
        facilities.push(facility);
      }
    });
    setSeedBanks(facilities);
  }, [organization]);

  useEffect(() => {
    const initializeSeedBank = () => {
      if (seedBanks.length) {
        const requestedSeedBank = seedBanks.find((sb) => sb?.id === parseInt(seedBankId, 10));
        if (requestedSeedBank) {
          setSelectedSeedBank(requestedSeedBank);
        } else {
          setActiveSeedBank(seedBanks[0]);
        }
      }
    };
    initializeSeedBank();
  }, [seedBankId, seedBanks, setActiveSeedBank]);

  return (
    <>
      {hasSeedBanks ? (
        <TfMain>
          <div className={classes.mainTitle}>
            <div className={classes.titleContainer}>
              <h1 className={classes.pageTitle}>{strings.MONITORING}</h1>
              <div className={classes.divider} />
              <p className={classes.seedBankLabel}>{strings.SEED_BANK}</p>
              <Select
                options={seedBanks.map((sb) => sb?.name || '')}
                onChange={onChangeSeedBank}
                selectedValue={selectedSeedBank?.name}
              />
            </div>
            {selectedSeedBank?.connectionState === 'Configured' ? (
              <Button label={strings.REFRESH_DATA} onClick={() => true} />
            ) : null}
          </div>
          {selectedSeedBank && (
            <SeedBankMonitoring seedBank={selectedSeedBank} organization={organization} reloadData={reloadData} />
          )}
        </TfMain>
      ) : isAdmin(organization) ? (
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
