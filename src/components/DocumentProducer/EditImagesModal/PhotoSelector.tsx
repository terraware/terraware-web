import React, { useEffect, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, ErrorBox, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PhotoDragDrop, { PhotoDragDropProps } from 'src/components/Photo/PhotoDragDrop';
import strings from 'src/strings';

export type PhotoChooserErrorType = {
  title: string;
  text: string;
};

export type PhotoChooserProps = Omit<PhotoDragDropProps, 'files' | 'setFiles'> & {
  title?: string;
  description?: string | string[];
  onPhotosChanged: (photos: PhotoWithAttributes[]) => void;
  error?: PhotoChooserErrorType;
  includeCaption?: boolean;
  includeCitation?: boolean;
};

export type PhotoWithAttributes = {
  file: File;
  caption: string;
  citation: string;
};

export type PhotoWithAttributesAndUrl = PhotoWithAttributes & {
  url: string;
};

export default function PhotoChooser(props: PhotoChooserProps): JSX.Element {
  const {
    title,
    description,
    onPhotosChanged,
    multipleSelection,
    error,
    includeCaption = true,
    includeCitation = true,
    ...dragDropProps
  } = props;
  const { isMobile } = useDeviceInfo();
  const [files, setFiles] = useState<File[]>([]);
  const [filesData, setFilesData] = useState<PhotoWithAttributesAndUrl[]>([]);
  const theme = useTheme();
  const [filesDataChanged, setFilesDataChanged] = useState<boolean>(false);

  const removeFileAtIndex = (index: number) => {
    const filesList = [...files];
    filesList.splice(index, 1);
    updateSelection(filesList);
  };

  const updateSelection = (selected: File[]) => {
    setFiles(selected);
  };

  useEffect(() => {
    const filesDataList = files.map((file) => {
      const url = URL.createObjectURL(file);
      return {
        file,
        url,
        caption: '',
        citation: '',
      };
    });

    if (multipleSelection) {
      setFilesData(filesDataList);
      setFilesDataChanged(true);
    } else {
      const lastUploadedIndex = files.length - 1;
      const lastImage = filesDataList[lastUploadedIndex];

      if (lastImage) {
        setFilesData([lastImage]);
        setFilesDataChanged(true);
      } else {
        setFilesData([]);
        setFilesDataChanged(true);
      }
    }

    return () => {
      // we need to clean this up to avoid a memory leak
      filesDataList.forEach((fileData) => URL.revokeObjectURL(fileData.url));
    };
  }, [files, multipleSelection]);

  useEffect(() => {
    if (!filesDataChanged) {
      return;
    }

    onPhotosChanged(filesData);
    setFilesDataChanged(false);
  }, [filesData, onPhotosChanged, filesDataChanged]);

  const updateFileData = (index: number, idToUpdate: string, newValue: string) => {
    const newFile = { ...filesData[index], [idToUpdate]: newValue };
    const newFilesData = [...filesData];
    newFilesData[index] = newFile;
    setFilesData(newFilesData);
    setFilesDataChanged(true);
  };

  return (
    <Box
      tabIndex={0}
      sx={{
        backgroundColor: theme.palette.TwClrBg,
        borderRadius: theme.spacing(4),
        padding: theme.spacing(3),
      }}
    >
      <Box>
        {title && (
          <Typography fontSize={20} fontWeight={600}>
            {title}
          </Typography>
        )}
        {description && (
          <Typography fontSize={14} fontWeight={400} marginTop={theme.spacing(1)} marginBottom={theme.spacing(2)}>
            {Array.isArray(description) ? description.map((txt, i) => <div key={i}>{txt}</div>) : description}
          </Typography>
        )}
        {error && (
          <ErrorBox
            title={error.title}
            text={error.text}
            sx={{
              width: 'auto',
              marginBottom: theme.spacing(2),
              '&.mobile': {
                width: 'auto',
              },
            }}
          />
        )}
        {filesData.length > 0 && (
          <Box display='flex' flexDirection='row' flexWrap='wrap' marginBottom={theme.spacing(2)}>
            {filesData.map((fileData, index) => (
              <Box display='flex' width='100%' key={`photo-${index}`}>
                <Box
                  key={index}
                  position='relative'
                  height={122}
                  width={122}
                  marginRight={isMobile ? theme.spacing(2) : theme.spacing(3)}
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
                    src={fileData.url}
                    alt={files[index]?.name}
                    style={{
                      margin: 'auto auto',
                      objectFit: 'contain',
                      display: 'flex',
                      maxWidth: '120px',
                      maxHeight: '120px',
                    }}
                  />
                </Box>

                {(includeCaption || includeCitation) && (
                  <Box width='100%'>
                    {includeCaption && (
                      <Grid>
                        <Textfield
                          type='text'
                          label={strings.CAPTION}
                          id='citation'
                          value={fileData.caption}
                          onChange={(newValue) => updateFileData(index, 'caption', newValue as string)}
                        />
                      </Grid>
                    )}
                    {includeCitation && (
                      <Grid paddingTop={theme.spacing(2)}>
                        <Textfield
                          type='text'
                          label={strings.CITATION}
                          id='citation'
                          value={fileData.citation}
                          onChange={(newValue) => updateFileData(index, 'citation', newValue as string)}
                        />
                      </Grid>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <PhotoDragDrop {...dragDropProps} multipleSelection={multipleSelection} files={files} setFiles={setFiles} />
    </Box>
  );
}
