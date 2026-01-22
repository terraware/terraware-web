import React, { type JSX, useCallback } from 'react';

import { Grid, GridProps, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import TextField from 'src/components/common/Textfield/Textfield';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Species, getWoodDensityLevelOptions } from 'src/types/Species';

interface SpeciesInternalFieldsFormProps {
  onChange: (id: string) => (value: unknown) => void;
  speciesRecord: Species;
}

const SpeciesInternalFieldsForm = ({ onChange, speciesRecord }: SpeciesInternalFieldsFormProps) => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();

  const GridItemWrapper = useCallback(
    ({ children, props }: { children: JSX.Element; props?: GridProps }) => (
      <Grid item xs={12} paddingBottom={theme.spacing(3)} minHeight={'64px'} {...props}>
        {children}
      </Grid>
    ),
    [theme]
  );

  const GridItemInput = useCallback(
    ({ children }: { children: JSX.Element }) => (
      <GridItemWrapper props={{ paddingRight: theme.spacing(1), xs: 12, md: 4 }}>{children}</GridItemWrapper>
    ),
    [theme, GridItemWrapper]
  );

  return (
    <Grid
      container
      sx={{
        backgroundColor: theme.palette.TwClrBg,
        borderRadius: '0 0 32px 32px',
        padding: theme.spacing(3, 0, 3, 3),
        margin: 0,
      }}
    >
      <Grid
        sx={{ borderTop: `1px solid ${theme.palette.TwClrBaseGray100}` }}
        container
        padding={theme.spacing(0, 0, 4, 0)}
      >
        <Grid
          container
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: '32px',
            paddingTop: theme.spacing(3),
            margin: 0,
          }}
        >
          <GridItemWrapper props={{ minHeight: 0 }}>
            <Typography fontSize={'20px'} fontWeight={600} lineHeight={'28px'} margin={0}>
              {strings.ADDITIONAL_SPECIES_DATA}
            </Typography>
          </GridItemWrapper>

          <Grid container>
            <GridItemInput>
              <TextField
                label={strings.HEIGHT_AT_MATURITY}
                id='heightAtMaturityValue'
                onChange={onChange('heightAtMaturityValue')}
                type='number'
                value={speciesRecord.heightAtMaturityValue}
              />
            </GridItemInput>
            <GridItemInput>
              <TextField
                label={strings.REFERENCE}
                id='heightAtMaturitySource'
                helperText={strings.REFERENCE_HEIGHT_AT_MATURITY}
                onChange={onChange('heightAtMaturitySource')}
                type='text'
                value={speciesRecord.heightAtMaturitySource}
              />
            </GridItemInput>
          </Grid>

          <Grid container>
            <GridItemInput>
              <TextField
                label={strings.DIAMETER_AT_BREAST_HEIGHT}
                id='dbhValue'
                onChange={onChange('dbhValue')}
                type='number'
                value={speciesRecord.dbhValue}
              />
            </GridItemInput>
            <GridItemInput>
              <TextField
                label={strings.REFERENCE}
                id='dbhSource'
                helperText={strings.REFERENCE_DBH}
                onChange={onChange('dbhSource')}
                type='text'
                value={speciesRecord.dbhSource}
              />
            </GridItemInput>
          </Grid>

          <Grid container>
            <GridItemInput>
              <TextField
                label={strings.AVERAGE_WOOD_DENSITY}
                id='averageWoodDensity'
                onChange={onChange('averageWoodDensity')}
                type='number'
                value={speciesRecord.averageWoodDensity}
              />
            </GridItemInput>
            <GridItemInput>
              <Dropdown
                id='woodDensityLevel'
                label={strings.WOOD_DENSITY_LEVEL}
                aria-label={strings.WOOD_DENSITY_LEVEL}
                fullWidth={true}
                onChange={onChange('woodDensityLevel')}
                placeholder={strings.SELECT}
                options={getWoodDensityLevelOptions(activeLocale)}
                selectedValue={speciesRecord.woodDensityLevel}
              />
            </GridItemInput>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SpeciesInternalFieldsForm;
