import api from './api';

export interface NetboxDevice {
  id: number;
  name?: string;
  device_type?: string;
  site?: string;
  [key: string]: any;
}

export const listNetboxDevices = async (page = 1, limit = 20) => {
  const response = await api.get('/api/v1/netbox-devices', {
    params: { page, limit },
  });
  return response.data;
};

export const getNetboxDevice = async (id: number) => {
  const response = await api.get(`/api/v1/netbox-devices/${id}`);
  return response.data;
};
