import React from 'react';

import { Container, Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import Link from 'src/components/common/Link';
import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import { IconName } from 'src/components/common/icon/icons';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type EmptyStateStyleProps = {
  titleFontSize: string;
  titleLineHeight: string;
  subtitleFontSize: string;
  subtitleLineHeight: string;
  listContainerVerticalMargin: string;
  isMobile?: boolean;
};

const DEFAULT_EMPTY_STATE_CONTENT_STYLES = {
  titleFontSize: '20px',
  titleLineHeight: '28px',
  subtitleFontSize: '16px',
  subtitleLineHeight: '24px',
  listContainerVerticalMargin: '24px',
};

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    fontWeight: 400,
    maxWidth: '1500px',
    textAlign: 'center',
  },
  title: (props: EmptyStateStyleProps) => ({
    fontSize: props.titleFontSize,
    fontWeight: 600,
    lineHeight: props.titleLineHeight,
    margin: theme.spacing(3, 0, 2, 0),
  }),
  subtitle: (props: EmptyStateStyleProps) => ({
    fontSize: props.subtitleFontSize,
    lineHeight: props.subtitleLineHeight,
    margin: '0 auto',
    marginBottom: theme.spacing(3),
    maxWidth: '700px',
  }),
  listContainer: (props: EmptyStateStyleProps) => ({
    display: 'flex',
    flexDirection: props.isMobile ? 'column' : 'row',
    alignContent: 'center',
    flexWrap: 'wrap',
    fontSize: '14px',
    justifyContent: 'center',
    lineHeight: '20px',
    margin: `${props.listContainerVerticalMargin} auto`,
  }),
  listItem: {
    flex: '1 1 auto',
    maxWidth: '220px',
    textAlign: 'center',
    margin: (props: EmptyStateStyleProps) => (props.isMobile ? theme.spacing(4, 3, 0, 3) : theme.spacing(0, 3)),
    '&:first-child': {
      marginTop: 0,
    },
    padding: (props: EmptyStateStyleProps) => (props.isMobile ? '20px 0' : '0 5px'),
  },
  listItemIcon: {
    width: '205px',
    height: '128px',
  },
  listItemTitle: {
    fontWeight: 'bold',
    lineHeight: '20px',
    margin: '0 auto',
    marginTop: theme.spacing(2),
  },
  listItemDescription: {
    margin: '0 auto',
  },
  listItemDescriptionWithButton: {
    margin: '0 auto',
    fontSize: '12px',
  },
  button: {
    marginBottom: theme.spacing(3),
  },
  footNote: {
    fontSize: '12px',
    lineHeight: '16px',
    margin: '0 auto',
    maxWidth: '550px',
    marginBottom: '24px',
  },
  noSpacing: {
    margin: 0,
  },
  subButton: {
    marginTop: theme.spacing(2),
  },
}));

export type ListItemContent = {
  icon: IconName;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonIcon?: IconName;
  onClickButton?: () => void;
  linkText?: string;
  onLinkClick?: () => void;
};

type EmptyStateContentProps = {
  title: string;
  subtitle: string | string[];
  listItems?: ListItemContent[];
  buttonText?: string;
  buttonIcon?: IconName;
  onClickButton?: () => void;
  footnote?: string[];
  styles?: EmptyStateStyleProps;
};

export default function EmptyStateContent(props: EmptyStateContentProps): JSX.Element {
  const { title, subtitle, listItems, buttonText, buttonIcon, onClickButton, footnote, styles } = props;
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ ...(styles || DEFAULT_EMPTY_STATE_CONTENT_STYLES), isMobile });

  const subtitleParagraphs: string[] = typeof subtitle === 'string' ? [subtitle] : subtitle;

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <Container className={classes.container}>
      <h1 className={classes.title}>{title}</h1>
      {subtitleParagraphs.map((para, index) => (
        <p className={classes.subtitle} key={index}>
          {para}
        </p>
      ))}
      <div className={classes.listContainer}>
        {listItems?.map((item, index) => {
          return (
            <Grid item xs={gridSize()} key={`${item.title}-${index}`} className={`${classes.listItem}`}>
              <Icon name={item.icon} className={classes.listItemIcon} />
              {item.title && <p className={classes.listItemTitle}>{item.title}</p>}
              <div>
                <p className={item.buttonText ? classes.listItemDescriptionWithButton : classes.listItemDescription}>
                  {item.description}
                </p>
                {item.linkText && item.onLinkClick && (
                  <Link onClick={item.onLinkClick} fontSize='12px'>
                    {item.linkText}
                  </Link>
                )}
              </div>
              {item.buttonText && item.onClickButton && (
                <Button
                  size='medium'
                  className={classes.subButton}
                  label={item.buttonText}
                  onClick={item.onClickButton}
                  icon={item.buttonIcon}
                />
              )}
            </Grid>
          );
        })}
      </div>
      {buttonText && onClickButton && (
        <Button size='medium' icon={buttonIcon} className={classes.button} label={buttonText} onClick={onClickButton} />
      )}
      {footnote && (
        <div className={classes.footNote}>
          {footnote.map((note, index) => {
            return (
              <p className={classes.noSpacing} key={`note-${index}`}>
                {note}
              </p>
            );
          })}
        </div>
      )}
    </Container>
  );
}
