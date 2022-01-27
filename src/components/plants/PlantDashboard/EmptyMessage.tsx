import { createStyles, makeStyles } from '@material-ui/core';
import Button from 'src/components/common/button/Button';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      border: '1px solid #A9B7B8',
      background: '#fff',
      padding: '24px',
      borderRadius: '8px',
      textAlign: 'center',
    },
  })
);

type EmptyMessageProps = {
  title: string;
  text?: string;
  buttonText?: string;
  onClick?: () => void;
};

export default function EmptyMessage(props: EmptyMessageProps): JSX.Element {
  const { title, text, buttonText, onClick } = props;
  const classes = useStyles();

  return (
    <div className={classes.mainContainer}>
      <h3>{title}</h3>
      <p>{text}</p>
      {onClick && buttonText && <Button label={buttonText} onClick={onClick} />}
    </div>
  );
}
