import React, { useMemo } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { SpeciesPlot } from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { PlotT0Data } from 'src/types/Tracking';
import { getShortDate } from 'src/utils/dateFormatter';

type PlotT0BoxProps = {
  plot: PlotsWithObservationsSearchResult;
  plantingSiteId: number;
  t0Plot?: PlotT0Data;
  withdrawnSpeciesPlot?: SpeciesPlot;
};

const PlotT0Box = ({ plot, plantingSiteId, t0Plot, withdrawnSpeciesPlot }: PlotT0BoxProps) => {
  const theme = useTheme();
  const { species } = useSpeciesData();
  const { activeLocale } = useLocalization();

  const getPlotTotalDensity = useMemo(() => {
    const total = t0Plot?.densityData.reduce((sum, density) => sum + density.plotDensity, 0);
    return total ? Math.round(total) : undefined;
  }, [t0Plot]);

  const someWithdrawnSpeciesMissing = useMemo(() => {
    return withdrawnSpeciesPlot?.species.some((withdrawnSp) => {
      if (!t0Plot?.densityData.find((dd) => dd.speciesId.toString() === withdrawnSp.speciesId.toString())) {
        return true;
      }
    });
  }, [t0Plot, withdrawnSpeciesPlot]);

  const observationPlot = useMemo(() => {
    return plot.observationPlots.find((op) => op.observation_id === t0Plot?.observationId?.toString());
  }, [plot.observationPlots, t0Plot?.observationId]);

  return (
    <>
      <Box display='flex' paddingY={theme.spacing(2)} gap={theme.spacing(2)}>
        <Box
          minHeight='100px'
          minWidth='80px'
          sx={{ background: theme.palette.TwClrBaseGray050, justifyContent: 'center' }}
          display='flex'
          alignItems='center'
        >
          <Typography>{plot.name}</Typography>
        </Box>
        <Box flexGrow={1} display={'flex'} alignItems={'center'}>
          {t0Plot && (t0Plot.observationId || (!t0Plot.observationId && !someWithdrawnSpeciesMissing)) ? (
            <Box>
              <Box display='flex' paddingBottom={3}>
                <Typography color={theme.palette.TwClrTxtSuccess} fontWeight={500} paddingRight={2}>
                  {strings.T0_DATA_IS_SET}
                </Typography>
                {t0Plot.observationId ? (
                  <Typography fontWeight={500}>
                    {strings.formatString(
                      strings.USING_OBSERVATION_DATA_FROM,
                      <Link
                        fontSize={'16px'}
                        to={APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', plantingSiteId.toString()).replace(
                          ':observationId',
                          t0Plot.observationId.toString()
                        )}
                      >
                        {observationPlot ? getShortDate(observationPlot.observation_startDate, activeLocale) : ''}
                      </Link>
                    )}
                  </Typography>
                ) : (
                  <Typography>{strings.USING_ENTERED_PLANT_DENSITY}</Typography>
                )}
              </Box>
              {t0Plot.densityData && (
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
                      {t0Plot.densityData.map((densityData, index) => (
                        <tr key={index}>
                          <td style={{ paddingRight: '64px' }}>
                            {species.find((sp) => sp.id === densityData.speciesId)?.scientificName}
                          </td>
                          <td>{Math.round(densityData.plotDensity)}</td>
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
                          <Typography fontWeight={600}>{getPlotTotalDensity}</Typography>
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
        <Box>
          <Box sx={{ background: theme.palette.TwClrBgSecondary }} display='flex' padding={1}>
            <Box display='flex' paddingRight={3}>
              <Typography fontWeight={600} paddingRight={0.5}>
                {strings.ZONE}
              </Typography>
              <Typography>{plot.plantingSubzone_plantingZone_name}</Typography>
            </Box>
            <Box display='flex'>
              <Typography fontWeight={600} paddingRight={0.5}>
                {strings.SUBZONE}
              </Typography>
              <Typography>{plot.plantingSubzone_name}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider />
    </>
  );
};

export default PlotT0Box;
