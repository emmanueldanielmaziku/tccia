# NTB (Non-Tariff Barriers) API Documentation & Flow

This document provides the complete NTB flow implementation and API endpoints for mobile app development.

## Base URLs

### Backend API (Direct - Use These)
```
https://tccia.kalen.co.tz/api
```

## NTB Flow Implementation

### Overview
The NTB module implements a user profile completion flow before allowing access to NTB features. Users must complete their profile with required fields before accessing NTB functionality.

### Flow Steps

#### 1. **Initial Load & Profile Check**
```
User opens NTB module
    ↓
Check if user profile is loading
    ↓
If loading: Show loading spinner with "Loading profile..." message
    ↓
If not loading: Check profile completion status
```

#### 2. **Profile Completion Check**
The system checks if these **required fields** are completed:
- `country_of_residence` (string, not empty)
- `operator_type` (string, not empty) 
- `gender` (string, not empty)

**Profile Complete Logic:**
```javascript
const isProfileComplete = 
  userProfile.country_of_residence && 
  userProfile.operator_type && 
  userProfile.gender;
```

#### 3. **Flow Decision Based on Profile Status**

**If Profile is INCOMPLETE:**
```
Show Profile Completion Form
    ↓
Display small form with 3 required fields:
    - Country of Residence (dropdown)
    - Operator Type (dropdown) 
    - Gender (dropdown)
    ↓
If "operator_type" = "others":
    Show additional text input: "Specify Type (e.g., Exporter)"
    ↓
User fills form and submits
    ↓
Call API: POST https://tccia.kalen.co.tz/api/user/update-profile
    ↓
On success: Switch to NTB List mode
    ↓
Fetch NTB list and show main interface
```

**If Profile is COMPLETE:**
```
Skip profile form
    ↓
Go directly to NTB List mode
    ↓
Fetch NTB list from API
    ↓
Show main NTB interface with:
    - List of existing NTB reports (if any)
    - "New NTB Report" button
    - Refresh button
```

#### 4. **Main NTB Interface (After Profile Complete)**

**NTB List View:**
```
Show header with:
    - Title: "Non-Tariff Barriers (NTB)"
    - Subtitle with report count
    - "New NTB Report" button
    - "Refresh" button
    ↓
If no reports exist:
    Show empty state with:
        - Icon
        - "No NTB Reports Found" message
        - "Submit Your First NTB Report" button
    ↓
If reports exist:
    Show list of NTB cards with:
        - NTB type
        - Report reference
        - Submission date
        - Status badge
        - Incident details
        - "View Details" button
```

**New NTB Report Form:**
```
Show comprehensive form with:
    Required Fields:
        - NTB Type (dropdown from API)
        - Date of Incident
        - Country of Incident
        - Location Type
        - Complaint Details (rich text editor)
        - Product Description
        - Occurrence
    
    Optional Fields (in collapsible section):
        - Cost/Value Range
        - Time Lost Range
        - Money Lost Range
        - Exact Loss Value
        - Loss Calculation Description
    
    File Uploads:
        - Document files (PDF, DOC, DOCX)
        - Image files (JPG, PNG, GIF)
    
    Location Features:
        - Auto-detect GPS location
        - Reverse geocoding for address
        - Manual location entry fallback
```

#### 5. **State Management**

**Mode States:**
- `"profile"` - Show profile completion form
- `"list"` - Show NTB list and main interface
- `"new"` - Show new NTB report form
- `"detail"` - Show NTB report details

**Loading States:**
- `profileLoading` - While fetching user profile
- `loading` - While fetching NTB list
- `submitting` - While submitting forms
- `detailLoading` - While fetching NTB details

#### 6. **Data Flow Summary**

```
App Start
    ↓
Check User Profile
    ↓
Profile Complete? 
    ├─ No → Show Profile Form → Submit → Go to NTB List
    └─ Yes → Go to NTB List
    ↓
NTB List Mode
    ├─ Show existing reports
    ├─ "New NTB" button → New Form Mode
    └─ "View Details" → Detail Mode
    ↓
New NTB Form Mode
    ├─ Fill form
    ├─ Upload files
    ├─ Submit → Back to NTB List
    └─ Cancel → Back to NTB List
```

### Mobile App Implementation Notes

#### **Profile Completion:**
- Use native dropdowns/pickers
- Implement form validation
- Show loading states
- Handle API errors gracefully

#### **NTB List:**
- Implement pull-to-refresh
- Use native list components
- Handle empty states
- Implement infinite scroll if needed

#### **New NTB Form:**
- Use native file pickers
- Implement GPS location detection
- Use native text inputs
- Handle form state management
- Implement proper validation

#### **File Uploads:**
- Use native file pickers
- Implement file size validation (10MB limit)
- Show upload progress
- Handle multiple file selection

---

## 6. User Profile Endpoints (Required for NTB Flow)

### Get User Profile
**Endpoint:** `GET https://tccia.kalen.co.tz/api/user_profile`

#### Headers
```
Authorization: Bearer {token}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+255123456789",
    "country_of_residence": "Tanzania",
    "operator_type": "commercial_trader",
    "operator_type_other": "",
    "gender": "male",
    "role": "user",
    "active": true
  }
}
```

### Update User Profile
**Endpoint:** `POST https://tccia.kalen.co.tz/api/user/update-profile`

#### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body
```json
{
  "country_of_residence": "Tanzania",
  "operator_type": "commercial_trader",
  "operator_type_other": "",
  "gender": "male"
}
```

#### Success Response (200)
```json
{
  "result": {
    "message": "Profile updated successfully",
    "updated_fields": {
      "country_of_residence": "Tanzania",
      "operator_type": "commercial_trader",
      "gender": "male"
    }
  }
}
```

---

## Authentication
All endpoints require a valid Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## 1. Submit NTB Report

**Endpoint:** `POST https://tccia.kalen.co.tz/api/ntb/create-with-files`

### Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Request Body (FormData)

#### Required Fields
```javascript
{
  "ntb_type_id": "string|number",           // ID of the NTB type
  "date_of_incident": "string",             // Date when incident occurred
  "country_of_incident": "string",          // Country where incident happened
  "location": "string",                      // Location description
  "complaint_details": "string",             // Detailed complaint description
  "product_description": "string",           // Description of affected product
  "occurrence": "string"                     // How often this occurs
}
```

#### Optional Fields
```javascript
{
  "cost_value_range": "string",              // Cost/value range affected
  "hs_code": "string",                       // Harmonized System code
  "hs_description": "string",                // HS code description
  "time_lost_range": "string",               // Time lost range
  "money_lost_range": "string",              // Money lost range
  "exact_loss_value": "string",              // Exact loss value
  "loss_calculation_description": "string",   // Description of loss calculation
  
  // Location Fields (Optional)
  "latitude": "string",                       // GPS latitude
  "longitude": "string",                      // GPS longitude
  "location_type": "string",                 // Type of location
  "location_accuracy": "string",             // Location accuracy
  "location_address": "string",              // Full address
  "google_place_id": "string"                // Google Places ID
}
```

#### File Attachments (Optional)
```javascript
{
  "document_files": File[],                  // Array of document files
  "image_files": File[],                     // Array of image files
  "video_files": File[]                      // Array of video files
}
```

### Complete Example Body
```javascript
const formData = new FormData();

// Required fields
formData.append('ntb_type_id', '1');
formData.append('date_of_incident', '2024-01-15');
formData.append('country_of_incident', 'Tanzania');
formData.append('location', 'Dar es Salaam Port');
formData.append('complaint_details', 'Customs officials are demanding additional documentation that is not required by law');
formData.append('product_description', 'Agricultural machinery parts');
formData.append('occurrence', 'Every shipment');

// Optional fields
formData.append('cost_value_range', '10000-50000');
formData.append('hs_code', '8432.10.00');
formData.append('hs_description', 'Agricultural machinery parts');
formData.append('time_lost_range', '2-5 days');
formData.append('money_lost_range', '5000-15000');
formData.append('exact_loss_value', '12500');
formData.append('loss_calculation_description', 'Storage fees + demurrage charges');

// Location fields
formData.append('latitude', '-6.7924');
formData.append('longitude', '39.2083');
formData.append('location_type', 'port');
formData.append('location_accuracy', 'high');
formData.append('location_address', 'Dar es Salaam Port, Tanzania');
formData.append('google_place_id', 'ChIJ...');

// File attachments (if any)
formData.append('document_files', file1);
formData.append('image_files', image1);
// formData.append('video_files', video1);
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "report_reference": "NTB-2024-001234",
    "id": 123,
    "status": "submitted"
  },
  "message": "NTB report created successfully"
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized - Missing authentication"
}
```

#### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 2. Get NTB List

**Endpoint:** `GET https://tccia.kalen.co.tz/api/ntb/list`

### Headers
```
Authorization: Bearer {token}
```

### Success Response (200)
```json
{
  "success": true,
  "status": "success",
  "data": [
    {
      "id": 1,
      "report_reference": "NTB-2024-001234",
      "status": "submitted",
      "date_of_incident": "2024-01-15",
      "country_of_incident": "Tanzania",
      "location": "Dar es Salaam Port"
    }
  ],
  "count": 1,
  "message": "NTB list fetched successfully"
}
```

---

## 3. Get NTB Details

**Endpoint:** `GET https://tccia.kalen.co.tz/api/ntb/{id}`

### Headers
```
Authorization: Bearer {token}
```

### Success Response (200)
```json
{
  "success": true,
  "status": "success",
  "data": {
    "id": 123,
    "report_reference": "NTB-2024-001234",
    "ntb_type_id": 1,
    "date_of_incident": "2024-01-15",
    "country_of_incident": "Tanzania",
    "location": "Dar es Salaam Port",
    "complaint_details": "Customs officials are demanding additional documentation...",
    "product_description": "Agricultural machinery parts",
    "occurrence": "Every shipment",
    "status": "submitted"
  },
  "message": "NTB details fetched successfully"
}
```

---

## 4. Get NTB Types

**Endpoint:** `GET https://tccia.kalen.co.tz/api/ntb/types`

### Success Response (200)
```json
{
  "success": true,
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Customs Procedures",
      "description": "Issues related to customs clearance procedures"
    },
    {
      "id": 2,
      "name": "Technical Standards",
      "description": "Technical barriers to trade"
    }
  ],
  "message": "NTB types fetched successfully"
}
```

---

## 5. Get NTB Feedback

**Endpoint:** `GET https://tccia.kalen.co.tz/api/ntb/report/web/feedback?tracking_code={code}`

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
- `tracking_code` (required): The tracking code of the NTB report

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "tracking_code": "NTB-2024-001234",
    "status": "under_review",
    "feedback": "Your report is being reviewed by our team",
    "last_updated": "2024-01-20T10:30:00Z"
  },
  "message": "Report feedback fetched successfully"
}
```

---

## Implementation Notes

1. **Authentication:** All endpoints (except types) require a valid Bearer token
2. **Content Type:** Submit endpoint uses `multipart/form-data` for file uploads
3. **Required Fields:** Submit endpoint requires: `ntb_type_id`, `date_of_incident`, `country_of_incident`, `location`, `complaint_details`, `product_description`, `occurrence`
4. **File Handling:** Supports multiple file types (documents, images, videos)
5. **Error Handling:** Always check the `success` field in responses

## Example Usage

### Submit NTB Report
```javascript
const formData = new FormData();
formData.append('ntb_type_id', '1');
formData.append('date_of_incident', '2024-01-15');
formData.append('country_of_incident', 'Tanzania');
formData.append('location', 'Dar es Salaam Port');
formData.append('complaint_details', 'Customs officials are demanding additional documentation...');
formData.append('product_description', 'Agricultural machinery parts');
formData.append('occurrence', 'Every shipment');

const response = await fetch('https://tccia.kalen.co.tz/api/ntb/create-with-files', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-token-here'
  },
  body: formData
});

const result = await response.json();
```

### Get NTB List
```javascript
const response = await fetch('https://tccia.kalen.co.tz/api/ntb/list', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
});

const result = await response.json();
```

### Get NTB Details
```javascript
const response = await fetch('https://tccia.kalen.co.tz/api/ntb/123', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
});

const result = await response.json();
```

### Get NTB Types
```javascript
const response = await fetch('https://tccia.kalen.co.tz/api/ntb/types', {
  method: 'GET'
});

const result = await response.json();
```

### Get NTB Feedback
```javascript
const response = await fetch('https://tccia.kalen.co.tz/api/ntb/report/web/feedback?tracking_code=NTB-2024-001234', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
});

const result = await response.json();
```

### Get User Profile
```javascript
const response = await fetch('https://tccia.kalen.co.tz/api/user_profile', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
});

const result = await response.json();
```

### Update User Profile
```javascript
const response = await fetch('https://tccia.kalen.co.tz/api/user/update-profile', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-token-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    country_of_residence: 'Tanzania',
    operator_type: 'commercial_trader',
    gender: 'male'
  })
});

const result = await response.json();
```
