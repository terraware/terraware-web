import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, Message, SelectT } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useDocLinks } from 'src/docLinks';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { requestCreateAcceleratorProjectSpecies } from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesAsyncThunks';
import { selectAcceleratorProjectSpeciesCreateRequest } from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { CreateAcceleratorProjectSpeciesRequestPayload } from 'src/services/AcceleratorProjectSpeciesService';
import strings from 'src/strings';
import { SpeciesForAcceleratorProject, getSpeciesNativeCategoryOptions } from 'src/types/AcceleratorProjectSpecies';
import { Species } from 'src/types/Species';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import TextWithLink from '../common/TextWithLink';

export interface AddSpeciesModalProps {
  hasActiveDeliverable: boolean;
  hasRecentDeliverable: boolean;
  onClose: () => void;
  acceleratorProjectSpecies: SpeciesForAcceleratorProject[];
  projectId: number;
  reload: () => void;
}

export default function AddSpeciesModal(props: AddSpeciesModalProps): JSX.Element {
  const { hasActiveDeliverable, hasRecentDeliverable, onClose, acceleratorProjectSpecies, reload, projectId } = props;

  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { currentAcceleratorProject } = useParticipantData();
  const theme = useTheme();
  const docLinks = useDocLinks();

  const { species } = useSpeciesData();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectAcceleratorProjectSpeciesCreateRequest(requestId));

  const [error, setError] = useState<string>('');

  const selectableSpecies = useMemo(() => {
    return (
      species.filter((_species) => {
        return !acceleratorProjectSpecies?.find((projectSpecies) => _species.id === projectSpecies.species.id);
      }) ?? []
    );
  }, [species, acceleratorProjectSpecies]);

  const [record, setRecord, , onChangeCallback] = useForm<Partial<CreateAcceleratorProjectSpeciesRequestPayload>>({
    projectId: -1,
  });
  const { activeLocale } = useLocalization();

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      reload();
      onClose();
    }
  }, [result, snackbar, onClose, reload]);

  useEffect(() => {
    setRecord((prev) => ({
      ...prev,
      projectId,
    }));
  }, [projectId, setRecord]);

  const save = () => {
    const payload: CreateAcceleratorProjectSpeciesRequestPayload = {
      ...record,
    } as CreateAcceleratorProjectSpeciesRequestPayload;

    if (!payload || !payload.projectId || !payload.rationale || !payload.speciesId || !payload.speciesNativeCategory) {
      setError(strings.REQUIRED_FIELD);
      return;
    }

    setError('');
    const request = dispatch(requestCreateAcceleratorProjectSpecies(payload));
    setRequestId(request.requestId);
  };

  const onChangeSpecies = (newSpecies: Species) => {
    setRecord((prev) => ({
      ...prev,
      speciesId: newSpecies.id,
    }));
  };

  const onChangeRationale = (rationale: unknown) => {
    setRecord((prev) => ({
      ...prev,
      rationale: `${rationale as string}`,
    }));
  };

  const message = hasActiveDeliverable
    ? strings.SPECIES_LIST_DELIVERABLE_ADD_SPECIES_ACTIVE_DELIVERABLE_INFO
    : hasRecentDeliverable
      ? strings.SPECIES_LIST_DELIVERABLE_ADD_SPECIES_RECENT_DELIVERABLE_INFO
      : false;

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.ADD_SPECIES_TO_PROJECT}
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
        <Button id='save' onClick={save} label={strings.ADD_TO_PROJECT} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'}>
        {message && (
          <Grid item xs={12} sx={{ marginBottom: theme.spacing(2) }}>
            <Message body={message} priority='info' type='page' />
          </Grid>
        )}

        {selectableSpecies.length === 0 && (
          <Grid item xs={12} sx={{ marginBottom: theme.spacing(2) }}>
            <Message
              title={strings.SPECIES_LIST_NO_ORGANIZATION_SPECIES_TITLE}
              body={
                <Typography display={'inline'} whiteSpace={'wrap'}>
                  <TextWithLink
                    href={docLinks.knowledge_base_add_species}
                    isExternal
                    style={{
                      position: 'relative',
                      bottom: '1px',
                    }}
                    text={strings.SPECIES_LIST_NO_ORGANIZATION_SPECIES_BODY}
                  />
                </Typography>
              }
              priority='warning'
              type='page'
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            id='project-name'
            label={strings.NAME}
            type='text'
            display={true}
            value={currentAcceleratorProject?.name}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <SelectT<Species>
            id='scientificName'
            label={strings.SCIENTIFIC_NAME}
            placeholder={strings.SELECT}
            options={selectableSpecies.sort((a: Species, b: Species) =>
              a.scientificName.localeCompare(b.scientificName)
            )}
            onChange={onChangeSpecies}
            selectedValue={species.find((_species) => record?.speciesId === _species.id)}
            fullWidth={true}
            isEqual={(a: Species, b: Species) => a.id === b.id}
            renderOption={(_species: Species) => _species?.scientificName || ''}
            displayLabel={(_species: Species) => _species?.scientificName || ''}
            toT={(scientificName: string) =>
              ({
                scientificName,
              }) as Species
            }
            required
            disabled={selectableSpecies.length === 0}
            errorText={error && !record?.speciesId ? error : ''}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <Dropdown
            id='speciesNativeCategory'
            selectedValue={record?.speciesNativeCategory}
            onChange={onChangeCallback('speciesNativeCategory')}
            options={getSpeciesNativeCategoryOptions(activeLocale)}
            label={strings.NATIVE_NON_NATIVE}
            aria-label={strings.NATIVE_NON_NATIVE}
            placeholder={strings.SELECT}
            fixedMenu
            required
            fullWidth={true}
            errorText={error && !record?.speciesNativeCategory ? error : ''}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <TextField
            id='rationale'
            label={strings.RATIONALE}
            type='textarea'
            value={record?.rationale}
            onChange={onChangeRationale}
            errorText={error && !record?.rationale ? error : ''}
            required
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
