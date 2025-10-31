import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response2 } from 'src/services/HttpService';

// endpoints
const FUNDER_ACTIVITIES_ENDPOINT = '/api/v1/funder/activities';
export const FUNDER_ACTIVITY_MEDIA_FILE_ENDPOINT = '/api/v1/funder/activities/{activityId}/media/{fileId}';

// responses
type PublishFunderActivitiesResponse =
  paths[typeof FUNDER_ACTIVITIES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpPublishedActivities = HttpService.root(FUNDER_ACTIVITIES_ENDPOINT);

const getAll = async (
  projectId: number,
  includeMedia?: boolean
): Promise<Response2<PublishFunderActivitiesResponse>> => {
  const queryParams = {
    projectId: projectId.toString(),
    ...(includeMedia !== undefined && { includeMedia: includeMedia.toString() }),
  };

  return await httpPublishedActivities.get2<PublishFunderActivitiesResponse>({ params: queryParams });
};

const FunderActivityService = {
  getAll,
};

export default FunderActivityService;
