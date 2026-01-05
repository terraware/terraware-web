import React, { useMemo } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { SpeciesPlot, StratumT0Data } from 'src/types/Tracking';
import { roundToDecimal } from 'src/utils/numbers';

type StratumT0BoxProps = {
  plotsWithObservations: PlotsWithObservationsSearchResult[];
  withdrawnSpeciesPlot?: SpeciesPlot[];
  t0Stratum?: StratumT0Data;
};

const StratumT0Box = ({ plotsWithObservations, withdrawnSpeciesPlot, t0Stratum }: StratumT0BoxProps) => {
  const theme = useTheme();
  const { species } = useSpeciesData();
  const { isMobile } = useDeviceInfo();

  const stratumTotalDensity = useMemo(() => {
    const total = t0Stratum?.densityData.reduce((sum, density) => sum + density.plotDensity, 0);
    return total ? roundToDecimal(total, 1) : undefined;
  }, [t0Stratum]);

  const allWithdrawnSpecies = React.useMemo(() => {
    if (!withdrawnSpeciesPlot) {
      return [];
    }
    const speciesMap = new Map<number, { density?: number; speciesId: number }>();
    withdrawnSpeciesPlot.forEach((plot) => {
      plot.species.forEach((wdSpecies) => {
        if (!speciesMap.has(wdSpecies.speciesId)) {
          speciesMap.set(wdSpecies.speciesId, wdSpecies);
        }
      });
    });
    return Array.from(speciesMap.values());
  }, [withdrawnSpeciesPlot]);

  const someWithdrawnSpeciesMissing = useMemo(() => {
    return allWithdrawnSpecies?.some((withdrawnSp) => {
      if (!t0Stratum?.densityData.find((dd) => dd.speciesId.toString() === withdrawnSp.speciesId.toString())) {
        return true;
      }
    });
  }, [allWithdrawnSpecies, t0Stratum?.densityData]);

  return (
    <>
      <Box
        display='flex'
        flexDirection={isMobile ? 'column' : 'row'}
        paddingY={theme.spacing(2)}
        gap={theme.spacing(2)}
      >
        <Box
          minHeight='100px'
          minWidth='80px'
          sx={{ background: theme.palette.TwClrBaseGray050, justifyContent: 'center' }}
          display='flex'
          alignItems='center'
          flexDirection={'column'}
          padding={2}
        >
          <Typography fontWeight={600}>{strings.ZONE}</Typography>
          <Typography>{plotsWithObservations?.[0].substratum_stratum_name}</Typography>
        </Box>
        <Box flexGrow={1} display={'flex'} alignItems={'center'}>
          {t0Stratum && !someWithdrawnSpeciesMissing ? (
            <Box>
              <Box display='flex' paddingBottom={3}>
                <Typography color={theme.palette.TwClrTxtSuccess} fontWeight={500} paddingRight={2}>
                  {strings.T0_DATA_IS_SET}
                </Typography>
              </Box>
              {t0Stratum.densityData && (
                <Box>
                  <table>
                    <thead style={{ textAlign: 'left' }}>
                      <tr>
                        <th style={{ paddingRight: '64px' }}>
                          <Box display='flex'>
                            {strings.SPECIES} <IconTooltip title={strings.SPECIES_TOOLTIP} />
                          </Box>
                        </th>
                        <th>
                          <Box display='flex'>
                            {strings.PLANT_DENSITY}
                            <IconTooltip title={strings.PLANT_DENSITY_TOOLTIP} />
                          </Box>
                          <Typography fontSize={'14px'} fontWeight={600}>
                            ({strings.PLANTS_PER_HA_LC})
                          </Typography>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {t0Stratum.densityData.map((densityData, index) => (
                        <tr key={index}>
                          <td style={{ paddingRight: '64px' }}>
                            {species.find((sp) => sp.id === densityData.speciesId)?.scientificName}
                          </td>
                          <td>{roundToDecimal(densityData.density, 1)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td style={{ paddingRight: '64px' }}>
                          <Box display={'flex'}>
                            <Typography fontWeight={600}>{strings.ALL_SPECIES}</Typography>
                            <IconTooltip title={strings.TOTAL_DENSITY_VIEW_TOOLTIP} />
                          </Box>
                        </td>
                        <td>
                          <Typography fontWeight={600}>{stratumTotalDensity}</Typography>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Box>
              )}
            </Box>
          ) : (
            <Typography color={theme.palette.TwClrTxtWarning} padding={1} fontWeight={500}>
              {strings.NOT_SET}
            </Typography>
          )}
        </Box>
      </Box>
      <Divider />
    </>
  );
};

export default StratumT0Box;
