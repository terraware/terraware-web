import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import ListMapSelector, { View } from 'src/components/common/ListMapSelector';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { useSupportedLocales } from 'src/strings/locales';
import { ZoneAggregation } from 'src/types/Observations';
import useDeviceInfo from 'src/utils/useDeviceInfo';
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
  const { isMobile } = useDeviceInfo();

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

  const plantingCompleteArea = useMemo(() => {
    let total = 0;
    if (data) {
      data.forEach((zone) => {
        zone.plantingSubzones.forEach((subzone) => {
          if (subzone.plantingCompleted) {
            total += subzone.areaHa;
          }
        });
      });
    }
    return total;
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
        <Box display='flex' flexDirection={isMobile ? 'column' : 'row'} justifyContent='start' alignItems='center'>
          <Box>{search}</Box>
          {data && siteAreaHa > 0 && view === 'map' && (
            <Box
              marginLeft={theme.spacing(2)}
              marginTop={isMobile ? theme.spacing(1) : '0px'}
              display='flex'
              flexDirection='row'
              justifyContent='start'
            >
              <Typography fontSize={'16px'} fontWeight={'600'} marginRight={theme.spacing(3)}>
                {strings.PLANTING_SITE_AREA}:{' '}
                {strings.formatString(strings.X_HA, numericFormatter.format(siteAreaHa))?.toString()}
              </Typography>
              <Typography fontSize={'16px'} fontWeight={'600'} marginRight={theme.spacing(3)}>
                {strings.PLANTING_COMPLETE_AREA}:{' '}
                {strings.formatString(strings.X_HA, numericFormatter.format(plantingCompleteArea))?.toString()}
              </Typography>
            </Box>
          )}
        </Box>
        <ListMapSelector defaultView={initialView} view={view} onView={updateView} />
      </Box>
      <Box
        marginTop={theme.spacing(2)}
        sx={view === 'map' ? { display: 'flex', flexDirection: 'column', flexGrow: 1 } : undefined}
      >
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
