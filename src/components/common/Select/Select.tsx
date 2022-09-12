import { Select, SelectT } from '@terraware/web-components';
export default Select;

export type SelectItem = {
  label: string;
  value: string;
};

export interface SelectValueProps {
  onChange: (newValue: string) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  helperText?: string | string[];
  placeholder?: string;
  errorText?: string | string[];
  warningText?: string | string[];
  selectedValue?: string;
  readonly?: boolean;
  options?: SelectItem[];
  fullWidth?: boolean;
  hideArrow?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  fixedMenu?: boolean;
}

/**
 * This is a simple component that takes in a tuple { label, value }
 * for list of options.
 * The label is used for display, the value is passed back in onChange, and used to set selectedValue.
 * This is a very common use-case for a Select component, extracting it out
 * here. Not a candidate for web-components at this point.
 *
 * Example:
 * <SelectValue
 *   options=[{ label: 'label', value: 'value'}, { label: 'label1': value: 'value1'} ]
 *   onChange={(value: string) => setSomeValue(value)}
 *   selectedValue={'value1'}
 * />
 */
export function SelectValue(props: SelectValueProps): JSX.Element {
  const { selectedValue, onChange, ...remainingProps } = props;
  const selectedItem = props.options?.find((option) => option.value === selectedValue);

  return (
    <SelectT<SelectItem>
      {...remainingProps}
      selectedValue={selectedItem}
      isEqual={(A: SelectItem, B: SelectItem) => A.value === B.value}
      renderOption={(option: SelectItem) => option.label}
      toT={(str: string) => ({ label: str, value: str } as SelectItem)}
      displayLabel={(option: SelectItem) => option?.label || ''}
      onChange={(option: SelectItem) => onChange(option.value)}
    />
  );
}
