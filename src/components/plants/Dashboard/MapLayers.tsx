// https://github.com/visgl/react-map-gl/blob/6.1-release/examples/clusters/src/app.js

import 'mapbox-gl/dist/mapbox-gl.css';
import React from 'react';
import { Layer } from 'react-map-gl';

export default function MapLayers(): JSX.Element {
  return (
    <>
      <Layer
        id='clusters'
        type='circle'
        source='plants'
        filter={['has', 'point_count']}
        paint={{
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6', // point_count<100
            100, '#f1f075', // point_count>100
            750, '#f28cb1', // point_count>750
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, // point_count<100
            100, 30, // point_count>100
            750, 40, // point_count>750
          ],
        }}
      />
      <Layer
        id='cluster-count'
        type='symbol'
        source='plants'
        filter={['has', 'point_count']}
        layout={{
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        }}
        paint={{}}
      />
      <Layer
        id='unclustered-point'
        type='circle'
        source='plants'
        filter={['!', ['has', 'point_count']]}
        paint={{
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 2, // zoom<=10
            14, 4, // zoom<=14
            15, 6, // zoom>5
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        }}
      />
    </>
  );
}