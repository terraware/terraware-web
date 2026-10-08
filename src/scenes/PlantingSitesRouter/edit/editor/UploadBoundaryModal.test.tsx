import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { Polygon } from 'geojson';

import { GeometryFileErrorCode } from 'src/queries/generated/draftPlantingSites';
import UploadBoundaryModal from 'src/scenes/PlantingSitesRouter/edit/editor/UploadBoundaryModal';
import strings from 'src/strings';
import { captureRequests, mockError, mockPost, renderWithProviders } from 'src/test-utils';

const PARSE_URL = '/api/v1/tracking/draftSites/boundaryFile';

const GEOMETRY: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [0, 0.02],
      [0.02, 0.02],
      [0.02, 0],
      [0, 0],
    ],
  ],
};

const renderModal = () => {
  const onSuccess = rstest.fn();
  const onClose = rstest.fn();
  const rendered = renderWithProviders(<UploadBoundaryModal onClose={onClose} onSuccess={onSuccess} />);

  return { ...rendered, onClose, onSuccess };
};

// building a multi-megabyte File would be wasteful, and only the reported size matters here
const fileOfSize = (filename: string, sizeMb: number): File => {
  const file = new File(['{}'], filename, { type: 'application/json' });
  Object.defineProperty(file, 'size', { value: Math.round(sizeMb * 1024 * 1024) });
  return file;
};

// FileChooser hides its input and drives it from the Choose File button, so there is no
// accessible handle to query by.
const chooseFile = async (user: ReturnType<typeof renderModal>['user'], file: File | string) => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  await user.upload(input, typeof file === 'string' ? new File(['{}'], file, { type: 'application/json' }) : file);
};

const uploadFile = async (user: ReturnType<typeof renderModal>['user'], file: File | string = 'site.geojson') => {
  await chooseFile(user, file);
  await user.click(screen.getByRole('button', { name: strings.UPLOAD }));
};

describe('UploadBoundaryModal', () => {
  const problemMessages: [GeometryFileErrorCode, () => string][] = [
    ['UnsupportedFormat', () => strings.UPLOAD_SITE_BOUNDARY_ERROR_UNSUPPORTED_FORMAT],
    ['InvalidFile', () => strings.UPLOAD_SITE_BOUNDARY_ERROR_INVALID_FILE],
    ['NoKmlInArchive', () => strings.UPLOAD_SITE_BOUNDARY_ERROR_NO_KML_IN_ARCHIVE],
    ['NoShapefile', () => strings.UPLOAD_SITE_BOUNDARY_ERROR_NO_SHAPEFILE],
    ['MultipleShapefiles', () => strings.UPLOAD_SITE_BOUNDARY_ERROR_MULTIPLE_SHAPEFILES],
    ['UnknownCoordinateSystem', () => strings.UPLOAD_SITE_BOUNDARY_ERROR_UNKNOWN_COORDINATE_SYSTEM],
    ['NoPolygons', () => strings.UPLOAD_SITE_BOUNDARY_ERROR_NO_POLYGONS],
    ['InvalidGeometry', () => strings.UPLOAD_SITE_BOUNDARY_ERROR_INVALID_GEOMETRY],
    ['TooManyVertices', () => strings.UPLOAD_SITE_BOUNDARY_ERROR_TOO_MANY_VERTICES],
  ];

  it.each(problemMessages)(
    'explains the %s problem the server reported and keeps the boundary unchanged',
    async (code, message) => {
      // the endpoint reports content validation problems with a 200 and no geometry
      mockPost(PARSE_URL, { filename: 'site.geojson', problems: [{ code }] });
      const { onSuccess, user } = renderModal();

      await uploadFile(user);

      expect(await screen.findByText(message())).toBeInTheDocument();
      expect(onSuccess).not.toHaveBeenCalled();
    }
  );

  const tooLargeMessage = () =>
    strings.formatString(strings.UPLOAD_SITE_BOUNDARY_ERROR_FILE_TOO_LARGE, '14.2', '10') as string;

  it('reports an oversized file as soon as it is chosen, without uploading it', async () => {
    const requests = captureRequests('post', PARSE_URL);
    const { onSuccess, user } = renderModal();

    await chooseFile(user, fileOfSize('survey-raw.zip', 14.2));

    expect(await screen.findByText(tooLargeMessage())).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.UPLOAD })).toBeDisabled();
    expect(requests).toHaveLength(0);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('clears the too-large error when a file within the limit is chosen', async () => {
    const { user } = renderModal();

    await chooseFile(user, fileOfSize('survey-raw.zip', 14.2));
    expect(await screen.findByText(tooLargeMessage())).toBeInTheDocument();

    await chooseFile(user, fileOfSize('site.geojson', 2));

    // FileChooser names the selected file, so this also proves the second choice replaced the first
    expect(await screen.findByText('site.geojson')).toBeInTheDocument();
    expect(screen.queryByText('survey-raw.zip')).not.toBeInTheDocument();
    expect(screen.queryByText(tooLargeMessage())).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.UPLOAD })).toBeEnabled();
  });

  it('reports the file size against the limit when the server rejects the upload as too large', async () => {
    // backstop for a server limit lower than the one enforced at selection time
    mockError('post', PARSE_URL, 413);
    const { onSuccess, user } = renderModal();

    await uploadFile(user, fileOfSize('survey-raw.zip', 14.2 / 2));

    const message = strings.formatString(strings.UPLOAD_SITE_BOUNDARY_ERROR_FILE_TOO_LARGE, '7.1', '10') as string;
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows a generic error and keeps the boundary unchanged when the request fails', async () => {
    mockError('post', PARSE_URL);
    const { onSuccess, user } = renderModal();

    await uploadFile(user);

    expect(await screen.findByText(strings.UPLOAD_SITE_BOUNDARY_ERROR_GENERIC)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows a generic error when the parse succeeds but returns no boundary', async () => {
    mockPost(PARSE_URL, { filename: 'site.geojson' });
    const { onSuccess, user } = renderModal();

    await uploadFile(user);

    expect(await screen.findByText(strings.UPLOAD_SITE_BOUNDARY_ERROR_GENERIC)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('hands the parsed boundary back without an error when the file parses', async () => {
    mockPost(PARSE_URL, {
      areaHa: 480,
      filename: 'site.geojson',
      format: 'GeoJSON',
      geometry: GEOMETRY,
      numPolygons: 1,
    });
    const { onSuccess, user } = renderModal();

    await uploadFile(user);

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith({
        areaHa: 480,
        filename: 'site.geojson',
        format: 'GeoJSON',
        geometry: GEOMETRY,
        numPolygons: 1,
      })
    );
    expect(screen.queryByText(strings.UPLOAD_SITE_BOUNDARY_ERROR_GENERIC)).not.toBeInTheDocument();
  });

  it('clears the error message when a different file is chosen', async () => {
    mockPost(PARSE_URL, { filename: 'site.geojson', problems: [{ code: 'NoPolygons' }] });
    const { user } = renderModal();

    await uploadFile(user);
    expect(await screen.findByText(strings.UPLOAD_SITE_BOUNDARY_ERROR_NO_POLYGONS)).toBeInTheDocument();

    await chooseFile(user, 'other.geojson');

    expect(screen.queryByText(strings.UPLOAD_SITE_BOUNDARY_ERROR_NO_POLYGONS)).not.toBeInTheDocument();
  });
});
