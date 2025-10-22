import React, { useCallback } from 'react';

import { Box, Pagination, Typography, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';

type MapDrawerPaginationProps = {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
};

const MapDrawerPagination = ({ page, setPage, totalPages }: MapDrawerPaginationProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, nextPage: number) => {
      setPage(nextPage);
    },
    [setPage]
  );

  return (
    <Box display='flex' justifyContent='start' alignItems='center' flex={1} padding={theme.spacing(1)}>
      <Typography fontSize={'14px'} paddingRight={'8px'}>
        {strings.formatString(strings.PAGINATION_FOOTER, page, totalPages)}
      </Typography>
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        sx={{
          '.MuiButtonBase-root.MuiPaginationItem-root.Mui-selected': {
            backgroundColor: theme.palette.TwClrBgGhostActive,
            borderRadius: '4px',
          },
        }}
      />
    </Box>
  );
};

export default MapDrawerPagination;
