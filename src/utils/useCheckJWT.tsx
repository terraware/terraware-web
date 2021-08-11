import jwtDecode from 'jwt-decode';
import moment from 'moment';
import React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import sessionSelector from '../state/selectors/session';
export interface JWToken {
  id: number;
  exp: number;
}
export default function useCheckJWT() {
  const token = useRecoilValue(sessionSelector);
  const resetSession = useResetRecoilState(sessionSelector);
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (token) {
      const payload: JWToken = jwtDecode(token.access_token);
      if (payload) {
        const exp = payload.exp;
        const now = moment().valueOf() / 1000;
        // we want the token to fail before it gets expired, to force a refresh of the token.
        const margin = 5;
        const timeToExpire = exp - margin - now;
        if (timeToExpire < 0) {
          resetSession();
        } else {
          timer = setTimeout(() => {
            resetSession();
          }, timeToExpire * 1000);
        }
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [token, resetSession]);
}
