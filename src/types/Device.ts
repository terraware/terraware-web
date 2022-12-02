export type Device = {
  id: number;
  facilityId: number;
  name: string;
  type: string;
  make: string;
  model: string;
  protocol?: string | undefined;
  address?: string | undefined;
  port?: number | undefined;
  verbosity?: number | undefined;
  parentId?: number | undefined;
};

export type DeviceTemplate = {
  id: number;
  category: 'PV' | 'Seed Bank Default';
  name: string;
  type: string;
  make: string;
  model: string;
  protocol?: string;
  address?: string;
  port?: number;
  settings?: { [key: string]: unknown };
  verbosity?: number;
};
