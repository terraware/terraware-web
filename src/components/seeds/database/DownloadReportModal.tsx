import React from 'react';
import { convertToSearchNodePayload, searchCsv, SeedSearchCriteria, SeedSearchSortOrder } from 'src/api/seeds/search';
import { ServerOrganization } from 'src/types/Organization';
import TextField from 'src/components/common/TextField';
import strings from 'src/strings';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { Grid } from '@mui/material';

interface DownloadReportModalProps {
  searchCriteria: SeedSearchCriteria;
  searchSortOrder: SeedSearchSortOrder;
  searchColumns: string[];
  organization: ServerOrganization;
  open: boolean;
  onClose: () => void;
}

export default function DownloadReportModal(props: DownloadReportModalProps): JSX.Element {
  const { searchCriteria, searchSortOrder, searchColumns, organization, open, onClose } = props;
  const [name, setName] = React.useState('');

  const handleCancel = () => {
    setName('');
    onClose();
  };

  const handleOk = async () => {
    const apiResponse = await searchCsv({
      prefix: 'facilities.accessions',
      fields: searchColumns.includes('active') ? [...searchColumns, 'id'] : [...searchColumns, 'active', 'id'],
      sortOrder: [searchSortOrder],
      search: convertToSearchNodePayload(searchCriteria, organization.id),
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
      title={strings.REPORT}
      size='medium'
      middleButtons={[
        <Button label={strings.CANCEL} priority='secondary' type='passive' onClick={handleCancel} key='button-1' />,
        <Button label={strings.DOWNLOAD} onClick={handleOk} key='button-2' />,
      ]}
      message={strings.DOWNLOAD_REPORT_DESCRIPTION}
    >
      <Grid container spacing={4} paddingTop='20px'>
        <Grid item xs={12}>
          <TextField
            id='reportName'
            value={name}
            onChange={(id, value) => {
              setName(value as string);
            }}
            label={strings.REPORT_NAME}
            aria-label='Report name'
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
