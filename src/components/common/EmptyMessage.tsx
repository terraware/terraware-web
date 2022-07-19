import { makeStyles } from '@mui/styles';
import Button from 'src/components/common/button/Button';

const useStyles = makeStyles(() => ({
  mainContainer: {
    border: '1px solid #A9B7B8',
    background: '#fff',
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
}));

type EmptyMessageProps = {
  title: string;
  text?: string;
  buttonText?: string;
  onClick?: () => void;
  className?: string;
};

export default function EmptyMessage(props: EmptyMessageProps): JSX.Element {
  const { title, text, buttonText, onClick, className } = props;
  const classes = useStyles();

  return (
    <div className={`${classes.mainContainer} ${className ?? ''}`}>
      <h3 className={classes.title}>{title}</h3>
      <p className={classes.text}>{text}</p>
      {onClick && buttonText && <Button label={buttonText} onClick={onClick} />}
    </div>
  );
}
