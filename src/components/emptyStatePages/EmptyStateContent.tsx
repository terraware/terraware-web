import React from 'react';
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import { IconName } from 'src/components/common/icon/icons';
import { Link } from '@material-ui/core';

type EmptyStateStyleProps = {
  titleFontSize: string;
  titleLineHeight: string;
  subtitleFontSize: string;
  subtitleLineHeight: string;
  listContainerVerticalMargin: string;
};

const useStyles = makeStyles((theme) =>
  createStyles({
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
      flexWrap: 'wrap',
      fontSize: '14px',
      justifyContent: 'center',
      lineHeight: '20px',
      margin: `${props.listContainerVerticalMargin} auto`,
    }),
    listItem: {
      flex: '1 1 auto',
      margin: '0 25px',
      maxWidth: '200px',
      textAlign: 'center',
    },
    listItemIcon: {
      width: '200px',
      height: '128px',
      marginBottom: theme.spacing(2),
    },
    listItemTitle: {
      fontWeight: 'bold',
      lineHeight: '20px',
      margin: '0 auto',
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
    itemLink: {
      fontSize: '12px',
      cursor: 'pointer',
    },
  })
);

export type ListItemContent = {
  icon: IconName;
  title: string;
  description?: string;
  buttonText?: string;
  onClickButton?: () => void;
  linkText?: string;
  onLinkClick?: () => void;
};

type EmptyStateContentProps = {
  title: string;
  subtitle: string;
  listItems: ListItemContent[];
  buttonText?: string;
  onClickButton?: () => void;
  footnote?: string[];
  styles: EmptyStateStyleProps;
};

export default function EmptyStateContent(props: EmptyStateContentProps): JSX.Element {
  const { title, subtitle, listItems, buttonText, onClickButton, footnote, styles } = props;
  const classes = useStyles(styles);

  return (
    <Container className={classes.container}>
      <h1 className={classes.title}>{title}</h1>
      <p className={classes.subtitle}>{subtitle}</p>
      <div className={classes.listContainer}>
        {listItems.map((item) => {
          return (
            <div key={item.title} className={classes.listItem}>
              <Icon name={item.icon} className={classes.listItemIcon} />
              <p className={classes.listItemTitle}>{item.title}</p>
              <div>
                <p className={item.buttonText ? classes.listItemDescriptionWithButton : classes.listItemDescription}>
                  {item.description}
                </p>
                {item.linkText && item.onLinkClick && (
                  <Link onClick={item.onLinkClick} className={classes.itemLink}>
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
                />
              )}
            </div>
          );
        })}
      </div>
      {buttonText && onClickButton && (
        <Button size='medium' className={classes.button} label={buttonText} onClick={onClickButton} />
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
