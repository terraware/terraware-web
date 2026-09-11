import React, { type JSX } from 'react';

import { Box, Checkbox, Typography, useTheme } from '@mui/material';
import { Dropdown, Icon } from '@terraware/web-components';

import Textfield from 'src/components/common/Textfield/Textfield';
import strings from 'src/strings';
import { Species } from 'src/types/Species';

import SpeciesNativityBadge from '../SpeciesNativityBadge';
import ProjectCheckSummary, { ProjectCheckSummaryProps, suggestionsCountLabel } from './ProjectCheckSummary';
import { NATIVITY_VALUES, Nativity, OverrideEdit, getNativityLabel, projectSpeciesKey } from './types';

type PendingRow = {
  species: Species;
  nativity: Nativity;
};

export type NativeCheckProjectSection = {
  key: number;
  projectId?: number;
  summary: ProjectCheckSummaryProps;
  pending: PendingRow[];
};

type NativeCheckStepProps = {
  sections: NativeCheckProjectSection[];
  overridingKeys: Set<string>;
  onToggle: (targetKey: number, speciesId: number) => void;
  overrides: Record<string, OverrideEdit>;
  onOverrideChange: (key: string, edit: OverrideEdit) => void;
};

const SummaryBox = (props: ProjectCheckSummaryProps): JSX.Element => {
  const theme = useTheme();
  const updatesLabel = props.updates && props.updates > 0 ? suggestionsCountLabel(props.updates) : undefined;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBgSecondary,
        padding: theme.spacing(2),
      }}
    >
      <ProjectCheckSummary {...props} updatesLabel={updatesLabel} />
    </Box>
  );
};

const NativeCheckStep = ({
  sections,
  overridingKeys,
  onToggle,
  overrides,
  onOverrideChange,
}: NativeCheckStepProps): JSX.Element => {
  const theme = useTheme();

  const nativityOptions = NATIVITY_VALUES.map((value) => ({ label: getNativityLabel(value), value }));

  const hasAnySuggestion = sections.some((section) => section.pending.length > 0);

  if (!hasAnySuggestion) {
    return (
      <Box padding={theme.spacing(4)} textAlign='center'>
        <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
          {strings.NATIVE_CHECK_NO_UPDATES}
        </Typography>
      </Box>
    );
  }

  return (
    <Box display='flex' flexDirection='column' gap={theme.spacing(2)} textAlign='left'>
      {sections.map((section) => (
        <Box
          key={section.key}
          sx={{
            border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
            overflow: 'hidden',
          }}
        >
          <SummaryBox {...section.summary} />
          {section.pending.length > 0 && (
            <>
              <Box
                display='grid'
                gridTemplateColumns='48px 1fr auto'
                alignItems='center'
                padding={theme.spacing(1.5, 2)}
                sx={{
                  backgroundColor: theme.palette.TwClrBgSecondary,
                  borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                }}
              >
                <span />
                <Typography fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxt}>
                  {strings.SPECIES}
                </Typography>
                <Typography fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxt} textAlign='right'>
                  {strings.SUGGESTED_STATUS}
                </Typography>
              </Box>
              {section.pending.map((row, index) => {
                const key = projectSpeciesKey(section.key, row.species.id);
                const isOverriding = overridingKeys.has(key);
                const override = overrides[key] ?? {};
                return (
                  <Box
                    key={key}
                    sx={{ borderTop: index > 0 ? `1px solid ${theme.palette.TwClrBrdrTertiary}` : undefined }}
                  >
                    <Box
                      display='grid'
                      gridTemplateColumns='48px 1fr auto'
                      alignItems='center'
                      padding={theme.spacing(1, 2, 1, 0)}
                    >
                      <Checkbox
                        checked={!isOverriding}
                        onChange={() => onToggle(section.key, row.species.id)}
                        sx={{ padding: 0 }}
                      />
                      <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
                        <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
                          {row.species.scientificName}
                        </Typography>
                        {isOverriding && (
                          <Box
                            component='span'
                            sx={{
                              backgroundColor: theme.palette.TwClrBgWarningTertiary,
                              borderRadius: theme.spacing(1),
                              padding: theme.spacing(0, 1),
                            }}
                          >
                            <Typography
                              component='span'
                              fontSize='12px'
                              fontWeight={600}
                              color={theme.palette.TwClrBgWarningActive}
                            >
                              {strings.OVERRIDING}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Box
                        display='flex'
                        justifyContent='flex-end'
                        sx={isOverriding ? { textDecoration: 'line-through', opacity: 0.5 } : undefined}
                      >
                        <SpeciesNativityBadge nativity={row.nativity} />
                      </Box>
                    </Box>
                    {isOverriding && (
                      <Box
                        sx={{
                          backgroundColor: theme.palette.TwClrBgWarningTertiary,
                          padding: theme.spacing(2),
                          display: 'flex',
                          flexDirection: 'column',
                          gap: theme.spacing(1.5),
                        }}
                      >
                        <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
                          <Icon name='warning' size='medium' fillColor={theme.palette.TwClrBgWarningActive} />
                          <Typography fontSize='14px' color={theme.palette.TwClrBgWarningActive}>
                            {strings.formatString(
                              strings.SPECIES_CHECK_OVERRIDE_WARNING,
                              getNativityLabel(row.nativity)
                            )}
                          </Typography>
                        </Box>
                        <Dropdown
                          id={`override-status-${key}`}
                          label={strings.STATUS}
                          options={nativityOptions}
                          selectedValue={override.nativity ?? row.nativity}
                          onChange={(value: string) =>
                            onOverrideChange(key, { ...override, nativity: value as Nativity })
                          }
                          fixedMenu
                          required
                        />
                        <Textfield
                          id={`override-justification-${key}`}
                          label={strings.JUSTIFICATION}
                          type='text'
                          value={override.justification ?? ''}
                          placeholder={strings.SPECIES_CHECK_OVERRIDE_JUSTIFICATION_PLACEHOLDER}
                          onChange={(value) => onOverrideChange(key, { ...override, justification: value as string })}
                          required
                        />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default NativeCheckStep;
