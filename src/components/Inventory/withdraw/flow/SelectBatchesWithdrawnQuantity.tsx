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
import { useOrganization } from 'src/providers/hooks';
import Table from 'src/components/common/table';
import { useUser } from 'src/providers';
import useNumberParser from 'src/utils/useNumberParser';

type SelectBatchesWithdrawnQuantityProps = {
  onNext: (withdrawal: NurseryWithdrawalRequest) => void;
  onCancel: () => void;
  saveText: string;
  batches: any[];
  nurseryWithdrawal: NurseryWithdrawalRequest;
};

type BatchWithdrawalForTable = {
  batchId: number;
  batchNumber: string;
  notReadyQuantityWithdrawn: number;
  readyQuantityWithdrawn: number;
  notReadyQuantity: number;
  readyQuantity: number;
  speciesId: number;
  facilityName: string;
  error: { [key: string]: string | undefined };
};

const useStyles = makeStyles(() => ({
  error: {
    '& .error-box--container': {
      alignItems: 'center',
    },
  },
}));

export default function SelectBatches(props: SelectBatchesWithdrawnQuantityProps): JSX.Element {
  const numberParser = useNumberParser();
  const { selectedOrganization } = useOrganization();
  const { user } = useUser();
  const { onNext, onCancel, saveText, batches, nurseryWithdrawal } = props;
  const { OUTPLANT } = NurseryWithdrawalPurposes;
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [species, setSpecies] = useState<any>([]);
  const [record, setRecord] = useForm<BatchWithdrawalForTable[]>([]);
  const [errorPageMessage, setErrorPageMessage] = useState('');
  const classes = useStyles();

  useEffect(() => {
    const transformBatchesForTable = () => {
      const speciesFromBatches: { [x: string]: { id: number; scientificName: string; commonName: string } } = {};
      const batchesForTable: BatchWithdrawalForTable[] = nurseryWithdrawal.batchWithdrawals.reduce((acc, bw) => {
        const associatedBatch = batches.find((batch) => batch.id.toString() === bw.batchId.toString());
        if (associatedBatch) {
          acc.push({
            batchId: bw.batchId,
            notReadyQuantityWithdrawn: bw.notReadyQuantityWithdrawn,
            readyQuantityWithdrawn: bw.readyQuantityWithdrawn,
            notReadyQuantity: associatedBatch.notReadyQuantity,
            readyQuantity: associatedBatch.readyQuantity,
            batchNumber: associatedBatch.batchNumber,
            speciesId: associatedBatch.species_id,
            facilityName: associatedBatch.facility_name,
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
  }, [batches, nurseryWithdrawal, selectedOrganization, setRecord]);

  const columns: TableColumnType[] = [
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

  const outplantColumns: TableColumnType[] = [
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
      key: 'readyQuantity',
      name: strings.READY_QUANTITY,
      type: 'string',
    },
    { key: 'outplantReadyQuantityWithdrawn', name: strings.WITHDRAW, type: 'string' },
  ];

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
    const numericParser = numberParser(user?.locale ?? 'en');
    let noErrors = true;
    let newRecords: BatchWithdrawalForTable[] = [];
    if (nurseryWithdrawal.purpose === OUTPLANT) {
      let unsetValues = 0;
      newRecords = record.map((recordData) => {
        const rec = {
          ...recordData,
          readyQuantity: numericParser.parse(recordData.readyQuantity.toString()),
        };
        let readyQuantityWithdrawnError = '';
        if (rec.readyQuantityWithdrawn) {
          if (isInvalidQuantity(rec.readyQuantityWithdrawn)) {
            readyQuantityWithdrawnError = strings.INVALID_VALUE;
            noErrors = false;
          } else {
            if (+rec.readyQuantityWithdrawn > +rec.readyQuantity) {
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
      newRecords = record.map((recordData) => {
        const rec = {
          ...recordData,
          notReadyQuantity: numericParser.parse(recordData.notReadyQuantity.toString()),
          readyQuantity: numericParser.parse(recordData.readyQuantity.toString()),
        };
        let readyQuantityWithdrawnError = '';
        let notReadyQuantityWithdrawnError = '';
        if (rec.readyQuantityWithdrawn) {
          if (isInvalidQuantity(rec.readyQuantityWithdrawn)) {
            readyQuantityWithdrawnError = strings.INVALID_VALUE;
            noErrors = false;
          } else {
            if (+rec.readyQuantityWithdrawn > +rec.readyQuantity) {
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
            if (+rec.notReadyQuantityWithdrawn > rec.notReadyQuantity) {
              notReadyQuantityWithdrawnError = strings.WITHDRAWN_QUANTITY_ERROR;
              noErrors = false;
            } else {
              notReadyQuantityWithdrawnError = '';
            }
          }
        } else {
          unsetValues++;
        }

        if (unsetValues === record.length * 2) {
          setErrorPageMessage(strings.WITHDRAWAL_BATCHES_MISSING_QUANTITY_ERROR);
          noErrors = false;
        } else {
          setErrorPageMessage('');
        }

        return {
          ...rec,
          error: {
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
                        id='inventory-table'
                        columns={nurseryWithdrawal.purpose === OUTPLANT ? outplantColumns : columns}
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
