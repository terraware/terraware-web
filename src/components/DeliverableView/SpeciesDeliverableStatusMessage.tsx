import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { ViewProps } from 'src/components/DeliverableView/types';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { SpeciesForAcceleratorProject } from 'src/types/AcceleratorProjectSpecies';

type Props = ViewProps & {
  species?: SpeciesForAcceleratorProject[] | undefined;
};

const SpeciesDeliverableStatusMessage = ({ deliverable, species }: Props): JSX.Element | null => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const rejectedSpecies = species?.filter((s) => s.participantProjectSpecies.submissionStatus === 'Rejected');

  return !activeLocale ? null : (
    <>
      {deliverable?.status === 'Approved' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={strings.THIS_DELIVERABLE_HAS_BEEN_APPROVED_SPECIES}
            priority='success'
            title={strings.DELIVERABLE_APPROVED}
            type='page'
          />
        </Box>
      )}

      {deliverable?.status === 'Rejected' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={deliverable?.feedback || ''}
            priority='critical'
            title={
              isAcceleratorRoute
                ? strings.PRELIMINARY_SPECIES_USAGE_LIST_UPDATE_REQUESTED
                : strings.PRELIMINARY_SPECIES_USAGE_LIST_UPDATE_NEEDED
            }
            type='page'
          />
        </Box>
      )}

      {!!rejectedSpecies?.length && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={
              <ul>
                {rejectedSpecies.map((_species, index) => (
                  <li key={index}>
                    {_species.species.scientificName}
                    {_species.participantProjectSpecies.feedback
                      ? `: ${_species.participantProjectSpecies.feedback}`
                      : ''}
                  </li>
                ))}
              </ul>
            }
            priority='critical'
            title={strings.SPECIES_NOT_ACCEPTED}
            type='page'
          />
        </Box>
      )}
    </>
  );
};

export default SpeciesDeliverableStatusMessage;
