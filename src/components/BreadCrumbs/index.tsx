import React, { type JSX, MouseEvent, SyntheticEvent } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import BackToLink from 'src/components/common/BackToLink';
import Link from 'src/components/common/Link';

export type Crumb = {
  name: string; // name of crumb
  to?: string; // link to url/path
  onClick?: (e?: MouseEvent | SyntheticEvent) => void;
};

export type BreadCrumbsProps = {
  hierarchical?: boolean; // if true, the 'to' paths are hierarchical and concantenated, default is false (each 'to' is a fully qualified path)
  crumbs: Crumb[];
};

export default function BreadCrumbs({ hierarchical, crumbs }: BreadCrumbsProps): JSX.Element {
  const theme = useTheme();
  const breadCrumbs: Crumb[] =
    hierarchical !== true
      ? crumbs
      : // construct the absolute paths using concatenation of previous paths
        crumbs.reduce((acc, curr) => {
          const crumb = {
            name: curr.name,
            to: [...acc.map((_, i) => crumbs[i].to), curr.to].join(''),
          };
          return [...acc, crumb];
        }, [] as Crumb[]);

  return (
    <Box display='inline-flex' alignItems='center' flexWrap='wrap'>
      {breadCrumbs.map((crumb: Crumb, index: number) => (
        <Box key={index} display='inline-flex' alignItems='center'>
          {index === 0 ? (
            <BackToLink id={`crumb_${index}`} to={crumb.to} onClick={crumb.onClick} name={crumb.name} />
          ) : (
            <Link id={`crumb_${index}`} to={crumb.to} onClick={crumb.onClick}>
              {crumb.name}
            </Link>
          )}
          {index + 1 !== breadCrumbs.length && (
            <Typography fontSize='16px' fontWeight={500} lineHeight='24px' color={theme.palette.TwClrTxtTertiary}>
              &nbsp;/&nbsp;
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}
