export type DeviceManager = {
  id: number;
  sensorKitId: string;
  available: boolean;
  facilityId?: number;
  updateProgress?: number;
  isOnline: boolean;
};
