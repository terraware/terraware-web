import { skipToken } from '@reduxjs/toolkit/query';

import { useGetBorderQuery } from 'src/queries/generated/countryBoundary';
import { MultiPolygon } from 'src/types/Tracking';

/**
 * Fetches the boundary of a country given its 2-letter code. Auto-fires when a country code is
 * provided and returns the boundary as a MultiPolygon.
 */
export const useCountryBoundary = (countryCode?: string): MultiPolygon | undefined => {
  const { currentData } = useGetBorderQuery(countryCode || skipToken);

  return currentData?.border as MultiPolygon | undefined;
};
