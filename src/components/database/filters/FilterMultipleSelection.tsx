import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { SearchField, SearchFilter } from '../../../api/types/search';
import Checkbox from '../../common/Checkbox';
import { Option } from '../columns';

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
  onChange: (filter: SearchFilter) => void;
  options: Option[];
  values: (string | null)[];
}

export default function MultipleSelection(props: Props): JSX.Element {
  const classes = useStyles();
  const filter = React.useRef<SearchFilter>();
  const [selections, setSelections] = React.useState<(string | null)[]>(
    props.values
  );

  React.useEffect(() => {
    setSelections(props.values);
  }, [props.values]);

  React.useEffect(() => {
    return () => {
      if (filter.current) {
        props.onChange(filter.current);
      }
    };
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
    };

    setSelections(updatesValues);
  };

  const options = [...props.options];
  const indexNull = options.findIndex((o) => o.value === null);
  if (indexNull >= 0) {
    if (options.find((o) => o.value === null)) {
      options.push({ label: 'None', value: null });
    }
    options.splice(indexNull, 1);
  }
  options.sort((a, b) =>
    a.value && b.value ? a.value.localeCompare(b.value) : 0
  );

  return (
    <div id={`filter-list-${props.field}`} className={classes.box}>
      {options.map(({ label, value }) => (
        <div key={value} className={classes.item}>
          <Checkbox
            id={value || ''}
            name={value || ''}
            label={label}
            value={selections.includes(value)}
            onChange={() => handleChange(value)}
          />
        </div>
      ))}
    </div>
  );
}
