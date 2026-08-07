import React, { type JSX } from 'react';

import { Box, Checkbox, Typography, useTheme } from '@mui/material';
import { Dropdown, Icon } from '@terraware/web-components';

import Textfield from 'src/components/common/Textfield/Textfield';
import strings from 'src/strings';
import { Species } from 'src/types/Species';

import SpeciesNativityBadge from '../SpeciesNativityBadge';
import ProjectCheckSummary, { ProjectCheckSummaryProps } from './ProjectCheckSummary';
import { NATIVITY_VALUES, Nativity, OverrideEdit, getNativityLabel, projectSpeciesKey } from './types';

export type PendingRow = {
  species: Species;
  nativity: Nativity;
};

export type NativeCheckProjectSection = {
  key: number;
  projectId?: number;
  summary: ProjectCheckSummaryProps;
  pending: PendingRow[];
};

export type NativeCheckStepProps = {
  mode: 'list' | 'override';
  sections: NativeCheckProjectSection[];
  selectedKeys: Set<string>;
  onToggle: (targetKey: number, speciesId: number) => void;
  overrides: Record<string, OverrideEdit>;
  onOverrideChange: (key: string, edit: OverrideEdit) => void;
};

// Each project's summary is its own rounded box in the native check (unlike the name check, where the
// summaries are grouped together).
const SummaryBox = (props: ProjectCheckSummaryProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBgSecondary,
        padding: theme.spacing(2),
      }}
    >
      <ProjectCheckSummary {...props} />
    </Box>
  );
};

const NativeCheckStep = ({
  mode,
  sections,
  selectedKeys,
  onToggle,
  overrides,
  onOverrideChange,
}: NativeCheckStepProps): JSX.Element => {
  const theme = useTheme();

  const hasPending = sections.some((section) => section.pending.length > 0);

  if (mode === 'list' && !hasPending) {
    return (
      <Box display='flex' flexDirection='column' gap={theme.spacing(2)} textAlign='left'>
        {sections.map((section) => (
          <SummaryBox key={section.key} {...section.summary} />
        ))}
        <Box padding={theme.spacing(4)} textAlign='center'>
          <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
            {strings.NATIVE_CHECK_NO_UPDATES}
          </Typography>
          <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
            {strings.NATIVE_CHECK_NO_UPDATES_HINT}
          </Typography>
        </Box>
      </Box>
    );
  }

  const nativityOptions = NATIVITY_VALUES.map((value) => ({ label: getNativityLabel(value), value }));

  return (
    <Box display='flex' flexDirection='column' gap={theme.spacing(2)} textAlign='left'>
      {sections.map((section) => {
        const rows =
          mode === 'override'
            ? section.pending.filter((row) => selectedKeys.has(projectSpeciesKey(section.key, row.species.id)))
            : section.pending;

        if (rows.length === 0) {
          return <SummaryBox key={section.key} {...section.summary} />;
        }

        return (
          <Box key={section.key} display='flex' flexDirection='column' gap={theme.spacing(2)}>
            <SummaryBox {...section.summary} />
            {mode === 'list' ? (
              <Box sx={{ border: `1px solid ${theme.palette.TwClrBrdrTertiary}`, overflow: 'hidden' }}>
                <Box
                  display='grid'
                  gridTemplateColumns='48px 1fr auto'
                  alignItems='center'
                  padding={theme.spacing(1.5, 2)}
                  sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
                >
                  <span />
                  <Typography fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxt}>
                    {strings.SPECIES}
                  </Typography>
                  <Typography fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxt} textAlign='right'>
                    {strings.STATUS}
                  </Typography>
                </Box>
                {rows.map((row) => {
                  const key = projectSpeciesKey(section.key, row.species.id);
                  return (
                    <Box
                      key={key}
                      display='grid'
                      gridTemplateColumns='48px 1fr auto'
                      alignItems='center'
                      padding={theme.spacing(1, 2, 1, 0)}
                    >
                      <Checkbox
                        checked={selectedKeys.has(key)}
                        onChange={() => onToggle(section.key, row.species.id)}
                        sx={{ padding: 0 }}
                      />
                      <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
                        {row.species.scientificName}
                      </Typography>
                      <Box display='flex' justifyContent='flex-end'>
                        <SpeciesNativityBadge nativity={row.nativity} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              rows.map((row) => {
                const key = projectSpeciesKey(section.key, row.species.id);
                const override = overrides[key] ?? {};
                return (
                  <Box
                    key={key}
                    sx={{
                      border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                      backgroundColor: theme.palette.TwClrBgWarningTertiary,
                      padding: theme.spacing(2),
                      display: 'flex',
                      flexDirection: 'column',
                      gap: theme.spacing(1.5),
                    }}
                  >
                    <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
                      <Icon name='warning' size='medium' fillColor={theme.palette.TwClrIcnWarning} />
                      <Typography fontSize='16px' fontWeight={500} color={'#3A4445'}>
                        {row.species.scientificName}
                      </Typography>
                    </Box>
                    <Dropdown
                      id={`override-status-${key}`}
                      label={strings.STATUS}
                      options={nativityOptions}
                      selectedValue={override.nativity ?? row.nativity}
                      onChange={(value: string) => onOverrideChange(key, { ...override, nativity: value as Nativity })}
                      fixedMenu
                    />
                    <Textfield
                      id={`override-justification-${key}`}
                      label={''}
                      type='text'
                      value={override.justification ?? ''}
                      placeholder={strings.JUSTIFICATION_FOR_PLANTING}
                      onChange={(value) => onOverrideChange(key, { ...override, justification: value as string })}
                    />
                  </Box>
                );
              })
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default NativeCheckStep;
