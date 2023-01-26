import { DropdownItem } from '@terraware/web-components';
import { supportedLocales } from '../strings/locales';
import { LocalizationContext } from '../providers/contexts';
import Dropdown from './common/Dropdown';
import { UserService } from 'src/services';
import { useUser } from '../providers';

export default function LocaleSelector(): JSX.Element {
  const { user, reloadUser } = useUser();
  const localeItems: DropdownItem[] = supportedLocales.map((supportedLocale) => ({
    value: supportedLocale.id,
    label: supportedLocale.name,
  }));

  return (
    <LocalizationContext.Consumer>
      {({ locale, setLocale }) => {
        const onChange = (newValue: string) => {
          if (locale !== newValue) {
            setLocale(newValue);
          }

          if (user && user.locale !== newValue) {
            const updateUserLocale = async () => {
              await UserService.updateUser({ ...user, locale: newValue });
              reloadUser();
            };

            updateUserLocale();
          }
        };

        return <Dropdown id={'localeSelector'} label={''} onChange={onChange} selected={locale} values={localeItems} />;
      }}
    </LocalizationContext.Consumer>
  );
}
