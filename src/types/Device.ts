export type DeviceTemplate = {
  id: number;
  category: 'PV';
  name: string;
  type: string;
  make: string;
  model: string;
  protocol?: string;
  address?: string;
  port?: number;
  settings?: { [key: string]: { [key: string]: unknown } };
  pollingInterval?: number;
};

export type DeviceConfig = {
  id: number;
  facilityId: number;
  name: string;
  type: string;
  make: string;
  model: string;
  protocol?: string;
  address?: string;
  port?: number;
  settings?: { [key: string]: unknown };
  pollingInterval?: number;
  parentId?: number;
};
