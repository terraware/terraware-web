import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { BusySpinner, Button, DialogBox, FileChooser, Message } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import Icon from 'src/components/common/icon/Icon';
import { useDocLinks } from 'src/docLinks';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { BoundaryFileFormat, MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization } from 'src/providers';
import {
  GeometryFileErrorCode,
  ParseDraftPlantingSiteBoundaryResponsePayload,
  useParseDraftPlantingSiteBoundaryMutation,
} from 'src/queries/generated/draftPlantingSites';
import defaultStrings from 'src/strings';

export const BOUNDARY_FILE_EXTENSIONS = '.kml,.kmz,.geojson,.json,.zip';

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;
// the limit the server enforces with a 413; also quoted in UPLOAD_SITE_BOUNDARY_DESCRIPTION
const MAX_FILE_SIZE_MB = 10;

// dropped files bypass the file input's accept filter, so the extension is checked again here
const hasBoundaryFileExtension = (filename: string): boolean =>
  BOUNDARY_FILE_EXTENSIONS.split(',').some((extension) => filename.toLowerCase().endsWith(extension));

const fileSizeText = (strings: typeof defaultStrings, bytes: number): string =>
  bytes < BYTES_PER_KB
    ? (strings.formatString(strings.FILE_SIZE_BYTES, `${bytes}`) as string)
    : bytes < BYTES_PER_MB
      ? (strings.formatString(strings.FILE_SIZE_KB, `${Math.round(bytes / BYTES_PER_KB)}`) as string)
      : (strings.formatString(strings.FILE_SIZE_MB, (bytes / BYTES_PER_MB).toFixed(1)) as string);

export const fileSizeKb = (bytes: number): number => Math.round(bytes / BYTES_PER_KB);

export const boundaryFileFormatOf = (
  format: NonNullable<ParseDraftPlantingSiteBoundaryResponsePayload['format']>
): BoundaryFileFormat => format.toLowerCase() as BoundaryFileFormat;

/** A parse response that actually carries a boundary; the payload leaves those fields off on failure. */
export type ParsedBoundary = Required<
  Pick<ParseDraftPlantingSiteBoundaryResponsePayload, 'areaHa' | 'filename' | 'format' | 'geometry' | 'numPolygons'>
>;

/**
 * Server-reported problem, or a stand-in for a request that never got far enough to report one:
 * a 413 when the file exceeds the upload limit, and anything else that failed outright.
 */
type BoundaryUploadError = GeometryFileErrorCode | 'FileTooLarge' | 'Unknown';

export type UploadBoundaryModalProps = {
  onClose: () => void;
  onSuccess: (parsed: ParsedBoundary, file: File) => void;
};

const isPayloadTooLarge = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as FetchBaseQueryError).status === 413;

const errorMessageFor = (strings: typeof defaultStrings, error: BoundaryUploadError, fileSizeMb: number): string => {
  switch (error) {
    case 'FileTooLarge':
      return strings.formatString(
        strings.UPLOAD_SITE_BOUNDARY_ERROR_FILE_TOO_LARGE,
        fileSizeMb.toFixed(1),
        `${MAX_FILE_SIZE_MB}`
      ) as string;
    case 'UnsupportedFormat':
      return strings.UPLOAD_SITE_BOUNDARY_ERROR_UNSUPPORTED_FORMAT;
    case 'InvalidFile':
      return strings.UPLOAD_SITE_BOUNDARY_ERROR_INVALID_FILE;
    case 'NoKmlInArchive':
      return strings.UPLOAD_SITE_BOUNDARY_ERROR_NO_KML_IN_ARCHIVE;
    case 'NoShapefile':
      return strings.UPLOAD_SITE_BOUNDARY_ERROR_NO_SHAPEFILE;
    case 'MultipleShapefiles':
      return strings.UPLOAD_SITE_BOUNDARY_ERROR_MULTIPLE_SHAPEFILES;
    case 'UnknownCoordinateSystem':
      return strings.UPLOAD_SITE_BOUNDARY_ERROR_UNKNOWN_COORDINATE_SYSTEM;
    case 'NoPolygons':
      return strings.UPLOAD_SITE_BOUNDARY_ERROR_NO_POLYGONS;
    case 'InvalidGeometry':
      return strings.UPLOAD_SITE_BOUNDARY_ERROR_INVALID_GEOMETRY;
    case 'TooManyVertices':
      return strings.UPLOAD_SITE_BOUNDARY_ERROR_TOO_MANY_VERTICES;
    default:
      return strings.UPLOAD_SITE_BOUNDARY_ERROR_GENERIC;
  }
};

const parsedBoundaryOf = ({
  areaHa,
  filename,
  format,
  geometry,
  numPolygons,
}: ParseDraftPlantingSiteBoundaryResponsePayload): ParsedBoundary | undefined =>
  areaHa !== undefined && format !== undefined && geometry !== undefined && numPolygons !== undefined
    ? { areaHa, filename, format, geometry, numPolygons }
    : undefined;

/**
 * Dialog to pick a spatial file and have the server parse it into a site boundary.
 */
export default function UploadBoundaryModal({ onClose, onSuccess }: UploadBoundaryModalProps): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();
  const docLinks = useDocLinks();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<BoundaryUploadError | undefined>();
  const [parseBoundary, { isLoading }] = useParseDraftPlantingSiteBoundaryMutation();
  const trackEvent = useTrackEvent();

  const trackFailure = useCallback(
    (file: File, errorCode: string, format?: ParseDraftPlantingSiteBoundaryResponsePayload['format']) =>
      trackEvent(MIXPANEL_EVENTS.PLANTING_SITE_BOUNDARY_UPLOAD_FAILED, {
        format: format ? boundaryFileFormatOf(format) : 'unknown',
        file_size_kb: fileSizeKb(file.size),
        error_code: errorCode,
      }),
    [trackEvent]
  );

  const selectedFileText = useMemo<string | undefined>(
    () => (files[0] ? fileSizeText(strings, files[0].size) : undefined),
    [files, strings]
  );

  const errorMessage = useMemo<string | undefined>(
    () => (error ? errorMessageFor(strings, error, (files[0]?.size ?? 0) / BYTES_PER_MB) : undefined),
    [error, files, strings]
  );

  const tooLarge = useMemo<boolean>(() => (files[0]?.size ?? 0) > MAX_FILE_SIZE_MB * BYTES_PER_MB, [files]);
  const unsupportedExtension = useMemo<boolean>(
    () => files[0] !== undefined && !hasBoundaryFileExtension(files[0].name),
    [files]
  );

  const onSelectFiles = useCallback(
    (selected: File[]) => {
      const file = selected[selected.length - 1];
      if (file && !hasBoundaryFileExtension(file.name)) {
        trackFailure(file, 'client_extension');
        setError('UnsupportedFormat');
      } else if (file && file.size > MAX_FILE_SIZE_MB * BYTES_PER_MB) {
        trackFailure(file, 'client_size');
        setError('FileTooLarge');
      } else {
        setError(undefined);
      }
      setFiles(file ? [file] : []);
    },
    [trackFailure]
  );

  const onUpload = useCallback(() => {
    const file = files[0];
    if (!file || tooLarge || unsupportedExtension) {
      return;
    }

    const upload = async () => {
      setError(undefined);

      try {
        const parsed = await parseBoundary({ file }).unwrap();

        // the endpoint reports content validation problems with a 200 and no geometry
        const problem = parsed.problems?.[0];
        if (problem) {
          trackFailure(file, problem.code, parsed.format);
          setError(problem.code);
          return;
        }

        const boundary = parsedBoundaryOf(parsed);
        if (!boundary) {
          trackFailure(file, 'server_error', parsed.format);
          setError('Unknown');
          return;
        }

        onSuccess(boundary, file);
      } catch (e) {
        const payloadTooLarge = isPayloadTooLarge(e);
        trackFailure(file, payloadTooLarge ? 'FileTooLarge' : 'server_error');
        setError(payloadTooLarge ? 'FileTooLarge' : 'Unknown');
      }
    };

    void upload();
  }, [files, onSuccess, parseBoundary, tooLarge, trackFailure, unsupportedExtension]);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.UPLOAD_SITE_BOUNDARY}
      size='large'
      skrim
      style={{ borderRadius: theme.spacing(1), position: 'absolute' }}
      middleButtons={[
        <Button
          id='cancel-upload-boundary'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id='confirm-upload-boundary'
          label={strings.UPLOAD}
          onClick={onUpload}
          disabled={files.length === 0 || isLoading || tooLarge || unsupportedExtension}
          key='button-2'
        />,
      ]}
    >
      {isLoading && <BusySpinner withSkrim={true} />}
      <Box display='flex' flexDirection='column' textAlign='left'>
        <FileChooser
          acceptFileType={BOUNDARY_FILE_EXTENSIONS}
          chooseFileText={strings.CHOOSE_FILE}
          files={files}
          fileSelectedText={selectedFileText}
          replaceFileText={strings.REPLACE_FILE}
          setFiles={onSelectFiles}
          uploadDescription={strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION}
          uploadText={strings.UPLOAD_SITE_BOUNDARY}
        />
        {errorMessage && (
          <Box marginTop={theme.spacing(1.75)}>
            <Message body={errorMessage} priority='critical' type='page' />
          </Box>
        )}
        <Typography
          fontSize='12px'
          fontWeight={400}
          lineHeight='18px'
          color={theme.palette.TwClrTxtSecondary}
          margin={theme.spacing(2, 0, 1)}
        >
          {strings.UPLOAD_SITE_BOUNDARY_ACCEPTED_FORMATS}
        </Typography>
        <Link
          fontSize='13px'
          style={{ alignItems: 'center', alignSelf: 'center', display: 'inline-flex', gap: theme.spacing(0.5) }}
          to={docLinks.knowledge_base_stratification}
          target='_blank'
        >
          <Icon name='help' size='small' style={{ fill: theme.palette.TwClrIcnSuccess }} />
          {strings.UPLOAD_SITE_BOUNDARY_HELP_LINK}
        </Link>
      </Box>
    </DialogBox>
  );
}
