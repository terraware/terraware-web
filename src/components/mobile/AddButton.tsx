import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Button from 'src/components/common/button/Button';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    minWidth: '30px',
    width: '30px',
    height: '30px',
    borderRadius: '15px',
  },
}));

type AddButtonProps = {
  onClick: () => void;
  id: string;
};

export default function AddButton({ onClick, id }: AddButtonProps) {
  const classes = useStyles();

  return <Button icon={'plus'} label={''} onClick={onClick} size='small' id={id} className={classes.button} />;
}
