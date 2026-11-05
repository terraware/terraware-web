import React, { useCallback } from 'react';

import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  useTheme,
} from '@mui/material';
import { Icon } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

export const DEFAULT_VIEW = 'default';
const SAVE_VIEW = 'saveView';

export type ViewOption = {
  label: string;
  value: string;
};

export const sortViewsByLabel = (views?: ViewOption[]) =>
  views && [...views].sort((a, b) => a.label.localeCompare(b.label));

export type CurrentViewSelectProps = {
  defaultViewLabel?: string | null;
  id?: string;
  myViews?: ViewOption[];
  onChange: (value: string) => void;
  onSave?: () => void;
  presetViews?: ViewOption[];
  selected: string;
  showSave?: boolean;
};

const CurrentViewSelect = ({
  defaultViewLabel: defaultViewLabelProp,
  id = 'current-view',
  myViews,
  onChange,
  onSave,
  presetViews,
  selected,
  showSave,
}: CurrentViewSelectProps) => {
  const { strings } = useLocalization();
  const defaultViewLabel = defaultViewLabelProp === undefined ? strings.DEFAULT : defaultViewLabelProp;
  const theme = useTheme();
  const labelId = `${id}-outlined-label`;

  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      if (showSave && event.target.value === SAVE_VIEW) {
        onSave?.();
      } else {
        onChange(event.target.value);
      }
    },
    [onChange, onSave, showSave]
  );

  const renderLabel = (label: string, value: string) => (
    <Box display='flex' alignItems='center' justifyContent='space-between' width='100%'>
      {label}
      {value === selected && (
        <Icon
          name='checkmark'
          size='small'
          fillColor={theme.palette.TwClrIcnSuccess}
          style={{ stroke: theme.palette.TwClrIcnSuccess, strokeWidth: 1 }}
        />
      )}
    </Box>
  );

  const renderValue = useCallback(
    (value: string) =>
      [...(presetViews ?? []), ...(myViews ?? [])].find((view) => view.value === value)?.label ??
      defaultViewLabel ??
      '',
    [defaultViewLabel, myViews, presetViews]
  );

  const renderSection = (header: string, views?: ViewOption[], showDivider = true) =>
    views?.length
      ? [
          ...(showDivider ? [<Divider key={`${header}-divider`} />] : []),
          <ListSubheader key={`${header}-header`} sx={{ fontSize: '12px', lineHeight: '30px' }}>
            {header.toUpperCase()}
          </ListSubheader>,
          ...views.map(({ label, value }) => (
            <MenuItem key={value} id={value} value={value}>
              {renderLabel(label, value)}
            </MenuItem>
          )),
        ]
      : [];

  return (
    <FormControl variant='outlined' size='small' sx={{ width: '100%' }}>
      <InputLabel id={labelId}>{strings.CURRENT_VIEW}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        label={strings.CURRENT_VIEW}
        onChange={handleChange}
        renderValue={renderValue}
        value={selected}
      >
        {defaultViewLabel !== null && (
          <MenuItem id={DEFAULT_VIEW} value={DEFAULT_VIEW}>
            {renderLabel(defaultViewLabel, DEFAULT_VIEW)}
          </MenuItem>
        )}
        {renderSection(strings.PRESET_VIEWS, sortViewsByLabel(presetViews), defaultViewLabel !== null)}
        {renderSection(strings.MY_VIEWS, myViews, defaultViewLabel !== null || !!presetViews?.length)}
        {showSave && <Divider />}
        {showSave && (
          <MenuItem
            id={`${id}-save`}
            value={SAVE_VIEW}
            sx={{
              color: theme.palette.TwClrTxtSuccess,
              '&:hover, &.Mui-focusVisible': { backgroundColor: theme.palette.TwClrBgSuccessTertiary },
            }}
          >
            <Icon
              name='plus'
              size='small'
              fillColor={theme.palette.TwClrIcnSuccess}
              style={{ marginRight: theme.spacing(1), stroke: theme.palette.TwClrIcnSuccess, strokeWidth: 1 }}
            />
            {strings.SAVE_TABLE_NEW_VIEW}
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default CurrentViewSelect;
