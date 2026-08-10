import { useEffect, useMemo } from 'react';

import { BotanicalCountry, useLazyListBotanicalCountriesQuery } from 'src/queries/search/botanicalCountries';

export type UseBotanicalCountriesResult = {
  botanicalCountries: BotanicalCountry[];
  getBotanicalCountryName: (code?: string) => string | undefined;
};

export const useBotanicalCountries = (skip = false): UseBotanicalCountriesResult => {
  const [listBotanicalCountries, { data, isUninitialized }] = useLazyListBotanicalCountriesQuery();

  useEffect(() => {
    if (!skip && isUninitialized) {
      void listBotanicalCountries(undefined, true);
    }
  }, [listBotanicalCountries, skip, isUninitialized]);

  const botanicalCountries = useMemo(() => data ?? [], [data]);

  const getBotanicalCountryName = useMemo(
    () => (code?: string) => botanicalCountries.find((botanicalCountry) => botanicalCountry.code === code)?.name,
    [botanicalCountries]
  );

  return { botanicalCountries, getBotanicalCountryName };
};
