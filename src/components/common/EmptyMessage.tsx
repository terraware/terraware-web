import React, { type JSX } from 'react';

import { Box, SxProps, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type RowAltItem = {
  title: string;
  text: string;
  linkText: string;
  onLinkClick: () => void;
  buttonText: string;
  onClick: () => void;
};

type RowItem = {
  title: string;
  text: string;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  altItem?: RowAltItem;
};

type EmptyMessageProps = {
  title: string;
  text?: string;
  buttonText?: string;
  onClick?: () => void;
  className?: string;
  rowItems?: RowItem[];
  sx?: SxProps;
};

export default function EmptyMessage(props: EmptyMessageProps): JSX.Element {
  const { title, text, buttonText, onClick, className, rowItems, sx } = props;
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const rowItemInfoStyles = {
    textAlign: 'left',
    marginBottom: isMobile ? theme.spacing(2) : 0,
  };

  const rowItemGroupStyles = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexGrow: 1,
    '& > button': {
      textAlign: 'center',
      width: '160px',
    },
  };

  return (
    <Box
      className={`${className ?? ''}`}
      sx={[
        {
          background: theme.palette.TwClrBg,
          padding: '24px',
          borderRadius: '24px',
          textAlign: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {title && <h3 style={{ fontSize: '20px' }}>{title}</h3>}
      {text && <p style={{ paddingBottom: '24px', fontSize: '16px' }}>{text}</p>}
      {rowItems !== undefined && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: theme.spacing(5),
          }}
        >
          {rowItems.map((rowItem, index) => (
            <Box
              key={index}
              sx={{
                borderTop: `1px solid ${theme.palette.TwClrBgTertiary}`,
                padding: `${theme.spacing(3)} 0`,
                margin: `0 ${theme.spacing(1)}`,
              }}
            >
              <Box sx={rowItemGroupStyles}>
                <Box sx={rowItemInfoStyles}>
                  <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxt} lineHeight='20px'>
                    {rowItem.title}
                  </Typography>
                  <Typography fontSize='14px' fontWeight={500} color={theme.palette.TwClrTxt} lineHeight='20px'>
                    {rowItem.text}
                  </Typography>
                </Box>
                <Button label={rowItem.buttonText} onClick={rowItem.onClick} disabled={rowItem.disabled} />
              </Box>
              {rowItem.altItem !== undefined ? (
                <>
                  <Typography sx={{ textAlign: 'left', margin: `${theme.spacing(2)} 0` }}>- {strings.OR} -</Typography>
                  <Box sx={rowItemGroupStyles}>
                    <Box sx={rowItemInfoStyles}>
                      <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxt} lineHeight='20px'>
                        {rowItem.altItem.title}
                      </Typography>
                      <Typography fontSize='14px' fontWeight={500} color={theme.palette.TwClrTxt} lineHeight='20px'>
                        {rowItem.altItem.text}
                      </Typography>
                      <Link onClick={rowItem.altItem.onLinkClick}>{rowItem.altItem.linkText}</Link>
                    </Box>
                    <Button
                      label={rowItem.altItem.buttonText}
                      onClick={rowItem.altItem.onClick}
                      priority='secondary'
                      disabled={rowItem.disabled}
                    />
                  </Box>
                </>
              ) : null}
            </Box>
          ))}
        </Box>
      )}
      {onClick && buttonText && <Button label={buttonText} onClick={onClick} />}
    </Box>
  );
}
