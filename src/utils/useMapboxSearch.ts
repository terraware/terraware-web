import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  AddressAutofillCore,
  AddressAutofillFeatureSuggestion,
  AddressAutofillSuggestion,
  SearchSession,
  SessionToken,
} from '@mapbox/search-js-core';

import useMapboxToken from './useMapboxToken';

export type MapboxSearch = {
  clear: () => void;
  retrieve: (suggestion: AddressAutofillSuggestion) => Promise<AddressAutofillFeatureSuggestion[]>;
  suggest: (suggestText: string) => Promise<AddressAutofillSuggestion[]>;
  suggestText?: string;
  suggestResult: AddressAutofillSuggestion[];
};

const useMapboxSearch = (): MapboxSearch => {
  const { token } = useMapboxToken();

  const [sessionId, setSessionId] = useState<string | null>();
  const [sessionToken, setSessionToken] = useState<SessionToken>();
  const [suggestResult, setSuggestResult] = useState<AddressAutofillSuggestion[]>([]);

  const addressAutofillCore = new AddressAutofillCore({
    accessToken: token,
  });
  const session = new SearchSession(addressAutofillCore);

  useEffect(() => {
    if (!sessionStorage) {
      return undefined;
    }

    const currentItem = sessionStorage.getItem('mapboxAutofillTokenId');
    setSessionId(currentItem);
  }, [sessionStorage, setSessionId]);

  useEffect(() => {
    if (sessionId !== undefined) {
      const newSessionToken = new SessionToken(sessionId ?? undefined);
      setSessionToken(newSessionToken);

      if (sessionStorage) {
        sessionStorage.setItem('mapboxAutofillTokenId', newSessionToken.id);
      }
    }
  }, [sessionId, sessionStorage, setSessionToken]);

  const [suggestText, setSuggestText] = useState<string>();

  const suggest = useCallback(
    async (nextSuggestText: string) => {
      if (sessionToken) {
        setSuggestText(nextSuggestText);
        const result = await session.suggest(nextSuggestText, { sessionToken });
        setSuggestResult(result?.suggestions ?? []);
        return result?.suggestions ?? [];
      } else {
        return Promise.reject('Mapbox session not loaded');
      }
    },
    [session, sessionToken, setSuggestText, setSuggestResult]
  );

  const retrieve = useCallback(
    async (suggestion: AddressAutofillSuggestion) => {
      if (sessionToken) {
        const result = await session.retrieve(suggestion, { sessionToken });
        return result?.features ?? [];
      } else {
        return Promise.reject('Mapbox session not loaded');
      }
    },
    [session, sessionToken]
  );

  const clear = useCallback(() => {
    setSuggestText(undefined);
    setSuggestResult([]);
    session.clear();
  }, [setSuggestText, setSuggestResult, session]);

  const mapboxSearch: MapboxSearch = useMemo(
    () => ({
      clear,
      retrieve,
      suggest,
      suggestText,
      suggestResult,
    }),
    [clear, retrieve, suggest, suggestResult, suggestText]
  );

  return mapboxSearch;
};

export default useMapboxSearch;
