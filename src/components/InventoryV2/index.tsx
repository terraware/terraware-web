import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import ImportInventoryModal from './ImportInventoryModal';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { Button, DropdownItem } from '@terraware/web-components';
import OptionsMenu from 'src/components/common/OptionsMenu';

type InventoryProps = {
  hasNurseries: boolean;
  hasSpecies: boolean;
};
export default function Inventory(props: InventoryProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const history = useHistory();
  const { hasNurseries, hasSpecies } = props;
  const [importInventoryModalOpen, setImportInventoryModalOpen] = useState(false);
  const contentRef = useRef(null);

  const goTo = (appPath: string) => {
    const appPathLocation = {
      pathname: appPath,
    };
    history.push(appPathLocation);
  };

  const isOnboarded = hasNurseries && hasSpecies;
  const shouldShowTable = isOnboarded;
  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'import') {
      setImportInventoryModalOpen(true);
    }
    if (optionItem.value === 'export') {
      // TODO: Export current view
    }
  };

  return (
    <TfMain backgroundImageVisible={!isOnboarded}>
      <ImportInventoryModal
        open={importInventoryModalOpen}
        onClose={() => setImportInventoryModalOpen(false)}
      />
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ paddingBottom: theme.spacing(4), paddingLeft: theme.spacing(3) }}>
          <Grid container>
            <Grid item xs={6}>
              <Typography fontSize='24px' fontWeight={600}>
                {strings.INVENTORY}
              </Typography>
            </Grid>
            {isOnboarded ? (
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                {isMobile ? (
                  <Button id='new-inventory' icon='plus' onClick={() => goTo(APP_PATHS.INVENTORY_NEW)} size='medium' />
                ) : (
                  <>
                    <Box sx={{ display: 'inline', paddingLeft: 1 }}>
                      <Button
                        id='new-inventory'
                        icon='plus'
                        label={strings.ADD_INVENTORY}
                        onClick={() => goTo(APP_PATHS.INVENTORY_NEW)}
                        size='medium'
                      />
                    </Box>
                    <OptionsMenu
                      onOptionItemClick={onOptionItemClick}
                      optionItems={[
                        { label: strings.IMPORT, value: 'import' },
                        { label: strings.EXPORT, value: 'export' }
                      ]}
                    />
                  </>
                )}
              </Grid>
            ) : null}
          </Grid>
        </Box>
      </PageHeaderWrapper>
      <PageSnackbar />
      <Box
        ref={contentRef}
        sx={{
          backgroundColor: shouldShowTable ? theme.palette.TwClrBg : undefined,
          borderRadius: '32px',
          padding: theme.spacing(3),
          minWidth: 'fit-content',
        }}
      >
        TODO: Add new Inventory Lists
      </Box>
    </TfMain>
  );
}
