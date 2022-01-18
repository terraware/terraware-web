import { makeStyles, Toolbar, Typography } from '@material-ui/core';
import Button from '../button/Button';

const styles = makeStyles((theme) => ({
  toolbar: {
    background: '#EDF0F1',
  },
  flexText: {
    flex: '1 1 100%',
  },
}));

interface EnhancedTableToolbarProps {
  numSelected: number;
  buttonText: string;
  buttonType: 'productive' | 'passive' | 'destructive' | undefined;
  onButtonClick: () => void;
}

export default function EnhancedTableToolbar(props: EnhancedTableToolbarProps): JSX.Element | null {
  const { numSelected, buttonText, buttonType, onButtonClick } = props;
  const classes = styles();

  return numSelected > 0 ? (
    <Toolbar className={classes.toolbar}>
      <Typography color='inherit' variant='subtitle1' component='div' className={classes.flexText}>
        {numSelected} selected
      </Typography>
      <Button label={buttonText} priority='secondary' type={buttonType} onClick={onButtonClick} />
    </Toolbar>
  ) : null;
}
