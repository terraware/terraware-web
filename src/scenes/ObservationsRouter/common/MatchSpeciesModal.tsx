import React, { type JSX, useEffect } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import SpeciesSelector from 'src/components/common/SpeciesSelector';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { MergeOtherSpeciesPayload } from 'src/types/Species';
import useForm from 'src/utils/useForm';

export type MergeOtherSpeciesPayloadPartial = Partial<MergeOtherSpeciesPayload>;

export interface MatchSpeciesModalProps {
  onClose: () => void;
  onSave: (mergeOtherSpeciesPayloads: MergeOtherSpeciesPayloadPartial[]) => void;
  unrecognizedSpecies: string[];
}

export default function MatchSpeciesModal(props: MatchSpeciesModalProps): JSX.Element {
  const { onClose, onSave, unrecognizedSpecies } = props;

  const [records, setRecords] = useForm<MergeOtherSpeciesPayloadPartial[]>(
    unrecognizedSpecies.map((speciesName) => {
      return { otherSpeciesName: speciesName };
    })
  );

  const theme = useTheme();

  const save = () => {
    onSave(records);
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.MATCH_UNRECOGNIZED_SPECIES}
      size='large'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.SAVE} key='button-2' />,
      ]}
      scrolled
    >
      <Box>
        <Typography>{strings.MATCH_SPECIES_MODAL_DESCRIPTION} </Typography>
      </Box>
      <Grid container textAlign={'left'} spacing={1}>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingRight: 1 }}>
          <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontWeight={400}>
            {strings.UNRECOGNIZED_SPECIES}
          </Typography>
        </Grid>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingLeft: 1 }}>
          <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontWeight={400}>
            {strings.SCIENTIFIC_NAME}
          </Typography>
        </Grid>
      </Grid>

      <Grid container textAlign={'left'}>
        {unrecognizedSpecies.map((speciesName, index) => (
          <MatchSpeciesRow
            key={index}
            matchSpeciesPayload={{ otherSpeciesName: speciesName }}
            setRecords={setRecords}
            index={index}
          />
        ))}
      </Grid>
    </DialogBox>
  );
}

export interface MatchSpeciesRowProps {
  matchSpeciesPayload: MergeOtherSpeciesPayloadPartial;
  setRecords: React.Dispatch<
    React.SetStateAction<
      Partial<{
        otherSpeciesName: string;
        speciesId: number;
      }>[]
    >
  >;
  index: number;
}

function MatchSpeciesRow(props: MatchSpeciesRowProps): JSX.Element {
  const { matchSpeciesPayload, setRecords, index } = props;
  const [record, setRecord] = useForm<MergeOtherSpeciesPayloadPartial>(matchSpeciesPayload);
  const theme = useTheme();

  useEffect(() => {
    setRecords((prev) => {
      const prevCopy = [...prev];
      const found = prevCopy.findIndex((pr) => pr.otherSpeciesName === record.otherSpeciesName);
      prevCopy.splice(found, 1);
      return [...prevCopy, record];
    });
  }, [record, setRecords]);

  return (
    <>
      <Grid
        item
        xs={6}
        borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
        paddingBottom={2}
        paddingTop={index === 0 ? 1 : 2}
      >
        <Typography>{record.otherSpeciesName}</Typography>
      </Grid>
      <Grid
        item
        xs={6}
        borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
        paddingBottom={2}
        paddingTop={index === 0 ? 1 : 2}
      >
        <SpeciesSelector record={record} setRecord={setRecord} hideLabel id={`speciesSelector${index}`} />
      </Grid>
    </>
  );
}
