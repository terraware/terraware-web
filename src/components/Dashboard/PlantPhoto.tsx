import 'mapbox-gl/dist/mapbox-gl.css';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { uniquePhotoForFeatureSelectorFamily } from '../../state/selectors/photos';
import strings from '../../strings';

interface Props {
  featureId?: number;
  style?: React.CSSProperties;
}

export default function PlantWrapper(props: Props): JSX.Element {
  return (
    <React.Suspense fallback={strings.LOADING}>
      <PlantPhoto {...props} />
    </React.Suspense>
  );
}

function PlantPhoto({ featureId, style }: Props): JSX.Element {
  const photoFeature = useRecoilValue(uniquePhotoForFeatureSelectorFamily(featureId));

  return (
    <>
      {photoFeature && (
        <img
          alt='Plant'
          src={photoFeature.imgSrc}
          style={{ maxHeight: '100px', display: 'block', ...style }}
          id='feature-image'
        />
      )}
    </>
  );
}
