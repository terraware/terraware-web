/* eslint-disable import/no-webpack-loader-syntax */
import { CssBaseline, StyledEngineProvider, Theme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Provider } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { APP_PATHS } from 'src/constants';
import useStateLocation from 'src/utils/useStateLocation';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { getRgbaFromHex } from 'src/utils/color';
import { store } from 'src/redux/store';
import { useLocalization, useOrganization } from 'src/providers';
import { useAppVersion } from 'src/hooks/useAppVersion';
import ToastSnackbar from 'src/components/ToastSnackbar';
import TopBar from 'src/components/TopBar/TopBar';
import TopBarContent from 'src/components/TopBar/TopBarContent';
import AppBootstrap from 'src/AppBootstrap';
import NoOrgRouter from 'src/scenes/NoOrgRouter';
import TerrawareRouter from 'src/scenes/TerrawareRouter';

interface StyleProps {
  isDesktop?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.TwClrBaseGray025,
    backgroundImage:
      'linear-gradient(180deg,' +
      `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0)} 0%,` +
      `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0.4)} 100%)`,
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    '& .navbar': {
      backgroundColor: (props: StyleProps) =>
        props.isDesktop ? theme.palette.TwClrBaseGray025 : theme.palette.TwClrBaseWhite,
      backgroundImage: (props: StyleProps) =>
        props.isDesktop
          ? 'linear-gradient(180deg,' +
            `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0)} 0%,` +
            `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0.4)} 100%)`
          : null,
      backgroundAttachment: 'fixed',
      paddingRight: (props: StyleProps) => (props.isDesktop ? '8px' : undefined),
      marginTop: (props: StyleProps) => (props.isDesktop ? '96px' : '0px'),
      paddingTop: (props: StyleProps) => (props.isDesktop ? '0px' : '24px'),
      overflowY: 'auto',
      width: (props: StyleProps) => (props.isDesktop ? '210px' : '300px'),
      zIndex: 1000,
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.TwClrBgGhostActive,
      },
      '& .nav-footer': {
        marginBottom: (props: StyleProps) => (props.isDesktop ? '128px' : '32px'),
      },
    },
  },
}));

const MINIMAL_USER_ROUTES: string[] = [
  APP_PATHS.WELCOME,
  APP_PATHS.MY_ACCOUNT,
  APP_PATHS.MY_ACCOUNT_EDIT,
  APP_PATHS.OPT_IN,
];

function AppContent() {
  // manager hooks
  useAppVersion();

  const { isDesktop, type } = useDeviceInfo();
  const classes = useStyles({ isDesktop });
  const location = useStateLocation();
  const { organizations } = useOrganization();

  const history = useHistory();

  const [showNavBar, setShowNavBar] = useState(true);

  useEffect(() => {
    if (organizations?.length === 0 && MINIMAL_USER_ROUTES.indexOf(location.pathname) === -1) {
      history.push(APP_PATHS.WELCOME);
    }
  }, [organizations, location, history]);

  useEffect(() => {
    if (type === 'mobile' || type === 'tablet') {
      setShowNavBar(false);
    } else {
      setShowNavBar(true);
    }
  }, [type]);

  // Localized strings are stored outside of React's state, but there's a state change when they're
  // updated. Declare the dependency here so the app rerenders when the locale changes.
  useLocalization();

  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <ToastSnackbar />
      <TopBar>
        <TopBarContent setShowNavBar={setShowNavBar} />
      </TopBar>
      <div className={classes.container}>
        {organizations.length === 0 ? (
          <NoOrgRouter />
        ) : (
          <TerrawareRouter showNavBar={showNavBar} setShowNavBar={setShowNavBar} />
        )}
      </div>
    </StyledEngineProvider>
  );
}

export default function App(): JSX.Element {
  return (
    <Provider store={store}>
      <AppBootstrap>
        <AppContent />
      </AppBootstrap>
    </Provider>
  );
}
