import { Dropdown, DropdownItem, Icon } from '@terraware/web-components';
import { supportedLocales } from '../strings/locales';
import { LocalizationContext } from '../providers/contexts';
import { UserService } from 'src/services';
import { useUser } from '../providers';
import { makeStyles } from '@mui/styles';
import { IconButton, Theme } from '@mui/material';
import { useState } from 'react';
import PopoverMenu from './common/PopoverMenu';
import strings from 'src/strings';

type LocaleSelectorProps = {
  transparent?: boolean;
  onChangeLocale?: (newValue: string) => void;
  selectedLocale?: string;
};

const useStyles = makeStyles((theme: Theme) => ({
  iconContainer: {
    height: '48px',
    borderRadius: '16px',
    padding: theme.spacing(1.5, 2),
  },
  icon: {
    width: '32px',
    height: '32px',
  },
  chevronDown: {
    marginLeft: '8px',
    fill: theme.palette.TwClrIcn,
  },
  selected: {
    fontSize: '16px',
    paddingLeft: '8px',
    color: theme.palette.TwClrTxt,
  },
}));

export default function LocaleSelector({
  transparent,
  onChangeLocale,
  selectedLocale,
}: LocaleSelectorProps): JSX.Element {
  const { user, reloadUser } = useUser();
  const localeItems: DropdownItem[] = supportedLocales.map((supportedLocale) => ({
    value: supportedLocale.id,
    label: supportedLocale.name,
  }));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const classes = useStyles();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <LocalizationContext.Consumer>
      {({ locale, setLocale }) => {
        const onChange = (selectedItem: DropdownItem) => {
          const newValue = selectedItem.value;
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
          handleClose();
        };

        return (
          <>
            {transparent ? (
              <div>
                <IconButton onClick={handleClick} size='small' className={classes.iconContainer}>
                  <span className={classes.selected}>
                    {localeItems.find((iLocale) => iLocale.value === locale)?.label}
                  </span>
                  <Icon name='chevronDown' size='medium' className={classes.chevronDown} />
                </IconButton>
                <PopoverMenu
                  sections={[localeItems]}
                  handleClick={onChange}
                  anchorElement={anchorEl}
                  setAnchorElement={setAnchorEl}
                />
              </div>
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
