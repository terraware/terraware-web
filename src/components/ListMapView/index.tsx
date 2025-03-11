import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import ListMapSelector, { View } from 'src/components/common/ListMapSelector';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { useSupportedLocales } from 'src/strings/locales';
import { ZoneAggregation } from 'src/types/Observations';
import { useNumberFormatter } from 'src/utils/useNumber';

/**
 * Props include an optional search component for the top left.
 * List and map components are optional, absence of either will
 * disable corresponding selector.
 */
export type ListMapViewProps = {
  data?: ZoneAggregation[];
  search: React.ReactNode;
  list: React.ReactNode;
  map: React.ReactNode;
  initialView: View;
  onView?: (view: View) => void;
  style?: Record<string, string | number>;
};

export default function ListMapView({
  search,
  list,
  map,
  onView,
  style,
  initialView,
  data,
}: ListMapViewProps): JSX.Element {
  const [view, setView] = useState<View>(initialView);
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const supportedLocales = useSupportedLocales();
  const numberFormatter = useNumberFormatter();

  const updateView = (nextView: View) => {
    setView(nextView);
    if (onView) {
      onView(nextView);
    }
  };
  const numericFormatter = useMemo(
    () => numberFormatter(activeLocale, supportedLocales),
    [activeLocale, numberFormatter, supportedLocales]
  );

  const siteAreaHa = useMemo(() => {
    return data ? data.reduce((total, currentValue) => total + currentValue.areaHa, 0) : 0;
  }, [data]);

  useEffect(() => {
    updateView(initialView);
  }, [initialView]);

  return (
    <Card
      style={{
        ...style,
      }}
      flushMobile
    >
      <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='center'>
        {search}
        <ListMapSelector defaultView={initialView} view={view} onView={updateView} />
      </Box>
      <Box
        marginTop={theme.spacing(2)}
        sx={view === 'map' ? { display: 'flex', flexDirection: 'column', flexGrow: 1 } : undefined}
      >
        {data && siteAreaHa > 0 && (
          <Typography marginBottom={theme.spacing(2)} fontSize={'16px'} fontWeight={'600'}>
            {strings.PLANTING_SITE_AREA}:{' '}
            {strings.formatString(strings.X_HA, numericFormatter.format(siteAreaHa))?.toString()}
          </Typography>
        )}
        <Box flexGrow={1} flexDirection='column' display={view === 'list' ? 'flex' : 'none'}>
          {list}
        </Box>
        <Box flexGrow={1} flexDirection='column' display={view === 'map' ? 'flex' : 'none'}>
          {map}
        </Box>
      </Box>
    </Card>
  );
}
