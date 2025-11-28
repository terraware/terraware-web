import React, { useCallback } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import { ExistingBiomassMeasurementPayload } from 'src/queries/generated/observations';
import strings from 'src/strings';

type QuadratPosition = 'NorthwestCorner' | 'NortheastCorner' | 'SouthwestCorner' | 'SoutheastCorner';

type QuadratConfig = {
  position: QuadratPosition;
  title: string;
};

const QUADRAT_CONFIG: Record<string, QuadratConfig> = {
  Northwest: { position: 'NorthwestCorner', title: strings.PHOTO_NORTHWEST_QUADRAT },
  Northeast: { position: 'NortheastCorner', title: strings.PHOTO_NORTHEAST_QUADRAT },
  Southwest: { position: 'SouthwestCorner', title: strings.PHOTO_SOUTHWEST_QUADRAT },
  Southeast: { position: 'SoutheastCorner', title: strings.PHOTO_SOUTHEAST_QUADRAT },
};

type QuadratNotesComponentProps = {
  quadrat: string;
  record?: ExistingBiomassMeasurementPayload;
  setRecord: React.Dispatch<React.SetStateAction<ExistingBiomassMeasurementPayload | undefined>>;
};

const QuadratNotesComponent = ({ quadrat, record, setRecord }: QuadratNotesComponentProps) => {
  const theme = useTheme();

  const config = QUADRAT_CONFIG[quadrat];
  const { position, title } = config;

  const quadratData = record?.quadrats.find((quad) => quad.position === position);
  const notesValue = quadratData?.description || '';

  const handleNotesChange = useCallback(
    (newValue: string) => {
      if (!record?.quadrats) {
        return;
      }

      const updatedQuadrats = record.quadrats.map((quad) =>
        quad.position === position ? { ...quad, description: newValue } : quad
      );

      setRecord((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          quadrats: updatedQuadrats,
        };
      });
    },
    [position, record, setRecord]
  );

  const onChangeNotesHandler = useCallback(
    (newValue: unknown) => {
      handleNotesChange(newValue as string);
    },
    [handleNotesChange]
  );

  return (
    <Box>
      <Typography
        fontSize='20px'
        fontWeight={600}
        color={theme.palette.TwClrTxt}
        marginBottom={2}
        paddingTop={quadrat !== 'Northwest' ? 2 : 0}
      >
        {title}
      </Typography>
      <TextField
        id={`notes-${position}`}
        type='textarea'
        label={strings.DESCRIPTION_NOTES}
        value={notesValue}
        onChange={onChangeNotesHandler}
      />
    </Box>
  );
};

export default QuadratNotesComponent;
