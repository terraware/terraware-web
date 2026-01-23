import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Divider, Grid, useTheme } from '@mui/material';
import { Button, DialogBox, Textfield } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import { useOrganization } from 'src/providers';
import { NurseryBatchService } from 'src/services';
import { BATCH_PHOTO_ENDPOINT } from 'src/services/NurseryBatchService';
import strings from 'src/strings';
import { Batch } from 'src/types/Batch';
import { getNurseryById } from 'src/utils/organization';

import { BatchHistoryItemForTable } from './BatchHistory';
import { getEventType } from './BatchHistoryRenderer';

export interface EventDetailsModalProps {
  onClose: () => void;
  selectedEvent: BatchHistoryItemForTable;
  batchId: number;
}

export default function EventDetailsModal(props: EventDetailsModalProps): JSX.Element {
  const { onClose, selectedEvent, batchId } = props;
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const previousEvent = selectedEvent.previousEvent;
  const gridSize = () => (isMobile ? 12 : 6);
  const marginTop = {
    marginTop: theme.spacing(0.5),
  };

  const paddingSeparator = useMemo(() => (isMobile ? 0 : 1.5), [isMobile]);

  const [relatedBatch, setRelatedBatch] = useState<Batch | null>();
  const [photoUrl, setPhotoUrl] = useState<string>();

  useEffect(() => {
    const fetchRelatedBatch = async () => {
      if (selectedEvent.type === 'IncomingWithdrawal') {
        const response = await NurseryBatchService.getBatch(selectedEvent.fromBatchId);
        if (response.requestSucceeded) {
          setRelatedBatch(response.batch);
        }
      }
    };
    if (selectedEvent.type === 'IncomingWithdrawal' && !relatedBatch) {
      void fetchRelatedBatch();
    }
  }, [selectedEvent, relatedBatch]);

  useEffect(() => {
    if (selectedEvent.type === 'PhotoCreated' && selectedEvent.fileId) {
      setPhotoUrl(
        BATCH_PHOTO_ENDPOINT.replace('{batchId}', batchId.toString()).replace(
          '{photoId}',
          selectedEvent.fileId.toString()
        )
      );
    }
  }, [selectedEvent, batchId]);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.EVENT_DETAILS}
      size='medium'
      middleButtons={[<Button id='done' onClick={onClose} label={strings.DONE} key='button-1' />]}
      scrolled={true}
    >
      <Grid container item xs={12} spacing={2} textAlign='left'>
        <Grid item xs={12} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield id='event' value={getEventType(selectedEvent)} type='text' label={strings.EVENT} display={true} />
        </Grid>
        <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
          <Textfield
            id='createdTime'
            value={getDateDisplayValue(selectedEvent.createdTime)}
            type='text'
            label={strings.DATE}
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='editedByName'
            value={selectedEvent.editedByName}
            type='text'
            label={strings.EDITED_BY}
            display={true}
          />
        </Grid>
        {(selectedEvent.modifiedFields.includes(strings.GERMINATION_ESTABLISHMENT_QUANTITY) ||
          selectedEvent.modifiedFields.includes(strings.ACTIVE_GROWTH_QUANTITY) ||
          selectedEvent.modifiedFields.includes(strings.READY_TO_PLANT_QUANTITY)) && (
          <Grid item xs={12} sx={marginTop}>
            <Divider />
          </Grid>
        )}
        {selectedEvent.modifiedFields.includes(strings.GERMINATION_ESTABLISHMENT_QUANTITY) && (
          <>
            {(!previousEvent ||
              previousEvent?.type === 'QuantityEdited' ||
              previousEvent?.type === 'StatusChanged') && (
              <Grid item xs={12} sx={marginTop} paddingRight={paddingSeparator}>
                <Textfield
                  id='germinationQuantityBefore'
                  value={previousEvent?.germinatingQuantity || 0}
                  type='text'
                  label={strings.GERMINATION_ESTABLISHMENT_QUANTITY_BEFORE}
                  display={true}
                />
              </Grid>
            )}
            {(selectedEvent.type === 'QuantityEdited' || selectedEvent.type === 'StatusChanged') && (
              <Grid item xs={12} sx={marginTop} paddingRight={paddingSeparator}>
                <Textfield
                  id='germinationQuantityAfter'
                  value={selectedEvent.germinatingQuantity}
                  type='text'
                  label={strings.GERMINATION_ESTABLISHMENT_QUANTITY_AFTER}
                  display={true}
                />
              </Grid>
            )}
          </>
        )}
        {selectedEvent.modifiedFields.includes(strings.ACTIVE_GROWTH_QUANTITY) && (
          <>
            {(!previousEvent ||
              previousEvent?.type === 'QuantityEdited' ||
              previousEvent?.type === 'StatusChanged') && (
              <Grid item xs={12} sx={marginTop} paddingRight={paddingSeparator}>
                <Textfield
                  id='activeGrowthQuantityBefore'
                  value={previousEvent?.activeGrowthQuantity || 0}
                  type='text'
                  label={strings.ACTIVE_GROWTH_QUANTITY_BEFORE}
                  display={true}
                />
              </Grid>
            )}
            {(selectedEvent.type === 'QuantityEdited' || selectedEvent.type === 'StatusChanged') && (
              <Grid item xs={12} sx={marginTop} paddingRight={paddingSeparator}>
                <Textfield
                  id='notReadQuantityAfter'
                  value={selectedEvent.activeGrowthQuantity}
                  type='text'
                  label={strings.ACTIVE_GROWTH_QUANTITY_AFTER}
                  display={true}
                />
              </Grid>
            )}
          </>
        )}

        {selectedEvent.modifiedFields.includes(strings.HARDENING_OFF_QUANTITY) && (
          <>
            {(!previousEvent ||
              previousEvent?.type === 'QuantityEdited' ||
              previousEvent?.type === 'StatusChanged') && (
              <Grid item paddingRight={paddingSeparator} sx={marginTop} xs={12}>
                <Textfield
                  display
                  id='hardeningOffQuantityBefore'
                  label={strings.HARDENING_OFF_QUANTITY_BEFORE}
                  type='text'
                  value={previousEvent?.hardeningOffQuantity || 0}
                />
              </Grid>
            )}
            {(selectedEvent.type === 'QuantityEdited' || selectedEvent.type === 'StatusChanged') && (
              <Grid item paddingRight={paddingSeparator} sx={marginTop} xs={12}>
                <Textfield
                  display
                  id='hardeningOffQuantityAfter'
                  label={strings.HARDENING_OFF_QUANTITY_AFTER}
                  type='text'
                  value={selectedEvent.hardeningOffQuantity}
                />
              </Grid>
            )}
          </>
        )}

        {selectedEvent.modifiedFields.includes(strings.READY_TO_PLANT_QUANTITY) && (
          <>
            {(!previousEvent ||
              previousEvent?.type === 'QuantityEdited' ||
              previousEvent?.type === 'StatusChanged') && (
              <Grid item xs={12} sx={marginTop} paddingRight={paddingSeparator}>
                <Textfield
                  id='readyQuantityBefore'
                  value={previousEvent?.readyQuantity || 0}
                  type='text'
                  label={strings.READY_TO_PLANT_QUANTITY_BEFORE}
                  display={true}
                />
              </Grid>
            )}
            {(selectedEvent.type === 'QuantityEdited' || selectedEvent.type === 'StatusChanged') && (
              <Grid item xs={12} sx={marginTop} paddingRight={paddingSeparator}>
                <Textfield
                  id='readyQuantityAfter'
                  value={selectedEvent.readyQuantity}
                  type='text'
                  label={strings.READY_TO_PLANT_QUANTITY_AFTER}
                  display={true}
                />
              </Grid>
            )}
          </>
        )}
        {selectedEvent.modifiedFields.includes(strings.SUBSTRATE) && (
          <>
            <Grid item xs={12} sx={marginTop}>
              <Divider />
            </Grid>
            {previousEvent?.type === 'DetailsEdited' && (
              <>
                <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                  <Textfield
                    id='substrateBefore'
                    value={previousEvent.substrate}
                    type='text'
                    label={strings.SUBSTRATE_BEFORE}
                    display={true}
                  />
                </Grid>
                <Grid padding={theme.spacing(3, 0, 1, 2)} xs={gridSize()} sx={{ alignSelf: 'flex-end' }}>
                  {previousEvent.substrate === strings.OTHER && (
                    <Textfield id='substrateNotesBefore' value={previousEvent.substrateNotes} type='text' label='' />
                  )}
                </Grid>
              </>
            )}
            {selectedEvent?.type === 'DetailsEdited' && (
              <>
                <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                  <Textfield
                    id='substrateAfter'
                    value={selectedEvent.substrate}
                    type='text'
                    label={strings.SUBSTRATE_AFTER}
                    display={true}
                  />
                </Grid>
                <Grid padding={theme.spacing(3, 0, 1, 2)} xs={gridSize()} sx={{ alignSelf: 'flex-end' }}>
                  {selectedEvent.substrate === strings.OTHER && (
                    <Textfield id='substrateNotesAfter' value={selectedEvent.substrateNotes} type='text' label='' />
                  )}
                </Grid>
              </>
            )}
          </>
        )}

        {selectedEvent.modifiedFields.includes(strings.TREATMENT) && (
          <>
            <Grid item xs={12} sx={marginTop}>
              <Divider />
            </Grid>
            {previousEvent?.type === 'DetailsEdited' && (
              <>
                <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                  <Textfield
                    id='treatmentBefore'
                    value={previousEvent.treatment}
                    type='text'
                    label={strings.TREATMENT_BEFORE}
                    display={true}
                  />
                </Grid>
                <Grid padding={theme.spacing(3, 0, 1, 2)} xs={gridSize()} sx={{ alignSelf: 'flex-end' }}>
                  {previousEvent.treatment === strings.OTHER && (
                    <Textfield id='treatmentNotesBefore' value={previousEvent.treatmentNotes} type='text' label='' />
                  )}
                </Grid>
              </>
            )}
            {selectedEvent?.type === 'DetailsEdited' && (
              <>
                <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
                  <Textfield
                    id='treatmentAfter'
                    value={selectedEvent.treatment}
                    type='text'
                    label={strings.TREATMENT_AFTER}
                    display={true}
                  />
                </Grid>
                <Grid padding={theme.spacing(3, 0, 1, 2)} xs={gridSize()} sx={{ alignSelf: 'flex-end' }}>
                  {selectedEvent.substrate === strings.OTHER && (
                    <Textfield id='treatmentNotesAfter' value={selectedEvent.treatmentNotes} type='text' label='' />
                  )}
                </Grid>
              </>
            )}
          </>
        )}

        {selectedEvent.modifiedFields.includes(strings.NOTES) && (
          <>
            <Grid item xs={12} sx={marginTop}>
              <Divider />
            </Grid>
            {previousEvent?.type === 'DetailsEdited' && (
              <Grid item xs={12} sx={marginTop} paddingRight={paddingSeparator}>
                <Textfield
                  id='notesBefore'
                  value={previousEvent.notes}
                  type='text'
                  label={strings.NOTES_BEFORE}
                  display={true}
                />
              </Grid>
            )}
            {selectedEvent?.type === 'DetailsEdited' && (
              <Grid item xs={12} sx={marginTop} paddingRight={paddingSeparator}>
                <Textfield
                  id='notesAfter'
                  value={selectedEvent.notes}
                  type='text'
                  label={strings.NOTES_AFTER}
                  display={true}
                />
              </Grid>
            )}
          </>
        )}
        {selectedEvent?.type === 'IncomingWithdrawal' && relatedBatch && (
          <>
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='fromNursery'
                value={
                  selectedOrganization ? getNurseryById(selectedOrganization, relatedBatch.facilityId).name || '' : ''
                }
                type='text'
                label={strings.FROM_NURSERY}
                display={true}
              />
            </Grid>

            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='toNursery'
                value={selectedEvent.nurseryName || ''}
                type='text'
                label={strings.TO_NURSERY}
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='totalQuantityMoved'
                value={
                  +selectedEvent.readyQuantityAdded +
                  +selectedEvent.activeGrowthQuantityAdded +
                  +selectedEvent.hardeningOffQuantityAdded
                }
                type='text'
                label={strings.TOTAL_QUANTITY_MOVED}
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='fromBatchNumber'
                value={relatedBatch.batchNumber}
                type='text'
                label={strings.BATCH_NUMBER}
                display={true}
              />
            </Grid>
          </>
        )}
        {selectedEvent?.type === 'PhotoCreated' && photoUrl && (
          <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
            <Box
              display='flex'
              position='relative'
              height={122}
              width={122}
              marginRight={isMobile ? 2 : 3}
              marginTop={1}
              border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
            >
              <img
                src={`${photoUrl}?maxHeight=120`}
                alt={'new'}
                style={{
                  margin: 'auto auto',
                  objectFit: 'contain',
                  display: 'flex',
                  maxWidth: '120px',
                  maxHeight: '120px',
                }}
              />
            </Box>
          </Grid>
        )}
      </Grid>
    </DialogBox>
  );
}
