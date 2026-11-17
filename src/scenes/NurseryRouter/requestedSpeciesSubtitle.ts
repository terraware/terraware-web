import { useMemo } from 'react';

import { useLocalization } from 'src/providers';
import { PlantingDateRequestRow } from 'src/queries/search/plantingDateRequests';
import { getMediumDate } from 'src/utils/dateFormatter';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

export const useRequestedSpeciesSubtitle = (request: PlantingDateRequestRow): string => {
  const { activeLocale, strings } = useLocalization();
  const { format } = useNumberFormatter();

  return useMemo(
    () =>
      [
        strings.formatString(strings.X_SPECIES, format(request.speciesCount)).toString(),
        getMediumDate(request.date, activeLocale),
        request.plantingSeasonName,
        request.plantingSiteName,
      ].join(' · '),
    [activeLocale, format, request, strings]
  );
};
