import { useCallback } from 'react';

import _ from 'lodash';

import {
  useCreateSubLocationMutation,
  useDeleteSubLocationMutation,
  useLazyListSubLocationsQuery,
  useUpdateSubLocationMutation,
} from 'src/queries/generated/facilities';
import { PartialSubLocation } from 'src/types/Facility';

const hasSameId = (location1: PartialSubLocation, location2: PartialSubLocation) => location1.id === location2.id;

const isRenamed = (location1: PartialSubLocation, location2: PartialSubLocation) =>
  location1.id === location2.id && location1.name !== location2.name;

export const useSaveSubLocations = () => {
  const [listSubLocations] = useLazyListSubLocationsQuery();
  const [createSubLocation] = useCreateSubLocationMutation();
  const [updateSubLocation] = useUpdateSubLocationMutation();
  const [deleteSubLocation] = useDeleteSubLocationMutation();

  return useCallback(
    async (facilityId: number, editedSubLocations: PartialSubLocation[]) => {
      const { subLocations } = await listSubLocations(facilityId).unwrap();

      const toDelete = _.differenceWith(subLocations, editedSubLocations, hasSameId);
      const toCreate = _.differenceWith(editedSubLocations, subLocations, hasSameId);
      const toRename = _.intersectionWith(editedSubLocations, subLocations, isRenamed);

      await Promise.all([
        ...toDelete.map((location) => deleteSubLocation({ facilityId, subLocationId: location.id }).unwrap()),
        ...toRename.map((location) =>
          updateSubLocation({
            facilityId,
            subLocationId: location.id as number,
            updateSubLocationRequestPayload: { name: location.name as string },
          }).unwrap()
        ),
        ...toCreate.map((location) =>
          createSubLocation({
            facilityId,
            createSubLocationRequestPayload: { name: location.name as string },
          }).unwrap()
        ),
      ]);
    },
    [listSubLocations, createSubLocation, updateSubLocation, deleteSubLocation]
  );
};
