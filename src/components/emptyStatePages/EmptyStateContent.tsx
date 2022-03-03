import React from 'react';
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import { IconName } from 'src/components/common/icon/icons';

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
  })
);

export type ListItemContent = {
  icon: IconName;
  title: string;
  description: string;
};

type EmptyStateContentProps = {
  title: string;
  subtitle: string;
  listItems: ListItemContent[];
  buttonText: string;
  onClickButton: () => void;
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
              <p className={classes.listItemDescription}>{item.description}</p>
            </div>
          );
        })}
      </div>
      <Button className={classes.button} label={buttonText} onClick={onClickButton} />
      {footnote && (
        <div className={classes.footNote}>
          {footnote.map((note) => {
            return <p className={classes.noSpacing}>{note}</p>;
          })}
        </div>
      )}
    </Container>
  );
}
