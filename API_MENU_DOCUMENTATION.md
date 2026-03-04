# API Module Menu Documentation

## Overview

Sistem menu API telah dibangun untuk memberikan akses mudah ke semua endpoint API dari aplikasi Tiara. Menu ini terorganisir dalam 4 module utama:

## Struktur File

### 1. **Data Layer** - `src/dataModules.ts`
File ini berisi struktur data lengkap semua API modules dan endpoints:

```typescript
- apiModules[] // Array dari semua modules
  ├── Server Management (6 endpoints)
  ├── Credentials Management (4 endpoints)
  ├── Netbox Integration (2 endpoints)
  └── Tools Monitoring (4 endpoints)
```

**Interfaces:**
- `ApiModule`: Struktur modul API (id, title, icon, endpoints)
- `ApiEndpoint`: Struktur endpoint individual (name, method, path, description, parameters)

### 2. **Component Layer** - `src/componentsModuleMenu.tsx`
Komponen reusable untuk menampilkan menu API:

- Menampilkan grid modules yang dapat diklik
- Modal untuk melihat detail endpoints per module
- Color-coded HTTP methods (GET, POST, PUT, DELETE)
- Parameter badges untuk setiap endpoint

### 3. **Page/Screen** - `app-explorer.tsx`
Halaman lengkap API Explorer dengan fitur:

- **Module List**: Grid view untuk semua modules
- **Module Detail**: Modal dengan daftar endpoints
- **Endpoint Detail**: Modal dengan informasi lengkap endpoint
  - HTTP Method badge
  - Full path (dapat dikopi)
  - Deskripsi endpoint
  - Parameter list
  - Authentication reminder
  - Test API button (untuk future implementation)

### 4. **Dashboard Integration** - `app/(tabs)/index.tsx`
Menu features di dashboard utama sekarang terhubung ke API Explorer.

## API Modules Detail

### 1. Server Management
**Icon:** `server` | **Color:** Blue

Modules untuk mengelola server infrastructure:

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| Get All Servers | GET | Fetch daftar server dengan filter |
| Create Server | POST | Tambah server baru |
| Update Server | PUT | Update data server |
| Delete Server | DELETE | Hapus server |
| Parse Excel | POST | Preview data Excel |
| Bulk Import | POST | Import banyak server |

### 2. Credentials Management
**Icon:** `lock-closed` | **Color:** Red

Modules untuk mengelola kredensial terenkripsi:

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| List Credentials | GET | Daftar kredensial per server |
| Reveal Secret | GET | Dekrypt password |
| Add Credential | POST | Tambah kredensial baru |
| Delete Credential | DELETE | Hapus kredensial |

### 3. Netbox Integration
**Icon:** `git-network` | **Color:** Purple

Modules untuk integrasi dengan inventory Netbox:

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| List Devices | GET | Daftar device dari Netbox |
| Get Device Detail | GET | Detail device spesifik |

### 4. Tools Monitoring
**Icon:** `pulse` | **Color:** Green

Modules untuk monitoring tools dan aplikasi:

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| List Tools | GET | Daftar semua tools |
| Create Tool | POST | Tambah tool baru |
| Update Tool | PUT | Update tool |
| Delete Tool | DELETE | Hapus tool |

## Navigasi & User Flow

```
Dashboard (index.tsx)
    ↓
Menu Features (Grid Icons)
    ↓
API Explorer (api-explorer.tsx)
    ↓
Select Module
    ↓
View Endpoints Modal
    ↓
Select Endpoint
    ↓
View Full Details
    ├─ Copy Path
    ├─ Test API (future)
    └─ Back
```

## HTTP Method Color Coding

- **GET** → Blue (`bg-blue-100 text-blue-700`)
- **POST** → Green (`bg-green-100 text-green-700`)
- **PUT** → Yellow (`bg-yellow-100 text-yellow-700`)
- **DELETE** → Red (`bg-red-100 text-red-700`)

## Features

### ✅ Implemented
- [x] Module grid dengan icon dan description
- [x] Modal untuk melihat endpoints per module
- [x] Endpoint detail view dengan full information
- [x] HTTP method color coding
- [x] Parameter display
- [x] Copy path functionality
- [x] Authentication header reminder

### 📋 Future Implementation
- [ ] Test API directly from app (API Tester)
- [ ] Save/bookmark endpoints
- [ ] Recent endpoints history
- [ ] Request builder
- [ ] Response preview
- [ ] Endpoint documentation link

## Usage Examples

### Accessing from Dashboard
```typescript
// User tap "Server" menu → Navigate to API Explorer
router.push('-explorer')

// In API Explorer
// 1. Select Server Management module
// 2. View available endpoints (6 endpoints)
// 3. Select "Get All Servers" endpoint
// 4. View full details dengan parameter listing
```

### Dari Komponen Standalone
```typescript
import { ApiModuleMenu } from '@/src/componentsModuleMenu';

<ApiModuleMenu 
  onSelectEndpoint={(moduleId, endpoint) => {
    // Handle endpoint selection
    console.log(moduleId, endpoint.path);
  }}
/>
```

## Struktur Data Contoh

```typescript
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
      description: 'Dapatkan daftar semua server...',
      parameters: ['search', 'layanan', 'pic', 'page']
    },
    // ... more endpoints
  ]
}
```

## Customization

### Menambah Module Baru
Edit `src/dataModules.ts`:

```typescript
export const apiModules: ApiModule[] = [
  // ... existing modules
  {
    id: 'new-module',
    title: 'New Module Name',
    icon: 'icon-name',
    color: 'text-color-600',
    bgColor: 'bg-color-50',
    description: 'Module description',
    endpoints: [
      // ... endpoints
    ]
  }
];
```

### Menambah Endpoint ke Module
```typescript
endpoints: [
  // ... existing endpoints
  {
    id: 'new-endpoint',
    name: 'Endpoint Name',
    method: 'GET',
    path: '/v1/new-endpoint',
    description: 'Deskripsi endpoint',
    parameters: ['param1', 'param2']
  }
]
```

## Mobile-Friendly Design

- ✅ Responsive grid layout
- ✅ Touch-optimized buttons
- ✅ Modal dengan scroll yang smooth
- ✅ Color-coded for easy scanning
- ✅ Consistent spacing & typography

## Notes

- Semua data diambil dari `API_QUICK_REFERENCE.md`
- Authentication header selalu diperlukan untuk semua request
- Accept header harus `application/json`
- Error handling dokumentasi tersedia di reference file
