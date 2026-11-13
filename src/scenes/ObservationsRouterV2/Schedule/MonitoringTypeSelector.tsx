import React, { type JSX, useMemo } from 'react';

import { Box, FormControlLabel, Radio, RadioGroup, Typography, useTheme } from '@mui/material';

import { useFeatureEnabled } from 'src/features';
import { useLocalization } from 'src/providers';
import { getRgbaFromHex } from 'src/utils/color';

import { MONITORING_TYPES, MonitoringType } from './monitoringTypes';
import { UpcomingObservationStartDates } from './useObservablePlantingSites';

interface MonitoringTypeSelectorProps {
  hasPlantings: boolean;
  onChange: (monitoringType: MonitoringType) => void;
  selectedMonitoringType: MonitoringType;
  upcomingObservationStartDates: UpcomingObservationStartDates;
}

const MonitoringTypeSelector = ({
  hasPlantings,
  onChange,
  selectedMonitoringType,
  upcomingObservationStartDates,
}: MonitoringTypeSelectorProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const biomassSchedulingEnabled = useFeatureEnabled('Scheduled Biomass Monitoring Observations');
  const baselineSurveyEnabled = useFeatureEnabled('Baseline Survey');
  const monitoringTypes: MonitoringType[] =
    biomassSchedulingEnabled && baselineSurveyEnabled ? ['Baseline Survey', ...MONITORING_TYPES] : MONITORING_TYPES;

  const optionsContent = useMemo(
    (): Record<MonitoringType, { badge: string; description: string; title: string }> => ({
      'Baseline Survey': {
        badge: strings.BASELINE_SURVEY,
        description: strings.RECORD_PLOT_CONDITIONS_AND_PLANTS_ALREADY_THERE,
        title: strings.MEASURE_MY_SITE_BEFORE_PLANTING,
      },
      Monitoring: {
        badge: strings.PLANT_MONITORING,
        description: strings.SCHEDULE_OBSERVATION_PLANT_MONITORING_DESCRIPTION,
        title: strings.SCHEDULE_OBSERVATION_PLANT_MONITORING_TITLE,
      },
      'Biomass Measurements': {
        badge: strings.BIOMASS_MONITORING,
        description: strings.SCHEDULE_OBSERVATION_BIOMASS_MONITORING_DESCRIPTION,
        title: strings.SCHEDULE_OBSERVATION_BIOMASS_MONITORING_TITLE,
      },
    }),
    [strings]
  );

  return (
    <>
      <Typography fontSize='14px' fontWeight={400} lineHeight='20px' color={theme.palette.TwClrTxtSecondary}>
        {strings.SCHEDULE_OBSERVATION_MONITORING_TYPE_LABEL}
      </Typography>
      <RadioGroup
        name='monitoringType'
        onChange={(_event, value) => onChange(value as MonitoringType)}
        value={selectedMonitoringType}
      >
        {monitoringTypes.map((monitoringType) => {
          const { badge, description, title } = optionsContent[monitoringType];
          const upcomingStartDate = upcomingObservationStartDates[monitoringType];
          const unavailableMessage =
            monitoringType === 'Baseline Survey'
              ? undefined
              : !hasPlantings
                ? strings.SCHEDULE_OBSERVATION_TYPE_REQUIRES_PLANTINGS
                : upcomingStartDate !== undefined
                  ? (strings.formatString(
                      strings.SCHEDULE_OBSERVATION_TYPE_ALREADY_SCHEDULED,
                      badge,
                      upcomingStartDate
                    ) as string)
                  : undefined;
          const disabled = unavailableMessage !== undefined;
          const selected = !disabled && selectedMonitoringType === monitoringType;

          return (
            <Box
              key={monitoringType}
              sx={{
                backgroundColor: selected
                  ? theme.palette.TwClrBgSuccessTertiary
                  : disabled
                    ? getRgbaFromHex(theme.palette.TwClrBgSecondary as string, 0.5)
                    : undefined,
                border: `1px solid ${selected ? theme.palette.TwClrBrdrSuccess : theme.palette.TwClrBrdrTertiary}`,
                borderRadius: theme.spacing(1),
                marginTop: theme.spacing(1),
                padding: theme.spacing(1, 2),
              }}
            >
              <FormControlLabel
                checked={selected}
                control={<Radio id={`monitoringType-${monitoringType}`} sx={{ alignSelf: 'flex-start' }} />}
                disabled={disabled}
                sx={{ alignItems: 'flex-start', margin: 0 }}
                label={
                  <Box paddingTop={theme.spacing(1)}>
                    <Typography fontSize='16px' fontWeight={600} lineHeight='24px' color={theme.palette.TwClrTxt}>
                      {title}
                    </Typography>
                    <Typography
                      fontSize='14px'
                      fontWeight={400}
                      lineHeight='20px'
                      color={theme.palette.TwClrTxtSecondary}
                      paddingBottom={theme.spacing(1)}
                    >
                      {description}
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: theme.palette.TwClrBgSecondary,
                        border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                        borderRadius: '16px',
                        display: 'inline-block',
                        padding: theme.spacing(0.5, 1.5),
                      }}
                    >
                      <Typography
                        fontSize='12px'
                        fontWeight={500}
                        color={disabled ? theme.palette.TwClrTxtSecondary : theme.palette.TwClrTxt}
                        whiteSpace='nowrap'
                      >
                        {badge}
                      </Typography>
                    </Box>
                    {unavailableMessage !== undefined && (
                      <Typography
                        fontSize='14px'
                        fontWeight={400}
                        lineHeight='20px'
                        color={theme.palette.TwClrTxtDanger}
                        paddingTop={theme.spacing(1)}
                      >
                        {unavailableMessage}
                      </Typography>
                    )}
                  </Box>
                }
                value={monitoringType}
              />
            </Box>
          );
        })}
      </RadioGroup>
    </>
  );
};

export default MonitoringTypeSelector;
