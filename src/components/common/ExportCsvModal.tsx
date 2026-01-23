import React, { type JSX, useState } from 'react';

import { Grid } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { downloadCsv } from 'src/utils/csv';

interface ExportCsvModalProps {
  open: boolean;
  onExport: () => Promise<any>;
  onClose: () => void;
}

export default function ExportCsvModal(props: ExportCsvModalProps): JSX.Element {
  const { open, onExport, onClose } = props;
  const [name, setName] = useState('');

  const handleCancel = () => {
    setName('');
    onClose();
  };

  const handleOk = async () => {
    const apiResponse = await onExport();

    if (apiResponse !== null) {
      downloadCsv(name, apiResponse);
    }

    onClose();
  };

  return (
    <DialogBox
      onClose={handleCancel}
      open={open}
      title={strings.EXPORT_RECORDS}
      size='medium'
      middleButtons={[
        <Button
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={handleCancel}
          key='button-1'
          id='cancelDownloadReport'
        />,
        <Button label={strings.EXPORT} onClick={() => void handleOk()} key='button-2' id='downloadButton' />,
      ]}
      message={strings.DOWNLOAD_REPORT_DESCRIPTION}
    >
      <Grid container spacing={4} paddingTop='20px'>
        <Grid item xs={12} textAlign='left'>
          <TextField
            type='text'
            id='reportName'
            value={name}
            onChange={(value) => {
              setName(value as string);
            }}
            label={strings.REPORT_NAME}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
