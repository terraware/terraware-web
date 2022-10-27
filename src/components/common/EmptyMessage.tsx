import { makeStyles } from '@mui/styles';
import { Theme, Typography, useTheme } from '@mui/material';
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
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(5),
  },
  rowItem: {
    borderTop: `1px solid ${theme.palette.TwClrBgTertiary}`,
    padding: `${theme.spacing(3)} 0`,
    margin: `0 ${theme.spacing(1)}`,
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
  const theme = useTheme();
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
                <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxt} lineHeight='20px'>
                  {rowItem.title}
                </Typography>
                <Typography fontSize='14px' fontWeight={500} color={theme.palette.TwClrTxt} lineHeight='20px'>
                  {rowItem.text}
                </Typography>
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
