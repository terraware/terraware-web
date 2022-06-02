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
  pollingInterval?: number | undefined;
  parentId?: number | undefined;
};
