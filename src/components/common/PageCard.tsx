import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Button from 'src/components/common/button/Button';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import stopPropagation from 'src/utils/stopPropagationEvent';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import Link from './Link';
import Icon from './icon/Icon';
import { IconName } from './icon/icons';

export type LinkStyle = 'plain' | 'button-primary' | 'button-secondary';

export interface PageCardProps {
  cardIsClickable?: boolean;
  description: string | (string | JSX.Element)[];
  icon: IconName;
  id?: string;
  isNameBold?: boolean;
  link: string;
  linkStyle: LinkStyle;
  linkText: string;
  name: string;
  onClick?: () => void;
}

const stopBubblingEvent = (event?: React.MouseEvent) => {
  if (event) {
    stopPropagation(event);
  }
};

export default function PageCard(props: PageCardProps): JSX.Element {
  const { cardIsClickable = true, description, icon, id, link, linkStyle, linkText, name, onClick } = props;
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();

  const goToPage = () => {
    navigate({ pathname: link });
  };

  const handleOnClick = () => {
    if (onClick) {
      onClick();
    } else {
      goToPage();
    }
  };

  return (
    <Box
      className={isMobile ? '' : 'min-height'}
      onClick={cardIsClickable ? handleOnClick : undefined}
      id={id ?? ''}
      sx={{
        background: theme.palette.TwClrBg,
        borderRadius: '24px',
        cursor: linkStyle === 'plain' ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px',
        '&.min-height': {
          minHeight: '220px',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          paddingBottom: '16px',
          alignItems: 'center',
        }}
      >
        <Icon
          name={icon}
          size='medium'
          style={{
            fill: theme.palette.TwClrIcnSecondary,
          }}
        />
        <Typography component='p' sx={{ fontSize: '20px', lineHeight: '28px', paddingLeft: '10px', fontWeight: 600 }}>
          {name}
        </Typography>
      </Box>
      <Typography
        component='p'
        variant='h6'
        sx={{
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          height: '100%',
          color: theme.palette.TwClrTxt,
        }}
      >
        {description}
      </Typography>
      {linkStyle === 'plain' && (
        <Box onClick={stopBubblingEvent} marginTop='28px'>
          <Link
            to={link}
            style={{
              display: 'block',
              fontSize: '16px',
            }}
          >
            {linkText}
          </Link>
        </Box>
      )}
      {(linkStyle === 'button-primary' || linkStyle === 'button-secondary') && (
        <Button
          priority={linkStyle === 'button-primary' ? 'primary' : 'secondary'}
          label={linkText}
          onClick={handleOnClick}
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            marginTop: '14px',
            maxWidth: 'fit-content',
          }}
        />
      )}
    </Box>
  );
}
