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

  const handleChange = (value: string) => {
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

  return (
    <div id={`filter-list-${props.field}`} className={classes.box}>
      {props.options.map(({ label, value }) => (
        <div key={value} className={classes.item}>
          <Checkbox
            id={value || ''}
            name={value || ''}
            label={label}
            value={selections.includes(value)}
            onChange={() => handleChange(value || '')}
          />
        </div>
      ))}
    </div>
  );
}
