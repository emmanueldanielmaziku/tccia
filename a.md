# NTB API Reference

## Overview
This document records the NTB endpoints used by the frontend, together with the exact request payloads and response shapes observed in the current integration environment (`https://tccia.kalen.co.tz`).

---

## 1. List NTB Reports
**Endpoint:** `GET /api/ntb/list`


**Request Headers**
- `Authorization: Bearer <token>`

**Sample Success Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 87,
      "report_reference": "NTB-000087",
      "ntb_type": "Administrative fee and levies",
      "date_of_incident": "2025-11-10",
      "reporting_country": "Uganda",
      "reported_country": "Tanzania",
      "location": "Ubungo, Dar es Salaam",
      "location_of_incidence": {
        "id": 1,
        "name": "Border/Cross point"
      },
      "specific_location": {
        "id": 1,
        "name": "Namanga",
        "code": "Nmg"
      },
      "state": "submitted",
      "cost_value_range": false,
      "occurrence": "Once before",
      "submission_date": "2025-11-10T13:10:23",
      "latest_feedback": "",
      "attachment_count": 1,
      "has_attachments": true,
      "rating": "2",
      "additional_comment": "Ecellent resolution process and timely response."
    }
  ],
  "count": 6
}
```

---

## 2. NTB Detail
**Endpoint:** `GET /api/ntb/{id}`

**Proxy Route:** `app/api/ntb/[id]/route.ts`

**Request Headers**
- `Authorization: Bearer <token>`

**Response**
- Passes through the upstream JSON (includes the same fields as the list entry plus full complaint, impact, reporter info, etc.).

---

## 3. Submit NTB Report (with files)
**Endpoint:** `POST /api/ntb/create-with-files`


**Request**
- `FormData` payload (multipart), forwarded exactly to the upstream API.
- Required fields:
  - `ntb_type_id`
  - `date_of_incident`
  - `reporting_country`
  - `reported_country`
  - `location`
  - `location_of_incidence_id`
  - `specific_location_id`
  - `complaint_details`
  - `product_description`
  - `occurrence`
- Optional fields:
  - `cost_value_range`, `time_lost_range`, `money_lost_range`, `exact_loss_value`, `loss_calculation_description`
  - Location extras: `latitude`, `longitude`, `location_accuracy`, `location_address`, `google_place_id`
  - Files: `document_files`, `image_files`, `video_files`

**Sample FormData snippet**
```
ntb_type_id=1
reporting_country=Tanzania
reported_country=Kenya
location=Namanga Border
location_of_incidence_id=1
specific_location_id=5
complaint_details=Delays during customs inspection
product_description=Coffee beans
occurrence=Once
image_files=@/Users/.../photo.jpg
```

**Sample Success Response**
```json
{
  "success": true,
  "message": "NTB report created successfully with attachments",
  "data": {
    "report_reference": "NTB-000011",
    "id": 11,
    "state": "submitted",
    "reporter_name": "Administrator",
    "location_of_incidence": {
      "id": 1,
      "name": "Border/Crossing point"
    },
    "specific_location": {
      "id": 1,
      "name": "Namanga",
      "code": "Nmg"
    },
    "attachments": [],
    "attachment_count": 0
  }
}
```

---

## 4. Submit Feedback (Rate Service)
**Endpoint:** `POST /api/ntb/{id}/feedback`

**Proxy Route:** `app/api/ntb/[id]/feedback/route.ts`

**Request Headers**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**
```json
{
  "rating": "4",
  "additional_comment": "Handled quickly and professionally."
}
```
- `rating` must be a string between "1" and "5".
- `additional_comment` is optional (omit if empty).

**Sample Upstream Response**
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": "<Response 128 bytes [200 OK]>"
}
```
> Treat any `200` accompanied by this JSON-RPC wrapper as success; the backend does not currently echo the saved rating/comment.

---

## 5. NTB Types (Reference)
**Endpoint:** `GET /api/ntb/types`

**Proxy Route:** `app/api/ntb/types/route.ts`

**Response**
```json
{
  "success": true,
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Administrative issues",
      "description": "Issues related to administrative procedures and bureaucracy"
    }
  ]
}
```

---

## 6. Location Incidence Reference Data
**Endpoint:** `GET /api/locations/incidence`

**Proxy Route:** `app/api/locations/incidence/route.ts`

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Border/Cross point",
      "specific_locations": [
        {
          "id": 1,
          "name": "Namanga",
          "code": "Nmg"
        }
      ]
    }
  ],
  "count": 1
}
```

---

## Status Labels Used in UI
```text
submitted             → Submitted
review                → Review (Focal Persons)
assignment            → Assignment
in_progress           → In Progress
intended_resolved     → Intended Resolved
unintended_resolved   → Unintended Resolved
done / resolved       → Resolved
closed                → Closed
```
Cards only show the “Rate Service” button when the status is one of the resolved variants **and** no rating exists yet.
