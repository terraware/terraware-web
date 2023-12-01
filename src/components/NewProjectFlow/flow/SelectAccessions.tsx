import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { FormButton, Message, TableColumnType } from '@terraware/web-components';
import PageForm from 'src/components/common/PageForm';
import strings from 'src/strings';
import Table from 'src/components/common/table';
import { CreateProjectRequest } from 'src/types/Project';
import { SeedBankService } from 'src/services';
import { SearchResponseElement } from 'src/types/Search';
import { isString } from 'src/types/utils';
import { AccessionState } from 'src/types/Accession';
import { FlowStates } from '../index';

type SelectAccessionsProps = {
  project: CreateProjectRequest;
  organizationId: number;
  flowState: FlowStates;
  onNext: () => void;
  onCancel: () => void;
  saveText: string;
  pageFormRightButtons: FormButton[];
  setProjectAccessions: (accessions: SearchResponseAccession[]) => void;
  setHasAccessions: (value: boolean) => void;
};

const columns = (): TableColumnType[] => [
  {
    key: 'accessionNumber',
    name: strings.ACCESSION,
    type: 'string',
  },
  {
    key: 'speciesName',
    name: strings.SPECIES,
    type: 'string',
  },
  {
    key: 'project_name',
    name: strings.PROJECT,
    type: 'string',
  },
  {
    key: 'state',
    name: strings.STATUS,
    type: 'string',
  },
  { key: 'collectedDate', name: strings.COLLECTION_DATE, type: 'string' },
  { key: 'collectionSiteName', name: strings.COLLECTION_SITE, type: 'string' },
];

const FIELDS_REQUIRED_SEARCH_ACCESSIONS: (keyof SearchResponseAccession)[] = [
  'accessionNumber',
  'speciesName',
  'collectedDate',
  'receivedDate',
  'state',
  'id',
];

const FIELDS_OPTIONAL_SEARCH_ACCESSIONS: (keyof SearchResponseAccession)[] = ['collectionSiteName', 'project_name'];

export interface SearchResponseAccession extends SearchResponseElement {
  accessionNumber: string;
  speciesName: string;
  collectedDate: string;
  receivedDate: string;
  state: AccessionState;
  id: string;
  collectionSiteName?: string;
  project_name?: string;
}

const isSearchResponseAccession = (element: unknown): element is SearchResponseAccession =>
  FIELDS_REQUIRED_SEARCH_ACCESSIONS.every((field) => isString((element as SearchResponseAccession)[field]));

export default function SelectAccessions(props: SelectAccessionsProps): JSX.Element | null {
  const {
    project,
    organizationId,
    flowState,
    onNext,
    onCancel,
    saveText,
    pageFormRightButtons,
    setProjectAccessions,
    setHasAccessions,
  } = props;

  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const [accessions, setAccessions] = useState<SearchResponseAccession[]>([]);
  const [selectedRows, setSelectedRows] = useState<SearchResponseAccession[]>([]);
  const [showAssignmentWarning, setShowAssignmentWarning] = useState<boolean>(false);

  useEffect(() => {
    const populate = async () => {
      const searchResponse = await SeedBankService.searchAccessions({
        organizationId,
        fields: [...FIELDS_REQUIRED_SEARCH_ACCESSIONS, ...FIELDS_OPTIONAL_SEARCH_ACCESSIONS] as string[],
      });

      if (searchResponse && searchResponse.length > 0) {
        setAccessions(searchResponse.filter(isSearchResponseAccession));
        if (searchResponse.find((element) => !!element.project_name)) {
          setShowAssignmentWarning(true);
        }
      } else {
        setHasAccessions(false);
      }
    };

    void populate();
  }, [setHasAccessions, organizationId]);

  useEffect(() => {
    setProjectAccessions(selectedRows);
  }, [setProjectAccessions, selectedRows]);

  useEffect(() => {
    if (flowState === 'accessions' && accessions.length === 0) {
      onNext();
    }
  }, [accessions, flowState, onNext]);

  if (flowState !== 'accessions') {
    return null;
  }

  return (
    <>
      {showAssignmentWarning && (
        <Box sx={{ marginTop: 5, marginBottom: 1 }}>
          <Message
            type='page'
            title={strings.EXISTING_PROJECT_ACCESSIONS_TITLE}
            priority={'info'}
            body={strings.EXISTING_PROJECT_ACCESSIONS_BODY.replace('{projectName}', project.name)}
          />
        </Box>
      )}

      <PageForm
        cancelID='cancelSelectAccessions'
        saveID='saveSelectAccessions'
        onCancel={onCancel}
        onSave={onNext}
        saveButtonText={saveText}
        additionalRightButtons={pageFormRightButtons}
      >
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            paddingBottom: isMobile ? '185px' : '105px',
            minWidth: 'fit-content',
          }}
        >
          <Grid
            container
            minWidth={isMobile ? 0 : 700}
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              borderRadius: theme.spacing(4),
              padding: theme.spacing(3),
              marginTop: theme.spacing(4),
            }}
          >
            <Grid item xs={12}>
              <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>
                {strings.formatString(strings.SELECT_ACCESSIONS_FOR_PROJECT, project.name)}
              </Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 400 }}>
                {strings.formatString(strings.SELECT_ACCESSIONS_FOR_PROJECT_DESCRIPTION, project.name)}
              </Typography>
            </Grid>
            <Table
              columns={columns}
              rows={accessions}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              id={'selectAccessionsTable'}
              orderBy={'accessionNumber'}
              showCheckbox={true}
            />
          </Grid>
        </Container>
      </PageForm>
    </>
  );
}
