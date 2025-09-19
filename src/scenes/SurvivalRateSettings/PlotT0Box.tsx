import React, { useMemo } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { PlotT0Data } from 'src/types/Tracking';

type PlotT0BoxProps = {
  plot: PlotsWithObservationsSearchResult;
  plantingSiteId: number;
  t0Plot?: PlotT0Data;
};

const PlotT0Box = ({ plot, plantingSiteId, t0Plot }: PlotT0BoxProps) => {
  const theme = useTheme();
  const { species } = useSpeciesData();

  const getPlotTotalDensity = useMemo(() => {
    const total = t0Plot?.densityData.reduce((sum, density) => sum + density.plotDensity, 0);
    return total;
  }, [t0Plot]);

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
          {t0Plot ? (
            <Box>
              <Box display='flex' paddingBottom={3}>
                <Typography color={theme.palette.TwClrTxtSuccess} fontWeight={500} paddingRight={2}>
                  {strings.T0_DATA_IS_SET}
                </Typography>
                {t0Plot.observationId ? (
                  <Typography color={theme.palette.TwClrTxtSuccess}>
                    {strings.formatString(
                      strings.USING_OBSERVATION_DATA_FROM,
                      <Link
                        to={APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', plantingSiteId.toString()).replace(
                          ':observationId',
                          t0Plot.observationId.toString()
                        )}
                      >
                        {
                          plot.observationPlots.find((op) => op.observation_id === t0Plot.observationId?.toString())
                            ?.observation_startDate
                        }
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
                        <th>{strings.SPECIES}</th>
                        <th>{strings.PLANT_DENSITY}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t0Plot.densityData.map((densityData, index) => (
                        <tr key={index}>
                          <td>{species.find((sp) => sp.id === densityData.speciesId)?.scientificName}</td>
                          <td>{densityData.plotDensity}</td>
                        </tr>
                      ))}
                      <tr>
                        <td>
                          <Box display={'flex'}>
                            <Typography fontWeight={600}>{strings.ALL_SPECIES}</Typography>
                            <IconTooltip title={strings.TOTAL_DENSITY_TOOLTIP} />
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
