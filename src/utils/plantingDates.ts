import { ScheduledDatePayload } from 'src/queries/generated/plantingSeasons';
import { PlantingDateRequestRow } from 'src/queries/search/plantingDateRequests';

const scheduledDateSpeciesKey = ({ quantity, speciesId, substratumId }: ScheduledDatePayload['species'][0]) =>
  `${substratumId}-${speciesId}-${quantity}`;

const requestSpeciesKey = (substratumId: number, species: PlantingDateRequestRow['substrata'][0]['species'][0]) =>
  `${substratumId}-${species.speciesId}-${species.quantity}`;

const scheduledDateMatchesRequest = (scheduledDate: ScheduledDatePayload, request: PlantingDateRequestRow): boolean => {
  const scheduledSpeciesKeys = scheduledDate.species.map(scheduledDateSpeciesKey).sort();
  const requestSpeciesKeys = request.substrata
    .flatMap((substratum) => substratum.species.map((species) => requestSpeciesKey(substratum.substratumId, species)))
    .sort();

  return (
    scheduledSpeciesKeys.length === requestSpeciesKeys.length &&
    scheduledSpeciesKeys.every((key, index) => key === requestSpeciesKeys[index])
  );
};

/**
 * Planting date requests don't carry the ID of the scheduled planting date they came from, so find it by date. When a
 * season has more than one scheduled date on the same day, pick the one whose species targets match the request.
 */
export const findScheduledDateForRequest = (
  scheduledDates: ScheduledDatePayload[],
  request: PlantingDateRequestRow
): ScheduledDatePayload | undefined => {
  const dateMatches = scheduledDates.filter((scheduledDate) => scheduledDate.date === request.date);
  if (dateMatches.length === 1) {
    return dateMatches[0];
  }
  return dateMatches.find((scheduledDate) => scheduledDateMatchesRequest(scheduledDate, request));
};
