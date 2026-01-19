import React, { type JSX, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { Button, Textfield } from '@terraware/web-components';

import strings from 'src/strings';
import { ImageVariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueImageValue } from 'src/types/documentProducer/VariableValue';
import { getImagePath } from 'src/utils/images';

import PhotoSelector, { PhotoWithAttributes } from '../EditImagesModal/PhotoSelector';

export type DeliverableEditImagesProps = {
  projectId: number;
  setDeletedImages: (values: VariableValueImageValue[]) => void;
  setImages: (values: VariableValueImageValue[]) => void;
  setNewImages: (values: PhotoWithAttributes[]) => void;
  variable: ImageVariableWithValues;
};

const DeliverableEditImages = (props: DeliverableEditImagesProps): JSX.Element => {
  const { variable, projectId, setDeletedImages, setImages, setNewImages } = props;
  const theme = useTheme();
  const [imagesCopy, setImagesCopy] = useState(variable.values);
  const [newImages, setNewImagesLocal] = useState<PhotoWithAttributes[]>();

  const onUpdateImage = (newImage: VariableValueImageValue) => {
    if (imagesCopy) {
      const newImagesCopy = [...imagesCopy];
      const updatedImageIndex = imagesCopy.findIndex((iImage) => iImage.id === newImage.id);
      newImagesCopy[updatedImageIndex] = newImage;
      setImagesCopy(newImagesCopy);
      setImages(newImagesCopy);
    }
  };

  const onFilesChanged = (addedImages: PhotoWithAttributes[]) => {
    setNewImagesLocal(addedImages);
    setNewImages(addedImages);
  };

  const removeFileAtIndex = (index: number) => {
    const newImagesCopy = [...imagesCopy];
    const deleted = newImagesCopy.splice(index, 1);
    setImagesCopy(newImagesCopy);
    setImages(newImagesCopy);
    setDeletedImages(deleted);
  };

  return (
    <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
      {(variable.isList || (!variable.isList && !newImages?.length)) &&
        imagesCopy.map((image, index) => (
          <Box key={`image-${index}`} display='flex' padding={theme.spacing(2, 3)} width='100%'>
            <Box
              position='relative'
              height={122}
              width={122}
              marginLeft={theme.spacing(3)}
              marginTop={theme.spacing(1)}
              border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
            >
              <Button
                icon='iconTrashCan'
                onClick={() => removeFileAtIndex(index)}
                size='small'
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: theme.palette.TwClrBgDanger,
                }}
              />
              <img
                height='120px'
                src={getImagePath(projectId, image.id, 120, 120)}
                alt='doc'
                style={{
                  margin: 'auto auto',
                  objectFit: 'contain',
                  display: 'flex',
                  maxWidth: '120px',
                  maxHeight: '120px',
                }}
              />
            </Box>
            <Box paddingLeft={theme.spacing(3)} width='100%'>
              <Grid>
                <Textfield
                  type='text'
                  label={strings.CAPTION}
                  id='citation'
                  value={image.caption}
                  onChange={(newValue) => onUpdateImage({ ...image, caption: newValue as string })}
                />
              </Grid>
              <Grid paddingTop={theme.spacing(2)}>
                <Textfield
                  type='text'
                  label={strings.CITATION}
                  id='citation'
                  value={image.citation}
                  onChange={(newValue) => onUpdateImage({ ...image, citation: newValue as string })}
                />
              </Grid>
            </Box>
          </Box>
        ))}
      <Grid item xs={12}>
        <PhotoSelector onPhotosChanged={onFilesChanged} multipleSelection={variable.isList} />
      </Grid>
    </Grid>
  );
};

export default DeliverableEditImages;
