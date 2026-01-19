import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import Page from 'src/components/Page';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useUser } from 'src/providers';
import strings from 'src/strings';

import './index.css';

const DocumentsEmptyPage = (): JSX.Element => {
  const theme = useTheme();
  const { goToDocumentNew } = useNavigateTo();
  const { isAllowed } = useUser();

  const canAddDocument = useMemo(() => isAllowed('CREATE_DOCUMENTS'), [isAllowed]);

  return (
    <Page title={strings.DOCUMENTS}>
      <Box
        display='flex'
        flexDirection='column'
        flexGrow={1}
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '24px',
          margin: 'auto',
          marginTop: theme.spacing(2),
          padding: theme.spacing(6),
          height: 'auto',
          width: '800px',
          textAlign: 'center',
        }}
      >
        <Box sx={{ marginBottom: theme.spacing(2) }}>
          <Typography fontSize='20px' fontWeight={600}>
            {strings.DOCUMENTS_ADD_CARD_TITLE}
          </Typography>
        </Box>

        <Box sx={{ marginBottom: theme.spacing(2) }}>
          <Typography fontSize='16px' fontWeight={400}>
            {strings.DOCUMENTS_ADD_CARD_INSTRUCTIONS}
          </Typography>
        </Box>

        <Box sx={{ width: '200px', margin: `0 auto ${theme.spacing(3)} auto` }}>
          <Icon name='blobbyIconParchment' className={'blobby-icon-parchment'} />
        </Box>

        {canAddDocument && (
          <Box>
            <Button
              onClick={goToDocumentNew}
              icon={'plus'}
              type='productive'
              priority='primary'
              size='medium'
              label={strings.ADD_DOCUMENT}
            />
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default DocumentsEmptyPage;
