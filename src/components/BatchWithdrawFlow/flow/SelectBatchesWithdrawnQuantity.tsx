import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { ErrorBox, TableColumnType } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import Table from 'src/components/common/table';
import { useLocalization, useOrganization } from 'src/providers';
import { NurseryWithdrawalPurposes, NurseryWithdrawalRequest } from 'src/types/Batch';
import useForm from 'src/utils/useForm';

import WithdrawalBatchesCellRenderer from './WithdrawalBatchesCellRenderer';

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
  activeGrowthQuantityWithdrawn: number;
  hardeningOffQuantityWithdrawn: number;
  germinatingQuantityWithdrawn: number;
  readyQuantityWithdrawn: number;
  germinatingQuantity: number;
  activeGrowthQuantity: number;
  hardeningOffQuantity: number;
  readyQuantity: number;
  'germinatingQuantity(raw)': number;
  'activeGrowthQuantity(raw)': number;
  'hardeningOffQuantity(raw)': number;
  'readyQuantity(raw)': number;
  totalQuantity: number;
  speciesId: number;
  facilityName: string;
  projectId: number;
  projectName: string;
  error: { [key: string]: string | undefined };
};

const { OUTPLANT } = NurseryWithdrawalPurposes;

export default function SelectBatches(props: SelectBatchesWithdrawnQuantityProps): JSX.Element {
  const { onNext, onCancel, saveText, batches, nurseryWithdrawal, filterProjectId } = props;

  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const [record, setRecord] = useForm<BatchWithdrawalForTable[]>([]);
  const [species, setSpecies] = useState<any>([]);
  const [errorPageMessage, setErrorPageMessage] = useState('');

  const defaultTableColumns = useMemo(
    (): TableColumnType[] => [
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
        name: strings.GERMINATION_ESTABLISHMENT_QUANTITY,
        type: 'number' as const,
      },
      {
        key: 'activeGrowthQuantityWithdrawn',
        name: strings.ACTIVE_GROWTH_QUANTITY,
        type: 'number' as const,
      },
      {
        key: 'hardeningOffQuantityWithdrawn',
        name: strings.HARDENING_OFF_QUANTITY,
        type: 'number' as const,
      },
      { key: 'readyQuantityWithdrawn', name: strings.READY_TO_PLANT_QUANTITY, type: 'number' as const },
      { key: 'totalQuantity', name: strings.TOTAL_QUANTITY, type: 'number' },
      {
        key: 'totalWithdraw',
        name: strings.TOTAL_WITHDRAW,
        type: 'number',
      },
    ],
    [strings]
  );

  const outplantTableColumns = useMemo(
    (): TableColumnType[] => [
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
        name: strings.READY_TO_PLANT_QUANTITY,
        type: 'string',
        alignment: 'right',
      },
      { key: 'outplantReadyQuantityWithdrawn', name: strings.WITHDRAW, type: 'string', alignment: 'right' },
    ],
    [strings]
  );

  const columns = useMemo(
    () => (nurseryWithdrawal.purpose === OUTPLANT ? outplantTableColumns : defaultTableColumns),
    [defaultTableColumns, nurseryWithdrawal.purpose, outplantTableColumns]
  );

  useEffect(() => {
    const transformBatchesForTable = () => {
      const speciesFromBatches: { [x: string]: { id: number; scientificName: string; commonName: string } } = {};

      const batchesForTable: BatchWithdrawalForTable[] = nurseryWithdrawal.batchWithdrawals.reduce((acc, bw) => {
        const associatedBatch = batches.find((batch) => batch.id.toString() === bw.batchId.toString());

        if (associatedBatch && (filterProjectId ? Number(associatedBatch.project_id) === filterProjectId : true)) {
          acc.push({
            batchId: bw.batchId,
            germinatingQuantityWithdrawn: bw.germinatingQuantityWithdrawn ?? 0,
            activeGrowthQuantityWithdrawn: bw.activeGrowthQuantityWithdrawn,
            hardeningOffQuantityWithdrawn: bw.hardeningOffQuantityWithdrawn ?? 0,
            readyQuantityWithdrawn: bw.readyQuantityWithdrawn,
            germinatingQuantity: associatedBatch.germinatingQuantity,
            activeGrowthQuantity: associatedBatch.activeGrowthQuantity,
            hardeningOffQuantity: associatedBatch.hardeningOffQuantity,
            readyQuantity: associatedBatch.readyQuantity,
            'germinatingQuantity(raw)': +associatedBatch['germinatingQuantity(raw)'],
            'activeGrowthQuantity(raw)': +associatedBatch['activeGrowthQuantity(raw)'],
            'hardeningOffQuantity(raw)': +associatedBatch['hardeningOffQuantity(raw)'],
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
        let activeGrowthQuantityWithdrawnError = '';
        let hardeningOffQuantityWithdrawnError = '';

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

        if (rec.activeGrowthQuantityWithdrawn) {
          if (isInvalidQuantity(rec.activeGrowthQuantityWithdrawn)) {
            activeGrowthQuantityWithdrawnError = strings.INVALID_VALUE;
            noErrors = false;
          } else {
            if (+rec.activeGrowthQuantityWithdrawn > +rec['activeGrowthQuantity(raw)']) {
              activeGrowthQuantityWithdrawnError = strings.WITHDRAWN_QUANTITY_ERROR;
              noErrors = false;
            } else {
              activeGrowthQuantityWithdrawnError = '';
            }
          }
        } else {
          unsetValues++;
        }

        if (rec.hardeningOffQuantityWithdrawn) {
          if (isInvalidQuantity(rec.hardeningOffQuantityWithdrawn)) {
            hardeningOffQuantityWithdrawnError = strings.INVALID_VALUE;
            noErrors = false;
          } else {
            if (+rec.hardeningOffQuantityWithdrawn > +rec['hardeningOffQuantity(raw)']) {
              hardeningOffQuantityWithdrawnError = strings.WITHDRAWN_QUANTITY_ERROR;
              noErrors = false;
            } else {
              hardeningOffQuantityWithdrawnError = '';
            }
          }
        } else {
          unsetValues++;
        }

        if (unsetValues === record.length * 3) {
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
            activeGrowthQuantityWithdrawn: activeGrowthQuantityWithdrawnError,
            hardeningOffQuantityWithdrawn: hardeningOffQuantityWithdrawnError,
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
          activeGrowthQuantityWithdrawn: rec.activeGrowthQuantityWithdrawn,
          hardeningOffQuantityWithdrawn: rec.hardeningOffQuantityWithdrawn,
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
          <ErrorBox
            text={errorPageMessage}
            sx={{
              '& .error-box--container': {
                alignItems: 'center',
              },
            }}
          />
        </Box>
      )}
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          paddingBottom: isMobile ? '185px' : '105px',
        }}
      >
        <Grid item xs={12}>
          <Typography sx={{ fontSize: '20px', fontWeight: 'bold', margin: theme.spacing(4, 3, 3) }}>
            {strings.SELECT_BATCHES}
          </Typography>
        </Grid>
        {species &&
          species.map((iSpecies: any) => {
            return (
              <Card flushMobile key={iSpecies.id} style={{ marginTop: theme.spacing(3) }}>
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
                      columns={columns}
                      rows={record.filter((rec) => rec.speciesId === iSpecies.id)}
                      Renderer={WithdrawalBatchesCellRenderer}
                      orderBy={'batchId'}
                      showPagination={false}
                      onSelect={onEditHandler}
                      controlledOnSelect={true}
                    />
                  )}
                </Grid>
              </Card>
            );
          })}
      </Container>
    </PageForm>
  );
}
