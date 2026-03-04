/**
 * Data struktur modul API berdasarkan API_QUICK_REFERENCE.md
 */

export interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters?: string[];
}

export interface ApiModule {
  id: string;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export const apiModules: ApiModule[] = [
  {
    id: 'server-management',
    title: 'Server Management',
    icon: 'server',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Kelola daftar server dengan credentials',
    endpoints: [
      {
        id: 'get-servers',
        name: 'Get All Servers',
        method: 'GET',
        path: '/v1/list-server',
        description: 'Dapatkan daftar semua server dengan filter dan pagination',
        parameters: ['search', 'layanan', 'pic', 'is_pam360', 'page'],
      },
      {
        id: 'create-server',
        name: 'Create Server',
        method: 'POST',
        path: '/v1/list-server',
        description: 'Tambah server baru dengan credentials yang terenkripsi',
        parameters: ['ip', 'hostname', 'port', 'pic', 'layanan', 'credentials'],
      },
      {
        id: 'update-server',
        name: 'Update Server',
        method: 'PUT',
        path: '/v1/list-server/{id}',
        description: 'Perbarui data server yang sudah ada',
        parameters: ['id', 'ip', 'hostname', 'status'],
      },
      {
        id: 'delete-server',
        name: 'Delete Server',
        method: 'DELETE',
        path: '/v1/list-server/{id}',
        description: 'Hapus server dari database',
        parameters: ['id'],
      },
      {
        id: 'parse-excel',
        name: 'Parse Excel Preview',
        method: 'POST',
        path: '/v1/list-server/parse-excel',
        description: 'Preview data dari file Excel sebelum di-import',
        parameters: ['file'],
      },
      {
        id: 'bulk-import',
        name: 'Bulk Import',
        method: 'POST',
        path: '/v1/list-server/store-import',
        description: 'Import banyak server sekaligus dari Excel',
        parameters: ['servers'],
      },
    ],
  },
  {
    id: 'credentials-management',
    title: 'Credentials Management',
    icon: 'lock-closed',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Kelola kredensial server yang terenkripsi',
    endpoints: [
      {
        id: 'list-credentials',
        name: 'List Credentials',
        method: 'GET',
        path: '/v1/list-server/credentials/{server_id}/list',
        description: 'Dapatkan daftar semua kredensial untuk server tertentu',
        parameters: ['server_id'],
      },
      {
        id: 'reveal-secret',
        name: 'Get Plaintext Secret',
        method: 'GET',
        path: '/v1/list-server/credentials/{credential_id}/reveal',
        description: 'Dapatkan password yang sudah di-decrypt (terenkripsi)',
        parameters: ['credential_id'],
      },
      {
        id: 'add-credential',
        name: 'Add New Credential',
        method: 'POST',
        path: '/v1/list-server/credentials/add/{server_id}',
        description: 'Tambah kredensial baru ke server',
        parameters: ['server_id', 'username', 'type', 'password_encrypted'],
      },
      {
        id: 'delete-credential',
        name: 'Delete Credential',
        method: 'DELETE',
        path: '/v1/list-server/credentials/delete/{credential_id}',
        description: 'Hapus kredensial dari server',
        parameters: ['credential_id'],
      },
    ],
  },
  {
    id: 'netbox-integration',
    title: 'Netbox Integration',
    icon: 'git-network',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Sinkronisasi dengan Netbox inventory',
    endpoints: [
      {
        id: 'list-netbox-devices',
        name: 'List Netbox Devices',
        method: 'GET',
        path: '/v1/netbox-devices',
        description: 'Dapatkan daftar device dari Netbox',
        parameters: ['page', 'limit'],
      },
      {
        id: 'get-netbox-device',
        name: 'Get Device Detail',
        method: 'GET',
        path: '/v1/netbox-devices/{id}',
        description: 'Dapatkan detail device spesifik dari Netbox',
        parameters: ['id'],
      },
    ],
  },
  {
    id: 'tools-monitoring',
    title: 'Tools Monitoring',
    icon: 'pulse',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Pantau tools dan aplikasi yang sedang berjalan',
    endpoints: [
      {
        id: 'list-tools',
        name: 'List Tools',
        method: 'GET',
        path: '/v1/tools-monitoring',
        description: 'Dapatkan daftar semua tools monitoring',
        parameters: ['search', 'page'],
      },
      {
        id: 'create-tool',
        name: 'Create Tool',
        method: 'POST',
        path: '/v1/tools-monitoring',
        description: 'Tambah tool monitoring baru',
        parameters: ['name', 'url', 'description', 'ip_server', 'environment'],
      },
      {
        id: 'update-tool',
        name: 'Update Tool',
        method: 'PUT',
        path: '/v1/tools-monitoring/{id}',
        description: 'Perbarui data tool monitoring',
        parameters: ['id', 'status'],
      },
      {
        id: 'delete-tool',
        name: 'Delete Tool',
        method: 'DELETE',
        path: '/v1/tools-monitoring/{id}',
        description: 'Hapus tool monitoring dari database',
        parameters: ['id'],
      },
    ],
  },
];

export const getModuleById = (id: string): ApiModule | undefined => {
  return apiModules.find(module => module.id === id);
};

export const getEndpointById = (moduleId: string, endpointId: string): ApiEndpoint | undefined => {
  const module = getModuleById(moduleId);
  return module?.endpoints.find(endpoint => endpoint.id === endpointId);
};
