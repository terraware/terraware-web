import { Dropdown, DropdownItem, PopoverMenu } from '@terraware/web-components';
import { supportedLocales } from '../strings/locales';
import { LocalizationContext } from '../providers/contexts';
import { UserService } from 'src/services';
import { useUser } from '../providers';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import strings from 'src/strings';

type LocaleSelectorProps = {
  transparent?: boolean;
  onChangeLocale?: (newValue: string) => void;
  localeSelected?: string;
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
}: LocaleSelectorProps): JSX.Element {
  const { user, reloadUser } = useUser();
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

        return (
          <>
            {transparent ? (
              <PopoverMenu
                anchor={
                  <span className={classes.selected}>
                    {localeItems.find((iLocale) => iLocale.value === selectedLocale)?.label}
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
                  selectedValue={selectedLocale}
                  options={localeItems}
                />
              )
            )}
          </>
        );
      }}
    </LocalizationContext.Consumer>
  );
}
