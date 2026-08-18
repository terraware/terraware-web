import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { IconName } from '@terraware/web-components/components/Icon/icons';

export type SegmentOption<T extends string> = {
  id: T;
  label: string;
  icon?: IconName;
  disabled?: boolean;
};

type SegmentControlProps<T extends string> = {
  segments: SegmentOption<T>[];
  selected: T;
  onChange: (id: T) => void;
  minSegmentWidth?: number;
};

/**
 * A pill-style segmented control for switching between a small set of views. Each segment shows a centered optional
 * icon and label; the selected segment is raised with a light background and shadow.
 */
const SegmentControl = <T extends string>({
  segments,
  selected,
  onChange,
  minSegmentWidth = 150,
}: SegmentControlProps<T>): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      role='tablist'
      sx={{
        backgroundColor: theme.palette.TwClrBgSecondary,
        borderRadius: theme.spacing(1),
        display: 'inline-flex',
        gap: theme.spacing(0.5),
        padding: theme.spacing(0.5),
      }}
    >
      {segments.map((segment) => {
        const isSelected = segment.id === selected;
        return (
          <Box
            key={segment.id}
            role='tab'
            aria-selected={isSelected}
            aria-disabled={segment.disabled}
            tabIndex={segment.disabled ? -1 : 0}
            onClick={() => {
              if (!segment.disabled) {
                onChange(segment.id);
              }
            }}
            onKeyDown={(event) => {
              if (!segment.disabled && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                onChange(segment.id);
              }
            }}
            sx={{
              alignItems: 'center',
              backgroundColor: isSelected ? theme.palette.TwClrBg : 'transparent',
              borderRadius: theme.spacing(0.75),
              boxShadow: isSelected ? '0 2px 4px 0 rgba(58, 68, 69, 0.20)' : 'none',
              cursor: segment.disabled ? 'default' : 'pointer',
              display: 'flex',
              gap: theme.spacing(1),
              justifyContent: 'center',
              minWidth: `${minSegmentWidth}px`,
              opacity: segment.disabled ? 0.5 : 1,
              padding: theme.spacing(0.5, 2),
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.TwClrBrdrBrand}`,
                outlineOffset: '-2px',
              },
            }}
          >
            {segment.icon && (
              <Icon
                name={segment.icon}
                size='medium'
                fillColor={isSelected ? theme.palette.TwClrIcnBrand : theme.palette.TwClrIcnSecondary}
              />
            )}
            <Typography fontSize='16px' fontWeight={400} color={theme.palette.TwClrTxt} whiteSpace='nowrap'>
              {segment.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default SegmentControl;
