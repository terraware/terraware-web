import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {},
  selectedSection: {
    fontWeight: 600,
    fontSize: 24,
  },
}));

interface TitleProps {
  page: string;
  parentPage: string;
}
export default function Title({ page }: TitleProps): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.titleContainer}>
      <div className={classes.title}>
        <Typography className={classes.selectedSection} variant='h1'>
          {page}
        </Typography>
      </div>
    </div>
  );
}
