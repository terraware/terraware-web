import { Theme, Toolbar, Typography } from '@mui/material';
import { TopBarButton } from '.';
import Button from '../button/Button';
import { makeStyles } from '@mui/styles';

const styles = makeStyles((theme: Theme) => ({
  toolbar: {
    background: '#EDF0F1',
  },
  flexText: {
    flex: '1 1 100%',
  },
  buttonSpacing: {
    marginLeft: theme.spacing(1),
  },
}));

interface EnhancedTableToolbarProps {
  numSelected: number;
  topBarButtons?: TopBarButton[];
}

export default function EnhancedTableToolbar(props: EnhancedTableToolbarProps): JSX.Element | null {
  const { numSelected, topBarButtons } = props;
  const classes = styles();

  return numSelected > 0 ? (
    <Toolbar className={classes.toolbar}>
      <Typography color='inherit' variant='subtitle1' component='div' className={classes.flexText}>
        {numSelected} selected
      </Typography>
      {topBarButtons?.map((tbButton) => {
        return (
          <Button
            className={classes.buttonSpacing}
            key={tbButton.buttonText}
            label={tbButton.buttonText}
            priority='secondary'
            type={tbButton.buttonType}
            onClick={tbButton.onButtonClick}
          />
        );
      })}
    </Toolbar>
  ) : null;
}
