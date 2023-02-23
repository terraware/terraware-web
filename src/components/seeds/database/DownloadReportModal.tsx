import React from 'react';
import { SearchCriteria, SearchSortOrder } from 'src/types/Search';
import { SearchService } from 'src/services';
import strings from 'src/strings';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { Grid } from '@mui/material';
import TextField from 'src/components/common/Textfield/Textfield';
import { useOrganization } from 'src/providers/hooks';

interface DownloadReportModalProps {
  searchCriteria: SearchCriteria;
  searchSortOrder: SearchSortOrder;
  searchColumns: string[];
  open: boolean;
  onClose: () => void;
}

export default function DownloadReportModal(props: DownloadReportModalProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { searchCriteria, searchSortOrder, searchColumns, open, onClose } = props;
  const [name, setName] = React.useState('');

  const handleCancel = () => {
    setName('');
    onClose();
  };

  const handleOk = async () => {
    const apiResponse = await SearchService.searchCsv({
      prefix: 'facilities.accessions',
      fields: searchColumns.includes('active') ? [...searchColumns] : [...searchColumns, 'active'],
      sortOrder: [searchSortOrder],
      search: SearchService.convertToSearchNodePayload(searchCriteria, selectedOrganization.id),
      count: 1000,
    });

    // TODO: show user error message if API call failed.
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
