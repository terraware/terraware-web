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
  const updatesLabel = props.updates !== undefined ? suggestionsCountLabel(props.updates) : undefined;

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
  mode,
  sections,
  selectedKeys,
  onToggle,
  overrides,
  onOverrideChange,
}: NativeCheckStepProps): JSX.Element => {
  const theme = useTheme();

  const nativityOptions = NATIVITY_VALUES.map((value) => ({ label: getNativityLabel(value), value }));

  if (mode === 'override') {
    return (
      <Box display='flex' flexDirection='column' gap={theme.spacing(2)} textAlign='left'>
        {sections.map((section) => {
          const rows = section.pending.filter((row) =>
            selectedKeys.has(projectSpeciesKey(section.key, row.species.id))
          );

          if (rows.length === 0) {
            return <SummaryBox key={section.key} {...section.summary} />;
          }

          return (
            <Box key={section.key} display='flex' flexDirection='column' gap={theme.spacing(2)}>
              <SummaryBox {...section.summary} />
              {rows.map((row) => {
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
                      required
                    />
                    <Textfield
                      id={`override-justification-${key}`}
                      label={strings.JUSTIFICATION}
                      type='text'
                      value={override.justification ?? ''}
                      onChange={(value) => onOverrideChange(key, { ...override, justification: value as string })}
                      required
                    />
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Box display='flex' flexDirection='column' gap={theme.spacing(2)} textAlign='left'>
      {sections.map((section) => {
        const rows = section.pending;

        return (
          <Box
            key={section.key}
            sx={{
              border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
              overflow: 'hidden',
            }}
          >
            <SummaryBox {...section.summary} />
            {rows.length > 0 ? (
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
              </>
            ) : (
              <Box
                padding={theme.spacing(3)}
                textAlign='center'
                sx={{ borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
              >
                <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
                  {strings.NATIVE_CHECK_NO_UPDATES}
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default NativeCheckStep;
