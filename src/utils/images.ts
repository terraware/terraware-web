const getImagePath = (projectId: number, imageId: number, maxHeight?: number, maxWidth?: number): string => {
  let path = `/api/v1/document-producer/projects/${projectId}/images/${imageId}`;

  if (maxHeight !== undefined || maxWidth !== undefined) {
    path += '?';
    if (maxHeight !== undefined) {
      path += `maxHeight=${maxHeight}&`;
    }
    if (maxWidth !== undefined) {
      path += `maxWidth=${maxWidth}`;
    }
  }

  return path;
};

export { getImagePath };
