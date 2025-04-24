import React, { useMemo } from 'react';

import { Box, Typography } from '@mui/material';
import { Button, Message } from '@terraware/web-components';

import strings from 'src/strings';

export interface UnrecognizedSpeciesPageMessageProps {
  setShowMatchSpeciesModal: (showMatchSpeciesModal: boolean) => void;
  setShowPageMessage: (showPageMessage: boolean) => void;
  unrecognizedSpecies: string[];
}

export default function UnrecognizedSpeciesPageMessage(props: UnrecognizedSpeciesPageMessageProps) {
  const { setShowMatchSpeciesModal, setShowPageMessage, unrecognizedSpecies } = props;

  const pageMessage = useMemo(
    () => (
      <Box key='unrecognized-species-message'>
        <Typography>{strings.UNRECOGNIZED_SPECIES_MESSAGE}</Typography>
        <ul style={{ margin: 0 }}>
          {unrecognizedSpecies.map((species, index) => (
            <li key={`species-${index}`}>{species}</li>
          ))}
        </ul>
      </Box>
    ),
    [unrecognizedSpecies]
  );

  return (
    <Box marginTop={1} marginBottom={4} width={'100%'}>
      <Message
        body={pageMessage}
        onClose={() => setShowPageMessage(false)}
        priority='warning'
        showCloseButton
        title={strings.UNRECOGNIZED_SPECIES}
        type='page'
        pageButtons={[
          <Button
            onClick={() => setShowPageMessage(false)}
            label={strings.DISMISS}
            priority='secondary'
            type='passive'
            key='button-1'
            size='small'
          />,
          <Button
            onClick={() => setShowMatchSpeciesModal(true)}
            label={strings.MATCH_SPECIES}
            priority='secondary'
            type='passive'
            key='button-2'
            size='small'
          />,
        ]}
      />
    </Box>
  );
}
