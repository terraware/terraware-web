import { Container } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import { ServerOrganization } from 'src/types/Organization';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { APP_PATHS } from 'src/constants';
import TfMain from 'src/components/common/TfMain';
import { isAdmin } from 'src/utils/organization';
import Title from 'src/components/common/Title';
import PageSnackbar from 'src/components/PageSnackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: '32px 0',
  },
  message: {
    margin: '0 auto',
    marginTop: '10%',
    maxWidth: '800px',
    width: (props: StyleProps) => (props.isMobile ? 'auto' : '800px'),
  },
}));

type InventoryProps = {
  organization: ServerOrganization;
  hasNurseries: boolean;
  hasSpecies: boolean;
};

export default function Inventory(props: InventoryProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const history = useHistory();
  const { organization, hasNurseries, hasSpecies } = props;

  const goTo = (appPath: string) => {
    const appPathLocation = {
      pathname: appPath,
    };
    history.push(appPathLocation);
  };

  const getEmptyState = () => {
    const emptyState = [];

    if (!hasSpecies) {
      emptyState.push({
        title: strings.SPECIES,
        text: emptyMessageStrings.INVENTORY_ONBOARDING_SPECIES_MSG,
        buttonText: strings.GO_TO_SPECIES,
        onClick: () => goTo(APP_PATHS.SPECIES),
      });
    }

    if (!hasNurseries) {
      emptyState.push({
        title: strings.NURSERIES,
        text: emptyMessageStrings.INVENTORY_ONBOARDING_NURSERIES_MSG,
        buttonText: strings.GO_TO_NURSERIES,
        onClick: () => goTo(APP_PATHS.NURSERIES),
      });
    }

    return emptyState;
  };

  const isOnboarded = hasNurseries && hasSpecies;

  return (
    <TfMain>
      <Title page={strings.INVENTORY} parentPage={strings.SEEDLINGS} />
      <PageSnackbar />
      <Container maxWidth={false} className={classes.mainContainer}>
        {isOnboarded ? (
          <div>{strings.INVENTORY}</div>
        ) : isAdmin(organization) ? (
          <EmptyMessage
            className={classes.message}
            title={emptyMessageStrings.ONBOARDING_ADMIN_TITLE}
            rowItems={getEmptyState()}
          />
        ) : (
          <EmptyMessage
            className={classes.message}
            title={emptyMessageStrings.REACH_OUT_TO_ADMIN_TITLE}
            text={emptyMessageStrings.NO_NURSERIES_NON_ADMIN_MSG}
          />
        )}
      </Container>
    </TfMain>
  );
}
