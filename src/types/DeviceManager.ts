export type DeviceManager = {
  id: number;
  shortCode: string;
  available: boolean;
  facilityId?: number;
  updateProgress?: number;
  isOnline: boolean;
};
