import api from './api';

export interface Server {
  id: number;
  ip: string;
  hostname: string;
  layanan?: string;
  status?: string;
  environment?: string;
  note?: string;
  pic?: string;
  port?: number;
}

export interface Credential {
  id: number;
  username: string;
  type: string;
  has_secret: boolean;
  note?: string;
}

export interface NewCredential {
  username: string;
  type: string;
  password_encrypted: string;
  note?: string;
}

export const listServers = async (page = 1, search = '') => {
  const response = await api.get('/v1/list-server', {
    params: { page, search },
  });
  return response.data;
};

export const getServerById = async (id: number) => {
  const response = await api.get(`/v1/list-server/${id}`);
  return response.data;
};

export const listCredentials = async (serverId: number) => {
  const response = await api.get(`/v1/list-server/credentials/${serverId}/list`);
  return response.data;
};

export const createServer = async (payload: Partial<Server>) => {
  const response = await api.post('/v1/list-server', payload);
  return response.data;
};

export const updateServer = async (id: number, payload: Partial<Server>) => {
  const response = await api.put(`/v1/list-server/${id}`, payload);
  return response.data;
};

export const deleteServer = async (id: number) => {
  const response = await api.delete(`/v1/list-server/${id}`);
  return response.data;
};

export const addCredential = async (serverId: number, payload: NewCredential) => {
  const response = await api.post(`/v1/list-server/credentials/add/${serverId}`, payload);
  return response.data;
};
