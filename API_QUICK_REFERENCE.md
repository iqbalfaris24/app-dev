# 🚀 API Routes Quick Reference

## Authentication

All routes require Sanctum token (except webhooks):

```
Authorization: Bearer YOUR_TOKEN
Accept: application/json
```

---

## List Server CRUD

### Get All Servers (with filter & pagination)

```http
GET /v1/list-server?search=prod&layanan=database&page=1
```

**Query Parameters:**

- `search` - Search hostname/ip/note
- `layanan` - Filter by service
- `pic` - Filter by PIC
- `is_pam360` - Filter by PAM360 (0 or 1)
- `page` - Pagination page (default: 1)

**Response:** 200 OK

```json
{
  "data": [{...}],
  "current_page": 1,
  "per_page": 9,
  "total": 45
}
```

---

### Create Server with Credentials

```http
POST /v1/list-server
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "hostname": "prod-db-01",
  "port": 22,
  "pic": "John Doe",
  "layanan": "Database",
  "note": "Production database server",
  "environment": "production",
  "status": "active",
  "credentials": [
    {
      "username": "root",
      "password_encrypted": "...",
      "note": "Root access"
    }
  ]
}
```

**Response:** 201 Created

```json
{
    "message": "Server berhasil ditambahkan.",
    "data": {
        "id": 100,
        "ip": "192.168.1.100",
        "hostname": "prod-db-01"
    }
}
```

---

### Update Server

```http
PUT /v1/list-server/{id}
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "hostname": "prod-db-02",
  "status": "maintenance"
}
```

---

### Delete Server

```http
DELETE /v1/list-server/{id}
```

---

### Parse Excel Preview

```http
POST /v1/list-server/parse-excel
Content-Type: multipart/form-data

file: (xlsx/xls/csv file)
```

**Response:** 200 OK

```json
[
  {
    "id": "temp_0",
    "ip": "192.168.1.1",
    "hostname": "server-1",
    "credentials": [...]
  }
]
```

---

### Bulk Import from Excel

```http
POST /v1/list-server/store-import
Content-Type: application/json

{
  "servers": [
    {
      "ip": "192.168.1.1",
      "hostname": "server-1",
      "layanan": "Database",
      "credentials": [
        {
          "username": "root",
          "password_encrypted": "..."
        }
      ]
    }
  ]
}
```

---

## Credentials Management

### List Server Credentials

```http
GET /v1/list-server/credentials/{server_id}/list
```

**Response:**

```json
{
  "server": {...},
  "credentials": [
    {
      "id": 1,
      "username": "root",
      "type": "password",
      "has_secret": true,
      "note": "Root access"
    }
  ]
}
```

---

### Get Plaintext Secret (Decrypted)

```http
GET /v1/list-server/credentials/{credential_id}/reveal
```

**Response:**

```json
{
    "status": "success",
    "secret": "actual_password_here"
}
```

---

### Add New Credential

```http
POST /v1/list-server/credentials/add/{server_id}
Content-Type: application/json

{
  "username": "appuser",
  "type": "password",
  "password_encrypted": "...",
  "note": "App user access"
}
```

---

### Delete Credential

```http
DELETE /v1/list-server/credentials/delete/{credential_id}
```

---

## Netbox Integration

### List Netbox Devices

```http
GET /v1/netbox-devices?page=1
```

**Query Parameters:**

- `page` - Pagination page (default: 1)
- `limit` - Items per page (default: 20)

**Response:**

```json
{
  "items": [{...}],
  "total": 500,
  "page": 1,
  "per_page": 20
}
```

---

### Get Netbox Device Detail

```http
GET /v1/netbox-devices/{id}
```

---

## Tools Monitoring

### List Tools

```http
GET /v1/tools-monitoring?search=elastic&page=1
```

**Query Parameters:**

- `search` - Search by name/url/description
- `page` - Pagination

---

### Create Tool

```http
POST /v1/tools-monitoring
Content-Type: application/json

{
  "name": "Kibana",
  "url": "https://kibana.example.com",
  "description": "Elasticsearch UI",
  "ip_server": "192.168.1.50",
  "environment": "production",
  "status": "active"
}
```

---

### Update Tool

```http
PUT /v1/tools-monitoring/{id}
Content-Type: application/json

{
  "status": "inactive"
}
```

---

### Delete Tool

```http
DELETE /v1/tools-monitoring/{id}
```

---

## Error Handling

### Validation Error (422)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "ip": ["IP address is already being used."],
        "hostname": ["Hostname is required."]
    }
}
```

### Resource Not Found (404)

```json
{
    "message": "Not found"
}
```

### Unauthorized (401)

```json
{
    "message": "Unauthenticated"
}
```

### Server Error (500)

```json
{
    "error": "Internal Server Error"
}
```

---

## Testing with cURL

### Get list of servers

```bash
TOKEN="your_sanctum_token"

curl -X GET "http://localhost/v1/list-server" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

### Create new server

```bash
curl -X POST "http://localhost/v1/list-server" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.100",
    "hostname": "new-server",
    "environment": "production"
  }'
```

---

## Pagination Meta Fields

All list endpoints return pagination metadata:

```json
{
  "data": [...],
  "current_page": 1,
  "from": 1,
  "to": 9,
  "per_page": 9,
  "total": 45,
  "last_page": 5,
  "first_page_url": "...",
  "last_page_url": "...",
  "next_page_url": "...",
  "prev_page_url": null,
  "path": "..."
}
```

---

## Status Codes Reference

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | OK                                      |
| 201  | Created                                 |
| 204  | No Content                              |
| 400  | Bad Request                             |
| 401  | Unauthorized                            |
| 403  | Forbidden                               |
| 404  | Not Found                               |
| 422  | Unprocessable Entity (Validation Error) |
| 500  | Internal Server Error                   |
