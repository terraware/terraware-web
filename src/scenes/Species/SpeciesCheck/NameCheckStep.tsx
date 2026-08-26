import React, { type JSX } from 'react';

import { Box, Checkbox, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { Species, SpeciesProblemElement } from 'src/types/Species';

import ProjectCheckSummary, { ProjectCheckSummaryProps } from './ProjectCheckSummary';

const issueLabel = (problem: SpeciesProblemElement): string => {
  switch (problem.type) {
    case 'Name Is Synonym':
      return strings.SPECIES_PROBLEM_NAME_IS_SYNONYM;
    case 'Name Misspelled':
      return strings.SPECIES_PROBLEM_NAME_MISSPELLED;
    case 'Name Not Found':
      return strings.SPECIES_PROBLEM_NAME_NOT_FOUND;
  }
};

type NameCheckStepProps = {
  summaries: ProjectCheckSummaryProps[];
  speciesWithProblems: Species[];
  selectedSpeciesIds: Set<number>;
  onToggleSpecies: (speciesId: number) => void;
};

const NameCheckStep = ({
  summaries,
  speciesWithProblems,
  selectedSpeciesIds,
  onToggleSpecies,
}: NameCheckStepProps): JSX.Element => {
  const theme = useTheme();

  const headerCell = {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.palette.TwClrTxt,
  };
  const bodyCell = {
    fontSize: '16px',
    color: theme.palette.TwClrTxt,
  };

  return (
    <Box display='flex' flexDirection='column' gap={theme.spacing(2)} textAlign='left'>
      <Box sx={{ backgroundColor: theme.palette.TwClrBgSecondary, padding: theme.spacing(0, 2) }}>
        {summaries.map((summary, index) => (
          <Box
            key={summary.projectName}
            sx={{
              padding: theme.spacing(2, 0),
              borderTop: index > 0 ? `1px solid ${theme.palette.TwClrBrdrTertiary}` : undefined,
            }}
          >
            <ProjectCheckSummary {...summary} updatesLabel={strings.SUGGESTIONS} />
          </Box>
        ))}
      </Box>

      {speciesWithProblems.length === 0 ? (
        <Box padding={theme.spacing(4)} textAlign='center'>
          <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
            {strings.DATABASE_CHECK_NO_ERRORS}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ border: `1px solid ${theme.palette.TwClrBrdrTertiary}`, overflow: 'hidden' }}>
          <Box
            display='grid'
            gridTemplateColumns='48px 1.5fr 1.5fr 2fr'
            alignItems='center'
            padding={theme.spacing(1.5, 2)}
            sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
          >
            <span />
            <Typography sx={headerCell}>{strings.SPECIES}</Typography>
            <Typography sx={headerCell}>{strings.ISSUE}</Typography>
            <Typography sx={{ ...headerCell, textAlign: 'right' }}>{strings.SUGGESTION}</Typography>
          </Box>
          {speciesWithProblems.map((species) => {
            const problem = species.problems?.[0];
            const hasSuggestion = !!problem?.suggestedValue;
            const textColor = hasSuggestion ? theme.palette.TwClrTxt : theme.palette.TwClrTxtSecondary;
            return (
              <Box
                key={species.id}
                display='grid'
                gridTemplateColumns='48px 1.5fr 1.5fr 2fr'
                alignItems='center'
                padding={theme.spacing(1, 2, 1, 0)}
              >
                <Checkbox
                  checked={hasSuggestion && selectedSpeciesIds.has(species.id)}
                  onChange={() => onToggleSpecies(species.id)}
                  disabled={!hasSuggestion}
                  sx={{ padding: 0 }}
                />
                <Typography sx={{ ...bodyCell, color: textColor }}>{species.scientificName}</Typography>
                <Typography sx={{ ...bodyCell, color: theme.palette.TwClrTxt }}>
                  {problem ? issueLabel(problem) : ''}
                </Typography>
                <Typography sx={{ ...bodyCell, textAlign: 'right', color: textColor }}>
                  {problem?.suggestedValue
                    ? strings.formatString(strings.CHANGE_TO, <b>{problem.suggestedValue}</b>)
                    : ''}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default NameCheckStep;
