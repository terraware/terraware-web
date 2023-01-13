import { DropdownItem } from '@terraware/web-components';
import { supportedLocales } from '../strings/locales';
import { LocalizationContext } from '../providers/contexts';
import Dropdown from './common/Dropdown';

export default function LocaleSelector(): JSX.Element {
  const localeItems: DropdownItem[] = supportedLocales.map((supportedLocale) => ({
    value: supportedLocale.id,
    label: supportedLocale.name,
  }));

  return (
    <LocalizationContext.Consumer>
      {({ locale, setLocale }) => {
        return (
          <Dropdown
            id={'localeSelector'}
            label={''}
            onChange={setLocale}
            selected={locale}
            values={localeItems}
          />
        );
      }}
    </LocalizationContext.Consumer>
  );
}
