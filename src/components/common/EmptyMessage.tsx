import { makeStyles } from '@mui/styles';
import { Theme, Typography } from '@mui/material';
import Button from 'src/components/common/button/Button';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    background: theme.palette.TwClrBg,
    padding: '24px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  text: {
    paddingBottom: '24px',
    fontSize: '16px',
  },
  title: {
    fontSize: '20px',
  },
  rowItemsContainer: {
    marginTop: theme.spacing(4),
  },
  rowItem: {
    borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: (props: StyleProps) => (props.isMobile ? 'column' : 'row'),
    justifyContent: 'space-between',
    alignItems: 'center',
    '& > button': {
      textAlign: 'center',
      width: '152px',
    },
  },
  rowItemInfo: {
    textAlign: 'left',
    marginBottom: (props: StyleProps) => (props.isMobile ? theme.spacing(2) : 0),
  },
  rowItemInfoTitle: {
    fontSize: '16px',
    fontWeight: 500,
    color: theme.palette.TwClrTxt,
    lineHeight: '20px',
  },
  rowItemInfoText: {
    fontSize: '14px',
    fontWeight: 500,
    color: theme.palette.TwClrTxt,
    lineHeight: '20px',
  },
}));

type RowItemProps = {
  title: string;
  text: string;
  buttonText: string;
  onClick: () => void;
};

type EmptyMessageProps = {
  title: string;
  text?: string;
  buttonText?: string;
  onClick?: () => void;
  className?: string;
  rowItems?: RowItemProps[];
};

export default function EmptyMessage(props: EmptyMessageProps): JSX.Element {
  const { title, text, buttonText, onClick, className, rowItems } = props;
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });

  return (
    <div className={`${classes.mainContainer} ${className ?? ''}`}>
      {title && <h3 className={classes.title}>{title}</h3>}
      {text && <p className={classes.text}>{text}</p>}
      {rowItems !== undefined && (
        <div className={classes.rowItemsContainer}>
          {rowItems.map((rowItem, index) => (
            <div className={classes.rowItem} key={index}>
              <div className={classes.rowItemInfo}>
                <Typography className={classes.rowItemInfoTitle}>{rowItem.title}</Typography>
                <Typography className={classes.rowItemInfoText}>{rowItem.text}</Typography>
              </div>
              <Button label={rowItem.buttonText} onClick={rowItem.onClick} />
            </div>
          ))}
        </div>
      )}
      {onClick && buttonText && <Button label={buttonText} onClick={onClick} />}
    </div>
  );
}
