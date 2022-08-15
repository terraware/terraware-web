import { Typography } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Icon from './icon/Icon';
import { Close } from '@mui/icons-material';
import Button from './button/Button';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    display: 'flex',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
  contentContainer: {
    display: 'flex',
  },
  page: {
    width: '584px',
    borderRadius: '8px',
    '&.bodyinfo': {
      border: '1px solid #708284',
      background: '#F2F4F5',
      '& .snackbarIcon': {
        fill: '#708284',
      },
    },
    '&.bodycritical': {
      border: '1px solid #FE0003',
      background: '#FFF1F1',
      '& .snackbarIcon': {
        fill: '#FE0003',
      },
    },
    '&.bodywarning': {
      border: '1px solid #BD6931',
      background: '#FEF2EE',
      '& .snackbarIcon': {
        fill: '#BD6931',
      },
    },
    '&.bodysuccess': {
      border: '1px solid #308F5F',
      background: '#D6FDE5',
      '& .snackbarIcon': {
        fill: '#308F5F',
      },
    },
    '& .body': {
      padding: `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)} 0`,
    },
  },
  body: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
    color: '#3A4445',
  },
  snackbarTitle: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '24px',
    color: '#3A4445',
    marginBottom: '8px',
  },
  iconContainer: {
    borderRadius: '14px 0 0 14px',
    padding: '16px',
    '& svg': {
      width: '24px',
      height: '24px',
    },
  },
  closeIconContainer: {
    cursor: 'pointer',
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: '10px',
  },
  buttonContainer: {
    width: '100%',
    textAlign: 'right',
    padding: `0 ${theme.spacing(1)} ${theme.spacing(1)}`,
  },
}));

type PageMessageProps = {
  title?: string[] | string;
  message: string[] | string;
  priority: 'info' | 'critical' | 'warning' | 'success';
  onClose?: () => void;
  buttonText?: string;
  onClick?: () => void;
};

export default function PageMessage(props: PageMessageProps): JSX.Element {
  const classes = useStyles();
  const { title, message, priority, onClose, buttonText, onClick } = props;

  return (
    <div className={`${classes.mainContainer} ${classes.page} body${priority}`}>
      <div className={classes.contentContainer}>
        <div className={`${classes.iconContainer} iconContainer`}>
          <Icon name={priority} className='snackbarIcon' />
        </div>
        <div className={`${classes.body} body`}>
          {title && (
            <Typography component='p' variant='body1' className={classes.snackbarTitle}>
              {title}
            </Typography>
          )}
          <Typography component='p' variant='body1'>
            {message}
          </Typography>
        </div>
        {onClose && (
          <div className={classes.closeIconContainer} onClick={onClose}>
            <Close />
          </div>
        )}
      </div>
      {buttonText && onClick && (
        <div className={classes.buttonContainer}>
          <Button label={buttonText} priority='secondary' type='passive' onClick={onClick} />
        </div>
      )}
    </div>
  );
}
