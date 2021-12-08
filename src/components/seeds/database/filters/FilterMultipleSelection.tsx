import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import Checkbox from '../../../common/Checkbox';
import { Option } from '../columns';
import { FieldNodePayload, SearchField } from '../../../../api/seeds/search';

const useStyles = makeStyles((theme) =>
  createStyles({
    box: {
      width: '264px',
      padding: theme.spacing(1.75),
    },
    item: {
      display: 'flex',
      alignItems: 'center',
    },
  })
);

interface Props {
  field: SearchField;
  onChange: (filter: FieldNodePayload) => void;
  options: Option[];
  values: (string | null)[];
}

export default function MultipleSelection(props: Props): JSX.Element {
  const classes = useStyles();
  const filter = React.useRef<FieldNodePayload>();
  const [selections, setSelections] = React.useState<(string | null)[]>(props.values);

  React.useEffect(() => {
    setSelections(props.values);
  }, [props.values]);

  React.useEffect(() => {
    return () => {
      if (filter.current) {
        props.onChange(filter.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (value: string | null) => {
    const updatesValues = [...selections];

    const valueIndex = updatesValues.findIndex((v) => v === value);
    if (valueIndex < 0) {
      updatesValues.push(value);
    } else {
      updatesValues.splice(valueIndex, 1);
    }

    filter.current = {
      field: props.field,
      values: updatesValues,
      type: 'Exact',
      operation: 'field',
    };

    setSelections(updatesValues);
  };

  const options = [...props.options];
  const indexNull = options.findIndex((o) => o.value === null);
  if (indexNull >= 0) {
    if (options.find((o) => o.value === null)) {
      options.push({ label: 'None', value: null, disabled: false });
    }
    options.splice(indexNull, 1);
  }
  options.sort((a, b) => (a.value && b.value ? a.value.localeCompare(b.value) : 0));

  return (
    <div id={`filter-list-${props.field}`} className={classes.box}>
      {options.map(({ label, value, disabled }) => (
        <div key={value} className={classes.item}>
          <Checkbox
            id={value || ''}
            name={value || ''}
            label={label}
            value={selections.includes(value)}
            onChange={() => handleChange(value)}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
