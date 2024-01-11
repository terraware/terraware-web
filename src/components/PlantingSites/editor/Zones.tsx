import { useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { Feature, FeatureCollection } from 'geojson';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { GeometryFeature, ReadOnlyBoundary } from 'src/components/Map/types';
import EditableMap, { RenderableReadOnlyBoundary } from 'src/components/Map/EditableMapV2';
import { cutPolygons, toFeature } from 'src/components/Map/utils';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import useMapIcons from 'src/components/Map/useMapIcons';
import StepTitleDescription, { Description } from './StepTitleDescription';

export type ZonesProps = {
  exclusions?: FeatureCollection;
  setZones: (zones?: FeatureCollection) => void;
  site: PlantingSite;
  zones?: FeatureCollection;
};

export default function Zones(props: ZonesProps): JSX.Element {
  const { exclusions, setZones, site, zones } = props;
  const mapIcons = useMapIcons();
  const getRenderAttributes = useRenderAttributes();

  const readOnlyBoundary = useMemo<RenderableReadOnlyBoundary[] | undefined>(() => {
    if (!zones) {
      return undefined;
    }

    const exclusionsBoundary = exclusions
      ? [
          {
            featureCollection: exclusions!,
            id: 'exclusions',
            renderProperties: getRenderAttributes('exclusions'),
          },
        ]
      : [];

    return [
      ...exclusionsBoundary,
      {
        featureCollection: { type: 'FeatureCollection', features: [toFeature(site.boundary!, {}, site.id)] },
        id: 'site',
        renderProperties: getRenderAttributes('site'),
      },
      {
        featureCollection: {
          type: 'FeatureCollection',
          // TODO: fetch id from existing feature if we came from an edit vs create site path
          // the id should be stored in the feature's properties, and retrieved from there
          features: zones!.features.map((feature: Feature, index: number) => ({ ...feature, id: `zone_${index}` })),
        },
        id: 'zone',
        renderProperties: getRenderAttributes('zone'),
      },
    ];
  }, [exclusions, getRenderAttributes, site.boundary, site.id, zones]);

  const description = useMemo<Description[]>(
    () => [
      { text: strings.SITE_ZONE_BOUNDARIES_DESCRIPTION_0 },
      {
        text: strings.SITE_ZONE_BOUNDARIES_DESCRIPTION_1,
        hasTutorial: true,
        handlePrefix: (prefix: string) => strings.formatString(prefix, mapIcons.slice) as JSX.Element[],
      },
    ],
    [mapIcons]
  );

  const onEditableBoundaryChanged = useCallback(
    (featureCollection?: FeatureCollection, isUndoRedo?: boolean) => {
      if (isUndoRedo || !zones) {
        return;
      }

      const cutWith = featureCollection?.features?.[0]?.geometry;
      if (cutWith) {
        const newZones = cutPolygons(zones.features as GeometryFeature[], cutWith);
        if (newZones) {
          setZones({ type: 'FeatureCollection', features: newZones });
        }
      }
      return;
    },
    [zones, setZones]
  );

  const onUndoRedoReadOnlyBoundary = useCallback(
    (updatedData?: ReadOnlyBoundary[]) => {
      setZones(updatedData?.find((data: ReadOnlyBoundary) => data.id === 'zone')?.featureCollection);
    },
    [setZones]
  );

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        dontShowAgainPreferenceName='dont-show-site-zone-boundaries-instructions'
        title={strings.SITE_ZONE_BOUNDARIES}
        tutorialDescription={strings.ADDING_ZONE_BOUNDARIES_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_zone_boundary_instructions_video'
        tutorialTitle={strings.ADDING_ZONE_BOUNDARIES}
      />
      <EditableMap
        clearOnEdit
        onEditableBoundaryChanged={onEditableBoundaryChanged}
        onUndoRedoReadOnlyBoundary={onUndoRedoReadOnlyBoundary}
        readOnlyBoundary={readOnlyBoundary}
      />
    </Box>
  );
}
