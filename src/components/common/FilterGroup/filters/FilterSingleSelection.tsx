import React from 'react';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dropdown, DropdownItem } from '@terraware/web-components';
import { Option } from '@terraware/web-components/components/table/types';

import strings from 'src/strings';
import { FieldNodePayload } from 'src/types/Search';

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    padding: theme.spacing(1.75),
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
}));

interface Props {
  field: string;
  onChange: (filter: FieldNodePayload) => void;
  options: Option[];
  value: string | null;
  isBoolean: boolean;
}

export default function SingleSelection(props: Props): JSX.Element {
  const classes = useStyles();

  const options = [...props.options];
  const indexEnabledNull = options.findIndex((o) => o.value === null && o.disabled === false);
  if (indexEnabledNull >= 0) {
    if (props.isBoolean) {
      const falseOption = options.find((o) => o.value === 'false' && o.disabled);
      if (falseOption) {
        falseOption.disabled = false;
      }
    } else {
      if (options.find((o) => o.value === null)) {
        options.push({ label: strings.UNSPECIFIED, value: null, disabled: false });
      }
    }
    options.splice(indexEnabledNull, 1);
  } else {
    const indexDisabledNull = options.findIndex((o) => o.value === null && o.disabled);
    if (indexDisabledNull >= 0) {
      options.splice(indexDisabledNull, 1);
    }
  }
  options.sort((a, b) => (a.value && b.value ? a.value.localeCompare(b.value) : 0));

  const handleChange = (value: string | null) => {
    let updatesValues = [value];
    if (props.isBoolean) {
      if (value === 'false') {
        updatesValues = [null, 'false'];
      }
    }

    const newFilter: FieldNodePayload = {
      field: props.field,
      values: updatesValues,
      type: 'Exact',
      operation: 'field',
    };

    props.onChange(newFilter);
  };

  return (
    <div id={`filter-list-${props.field}`} className={classes.box}>
      <Dropdown
        options={options.map(({ label, value }) => ({ label, value }) as DropdownItem)}
        onChange={(val) => handleChange(val)}
        selectedValue={props.value}
        fullWidth={true}
        disabled={options.length === 0}
      />
    </div>
  );
}
