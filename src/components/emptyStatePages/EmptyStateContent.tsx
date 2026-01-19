import React, { type JSX } from 'react';

import { Box, Container, Grid, useTheme } from '@mui/material';

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
  const theme = useTheme();

  const emptyStateStyles = styles || DEFAULT_EMPTY_STATE_CONTENT_STYLES;

  const subtitleParagraphs: string[] = typeof subtitle === 'string' ? [subtitle] : subtitle;

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <Container
      sx={{
        fontWeight: 400,
        maxWidth: '1500px',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: emptyStateStyles.titleFontSize,
          fontWeight: 600,
          lineHeight: emptyStateStyles.titleLineHeight,
          margin: theme.spacing(3, 0, 2, 0),
        }}
      >
        {title}
      </h1>
      {subtitleParagraphs.map((para, index) => (
        <p
          key={index}
          style={{
            fontSize: emptyStateStyles.subtitleFontSize,
            lineHeight: emptyStateStyles.subtitleLineHeight,
            margin: '0 auto',
            marginBottom: theme.spacing(3),
            maxWidth: '700px',
          }}
        >
          {para}
        </p>
      ))}
      {listItems && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignContent: 'center',
            flexWrap: 'wrap',
            fontSize: '14px',
            justifyContent: 'center',
            lineHeight: '20px',
            margin: `${DEFAULT_EMPTY_STATE_CONTENT_STYLES.listContainerVerticalMargin} auto`,
          }}
        >
          {listItems.map((item, index) => {
            return (
              <Grid
                item
                xs={gridSize()}
                key={`${item.title}-${index}`}
                sx={{
                  flex: '1 1 auto',
                  maxWidth: '220px',
                  textAlign: 'center',
                  margin: isMobile ? theme.spacing(4, 3, 0, 3) : theme.spacing(0, 3),
                  '&:first-child': {
                    marginTop: 0,
                  },
                  padding: isMobile ? '20px 0' : '0 5px',
                }}
              >
                <Icon
                  name={item.icon}
                  style={{
                    width: '205px',
                    height: '128px',
                  }}
                />
                {item.title && (
                  <p
                    style={{
                      fontWeight: 'bold',
                      lineHeight: '20px',
                      margin: '0 auto',
                      marginTop: theme.spacing(2),
                    }}
                  >
                    {item.title}
                  </p>
                )}
                <div>
                  <p
                    style={
                      item.buttonText
                        ? {
                            margin: '0 auto',
                            fontSize: '12px',
                          }
                        : { margin: '0 auto' }
                    }
                  >
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
                    label={item.buttonText}
                    onClick={item.onClickButton}
                    icon={item.buttonIcon}
                    sx={{ marginTop: theme.spacing(2) }}
                  />
                )}
              </Grid>
            );
          })}
        </Box>
      )}
      {buttonText && onClickButton && (
        <Button
          size='medium'
          icon={buttonIcon}
          label={buttonText}
          onClick={onClickButton}
          sx={{ marginBottom: theme.spacing(3) }}
        />
      )}
      {footnote && (
        <Box
          sx={{
            fontSize: '12px',
            lineHeight: '16px',
            margin: '0 auto',
            marginTop: '24px',
            marginBottom: '24px',
          }}
        >
          {footnote.map((note, index) => {
            return (
              <p key={`note-${index}`} style={{ margin: 0 }}>
                {note}
              </p>
            );
          })}
        </Box>
      )}
    </Container>
  );
}
