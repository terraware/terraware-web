import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Drawer, IconButton, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useLazyGetPlantingSeasonSpeciesSummaryQuery } from 'src/queries/search/plantingSeasons';
import strings from 'src/strings';

type SpeciesSummaryDrawerProps = {
  open: boolean;
  onClose: () => void;
  plantingSeasonId: number;
};

type DisplayRow = {
  speciesId: number;
  scientificName: string;
  commonName?: string;
  target: number;
  allocated: number;
  withdrawn: number;
  leftToPlant: number;
};

const SpeciesSummaryDrawer = ({ open, onClose, plantingSeasonId }: SpeciesSummaryDrawerProps): JSX.Element => {
  const theme = useTheme();
  const { species } = useOrganizationSpecies();
  const [getSummary, { data: summaryRows }] = useLazyGetPlantingSeasonSpeciesSummaryQuery();

  useEffect(() => {
    if (open) {
      void getSummary(plantingSeasonId, true);
    }
  }, [open, plantingSeasonId, getSummary]);

  const rows = useMemo<DisplayRow[]>(() => {
    return (summaryRows ?? [])
      .map((row) => {
        const speciesInfo = species.find((s) => s.id === row.speciesId);
        return {
          speciesId: row.speciesId,
          scientificName: row.scientificName ?? speciesInfo?.scientificName ?? `#${row.speciesId}`,
          commonName: row.commonName ?? speciesInfo?.commonName,
          target: row.target,
          allocated: row.allocated,
          withdrawn: row.withdrawn,
          leftToPlant: row.leftToPlant,
        };
      })
      .sort((a, b) => a.scientificName.localeCompare(b.scientificName));
  }, [summaryRows, species]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          target: acc.target + r.target,
          allocated: acc.allocated + r.allocated,
          withdrawn: acc.withdrawn + r.withdrawn,
          leftToPlant: acc.leftToPlant + r.leftToPlant,
        }),
        { target: 0, allocated: 0, withdrawn: 0, leftToPlant: 0 }
      ),
    [rows]
  );

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '640px' },
          maxWidth: '100vw',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box display='flex' alignItems='center' justifyContent='space-between' padding={theme.spacing(2, 3)}>
        <Typography fontSize='20px' fontWeight={600}>
          {strings.SPECIES_SUMMARY}
        </Typography>
        <IconButton onClick={onClose} size='small' aria-label='close'>
          <Icon name='close' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
        </IconButton>
      </Box>

      <Box flex={1} overflow='auto' padding={theme.spacing(2, 3)}>
        <Box
          display='grid'
          gridTemplateColumns='2fr 1fr 1fr 1fr 1fr'
          gap={theme.spacing(1)}
          padding={theme.spacing(1, 0)}
          sx={{ borderBottom: `2px solid ${theme.palette.TwClrBrdrSecondary}` }}
        >
          <Typography fontSize='14px' fontWeight={600}>
            {`${strings.SPECIES} (${rows.length})`}
          </Typography>
          <Typography fontSize='14px' fontWeight={600} textAlign='right'>
            {strings.TARGET}
          </Typography>
          <Typography fontSize='14px' fontWeight={600} textAlign='right'>
            {strings.ALLOCATED}
          </Typography>
          <Typography fontSize='14px' fontWeight={600} textAlign='right'>
            {strings.WITHDRAWN}
          </Typography>
          <Typography fontSize='14px' fontWeight={600} textAlign='right'>
            {strings.LEFT_TO_PLANT}
          </Typography>
        </Box>

        {rows.map((row, index) => (
          <Box
            key={row.speciesId}
            display='grid'
            gridTemplateColumns='2fr 1fr 1fr 1fr 1fr'
            gap={theme.spacing(1)}
            alignItems='center'
            padding={theme.spacing(1.5, 0)}
            sx={{
              backgroundColor: index % 2 === 0 ? theme.palette.TwClrBgSecondary : 'transparent',
              paddingLeft: theme.spacing(1),
              paddingRight: theme.spacing(1),
            }}
          >
            <Box>
              <Typography fontSize='16px' fontWeight={400}>
                {row.scientificName}
              </Typography>
              {row.commonName && (
                <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
                  {row.commonName}
                </Typography>
              )}
            </Box>
            <Typography fontSize='16px' textAlign='right'>
              {row.target.toLocaleString()}
            </Typography>
            <Typography fontSize='16px' textAlign='right'>
              {row.allocated.toLocaleString()}
            </Typography>
            <Typography fontSize='16px' textAlign='right'>
              {row.withdrawn.toLocaleString()}
            </Typography>
            <Typography fontSize='16px' textAlign='right'>
              {row.leftToPlant.toLocaleString()}
            </Typography>
          </Box>
        ))}

        <Box
          display='grid'
          gridTemplateColumns='2fr 1fr 1fr 1fr 1fr'
          gap={theme.spacing(1)}
          padding={theme.spacing(1.5, 1)}
          sx={{
            backgroundColor: rows.length % 2 === 0 ? theme.palette.TwClrBgSecondary : 'transparent',
          }}
        >
          <Typography fontSize='16px' fontWeight={600}>
            {strings.TOTALS}
          </Typography>
          <Typography fontSize='16px' fontWeight={600} textAlign='right'>
            {totals.target.toLocaleString()}
          </Typography>
          <Typography fontSize='16px' fontWeight={600} textAlign='right'>
            {totals.allocated.toLocaleString()}
          </Typography>
          <Typography fontSize='16px' fontWeight={600} textAlign='right'>
            {totals.withdrawn.toLocaleString()}
          </Typography>
          <Typography fontSize='16px' fontWeight={600} textAlign='right'>
            {totals.leftToPlant.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      <Box display='flex' justifyContent='left' padding={theme.spacing(2, 3)}>
        <Button label={strings.CLOSE} onClick={onClose} priority='secondary' type='passive' />
      </Box>
    </Drawer>
  );
};

export default SpeciesSummaryDrawer;
