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

const useStyles = makeStyles((theme: Theme) => ({
  spinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    margin: 'auto',
    minHeight: '100vh',
    '& .MuiCircularProgress-svg': {
      color: theme.palette.TwClrIcnBrand,
      height: '193px',
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

  useEffect(() => {
    if (!bootstrapped) {
      const isBootstrapped = userBootstrapped && organizationBootstrapped && localizationBootstrapped;
      if (isBootstrapped) {
        setBootstrapped(isBootstrapped);
      }
    }
  }, [bootstrapped, userBootstrapped, organizationBootstrapped, localizationBootstrapped]);

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
  const [locale] = useState('en');

  return (
    <UserProvider>
      <OrganizationProvider>
        <LocalizationProvider locale={locale}>
          <BlockingBootstrap>{children}</BlockingBootstrap>
        </LocalizationProvider>
      </OrganizationProvider>
    </UserProvider>
  );
}
