import React, { type JSX } from 'react';

import { useTheme } from '@mui/material';
import { Dropdown, DropdownItem, PopoverMenu } from '@terraware/web-components';

import { UserService } from 'src/services';
import strings from 'src/strings';

import { useUser } from '../providers';
import { LocalizationContext } from '../providers/contexts';
import { findLocaleDetails, useSupportedLocales } from '../strings/locales';

type LocaleSelectorProps = {
  transparent?: boolean;
  onChangeLocale?: (newValue: string) => void;
  localeSelected?: string;
  fullWidth?: boolean;
};

export default function LocaleSelector({
  transparent,
  onChangeLocale,
  localeSelected,
  fullWidth,
}: LocaleSelectorProps): JSX.Element {
  const { user, reloadUser } = useUser();
  const supportedLocales = useSupportedLocales();
  const localeItems: DropdownItem[] = supportedLocales.map((supportedLocale) => ({
    value: supportedLocale.id,
    label: supportedLocale.name,
  }));
  const theme = useTheme();

  return (
    <LocalizationContext.Consumer>
      {({ selectedLocale, setSelectedLocale }) => {
        const onChange = (selectedItem: DropdownItem) => {
          const newValue = selectedItem.value;
          if (selectedLocale !== newValue) {
            setSelectedLocale(newValue);
          }

          if (user && user.locale !== newValue) {
            const updateUserLocale = async () => {
              await UserService.updateUser({ ...user, locale: newValue });
              reloadUser();
            };

            void updateUserLocale();
          }
        };

        const localeDetails = findLocaleDetails(supportedLocales, localeSelected || selectedLocale);

        return (
          <>
            {transparent ? (
              <PopoverMenu
                anchor={
                  <span
                    style={{
                      fontSize: '16px',
                      paddingLeft: '8px',
                      color: theme.palette.TwClrTxt,
                    }}
                  >
                    {localeItems.find((iLocale) => iLocale.value === localeDetails.id)?.label}
                  </span>
                }
                menuSections={[localeItems]}
                onClick={onChange}
              />
            ) : (
              onChangeLocale && (
                <Dropdown
                  label={strings.LANGUAGE}
                  onChange={onChangeLocale}
                  selectedValue={localeDetails.id}
                  options={localeItems}
                  fullWidth={fullWidth}
                />
              )
            )}
          </>
        );
      }}
    </LocalizationContext.Consumer>
  );
}
