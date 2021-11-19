import 'mapbox-gl/dist/mapbox-gl.css';
import React from 'react';

interface DisplayPhotoProps {
  photoUrl?: string;
  style?: React.CSSProperties;
}

export default function DisplayPhoto(props: DisplayPhotoProps): JSX.Element {
  const { photoUrl, style } = props;
  return (
    <>{photoUrl && <img alt='Plant' src={photoUrl} style={{ maxHeight: '100px', display: 'block', ...style }} />}</>
  );
}
