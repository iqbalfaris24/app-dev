import api from './api';

export interface Tool {
  id: number;
  name: string;
  url: string;
  description?: string;
  ip_server?: string;
  environment?: string;
  status?: string;
}

export const listTools = async (page = 1, search = '') => {
  const response = await api.get('/v1/tools-monitoring', {
    params: { page, search },
  });
  return response.data;
};

export const createTool = async (payload: Partial<Tool>) => {
  const response = await api.post('/v1/tools-monitoring', payload);
  return response.data;
};

export const updateTool = async (id: number, payload: Partial<Tool>) => {
  const response = await api.put(`/v1/tools-monitoring/${id}`, payload);
  return response.data;
};

export const deleteTool = async (id: number) => {
  const response = await api.delete(`/v1/tools-monitoring/${id}`);
  return response.data;
};
