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
import EmptyStateContent from '../emptyStatePages/EmptyStateContent';
import { EMPTY_STATE_CONTENT_STYLES } from '../emptyStatePages/EmptyStatePage';

const useStyles = makeStyles((theme) =>
  createStyles({
    placeholder: {
      display: 'flex',
      height: '100%',
    },
    pageTitle: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 600,
      margin: 0,
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
    notSetUpContent: {
      border: '1px solid #A9B7B8',
      borderRadius: '8px',
      margin: 'auto',
      marginTop: `max(10vh, ${theme.spacing(8)}px)`,
      maxWidth: '800px',
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
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const { seedBankId } = useParams<{ seedBankId: string }>();

  const seedBanks = getAllSeedBanks(organization);

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

  const onChangeSeedBank = (newValue: string) => {
    setActiveSeedBank(seedBanks.find((sb) => sb?.name === newValue));
  };

  return (
    <>
      {hasSeedBanks ? (
        <TfMain>
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
            <div className={classes.placeholder}>
              <span className={classes.text}>Monitoring placeholder for {organization.name}</span>
            </div>
          ) : (
            <>
              {isAdmin(organization) ? (
                <div className={classes.notSetUpContent}>
                  <EmptyStateContent
                    title={strings.SET_UP_YOUR_SENSOR_KIT}
                    subtitle={strings.SET_UP_YOUR_SENSOR_KIT_MSG}
                    listItems={[{ icon: 'monitoring', title: strings.SENSOR_KIT_SET_UP }]}
                    buttonText={strings.START_SET_UP}
                    onClickButton={() => true}
                    styles={EMPTY_STATE_CONTENT_STYLES}
                  />
                </div>
              ) : (
                <EmptyMessage
                  className={classes.message}
                  title={emptyMessageStrings.NO_SEEDBANKS_NON_ADMIN_TITLE}
                  text={emptyMessageStrings.NO_SEEDBANKS_SET_UP_NON_ADMIN_MSG}
                />
              )}
            </>
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
