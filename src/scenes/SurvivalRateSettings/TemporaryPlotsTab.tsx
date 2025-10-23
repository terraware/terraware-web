import React, { useCallback } from 'react';

import { Box, useTheme } from '@mui/material';
import { Checkbox, Icon, Tooltip } from '@terraware/web-components';

import { SpeciesPlot } from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { SiteT0Data } from 'src/types/Tracking';

import ZoneT0Box from './ZoneT0Box';

type TemporaryPlotsTabProps = {
  zonesWithObservations: Record<string, PlotsWithObservationsSearchResult[]>;
  withdrawnSpeciesPlots?: SpeciesPlot[];
  t0SiteData?: SiteT0Data;
  including?: boolean;
};

const TemporaryPlotsTab = ({
  zonesWithObservations,
  withdrawnSpeciesPlots,
  t0SiteData,
  including,
}: TemporaryPlotsTabProps) => {
  const theme = useTheme();

  const onChangeTemporaryPlotsCheck = useCallback(() => {
    // don't do anyhting since it's always disabled
    return true;
  }, []);

  return including ? (
    Object.entries(zonesWithObservations).map(([zoneId, plots]) => {
      const plotIds = plots.map((plot) => plot.id.toString());
      const filteredWithdrawnSpecies = withdrawnSpeciesPlots?.filter((wsp) =>
        plotIds.includes(wsp.monitoringPlotId.toString())
      );
      return (
        <ZoneT0Box
          key={zoneId}
          plotsWithObservations={plots}
          withdrawnSpeciesPlot={filteredWithdrawnSpecies}
          t0Zone={t0SiteData?.zones.find((z) => z.plantingZoneId.toString() === zoneId.toString())}
        />
      );
    })
  ) : (
    <Box display={'flex'} alignItems={'center'} paddingTop={theme.spacing(1.5)}>
      <Checkbox
        id={'temporaryPlotsCheck'}
        name={'temporaryPlotsCheck'}
        label={strings.USE_TEMPORARY_PLOTS_IN_SURVIVAL_RATE}
        value={false}
        disabled={true}
        onChange={onChangeTemporaryPlotsCheck}
      />
      <Box marginTop={1} paddingLeft={1}>
        <Tooltip title={strings.USE_TEMPORARY_PLOTS_IN_SURVIVAL_RATE_TOOLTIP}>
          <Box display='flex'>
            <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default TemporaryPlotsTab;
