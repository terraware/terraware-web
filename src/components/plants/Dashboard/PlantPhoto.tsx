import 'mapbox-gl/dist/mapbox-gl.css';
import React from 'react';
import { useRecoilValue } from 'recoil';
import ErrorBoundary from 'src/ErrorBoundary';
import { uniquePhotoForFeatureSelectorFamily } from 'src/state/selectors/plants/photos';
import strings from 'src/strings';

interface Props {
  featureId?: number;
  style?: React.CSSProperties;
}

export default function PlantWrapper(props: Props): JSX.Element {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={strings.LOADING}>
        <PlantPhoto {...props} />
      </React.Suspense>
    </ErrorBoundary>
  );
}

function PlantPhoto({ featureId, style }: Props): JSX.Element {
  const photoFeature = useRecoilValue(
    uniquePhotoForFeatureSelectorFamily(featureId)
  );

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
