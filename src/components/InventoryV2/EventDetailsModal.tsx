import { Divider, Grid, useTheme } from '@mui/material';
import { Button, DialogBox, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';
import { BatchHistoryItemWithUser } from './BatchHistory';

export interface EventDetailsModalProps {
  onClose: () => void;
  selectedEvent: BatchHistoryItemWithUser;
}

export default function EventDetailsModal(props: EventDetailsModalProps): JSX.Element {
  const { onClose, selectedEvent } = props;

  const theme = useTheme();

  const { isMobile } = useDeviceInfo();

  const gridSize = () => (isMobile ? 12 : 6);

  const paddingSeparator = () => (isMobile ? 0 : 1.5);

  const marginTop = {
    marginTop: theme.spacing(2),
  };

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
        <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield id='event' value={selectedEvent.type} type='text' label={strings.EVENT} display={true} />
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
        <Grid item xs={12} sx={marginTop}>
          <Divider />
        </Grid>
        <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='germinationQuantityBefore'
            value={selectedEvent.editedByName}
            type='text'
            label={strings.GERMINATION_QUANTITY_BEFORE}
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='germinationQuantityAfter'
            value={selectedEvent.editedByName}
            type='text'
            label={strings.GERMINATION_QUANTITY_AFTER}
            display={true}
          />
        </Grid>
        <Grid item xs={12} sx={marginTop}>
          <Divider />
        </Grid>
        <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='substrateBefore'
            value={selectedEvent.editedByName}
            type='text'
            label={strings.SUBSTRATE_BEFORE}
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='substrateAfter'
            value={selectedEvent.editedByName}
            type='text'
            label={strings.SUBSTRATE_AFTER}
            display={true}
          />
        </Grid>

        <Grid item xs={12} sx={marginTop}>
          <Divider />
        </Grid>
        <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='notesBefore'
            value={selectedEvent.editedByName}
            type='text'
            label={strings.NOTES_BEFORE}
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
          <Textfield
            id='notesAfter'
            value={selectedEvent.editedByName}
            type='text'
            label={strings.NOTES_AFTER}
            display={true}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
