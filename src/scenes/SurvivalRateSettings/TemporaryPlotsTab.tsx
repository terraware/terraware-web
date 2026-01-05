import React, { useCallback } from 'react';

import { Box, useTheme } from '@mui/material';
import { Checkbox, Icon, Tooltip } from '@terraware/web-components';

import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { SiteT0Data, SpeciesPlot } from 'src/types/Tracking';

import StratumT0Box from './StratumT0Box';

type TemporaryPlotsTabProps = {
  strataWithObservations: Record<string, PlotsWithObservationsSearchResult[]>;
  withdrawnSpeciesPlots?: SpeciesPlot[];
  t0SiteData?: SiteT0Data;
  including?: boolean;
};

const TemporaryPlotsTab = ({
  strataWithObservations,
  withdrawnSpeciesPlots,
  t0SiteData,
  including,
}: TemporaryPlotsTabProps) => {
  const theme = useTheme();

  const onChangeTemporaryPlotsCheck = useCallback(() => {
    // don't do anything since it's always disabled
    return true;
  }, []);

  if (Object.entries(strataWithObservations).length === 0) {
    return <Box padding={theme.spacing(2)}>{strings.NO_TEMPORARY_PLOTS_WITHIN_STRATA}</Box>;
  }

  return including ? (
    Object.entries(strataWithObservations).map(([stratumId, plots]) => {
      const plotIds = plots.map((plot) => plot.id.toString());
      const filteredWithdrawnSpecies = withdrawnSpeciesPlots?.filter((wsp) =>
        plotIds.includes(wsp.monitoringPlotId.toString())
      );
      return (
        <StratumT0Box
          key={stratumId}
          plotsWithObservations={plots}
          withdrawnSpeciesPlot={filteredWithdrawnSpecies}
          t0Stratum={t0SiteData?.strata.find((z) => z.stratumId.toString() === stratumId.toString())}
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
