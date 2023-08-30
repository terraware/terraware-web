import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, StyledEngineProvider, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  useUser,
  useOrganization,
  useLocalization,
  LocalizationProvider,
  OrganizationProvider,
  UserProvider,
} from 'src/providers';
import ReactMapGL from 'react-map-gl';
import useMapboxToken from 'src/utils/useMapboxToken';

/**
 * The following is needed to deal with a mapbox bug
 * See: https://docs.mapbox.com/mapbox-gl-js/guides/install/#transpiling
 */
import mapboxgl from 'mapbox-gl';
const mapboxImpl: any = mapboxgl;
// @tslint
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxImpl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default; /* tslint:disable-line */

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

  useEffect(() => {
    setBootstrapped(bootstrapped || (userBootstrapped && organizationBootstrapped && localizationBootstrapped));
  }, [bootstrapped, userBootstrapped, organizationBootstrapped, localizationBootstrapped]);

  if (!bootstrapped) {
    return (
      <StyledEngineProvider injectFirst>
        <CircularProgress className={classes.spinner} size='193' />
      </StyledEngineProvider>
    );
  }

  return (
    <>
      <Collateral />
      {children}
    </>
  );
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

// trigger collateral loads, without showing components
const Collateral = (): JSX.Element => (
  <Box sx={{ left: -10000, position: 'absolute', display: 'hidden' }}>
    <MapCollateral />
  </Box>
);

// force loading mapbox collateral
const MapCollateral = (): JSX.Element | null => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const { token } = useMapboxToken();

  useEffect(() => {
    if (token && !loaded) {
      setTimeout(() => setLoaded(true), 0);
    }
  }, [loaded, token]);

  if (token && !loaded) {
    return <ReactMapGL mapStyle='mapbox://styles/mapbox/satellite-v9?optimize=true' mapboxAccessToken={token} />;
  }

  // don't show map after an initial load
  return null;
};
