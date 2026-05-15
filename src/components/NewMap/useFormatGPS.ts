import { useCallback } from 'react';

import { useNumberFormatter } from 'src/utils/useNumberFormatter';

export const useFormatGPS = () => {
  const { format } = useNumberFormatter();

  return useCallback(
    (lon: number, lat: number): string => {
      const latHemisphere = lat >= 0 ? 'N' : 'S';
      const lonHemisphere = lon >= 0 ? 'E' : 'W';

      const latAbs = Math.abs(lat).toFixed(4);
      const lonAbs = Math.abs(lon).toFixed(4);

      const latFormatted = format(Number(latAbs));
      const lonFormatted = format(Number(lonAbs));

      return `${latFormatted}° ${latHemisphere}, ${lonFormatted}° ${lonHemisphere}`;
    },
    [format]
  );
};
