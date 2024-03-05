import { Box, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Icon } from '@terraware/web-components';

import Link from 'src/components/common/Link';

const useStyles = makeStyles((theme: Theme) => ({
  addIcon: {
    fill: theme.palette.TwClrIcnBrand,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  largeIcon: {
    height: '20px',
    width: '20px',
  },
}));

type AddLinkProps = {
  text: string;
  id?: string;
  large?: boolean;
  onClick: (args: any) => void;
  disabled?: boolean;
};

export default function AddLink(props: AddLinkProps): JSX.Element {
  const { text, id, large, onClick, disabled } = props;
  const classes = useStyles();

  return (
    <Link id={id} onClick={onClick} fontSize={large ? '16px' : ''} disabled={disabled}>
      <Box display='flex'>
        <Icon
          name='iconAdd'
          className={`${classes.addIcon} ${large ? classes.largeIcon : ''} ${disabled ? classes.disabledIcon : ''}`}
        />
        <span>&nbsp;{text}</span>
      </Box>
    </Link>
  );
}
