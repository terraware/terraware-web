import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
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

const useStyles = makeStyles((theme: Theme) => ({
  selected: {
    fontSize: '16px',
    paddingLeft: '8px',
    color: theme.palette.TwClrTxt,
  },
}));

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
  const classes = useStyles();

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

            updateUserLocale();
          }
        };

        const localeDetails = findLocaleDetails(supportedLocales, localeSelected || selectedLocale);

        return (
          <>
            {transparent ? (
              <PopoverMenu
                anchor={
                  <span className={classes.selected}>
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
