import React from 'react';
import strings from 'src/strings';
import { SelectValue } from 'src/components/common/Select/Select';

interface Props {
  placeholder: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  selectedValue?: string;
}

export default function CollectionSource(props: Props): JSX.Element {
  return (
    <SelectValue
      {...props}
      fullWidth={true}
      readonly={true}
      options={[
        {
          label: strings.WILD_IN_SITU,
          value: 'Wild',
        },
        {
          label: strings.REINTRODUCED,
          value: 'Reintroduced',
        },
        {
          label: strings.CULTIVATED_EX_SITU,
          value: 'Cultivated',
        },
        {
          label: strings.OTHER,
          value: 'Other',
        },
      ]}
    />
  );
}
