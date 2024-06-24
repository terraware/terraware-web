const getImagePath = (documentId: number, imageId: number, maxHeight?: number, maxWidth?: number): string => {
  let path = `/api/v1/documents/${documentId}/images/${imageId}`;

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
