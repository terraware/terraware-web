import React, { useMemo } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material';
import { DropdownItem, PopoverMenu } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useDocLinks } from 'src/docLinks';
import { useUser } from 'src/providers';
import strings from 'src/strings';
import useEnvironment from 'src/utils/useEnvironment';

type UserMenuProps = {
  hasOrganizations?: boolean;
};

export default function UserMenu({}: UserMenuProps): JSX.Element {
  const theme = useTheme();
  const { user } = useUser();
  const { isProduction } = useEnvironment();
  const navigate = useNavigate();
  const docLinks = useDocLinks();
  const mixpanel = useMixpanel();

  const onHandleLogout = () => {
    mixpanel?.reset();
    window.location.href = '/sso/logout';
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
        navigate(selectedItem.value);
        break;
      }
    }
  };

  const menuItems = useMemo(() => {
    let items: DropdownItem[] = [];
    if (user?.userType !== 'Funder') {
      items.push({ label: strings.MY_ACCOUNT, value: APP_PATHS.MY_ACCOUNT });
    }

    if (!isProduction) {
      items.push({ label: strings.OPT_IN, value: APP_PATHS.OPT_IN });
    }

    items = items.concat([
      { label: strings.PRIVACY_POLICY, value: 'privacyPolicy' },
      { label: strings.HELP_SUPPORT, value: APP_PATHS.HELP_SUPPORT },
      { label: strings.LOG_OUT, value: 'logOut' },
    ]);

    return items;
  }, [user, isProduction]);

  return (
    <PopoverMenu
      anchor={
        <span
          style={{
            fontSize: '16px',
            paddingLeft: '8px',
            color: theme.palette.TwClrTxt,
          }}
        >
          {user?.firstName} {user?.lastName}
        </span>
      }
      menuSections={[menuItems]}
      onClick={onItemClick}
    />
  );
}
