import React from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { ViewProps } from 'src/components/DeliverableView/types';
import { useLocalization } from 'src/providers/hooks';
import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';

type Props = ViewProps & {
  species?: ParticipantProjectSpecies[] | undefined;
};

const SpeciesDeliverableStatusMessage = ({ deliverable, species }: Props): JSX.Element | null => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const rejectedSpecies = species?.filter((s) => s.status === 'Rejected');

  return !activeLocale ? null : (
    <>
      {deliverable?.status === 'Approved' && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={strings.THIS_DELIVERABLE_HAS_BEEN_APPROVED}
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
            title={strings.PRELIMINARY_SPECIES_USAGE_LIST_NOT_ACCEPTED}
            type='page'
          />
        </Box>
      )}

      {!!rejectedSpecies?.length && (
        <Box marginBottom={theme.spacing(4)}>
          <Message
            body={
              <ul>
                {rejectedSpecies.map((species, index) => (
                  <li key={index}>
                    {species.speciesScientificName || species.speciesCommonName}
                    {species.feedback ? `: ${species.feedback}` : ''}
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
