import { useCallback, useMemo, useState } from 'react';

import {
  AddressAutofillCore,
  AddressAutofillFeatureSuggestion,
  AddressAutofillSuggestion,
  SearchSession,
} from '@mapbox/search-js-core';

import strings from 'src/strings';

import useMapboxToken from './useMapboxToken';
import useSnackbar from './useSnackbar';

// Wait a quarter second before calling suggest again
const SUGGESTION_DELAY_MS = 250;

export type MapboxSearch = {
  clear: () => void;
  retrieve: (suggestion: AddressAutofillSuggestion) => Promise<AddressAutofillFeatureSuggestion[]>;
  suggest: (suggestText: string) => Promise<AddressAutofillSuggestion[]>;
  suggestText?: string;
};

const useMapboxSearch = (): MapboxSearch => {
  const { token } = useMapboxToken();

  const addressAutofillCore = new AddressAutofillCore({
    accessToken: token,
  });
  const session = new SearchSession(addressAutofillCore, SUGGESTION_DELAY_MS);
  const [suggestText, setSuggestText] = useState<string>();
  const { toastError } = useSnackbar();

  session.addEventListener('suggesterror', () => {
    toastError(strings.GENERIC_ERROR);
  });

  const suggest = useCallback(
    async (nextSuggestText: string) => {
      setSuggestText(nextSuggestText);
      const result = await session.suggest(nextSuggestText);
      return result?.suggestions ?? [];
    },
    [session]
  );

  const retrieve = useCallback(
    async (suggestion: AddressAutofillSuggestion) => {
      const result = await session.retrieve(suggestion);
      return result?.features ?? [];
    },
    [session]
  );

  const mapboxSearch: MapboxSearch = useMemo(
    () => ({
      clear: () => {
        setSuggestText(undefined);
        session.clear();
      },
      retrieve,
      suggest,
      suggestText,
    }),
    [retrieve, session, suggest, suggestText]
  );

  return mapboxSearch;
};

export default useMapboxSearch;
