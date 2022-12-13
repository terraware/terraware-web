import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { User } from 'src/types/User';
import strings from '../../src/strings';
import Icon from './common/icon/Icon';
import { APP_PATHS, TERRAFORMATION_PRIVACY_POLICY } from 'src/constants';
import { IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useEnvironment from 'src/utils/useEnvironment';
import PopoverMenu from './common/PopoverMenu';
import { DropdownItem } from '@terraware/web-components';

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
  userName: {
    fontSize: '16px',
    paddingLeft: '8px',
    color: theme.palette.TwClrTxt,
  },
}));

type UserMenuProps = {
  user?: User;
  reloadUser: () => void;
  hasOrganizations?: boolean;
};
export default function UserMenu({ user, reloadUser, hasOrganizations }: UserMenuProps): JSX.Element {
  const classes = useStyles();
  const { isProduction } = useEnvironment();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const history = useHistory();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onHandleLogout = () => {
    window.location.href = `/sso/logout`;
  };

  const onItemClick = (selectedItem: DropdownItem) => {
    switch (selectedItem.value) {
      case 'privacyPolicy': {
        handleClose();
        window.open(TERRAFORMATION_PRIVACY_POLICY, '_blank');
        break;
      }
      case 'logOut': {
        handleClose();
        onHandleLogout();
        break;
      }
      default: {
        handleClose();
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

    if (!isProduction && hasOrganizations) {
      items.splice(1, 0, { label: strings.OPT_IN, value: APP_PATHS.OPT_IN });
    }

    return items;
  };

  return (
    <div>
      <IconButton onClick={handleClick} size='small' className={classes.iconContainer}>
        <span className={classes.userName}>
          {user?.firstName} {user?.lastName}
        </span>
        <Icon name='chevronDown' size='medium' className={classes.chevronDown} />
      </IconButton>
      <PopoverMenu
        sections={[getMenuItems()]}
        handleClick={onItemClick}
        anchorElement={anchorEl}
        setAnchorElement={setAnchorEl}
      />
    </div>
  );
}
