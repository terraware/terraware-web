import React, { ReactNode } from 'react';
import { ReactComponent as Logo } from './logo.svg';
import './styles.scss';
import Icon from '../icon/Icon';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { makeStyles } from '@mui/styles';

export interface Props {
  children: ReactNode;
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

const useStyles = makeStyles(() => ({
  icon: {
    fill: '#708284',
    width: '27px',
    height: '27px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  navBarTop: {
    height: '56px',
    display: 'flex',
    paddingLeft: '20px',
  },
}));

export default function Navbar(props: Props): JSX.Element {
  const { children, setShowNavBar, className } = props;
  const { isDesktop } = useDeviceInfo();
  const classes = useStyles();

  return (
    <div className={`navbar ${className}`}>
      {isDesktop ? (
        <div className='logo'>
          <Logo />
        </div>
      ) : (
        <div className={classes.navBarTop}>
          <button onClick={() => setShowNavBar(false)} className={classes.closeButton}>
            <Icon name='close' className={classes.icon} />
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
