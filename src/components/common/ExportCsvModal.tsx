import { useState } from 'react';
import strings from 'src/strings';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { Grid } from '@mui/material';
import TextField from 'src/components/common/Textfield/Textfield';

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
      const csvContent = 'data:text/csv;charset=utf-8,' + apiResponse;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${name}.csv`);
      link.click();
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
        <Button label={strings.EXPORT} onClick={handleOk} key='button-2' id='downloadButton' />,
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
