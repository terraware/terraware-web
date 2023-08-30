import React from 'react';
import { useHistory } from 'react-router-dom';
import strings from '../../src/strings';
import { APP_PATHS } from 'src/constants';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useEnvironment from 'src/utils/useEnvironment';
import { DropdownItem, PopoverMenu } from '@terraware/web-components';
import { useUser } from 'src/providers';
import { useDocLinks } from 'src/docLinks';

const useStyles = makeStyles((theme: Theme) => ({
  userName: {
    fontSize: '16px',
    paddingLeft: '8px',
    color: theme.palette.TwClrTxt,
  },
}));

type UserMenuProps = {
  hasOrganizations?: boolean;
};

export default function UserMenu({ hasOrganizations }: UserMenuProps): JSX.Element {
  const classes = useStyles();
  const { user } = useUser();
  const { isProduction } = useEnvironment();
  const history = useHistory();
  const docLinks = useDocLinks();

  const onHandleLogout = () => {
    window.location.href = `/sso/logout`;
  };

  const onItemClick = (selectedItem: DropdownItem) => {
    switch (selectedItem.value) {
      case 'privacyPolicy': {
        window.open(docLinks.privacy_policy, '_blank');
        break;
      }
      case 'logOut': {
        onHandleLogout();
        break;
      }
      default: {
        history.push(selectedItem.value);
        break;
      }
    }
  };

  const getMenuItems = () => {
    const items: DropdownItem[] = [
      { label: strings.MY_ACCOUNT, value: APP_PATHS.MY_ACCOUNT },
      { label: strings.PRIVACY_POLICY, value: 'privacyPolicy' },
      { label: strings.LOG_OUT, value: 'logOut' },
    ];

    if (!isProduction) {
      items.splice(1, 0, { label: strings.OPT_IN, value: APP_PATHS.OPT_IN });
    }

    return items;
  };

  return (
    <PopoverMenu
      anchor={
        <span className={classes.userName}>
          {user?.firstName} {user?.lastName}
        </span>
      }
      menuSections={[getMenuItems()]}
      onClick={onItemClick}
    />
  );
}
