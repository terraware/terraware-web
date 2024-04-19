import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';

import Button from 'src/components/common/button/Button';
import stopPropagation from 'src/utils/stopPropagationEvent';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import Link from './Link';
import Icon from './icon/Icon';
import { IconName } from './icon/icons';

export type LinkStyle = 'plain' | 'button';

export interface PageCardProps {
  name: string;
  isNameBold?: boolean;
  icon: IconName;
  description: string;
  linkText: string;
  link: string;
  linkStyle: LinkStyle;
  id?: string;
}

export default function PageCard(props: PageCardProps): JSX.Element {
  const { name, icon, description, id, linkText, link, linkStyle } = props;
  const theme = useTheme();
  const navigate = useNavigate();
  const { isMobile } = useDeviceInfo();

  const stopBubblingEvent = (event?: React.MouseEvent) => {
    if (event) {
      stopPropagation(event);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const goToPage = (event?: React.MouseEvent) => {
    if (linkStyle === 'button') {
      return;
    }
    navigate({ pathname: link });
  };

  return (
    <Box
      className={isMobile ? '' : 'min-height'}
      onClick={goToPage}
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
      {linkStyle === 'button' && (
        <Button
          priority='secondary'
          label={linkText}
          onClick={() => window.open(link, '_blank')}
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            marginLeft: 'auto',
            marginTop: '14px',
            maxWidth: 'fit-content',
          }}
        />
      )}
    </Box>
  );
}
