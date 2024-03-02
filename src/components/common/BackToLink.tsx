import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Icon } from '@terraware/web-components';

import Link from './Link';

const useStyles = makeStyles((theme: Theme) => ({
  backIcon: {
    fill: theme.palette.TwClrIcnBrand,
    marginRight: theme.spacing(1),
  },
  back: {
    alignItems: 'center',
    display: 'flex',
    width: 'fit-content',
  },
}));

type BackToLinkProps = {
  id: string;
  name: string;
  to: string;
  className?: string;
  replace?: boolean;
};

export default function BackToLink({ id, name, to, className, replace }: BackToLinkProps): JSX.Element {
  const classes = useStyles();

  return (
    <Link id={id} to={to} className={`${classes.back} ${className || ''}`} replace={replace}>
      <Icon name='caretLeft' className={classes.backIcon} size='small' />
      {name}
    </Link>
  );
}
