import React, { type JSX, useMemo } from 'react';

import { Box, type TooltipProps, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import Autocomplete from 'src/components/common/Autocomplete';
import { useLocalization } from 'src/providers/hooks';
import { RecentValue } from 'src/queries/search/accessions';
import strings from 'src/strings';

const NUM_RECENT = 5;

type OptionProps = {
  liProps: React.HTMLAttributes<HTMLLIElement>;
  value: string;
  allLabel: string;
  showRecentHeader: boolean;
  showAllHeader: boolean;
  relativeTime?: string;
};

// Renders a single dropdown option, optionally preceded by a section header and followed by a
// right-aligned relative-time label
const RecentValueOption = ({
  liProps,
  value,
  allLabel,
  showRecentHeader,
  showAllHeader,
  relativeTime,
}: OptionProps): JSX.Element => {
  const theme = useTheme();

  const headerSx = {
    color: theme.palette.TwClrTxtSecondary,
    fontSize: '12px',
    fontWeight: 600,
    padding: theme.spacing(1, 2),
  };

  return (
    <>
      {showRecentHeader && <Box sx={headerSx}>{strings.RECENT}</Box>}
      {showAllHeader && <Box sx={headerSx}>{allLabel}</Box>}
      <li {...liProps}>
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span>{value}</span>
          {relativeTime && (
            <Box
              component='span'
              sx={{
                color: theme.palette.TwClrTxtSecondary,
                fontSize: '14px',
                marginLeft: 2,
                whiteSpace: 'nowrap',
              }}
            >
              {relativeTime}
            </Box>
          )}
        </Box>
      </li>
    </>
  );
};

interface Props {
  id: string;
  label?: string;
  placeholder?: string;
  selected?: string;
  onChange: (value: string) => void;
  values: RecentValue[];
  allLabel: string;
  tooltipTitle?: TooltipProps['title'];
}

// Autocomplete with a "Recent" section listing the most recently used values, followed by an "all"
// section with the remaining values alphabetically. Once the user starts typing, both sections
// collapse into a single flat list matched on the typed characters.
export default function RecentValuesAutocomplete({
  id,
  label,
  placeholder,
  selected = '',
  onChange,
  values,
  allLabel,
  tooltipTitle,
}: Props): JSX.Element {
  const { activeLocale } = useLocalization();

  const inputText = selected.trim();
  const grouped = inputText === '' && values.length > NUM_RECENT;

  const recent = useMemo(() => values.slice(0, NUM_RECENT), [values]);

  const sortedAll = useMemo(() => {
    const locale = activeLocale ?? undefined;
    return values.map(({ value }) => value).sort((a, b) => a.localeCompare(b, locale, { sensitivity: 'base' }));
  }, [values, activeLocale]);

  const browsingOrder = useMemo(() => {
    const recentValues = new Set(recent.map(({ value }) => value));
    const others = sortedAll.filter((value) => !recentValues.has(value));
    return [...recent.map(({ value }) => value), ...others];
  }, [recent, sortedAll]);

  const firstRecent = recent[0]?.value;
  const firstOther = browsingOrder[recent.length];

  const lastUsedByValue = useMemo(() => {
    const map = new Map<string, string>();
    recent.forEach(({ value, lastUsed }) => {
      if (lastUsed) {
        map.set(value, lastUsed);
      }
    });
    return map;
  }, [recent]);

  const formatRelative = (isoDate: string): string | undefined => {
    if (!activeLocale) {
      return undefined;
    }
    // luxon has no pseudo locales, use Korean for gibberish.
    const dateLocale = activeLocale === 'gx' ? 'ko' : activeLocale;
    return DateTime.fromISO(isoDate).setLocale(dateLocale).toRelative() ?? undefined;
  };

  return (
    <Autocomplete
      freeSolo
      id={id}
      label={label}
      placeholder={placeholder}
      tooltipTitle={tooltipTitle}
      selected={selected}
      onChange={(value) => onChange((value as string) ?? '')}
      options={sortedAll}
      filterOptions={() => {
        if (grouped) {
          return browsingOrder;
        }
        if (inputText === '') {
          return sortedAll;
        }
        const query = inputText.toLowerCase();
        return sortedAll.filter((value) => value.toLowerCase().includes(query));
      }}
      renderOption={(props, option) => {
        const value = (option as string) ?? '';
        const optionProps = props as React.HTMLAttributes<HTMLLIElement> & { key?: React.Key };
        const optionKey = optionProps.key ?? value;
        const liProps = { ...optionProps };
        delete liProps.key;
        const lastUsed = grouped ? lastUsedByValue.get(value) : undefined;

        return (
          <RecentValueOption
            key={optionKey}
            liProps={liProps}
            value={value}
            allLabel={allLabel}
            showRecentHeader={grouped && value === firstRecent}
            showAllHeader={grouped && value === firstOther}
            relativeTime={lastUsed ? formatRelative(lastUsed) : undefined}
          />
        );
      }}
    />
  );
}
