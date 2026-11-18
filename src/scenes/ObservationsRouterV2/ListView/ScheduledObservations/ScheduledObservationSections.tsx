import React, { type JSX, type ReactNode } from 'react';

import { Box, ButtonBase, Divider, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { useLocalization } from 'src/providers';
import { ObservationPayload } from 'src/queries/generated/observations';

import { type ScheduledObservationSection, type ScheduledObservations } from './useScheduledObservations';

const SECTIONS: ScheduledObservationSection[] = ['upcoming', 'inProgress', 'overdue'];

type ScheduledObservationSectionsProps = {
  expandedSection?: ScheduledObservationSection;
  limit?: number;
  observations: ScheduledObservations;
  onToggle: (section: ScheduledObservationSection) => void;
  onViewAll?: (section: ScheduledObservationSection) => void;
  paddingX: number;
  renderObservation: (observation: ObservationPayload) => ReactNode;
};

const ScheduledObservationSections = ({
  expandedSection,
  limit,
  observations,
  onToggle,
  onViewAll,
  paddingX,
  renderObservation,
}: ScheduledObservationSectionsProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const labels: Record<ScheduledObservationSection, string> = {
    inProgress: strings.IN_PROGRESS,
    overdue: strings.OVERDUE,
    upcoming: strings.UPCOMING,
  };
  const viewAllLabels: Record<ScheduledObservationSection, string> = {
    inProgress: strings.VIEW_ALL_X_IN_PROGRESS,
    overdue: strings.VIEW_ALL_X_OVERDUE,
    upcoming: strings.VIEW_ALL_X_UPCOMING,
  };

  return (
    <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', minHeight: 0 }}>
      {SECTIONS.map((section) => {
        const sectionObservations = observations[section];
        const isExpanded = expandedSection === section;
        const isOverdue = section === 'overdue';
        const visibleObservations = limit === undefined ? sectionObservations : sectionObservations.slice(0, limit);
        const bodyId = `scheduled-observations-${section}`;

        return (
          <React.Fragment key={section}>
            <ButtonBase
              aria-controls={isExpanded ? bodyId : undefined}
              aria-expanded={isExpanded}
              onClick={() => onToggle(section)}
              sx={{
                alignItems: 'center',
                backgroundColor: theme.palette.TwClrBgSecondary,
                borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                display: 'flex',
                flexShrink: 0,
                gap: theme.spacing(1),
                padding: theme.spacing(1.5, paddingX),
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Typography fontSize='16px' fontWeight={600} lineHeight='24px'>
                {labels[section]}
              </Typography>
              <Typography
                sx={{
                  backgroundColor:
                    isOverdue && sectionObservations.length > 0 ? theme.palette.TwClrBgDangerTertiary : undefined,
                  borderRadius: '12px',
                  color:
                    isOverdue && sectionObservations.length > 0
                      ? theme.palette.TwClrTxtDanger
                      : theme.palette.TwClrTxtSecondary,
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '20px',
                  padding: theme.spacing(0, 0.75),
                }}
              >
                {sectionObservations.length}
              </Typography>
              <Box sx={{ display: 'flex', marginLeft: 'auto' }}>
                <Icon name={isExpanded ? 'chevronUp' : 'chevronDown'} size='medium' />
              </Box>
            </ButtonBase>
            {isExpanded && (
              <Box id={bodyId} sx={{ flex: '0 1 auto', minHeight: 0, overflowY: 'auto' }}>
                {sectionObservations.length === 0 && (
                  <>
                    <Divider />
                    <Typography
                      color={theme.palette.TwClrTxtSecondary}
                      fontSize='14px'
                      lineHeight='20px'
                      padding={theme.spacing(2, paddingX)}
                    >
                      {strings.NONE}
                    </Typography>
                  </>
                )}
                {visibleObservations.map((observation) => (
                  <React.Fragment key={observation.id}>
                    <Divider />
                    <Box padding={theme.spacing(2, paddingX)}>{renderObservation(observation)}</Box>
                  </React.Fragment>
                ))}
                {onViewAll && sectionObservations.length > visibleObservations.length && (
                  <>
                    <Divider />
                    <Box padding={theme.spacing(1.5, paddingX)}>
                      <Link fontSize='14px' onClick={() => onViewAll(section)}>
                        {strings.formatString(viewAllLabels[section], sectionObservations.length)}
                      </Link>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default ScheduledObservationSections;
