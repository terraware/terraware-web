import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import PageForm from 'src/components/common/PageForm';
import { useDeviceInfo } from '@terraware/web-components/utils';
import strings from 'src/strings';
import { NurseryWithdrawalRequest, NurseryWithdrawalPurposes } from 'src/types/Batch';
import { ErrorBox, TableColumnType } from '@terraware/web-components';
import WithdrawalBatchesCellRenderer from './WithdrawalBatchesCellRenderer';
import useForm from 'src/utils/useForm';
import { makeStyles } from '@mui/styles';
import { useOrganization } from 'src/providers';
import Table from 'src/components/common/table';
import isEnabled from 'src/features';

type SelectBatchesWithdrawnQuantityProps = {
  onNext: (withdrawal: NurseryWithdrawalRequest) => void;
  onCancel: () => void;
  saveText: string;
  batches: any[];
  nurseryWithdrawal: NurseryWithdrawalRequest;
  filterProjectId?: number;
};

type BatchWithdrawalForTable = {
  batchId: number;
  batchNumber: string;
  notReadyQuantityWithdrawn: number;
  germinatingQuantityWithdrawn: number;
  readyQuantityWithdrawn: number;
  germinatingQuantity: number;
  notReadyQuantity: number;
  readyQuantity: number;
  'germinatingQuantity(raw)': number;
  'notReadyQuantity(raw)': number;
  'readyQuantity(raw)': number;
  totalQuantity: number;
  speciesId: number;
  facilityName: string;
  projectId: number;
  projectName: string;
  error: { [key: string]: string | undefined };
};

const useStyles = makeStyles(() => ({
  error: {
    '& .error-box--container': {
      alignItems: 'center',
    },
  },
}));

const defaultTableColumns = (): TableColumnType[] => [
  {
    key: 'batchNumber',
    name: strings.SEEDLING_BATCH,
    type: 'string',
  },
  {
    key: 'facilityName',
    name: strings.NURSERY,
    type: 'string',
  },
  {
    key: 'projectName',
    name: strings.PROJECT,
    type: 'string',
  },
  {
    key: 'germinatingQuantityWithdrawn',
    name: strings.GERMINATING_QUANTITY,
    type: 'string',
  },
  {
    key: 'notReadyQuantityWithdrawn',
    name: strings.NOT_READY_QUANTITY,
    type: 'string',
  },
  { key: 'readyQuantityWithdrawn', name: strings.READY_QUANTITY, type: 'string' },
  { key: 'totalQuantity', name: strings.TOTAL_QUANTITY, type: 'string' },
  {
    key: 'totalWithdraw',
    name: strings.TOTAL_WITHDRAW,
    type: 'string',
  },
];

const tableColumns = (nurseryV2: boolean) => () => {
  const columns = defaultTableColumns();

  if (!nurseryV2) {
    columns.splice(2, 1); // remove germinating quantity column
  }

  return columns;
};

const outplantTableColumns = (): TableColumnType[] => [
  {
    key: 'batchNumber',
    name: strings.SEEDLING_BATCH,
    type: 'string',
  },
  {
    key: 'facilityName',
    name: strings.NURSERY,
    type: 'string',
  },
  {
    key: 'projectName',
    name: strings.PROJECT,
    type: 'string',
  },
  {
    key: 'readyQuantity',
    name: strings.READY_QUANTITY,
    type: 'string',
  },
  { key: 'outplantReadyQuantityWithdrawn', name: strings.WITHDRAW, type: 'string' },
];

const { OUTPLANT } = NurseryWithdrawalPurposes;

export default function SelectBatches(props: SelectBatchesWithdrawnQuantityProps): JSX.Element {
  const { onNext, onCancel, saveText, batches, nurseryWithdrawal, filterProjectId } = props;

  const classes = useStyles();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [record, setRecord] = useForm<BatchWithdrawalForTable[]>([]);
  const nurseryV2 = isEnabled('Nursery Updates');
  const featureFlagProjects = isEnabled('Projects');

  const [species, setSpecies] = useState<any>([]);
  const [errorPageMessage, setErrorPageMessage] = useState('');

  useEffect(() => {
    const transformBatchesForTable = () => {
      const speciesFromBatches: { [x: string]: { id: number; scientificName: string; commonName: string } } = {};

      const batchesForTable: BatchWithdrawalForTable[] = nurseryWithdrawal.batchWithdrawals.reduce((acc, bw) => {
        const associatedBatch = batches.find((batch) => batch.id.toString() === bw.batchId.toString());

        if (associatedBatch && (filterProjectId ? Number(associatedBatch.project_id) === filterProjectId : true)) {
          acc.push({
            batchId: bw.batchId,
            germinatingQuantityWithdrawn: bw.germinatingQuantityWithdrawn ?? 0,
            notReadyQuantityWithdrawn: bw.notReadyQuantityWithdrawn,
            readyQuantityWithdrawn: bw.readyQuantityWithdrawn,
            germinatingQuantity: associatedBatch.germinatingQuantity,
            notReadyQuantity: associatedBatch.notReadyQuantity,
            readyQuantity: associatedBatch.readyQuantity,
            'germinatingQuantity(raw)': +associatedBatch['germinatingQuantity(raw)'],
            'notReadyQuantity(raw)': +associatedBatch['notReadyQuantity(raw)'],
            'readyQuantity(raw)': +associatedBatch['readyQuantity(raw)'],
            totalQuantity: associatedBatch.totalQuantity,
            batchNumber: associatedBatch.batchNumber,
            speciesId: associatedBatch.species_id,
            facilityName: associatedBatch.facility_name,
            projectId: Number(associatedBatch.project_id),
            projectName: associatedBatch.project_name,
            error: {},
          });

          if (!speciesFromBatches[associatedBatch.species_id]) {
            speciesFromBatches[associatedBatch.species_id] = {
              id: associatedBatch.species_id,
              scientificName: associatedBatch.species_scientificName,
              commonName: associatedBatch.species_commonName,
            };
          }
        }
        return acc;
      }, [] as BatchWithdrawalForTable[]);

      setRecord(batchesForTable);
      setSpecies(Object.values(speciesFromBatches));
    };

    transformBatchesForTable();
  }, [batches, filterProjectId, nurseryWithdrawal, selectedOrganization, setRecord]);

  const onEditHandler = (batch: BatchWithdrawalForTable, fromColumn?: string, value?: string) => {
    setRecord((previousRecord: BatchWithdrawalForTable[]): BatchWithdrawalForTable[] => {
      const recordToBeEdited = previousRecord.find((bw) => bw.batchId === batch.batchId);
      if (recordToBeEdited && fromColumn) {
        if (fromColumn === 'outplantReadyQuantityWithdrawn') {
          fromColumn = 'readyQuantityWithdrawn';
        }
        const indexOfRecordToBeEdited = previousRecord.indexOf(recordToBeEdited);
        const newRecord = [...previousRecord];
        newRecord.splice(indexOfRecordToBeEdited, 1, { ...recordToBeEdited, [fromColumn]: value });
        return newRecord;
      }
      return previousRecord;
    });
  };

  const isInvalidQuantity = (val: any) => isNaN(val) || +val < 0;

  const validateQuantities = () => {
    let noErrors = true;
    let newRecords: BatchWithdrawalForTable[] = [];
    if (nurseryWithdrawal.purpose === OUTPLANT) {
      let unsetValues = 0;
      newRecords = record.map((rec) => {
        let readyQuantityWithdrawnError = '';
        if (rec.readyQuantityWithdrawn) {
          if (isInvalidQuantity(rec.readyQuantityWithdrawn)) {
            readyQuantityWithdrawnError = strings.INVALID_VALUE;
            noErrors = false;
          } else {
            if (+rec.readyQuantityWithdrawn > +rec['readyQuantity(raw)']) {
              readyQuantityWithdrawnError = strings.WITHDRAWN_QUANTITY_ERROR;
              noErrors = false;
            } else {
              rec.error.readyQuantityWithdrawn = '';
            }
          }
        } else {
          unsetValues++;
        }

        if (unsetValues === record.length) {
          setErrorPageMessage(strings.WITHDRAWAL_BATCHES_MISSING_QUANTITY_ERROR);
          noErrors = false;
        } else {
          setErrorPageMessage('');
        }

        return { ...rec, error: { readyQuantityWithdrawn: readyQuantityWithdrawnError } };
      });
    } else {
      let unsetValues = 0;
      newRecords = record.map((rec) => {
        let germinatingQuantityWithdrawnError = '';
        let readyQuantityWithdrawnError = '';
        let notReadyQuantityWithdrawnError = '';

        if (nurseryV2) {
          if (rec.germinatingQuantityWithdrawn) {
            if (isInvalidQuantity(rec.germinatingQuantityWithdrawn)) {
              germinatingQuantityWithdrawnError = strings.INVALID_VALUE;
              noErrors = false;
            } else {
              if (+rec.germinatingQuantityWithdrawn > +rec['germinatingQuantity(raw)']) {
                germinatingQuantityWithdrawnError = strings.WITHDRAWN_QUANTITY_ERROR;
                noErrors = false;
              } else {
                germinatingQuantityWithdrawnError = '';
              }
            }
          } else {
            unsetValues++;
          }
        }

        if (rec.readyQuantityWithdrawn) {
          if (isInvalidQuantity(rec.readyQuantityWithdrawn)) {
            readyQuantityWithdrawnError = strings.INVALID_VALUE;
            noErrors = false;
          } else {
            if (+rec.readyQuantityWithdrawn > +rec['readyQuantity(raw)']) {
              readyQuantityWithdrawnError = strings.WITHDRAWN_QUANTITY_ERROR;
              noErrors = false;
            } else {
              readyQuantityWithdrawnError = '';
            }
          }
        } else {
          unsetValues++;
        }

        if (rec.notReadyQuantityWithdrawn) {
          if (isInvalidQuantity(rec.notReadyQuantityWithdrawn)) {
            notReadyQuantityWithdrawnError = strings.INVALID_VALUE;
            noErrors = false;
          } else {
            if (+rec.notReadyQuantityWithdrawn > +rec['notReadyQuantity(raw)']) {
              notReadyQuantityWithdrawnError = strings.WITHDRAWN_QUANTITY_ERROR;
              noErrors = false;
            } else {
              notReadyQuantityWithdrawnError = '';
            }
          }
        } else {
          unsetValues++;
        }

        if (unsetValues === record.length * (nurseryV2 ? 3 : 2)) {
          setErrorPageMessage(strings.WITHDRAWAL_BATCHES_MISSING_QUANTITY_ERROR);
          noErrors = false;
        } else {
          setErrorPageMessage('');
        }

        return {
          ...rec,
          error: {
            germinatingQuantityWithdrawn: germinatingQuantityWithdrawnError,
            readyQuantityWithdrawn: readyQuantityWithdrawnError,
            notReadyQuantityWithdrawn: notReadyQuantityWithdrawnError,
          },
        };
      });
    }

    setRecord(newRecords);

    return noErrors;
  };

  const onNextHandler = () => {
    const validQuantities = validateQuantities();

    if (validQuantities) {
      const newBatchWithdrawals = record.map((rec) => {
        return {
          batchId: rec.batchId,
          germinatingQuantityWithdrawn: rec.germinatingQuantityWithdrawn,
          notReadyQuantityWithdrawn: rec.notReadyQuantityWithdrawn,
          readyQuantityWithdrawn: rec.readyQuantityWithdrawn,
        };
      });

      onNext({ ...nurseryWithdrawal, batchWithdrawals: newBatchWithdrawals });
    }
  };

  return (
    <PageForm
      cancelID='cancelSelectBatchesWithdrawnQty'
      saveID='saveSelectBatchesWithdrawnQty'
      onCancel={onCancel}
      onSave={onNextHandler}
      saveButtonText={saveText}
    >
      {errorPageMessage && (
        <Box sx={{ marginTop: 5, marginBottom: 3 }}>
          <ErrorBox text={errorPageMessage} className={classes.error} />
        </Box>
      )}
      <Container
        maxWidth={false}
        sx={{
          paddingBottom: isMobile ? '185px' : '105px',
        }}
      >
        <Grid container minWidth={isMobile ? 0 : 700} sx={{ flexDirection: 'column' }}>
          <Grid item xs={12}>
            <Typography sx={{ fontSize: '20px', fontWeight: 'bold', margin: theme.spacing(4, 3, 3) }}>
              {strings.SELECT_BATCHES}
            </Typography>
          </Grid>
          {species &&
            species.map((iSpecies: any) => {
              return (
                <Grid
                  key={iSpecies.id}
                  display='flex'
                  flexDirection='column'
                  flexGrow={1}
                  sx={{
                    backgroundColor: theme.palette.TwClrBg,
                    borderRadius: theme.spacing(4),
                    padding: theme.spacing(3),
                    margin: theme.spacing(0, 3, 3, 0),
                  }}
                >
                  <Grid item xs={12}>
                    <Typography
                      variant='h2'
                      sx={{ fontSize: '16px', fontWeight: 600, marginBottom: theme.spacing(2), paddingTop: 1 }}
                    >
                      {iSpecies.scientificName} {iSpecies.commonName ? `(${iSpecies.commonName})` : null}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} marginBottom={5}>
                    {record.length > 0 && (
                      <Table
                        id={`batch-withdraw-quantity-table${nurseryWithdrawal.purpose === OUTPLANT ? '-outplant' : ''}`}
                        columns={() =>
                          (nurseryWithdrawal.purpose === OUTPLANT
                            ? outplantTableColumns()
                            : tableColumns(nurseryV2)()
                          ).filter((column) => (featureFlagProjects ? column : column.key !== 'projectName'))
                        }
                        rows={record.filter((rec) => rec.speciesId === iSpecies.id)}
                        Renderer={WithdrawalBatchesCellRenderer}
                        orderBy={'batchId'}
                        showPagination={false}
                        onSelect={onEditHandler}
                        controlledOnSelect={true}
                      />
                    )}
                  </Grid>
                </Grid>
              );
            })}
        </Grid>
      </Container>
    </PageForm>
  );
}
