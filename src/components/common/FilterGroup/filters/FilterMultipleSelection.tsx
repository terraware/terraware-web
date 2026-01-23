import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { MultiSelect } from '@terraware/web-components';
import { Option } from '@terraware/web-components/components/table/types';

import strings from 'src/strings';
import { FieldNodePayload } from 'src/types/Search';

interface Props {
  field: string;
  onChange: (filter: FieldNodePayload) => void;
  options: Option[];
  values: (string | null)[];
  pillValueRenderer?: (values: (string | number | null)[]) => string | undefined;
}

export default function MultipleSelection(props: Props): JSX.Element {
  const theme = useTheme();
  const filter = React.useRef<FieldNodePayload>(undefined);
  const [selections, setSelections] = React.useState<(string | null)[]>(props.values);

  React.useEffect(() => {
    setSelections(props.values);
  }, [props.values]);

  const optionsMap = useMemo(
    () =>
      new Map<string, string>(
        props.options.filter((opt) => opt.value && opt.label).map((opt) => [opt.value!, opt.label!])
      ),
    [props.options]
  );

  const onAdd = (value: string | null) => {
    const updatesValues = [...selections];
    const valueIndex = updatesValues.findIndex((v) => v === value);
    if (valueIndex < 0) {
      updatesValues.push(value);
      updateFilters(updatesValues);
    }
  };

  const onRemove = (value: string | null) => {
    const updatesValues = [...selections];
    const valueIndex = updatesValues.findIndex((v) => v === value);
    if (valueIndex >= 0) {
      updatesValues.splice(valueIndex, 1);
      updateFilters(updatesValues);
    }
  };

  const updateFilters = (updatesValues: (string | null)[]) => {
    filter.current = {
      field: props.field,
      values: updatesValues,
      type: 'Exact',
      operation: 'field',
    };

    setSelections(updatesValues);
    props.onChange(filter.current);
  };

  const options = [...props.options];
  const indexNull = options.findIndex((o) => o.value === null);
  if (indexNull >= 0) {
    if (options.find((o) => o.value === null)) {
      options.push({ label: strings.UNSPECIFIED, value: null, disabled: false });
    }
    options.splice(indexNull, 1);
  }
  options.sort((a, b) => (a.value && b.value ? a.value.localeCompare(b.value) : 0));

  return (
    <Box id={`filter-list-${props.field}`} sx={{ padding: theme.spacing(1.75) }}>
      <MultiSelect
        fullWidth={true}
        onAdd={onAdd}
        onRemove={onRemove}
        options={optionsMap}
        valueRenderer={(v) => (props.pillValueRenderer ? props.pillValueRenderer([v]) || '' : v)}
        selectedOptions={selections}
        disabled={options.length === 0}
      />
    </Box>
  );
}
