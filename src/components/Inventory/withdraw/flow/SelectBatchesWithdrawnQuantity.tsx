import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, useTheme } from '@mui/material';
import { ServerOrganization } from 'src/types/Organization';
import FormBottomBar from 'src/components/common/FormBottomBar';
import { useDeviceInfo } from '@terraware/web-components/utils';
import strings from 'src/strings';
import { NurseryWithdrawalRequest } from 'src/api/types/batch';
import { Table, TableColumnType } from '@terraware/web-components';
import WithdrawalBatchesCellRenderer from './WithdrawalBatchesCellRenderer';
import useForm from 'src/utils/useForm';

type SelectBatchesWithdrawnQuantityProps = {
  organization: ServerOrganization;
  onNext: () => void;
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
};

export default function SelectBatches(props: SelectBatchesWithdrawnQuantityProps): JSX.Element {
  const { onNext, onCancel, saveText, batches, nurseryWithdrawal, organization } = props;
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [species, setSpecies] = useState<any>([]);
  const [record, setRecord] = useForm<BatchWithdrawalForTable[]>([]);

  useEffect(() => {
    const transformBatchesForTable = async () => {
      const speciesFromBatches: { [x: string]: { id: number; scientificName: string; commonName: string } } = {};
      let batchesForTable: BatchWithdrawalForTable[] = [];
      batchesForTable = nurseryWithdrawal.batchWithdrawals.reduce((acc, bw) => {
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
      }, batchesForTable);

      setRecord(batchesForTable);
      setSpecies(Object.values(speciesFromBatches));
    };

    transformBatchesForTable();
  }, [batches, nurseryWithdrawal, organization, setRecord]);

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

  return (
    <>
      <Container
        maxWidth={false}
        sx={{
          padding: 3,
        }}
      >
        <Grid container minWidth={isMobile ? 0 : 700}>
          <Grid item xs={12}>
            <Typography variant='h2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: theme.spacing(2) }}>
              {strings.SELECT_BATCHES}
            </Typography>
          </Grid>
          {species &&
            species.map((iSpecies: any) => {
              return (
                <>
                  <Grid item xs={12}>
                    <Typography
                      variant='h2'
                      sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: theme.spacing(2) }}
                    >
                      {iSpecies.scientificName} {iSpecies.commonName ? `(${iSpecies.commonName})` : null}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    {record.length > 0 && (
                      <Table
                        id='inventory-table'
                        columns={nurseryWithdrawal.purpose === 'Out Plant' ? outplantColumns : columns}
                        rows={record.filter((rec) => rec.speciesId === iSpecies.id)}
                        Renderer={WithdrawalBatchesCellRenderer}
                        orderBy={'batchId'}
                        showPagination={false}
                        onSelect={onEditHandler}
                        controlledOnSelect={true}
                      />
                    )}
                  </Grid>
                </>
              );
            })}
        </Grid>
      </Container>
      <FormBottomBar onCancel={onCancel} onSave={onNext} saveButtonText={saveText} />
    </>
  );
}
