export type Photo = {
  id: number;
  feature_id: number;
  plant_observation_id?: number;
  heading?: string;
  orientation?: string;
  captured_time: string;
  account_id?: number;
  file_name?: string;
  content_type?: string;
  size?: string;
  created_time?: string;
  modified_time?: string;
};

export type PhotoFeature = {
  photo: Blob;
  featuredId: number;
};
