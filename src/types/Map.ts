// flattened info for shapes relating to planting site data

export type MapGeometry = number[][][][];

/**
 * Example of a boundary:
 * [
 *   [
 *     [
 *       [-67.13734, 45.13745],
 *       [-66.96466, 44.8097],
 *       [-68.03252, 44.3252],
 *       [-69.06, 43.98],
 *       [-70.11617, 43.68405],
 *       [-70.64573, 43.09008],
 *       [-70.75102, 43.08003],
 *       [-70.79761, 43.21973],
 *     ]
 *   ],
 *   [
 *     [
 *       [-70.98176, 43.36789],
 *       [-70.94416, 43.46633],
 *       [-71.08482, 45.30524],
 *       [-70.66002, 45.46022],
 *       [-70.30495, 45.91479],
 *       [-70.00014, 46.69317],
 *       [-69.23708, 47.44777],
 *       [-68.90478, 47.18479],
 *       [-68.2343, 47.35462],
 *       [-67.79035, 47.06624],
 *       [-67.79141, 45.70258],
 *       [-67.13734, 45.13745]
 *     ]
 *   ]
 * ]
 */

export type MapSourceProperties = { [key: string]: any };

export type MapAnnotation = {
  textField: string; // property field whose value to render as annotation
  textSize: number;
  textColor: string;
};

/**
 * A renderable map entity
 * eg. site, zone, subzone
 */
export type MapEntity = {
  properties: MapSourceProperties;
  boundary: MapGeometry;
  id: number;
};

export type MapSourceBaseData = {
  id: string;
  entities: MapEntity[];
};

export type MapSource = MapSourceBaseData & {
  fillColor: string;
  lineColor: string;
  lineWidth: number;
  isInteractive?: boolean;
  // property name to render as a polygon annotation
  annotation?: MapAnnotation;
  highlightFillColor?: string;
  hoverFillColor?: string;
  selectFillColor?: string;
};

export type MapBoundingBox = {
  lowerLeft: [number, number];
  upperRight: [number, number];
};

export type MapOptions = {
  bbox: MapBoundingBox;
  sources: MapSource[];
};

/**
 * Render a popup based on properties
 */
export type MapPopupRenderer = {
  render: (properties: MapSourceProperties) => JSX.Element;
  style?: object;
  className?: string;
};

/**
 * Model an identifiable entity
 */
export type MapEntityId = {
  id?: number; // id of entity, undefined for unknown
  sourceId: string; // source type of entity 'subzone', 'zone', 'site', etc.
};

/**
 * map entity options
 */
export type MapEntityOptions = {
  highlight?: MapEntityId;
  focus?: MapEntityId;
};
