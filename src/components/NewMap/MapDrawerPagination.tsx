import React, { type JSX, useCallback, useMemo } from 'react';

import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, IconButton, Pagination, Typography, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';

import { MapDrawerSize } from './MapDrawer';

type MapDrawerPaginationProps = {
  drawerSize: MapDrawerSize;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
};

const MapDrawerPagination = ({ drawerSize, page, setPage, totalPages }: MapDrawerPaginationProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, nextPage: number) => {
      setPage(nextPage);
    },
    [setPage]
  );

  const setPageCallback = useCallback(
    (nextPage: number) => () => {
      setPage(nextPage);
    },
    [setPage]
  );

  const paginationComponent = useMemo(() => {
    if (drawerSize === 'small') {
      return (
        <Box>
          <IconButton disabled={page <= 1} size='small' onClick={setPageCallback(1)}>
            <FirstPageIcon />
          </IconButton>
          <IconButton disabled={page <= 1} size='small' onClick={setPageCallback(page - 1)}>
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton disabled={page >= totalPages} size='small' onClick={setPageCallback(page + 1)}>
            <NavigateNextIcon />
          </IconButton>
          <IconButton disabled={page >= totalPages} size='small' onClick={setPageCallback(totalPages)}>
            <LastPageIcon />
          </IconButton>
        </Box>
      );
    } else {
      return (
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          size={'small'}
          sx={{
            '.MuiButtonBase-root.MuiPaginationItem-root.Mui-selected': {
              backgroundColor: theme.palette.TwClrBgGhostActive,
              borderRadius: '4px',
            },
          }}
        />
      );
    }
  }, [drawerSize, handlePageChange, page, theme, setPageCallback, totalPages]);

  return (
    <Box
      display='flex'
      justifyContent='start'
      alignItems='center'
      flex={1}
      flexDirection={'row'}
      padding={theme.spacing(1)}
    >
      <Box width='fit-content'>
        <Typography fontSize={'14px'} paddingRight={'8px'} noWrap>
          {strings.formatString(strings.PAGINATION_FOOTER, page, totalPages)}
        </Typography>
      </Box>
      {paginationComponent}
    </Box>
  );
};

export default MapDrawerPagination;
