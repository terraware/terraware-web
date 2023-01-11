import React, { useCallback, useEffect, useState } from 'react';
import { CircularProgress, StyledEngineProvider, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { getUser } from 'src/api/user/user';
import { UserContext } from './contexts';
import { ProvidedUserData } from './DataTypes';

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

export type UserProviderProps = {
  children?: React.ReactNode;
};

export default function UserProvider({ children }: UserProviderProps): JSX.Element {
  const classes = useStyles();
  const reloadUser = useCallback(() => {
    const populateUser = async () => {
      const response = await getUser();
      if (response.requestSucceeded) {
        setUserData((previous: ProvidedUserData) => {
          return {
            ...previous,
            user: response.user ?? undefined,
          };
        });
      }
    };
    populateUser();
  }, []);
  const [userData, setUserData] = useState<ProvidedUserData>({ reloadUser });

  useEffect(() => {
    reloadUser();
  }, [reloadUser]);

  if (!userData.user) {
    return (
      <StyledEngineProvider injectFirst>
        <CircularProgress className={classes.spinner} size='193' />
      </StyledEngineProvider>
    );
  }

  return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}
