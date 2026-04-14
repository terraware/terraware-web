import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

type CreateVirtualWalkthroughStep2ModalProps = {
  file: File;
  onClose: () => void;
  onUpload: () => void;
};

const CreateVirtualWalkthroughStep2Modal = ({
  file,
  onClose,
  onUpload,
}: CreateVirtualWalkthroughStep2ModalProps): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { plantingSites } = useOrganizationPlantingSites();
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number | undefined>();

  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  const plantingSiteOptions = useMemo(
    (): DropdownItem[] => [
      { label: strings.NONE, value: -1 },
      ...(plantingSites ?? [])
        .toSorted((a, b) => a.name.localeCompare(b.name, activeLocale ?? undefined))
        .map((site) => ({ label: site.name, value: site.id })),
    ],
    [activeLocale, plantingSites]
  );

  const handleUpload = useCallback(() => {
    onUpload();
  }, [onUpload]);

  return (
    <DialogBox
      onClose={onClose}
      open
      title={strings.CREATE_VIRTUAL_WALKTHROUGH}
      size='large'
      middleButtons={[
        <Button key='cancel' label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} />,
        <Button
          key='upload'
          label={strings.UPLOAD}
          onClick={handleUpload}
          disabled={selectedPlantingSiteId === undefined}
        />,
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
        <Typography sx={{ color: theme.palette.TwClrTxt, fontSize: '16px' }}>
          {strings.CREATE_VIRTUAL_WALKTHROUGH_STEP2_DESCRIPTION}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <video
            src={previewUrl}
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '320px' }}>
            <Dropdown
              onChange={(value) => setSelectedPlantingSiteId(Number(value))}
              options={plantingSiteOptions}
              placeholder={strings.SELECT}
              selectedValue={selectedPlantingSiteId}
              label={strings.PLANTING_SITE}
              required
            />
            <Typography sx={{ fontSize: '14px', marginTop: 1 }}>{strings.SELECT_PLANTING_SITE_FOR_3D_MODEL}</Typography>
          </Box>
        </Box>
      </Box>
    </DialogBox>
  );
};

export default CreateVirtualWalkthroughStep2Modal;
