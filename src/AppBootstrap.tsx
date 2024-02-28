import React, { useEffect, useState } from 'react';
import { CircularProgress, StyledEngineProvider, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  useUser,
  useOrganization,
  useLocalization,
  LocalizationProvider,
  OrganizationProvider,
  UserProvider,
} from 'src/providers';
import { useRouteMatch } from 'react-router-dom';
import { APP_PATHS } from './constants';

const useStyles = makeStyles((theme: Theme) => ({
  spinner: {
    height: '200px',
    width: '200px',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    '& .MuiCircularProgress-svg': {
      color: theme.palette.TwClrIcnBrand,
      height: '200px',
      width: '200px',
    },
  },
}));

type BlockingBootstrapProps = {
  children?: React.ReactNode;
};

function BlockingBootstrap({ children }: BlockingBootstrapProps): JSX.Element {
  const classes = useStyles();
  const [bootstrapped, setBootstrapped] = useState<boolean>(false);
  const { bootstrapped: userBootstrapped } = useUser();
  const { bootstrapped: organizationBootstrapped } = useOrganization();
  const { bootstrapped: localizationBootstrapped } = useLocalization();
  const isAcceleratorRoute = useRouteMatch(APP_PATHS.ACCELERATOR);

  useEffect(() => {
    setBootstrapped(
      bootstrapped ||
        (userBootstrapped && !!(organizationBootstrapped || isAcceleratorRoute) && localizationBootstrapped)
    );
  }, [bootstrapped, userBootstrapped, organizationBootstrapped, isAcceleratorRoute, localizationBootstrapped]);

  if (!bootstrapped) {
    return (
      <StyledEngineProvider injectFirst>
        <CircularProgress className={classes.spinner} size='193' />
      </StyledEngineProvider>
    );
  }

  return <>{children}</>;
}

export type AppBootstrapProps = {
  children?: React.ReactNode;
};

export default function AppBootstrap({ children }: AppBootstrapProps): JSX.Element {
  const [selectedLocale, setSelectedLocale] = useState('en');
  const [activeLocale, setActiveLocale] = useState<string | null>(null);

  return (
    <UserProvider>
      <OrganizationProvider>
        <LocalizationProvider
          selectedLocale={selectedLocale}
          setSelectedLocale={setSelectedLocale}
          activeLocale={activeLocale}
          setActiveLocale={setActiveLocale}
        >
          <BlockingBootstrap>{children}</BlockingBootstrap>
        </LocalizationProvider>
      </OrganizationProvider>
    </UserProvider>
  );
}
