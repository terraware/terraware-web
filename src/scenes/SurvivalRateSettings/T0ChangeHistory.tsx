import React, { type JSX, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { DateTime } from 'luxon';

import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListT0EventsQuery } from 'src/queries/t0/events';
import { getMediumDate } from 'src/utils/dateFormatter';

import { type T0Change, type T0ChangeGroup, type T0Save, groupT0EventsIntoSaves } from './t0EventSaves';

const SUMMARY_SEPARATOR = ' · ';

type T0ChangeHistoryProps = {
  plantingSiteId: number;
};

const T0ChangeHistory = ({ plantingSiteId }: T0ChangeHistoryProps): JSX.Element | null => {
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const [showHistory, setShowHistory] = useState(false);
  const [expandedSaves, setExpandedSaves] = useState<string[]>([]);
  const [listT0Events, { data: events }] = useLazyListT0EventsQuery();

  const organizationId = selectedOrganization?.id;

  useEffect(() => {
    if (organizationId !== undefined) {
      void listT0Events({ organizationId, plantingSiteId }, true);
    }
  }, [listT0Events, organizationId, plantingSiteId]);

  const saves = useMemo(() => groupT0EventsIntoSaves(events), [events]);

  const toggleHistory = useCallback(() => setShowHistory((previous) => !previous), []);

  const toggleSave = useCallback(
    (key: string) =>
      setExpandedSaves((previous) =>
        previous.includes(key) ? previous.filter((expanded) => expanded !== key) : [...previous, key]
      ),
    []
  );

  const summarize = useCallback(
    (save: T0Save): string => {
      if (save.plotCount === 0 && save.stratumCount === 0) {
        return strings.T0_HISTORY_UPDATED_SETTINGS;
      }

      const parts = [strings.T0_HISTORY_UPDATED];

      if (save.plotCount > 0) {
        parts.push(
          save.plotCount === 1
            ? strings.T0_HISTORY_PLOTS_ONE
            : (strings.formatString(strings.T0_HISTORY_PLOTS, save.plotCount) as string)
        );
      }
      if (save.stratumCount > 0) {
        parts.push(
          save.stratumCount === 1
            ? strings.T0_HISTORY_STRATA_ONE
            : (strings.formatString(strings.T0_HISTORY_STRATA, save.stratumCount) as string)
        );
      }
      if (save.includesSiteSetting) {
        parts.push(strings.T0_HISTORY_SITE_SETTINGS);
      }

      return parts.join(SUMMARY_SEPARATOR);
    },
    [strings]
  );

  const groupLabel = useCallback(
    (group: T0ChangeGroup): string => {
      switch (group.kind) {
        case 'plot':
          return strings.formatString(strings.T0_HISTORY_PLOT, group.plotNumber) as string;
        case 'stratum':
          return strings.formatString(strings.T0_HISTORY_STRATUM, group.stratumName) as string;
        case 'site':
          return strings.PLANTING_SITE;
      }
    },
    [strings]
  );

  const renderOldValue = useCallback(
    (value?: string): JSX.Element => (
      <Typography component='span' color={theme.palette.TwClrTxtWarning} fontWeight={600}>
        {value || strings.NONE}
      </Typography>
    ),
    [strings.NONE, theme.palette.TwClrTxtWarning]
  );

  const renderNewValue = useCallback(
    (value?: string): JSX.Element => (
      <Typography component='span' color={theme.palette.TwClrTxtSuccess} fontWeight={600}>
        {value || strings.NONE}
      </Typography>
    ),
    [strings.NONE, theme.palette.TwClrTxtSuccess]
  );

  const observationLabel = useCallback(
    (date?: string, observationId?: string): string | undefined => {
      if (!date) {
        return observationId;
      }

      const startDate = getMediumDate(date, activeLocale);

      return observationId
        ? (strings.formatString(strings.T0_HISTORY_OBSERVATION_WITH_ID, startDate, observationId) as string)
        : startDate;
    },
    [activeLocale, strings]
  );

  const renderChange = useCallback(
    (change: T0Change): ReactNode => {
      if (change.type === 'observation') {
        const from = observationLabel(change.fromDate, change.fromObservationId);
        const to = observationLabel(change.toDate, change.toObservationId);

        if (!to) {
          return strings.formatString(strings.T0_HISTORY_OBSERVATION_REMOVED, renderOldValue(from));
        }
        if (!from) {
          return strings.formatString(strings.T0_HISTORY_OBSERVATION_SET, renderNewValue(to));
        }
        return strings.formatString(strings.T0_HISTORY_OBSERVATION_CHANGED, renderOldValue(from), renderNewValue(to));
      }

      if (change.type === 'density') {
        if (!change.to) {
          return strings.formatString(strings.T0_HISTORY_DENSITY_REMOVED, change.speciesName);
        }
        if (!change.from) {
          return strings.formatString<string | JSX.Element>(
            strings.T0_HISTORY_DENSITY_SET,
            change.speciesName,
            renderNewValue(change.to)
          );
        }
        return strings.formatString<string | JSX.Element>(
          strings.T0_HISTORY_DENSITY_CHANGED,
          change.speciesName,
          renderOldValue(change.from),
          renderNewValue(change.to)
        );
      }

      return strings.formatString(
        strings.VALUE_CHANGED_FROM_TO,
        <Typography component='span' textTransform='capitalize'>
          {change.fieldName}
        </Typography>,
        renderOldValue(change.from),
        renderNewValue(change.to)
      );
    },
    [observationLabel, renderNewValue, renderOldValue, strings]
  );

  const lastSave = saves[0];

  if (!lastSave) {
    return null;
  }

  return (
    <Box paddingTop={theme.spacing(3)}>
      <Box display='flex' alignItems='center'>
        <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrBaseBlack} marginRight='16px'>
          {strings.formatString(
            strings.LAST_MODIFIED_ON_BY,
            DateTime.fromISO(lastSave.timestamp).toFormat('yyyy-MM-dd'),
            lastSave.userName
          )}
        </Typography>
        <Button
          priority='ghost'
          label={strings.CHANGE_HISTORY}
          onClick={toggleHistory}
          sx={{ fontWeight: '400 !important', '&:focus': { outline: 'none !important' } }}
          rightIcon={showHistory ? 'chevronUp' : 'chevronDown'}
        />
      </Box>
      {showHistory && (
        <Box>
          {saves.map((save) => {
            const expanded = expandedSaves.includes(save.key);

            return (
              <Box key={save.key} borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`} padding={2}>
                <Box display='flex' gap='24px' alignItems='center'>
                  <Box sx={{ flexShrink: { xs: 1, sm: 0 } }}>
                    <Typography
                      color={theme.palette.TwClrTxtSecondary}
                      sx={{ whiteSpace: { xs: 'normal', sm: 'nowrap' } }}
                    >
                      {DateTime.fromISO(save.timestamp).toFormat('yyyy-MM-dd HH:mm')} {strings.BY} {save.userName}
                    </Typography>
                  </Box>
                  <Box flex={1}>
                    <Button
                      priority='ghost'
                      label={summarize(save)}
                      onClick={() => toggleSave(save.key)}
                      sx={{ fontWeight: '400 !important', '&:focus': { outline: 'none !important' } }}
                      rightIcon={expanded ? 'chevronUp' : 'chevronDown'}
                    />
                  </Box>
                </Box>
                {expanded && (
                  <Box paddingTop={1}>
                    {save.groups.map((group) => (
                      <Box key={group.key} paddingTop={1}>
                        <Typography fontWeight={600}>{groupLabel(group)}</Typography>
                        {group.changes.map((change, index) => (
                          <Typography key={index} paddingLeft={2}>
                            {renderChange(change)}
                          </Typography>
                        ))}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default T0ChangeHistory;
