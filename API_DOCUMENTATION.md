# TCCIA API Documentation

**Base URL**: `https://tccia.kalen.co.tz`

This documentation covers all the API endpoints used in the TCCIA frontend application. These are the exact endpoints that your Flutter mobile app should use with Dio.

## Authentication

Most endpoints require Bearer token authentication. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

## Response Format

Most APIs return data in JSON-RPC 2.0 format or standard JSON format. Error responses typically include:
```json
{
  "status": "error",
  "error": "Error message",
  "details": "Additional error details"
}
```

---

## Authentication Endpoints

### 1. User Registration
**Endpoint**: `POST /api/registration`
**Headers**: Content-Type: application/json
**Authentication**: None required

**Request Body**:
```json
{
  "name": "John Doe",
  "phone": "+255123456789",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "success": true,
    "registration_id": "REG123456",
    "user_id": "USER123",
    "name": "John Doe",
    "role": "user",
    "email": "john@example.com",
    "state": "active"
  }
}
```

### 2. User Login
**Endpoint**: `POST /api/user_token`
**Headers**: Content-Type: application/json
**Authentication**: None required

**Request Body**:
```json
{
  "phone": "+255123456789",
  "password": "password123"
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "token": "jwt_token_here",
    "uid": 123
  }
}
```

---

## User Profile Endpoints

### 3. Get User Profile
**Endpoint**: `GET /api/user/me`
**Headers**: Authorization: Bearer {token}

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "phone": "+255123456789",
    "email": "john@example.com",
    "country_of_residence": "Tanzania",
    "operator_type": "individual",
    "gender": "male"
  },
  "message": "User profile fetched successfully"
}
```

### 4. Update User Profile
**Endpoint**: `POST /api/user/update-profile`
**Headers**: Content-Type: application/json, Authorization: Bearer {token}

**Request Body**:
```json
{
  "country_of_residence": "Tanzania",
  "operator_type": "individual",
  "gender": "male",
  "operator_type_other": null
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "message": "Profile updated successfully",
    "updated_fields": {
      "country_of_residence": "Tanzania",
      "operator_type": "individual",
      "operator_type_other": "",
      "gender": "male"
    }
  }
}
```

---

## Company Management Endpoints

### 5. Get Companies List
**Endpoint**: `GET /api/companies`
**Headers**: Authorization: Bearer {token}

**Response** (Success):
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "ABC Company Ltd",
      "tin": "123456789",
      "registration_number": "REG123",
      "status": "active"
    }
  ],
  "message": "Companies fetched successfully"
}
```

---

## Firm Registration Endpoints

### 6. Submit TIN for Firm Registration
**Endpoint**: `POST /api/company_registration/fetch_tin`
**Headers**: Content-Type: application/json, Authorization: Bearer {token}

**Request Body**:
```json
{
  "company_tin": "123456789"
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "status": "success",
    "data": {
      "company_name": "ABC Company Ltd",
      "tin": "123456789"
    }
  }
}
```

### 7. Send Verification Code for Firm Registration
**Endpoint**: `POST /api/company_registration/send_code`
**Headers**: Content-Type: application/json, Authorization: Bearer {token}

**Request Body**:
```json
{
  "company_tin": "123456789"
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "success": true,
    "message": "Verification code sent successfully"
  }
}
```

### 8. Verify Code for Firm Registration
**Endpoint**: `POST /api/company_registration/verify_code`
**Headers**: Content-Type: application/json, Authorization: Bearer {token}

**Request Body**:
```json
{
  "company_tin": "123456789",
  "code_input": "123456"
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "success": true,
    "message": "Code verified successfully"
  }
}
```

### 9. Submit Firm Registration
**Endpoint**: `POST /api/company_registration/submit_tin`
**Headers**: Content-Type: application/json, Authorization: Bearer {token}

**Request Body**:
```json
{
  "company_tin": "123456789"
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "success": true,
    "data": {
      "registration_id": "REG123",
      "company_id": "COMP123"
    },
    "id": "COMP123"
  }
}
```

---

## Membership Endpoints

### 10. Get Membership Categories
**Endpoint**: `GET /api/membership/categories`
**Headers**: None required

**Response** (Success):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Gold Membership",
      "description": "Premium membership benefits"
    }
  ]
}
```

### 11. Get Membership Regions
**Endpoint**: `GET /api/membership/regions`
**Headers**: None required

**Response** (Success):
```json
{
  "success": true,
  "message": "Regions with districts retrieved successfully",
  "data": {
    "regions": [
      {
        "id": 2,
        "name": "Arusha",
        "district_count": 2,
        "active": true,
        "districts": [
          {
            "id": 7,
            "name": "Arumeru",
            "active": true
          },
          {
            "id": 6,
            "name": "Arusha City",
            "active": true
          }
        ]
      },
      {
        "id": 1,
        "name": "Dar es Salaam",
        "district_count": 5,
        "active": true,
        "districts": [
          {
            "id": 2,
            "name": "Ilala",
            "active": true
          },
          {
            "id": 5,
            "name": "Kigamboni",
            "active": true
          },
          {
            "id": 1,
            "name": "Kinondoni",
            "active": true
          },
          {
            "id": 3,
            "name": "Temeke",
            "active": true
          },
          {
            "id": 4,
            "name": "Ubungo",
            "active": true
          }
        ]
      },
      {
        "id": 4,
        "name": "Dodoma",
        "district_count": 0,
        "active": true,
        "districts": []
      },
      {
        "id": 5,
        "name": "Mbeya",
        "district_count": 0,
        "active": true,
        "districts": []
      },
      {
        "id": 3,
        "name": "Mwanza",
        "district_count": 2,
        "active": true,
        "districts": [
          {
            "id": 9,
            "name": "Ilemela",
            "active": true
          },
          {
            "id": 8,
            "name": "Nyamagana",
            "active": true
          }
        ]
      }
    ],
    "total_regions": 5
  }
}
```

### 12. Get Membership Sectors
**Endpoint**: `GET /api/membership/sectors`
**Headers**: None required

**Response** (Success):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Agriculture",
      "code": "AGR"
    }
  ]
}
```

### 13. Apply for Membership
**Endpoint**: `POST /api/membership/apply`
**Headers**: Content-Type: application/json, Authorization: Bearer {token}

**Request Body**:
```json
{
  "category_id": 1,
  "region_id": 1,
  "sector_id": 1,
  "company_tin": "123456789",
  "contact_person": "John Doe",
  "contact_email": "john@example.com",
  "contact_phone": "+255123456789"
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "success": true,
    "data": {
      "application_id": "APP123",
      "status": "pending"
    }
  }
}
```

### 14. Renew Membership
**Endpoint**: `POST /api/membership/renew`
**Headers**: Content-Type: application/json, Authorization: Bearer {token}

**Request Body**:
```json
{
  "membership_id": "MEM123",
  "payment_method": "bank_transfer",
  "amount": 50000
}
```

**Response** (Success):
```json
{
  "result": {
    "success": true,
    "data": {
      "renewal_id": "REN123",
      "status": "pending_payment"
    }
  }
}
```

### 15. Submit TIN for Membership
**Endpoint**: `POST /api/membership/submit_tin`
**Headers**: Content-Type: application/json, Authorization: Bearer {token}

**Request Body**:
```json
{
  "tin": "123456789"
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "success": true,
    "data": {
      "company_name": "ABC Company Ltd"
    }
  }
}
```

### 16. Send Verification Code for Membership
**Endpoint**: `POST /api/membership/send_code`
**Headers**: Content-Type: application/json

**Request Body**:
```json
{
  "application_id": "APP123"
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "success": true,
    "message": "Verification code sent successfully"
  }
}
```

### 17. Verify Code for Membership
**Endpoint**: `POST /api/membership/verify_code`
**Headers**: Content-Type: application/json

**Request Body**:
```json
{
  "application_id": "APP123",
  "code_input": "123456"
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "success": true,
    "message": "Verification code verified successfully",
    "data": {
      "membership_id": "MEM123456",
      "status": "active",
      "expiry_date": "2025-12-31"
    }
  }
}
```

### 18. Get Membership Application by TIN
**Endpoint**: `GET /api/membership/application/{tin}`
**Headers**: Authorization: Bearer {token}

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "id": 123,
    "tin": "123456789",
    "status": "approved",
    "application_date": "2024-01-15",
    "membership_number": "MEM123456"
  }
}
```

### 19. Download Membership Certificate
**Endpoint**: `GET /api/membership/certificate/{id}`
**Headers**: Authorization: Bearer {token}

**Response**: PDF file download
**Content-Type**: application/pdf
**Content-Disposition**: attachment; filename=membership_certificate_{id}.pdf

---

## Certificate of Origin (COO) Endpoints

### 20. Get COO Certificates
**Endpoint**: `POST /api/lpco_application/certificate`
**Headers**: Content-Type: application/json, Authorization: Bearer {token}

**Request Body**:
```json
{
  "status_filter": "all",
  "type_filter": "all"
}
```

**Response** (Success):
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "status": "success",
    "data": [
      {
        "message_info": {
          "application_uuid": "UUID123",
          "application_code_number": "COO123",
          "status": "Approved",
          "submission_date": "2024-01-15"
        },
        "applicant_info": {
          "name": "John Doe",
          "company": "ABC Company Ltd"
        }
      }
    ]
  }
}
```

---

## Factory Verification Endpoints

### 21. Get Factory Products
**Endpoint**: `GET /api/factory_verification/products?company_tin={tin}`
**Headers**: Authorization: Bearer {token}

**Response** (Success):
```json
{
  "success": true,
  "verifications": [
    {
      "id": 1,
      "product_name": "Product A",
      "status": "verified",
      "verification_date": "2024-01-15"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_items": 1
  },
  "message": "Factory verifications fetched successfully"
}
```

### 22. Get Factory Products Count
**Endpoint**: `GET /api/factory_verification/products/count?company_tin={tin}`
**Headers**: Authorization: Bearer {token}

**Response** (Success):
```json
{
  "success": true,
  "product_count": 5,
  "message": "Total 5 products found for TIN 123456789."
}
```

### 23. Submit Factory Verification
**Endpoint**: `POST /api/factory_verification`
**Headers**: Authorization: Bearer {token}

**Request Body**:
```json
{
  "company_tin": "123456789",
  "applicant_name": "John Doe",
  "applicant_phone": "+255123456789",
  "applicant_email": "john@example.com",
  "suggested_inspection_date": "2024-02-15",
  "products": [
    {
      "manufacturer_id": 1,
      "product_id": 1,
      "description": "Product description"
    }
  ]
}
```

**Response** (Success):
```json
{
  "status": "success",
  "data": {
    "verification_id": "VER123",
    "status": "submitted"
  },
  "message": "Factory verification submitted successfully"
}
```

---

## Product Endpoints

### 24. Get Products List
**Endpoint**: `GET /api/products/master?hse={hs_code}` (Search by HS Code)
**Endpoint**: `POST /api/products/master` (Get all by company)
**Headers**: Authorization: Bearer {token} (for POST), None (for GET with hse)

**POST Request Body**:
```json
{
  "company_id": "123"
}
```

**Response** (Success):
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Product Name",
        "hs_code": "123456",
        "product_category": "Electronics",
        "unity_of_measure": "pieces"
      }
    ]
  },
  "message": "Products fetched successfully"
}
```

---

## Manufacturer Endpoints

### 25. Get Manufacturers
**Endpoint**: `GET /api/manufacturers`
**Headers**: None required

**Response** (Success):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Manufacturer ABC",
      "country": "Tanzania",
      "contact_info": "info@manufacturer.com"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1
  },
  "message": "Manufacturers fetched successfully"
}
```

---

## NTB (Non-Tariff Barriers) Endpoints

### 26. Get NTB Types
**Endpoint**: `GET /api/ntb/types`
**Headers**: None required

**Response** (Success):
```json
{
  "success": true,
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Import Restrictions",
      "description": "Restrictions on importing goods"
    }
  ],
  "message": "NTB types fetched successfully"
}
```

### 27. Get NTB List
**Endpoint**: `GET /api/ntb/list`
**Headers**: Authorization: Bearer {token}

**Response** (Success):
```json
{
  "success": true,
  "status": "success",
  "data": [
    {
      "id": 1,
      "tracking_code": "NTB123456",
      "ntb_type": "Import Restrictions",
      "date_of_incident": "2024-01-15",
      "country_of_incident": "Tanzania",
      "state": "pending",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1,
  "message": "NTB list fetched successfully"
}
```

### 28. Get NTB Details
**Endpoint**: `GET /api/ntb/{id}`
**Headers**: Authorization: Bearer {token}

**Response** (Success):
```json
{
  "success": true,
  "status": "success",
  "data": {
    "id": 1,
    "tracking_code": "NTB123456",
    "ntb_type": "Import Restrictions",
    "date_of_incident": "2024-01-15",
    "country_of_incident": "Tanzania",
    "location": "Dar es Salaam Port",
    "complaint_details": "Detailed complaint description",
    "product_description": "Agricultural machinery parts",
    "state": "pending"
  },
  "message": "NTB details fetched successfully"
}
```

### 29. Submit NTB Report
**Endpoint**: `POST /api/ntb/create-with-files`
**Headers**: Authorization: Bearer {token}
**Content-Type**: multipart/form-data

**Request Body** (FormData):
```
ntb_type_id: "1"
date_of_incident: "2024-01-15"
country_of_incident: "Tanzania"
location: "Dar es Salaam Port"
complaint_details: "<p>Detailed complaint description...</p>"
product_description: "Agricultural machinery parts"
occurrence: "One-time"
cost_value_range: "$1,000 - $5,000" (optional)
time_lost_range: "1-3 days" (optional)
money_lost_range: "$500 - $1,000" (optional)
exact_loss_value: "2500.50" (optional)
loss_calculation_description: "Based on daily operational costs..." (optional)
latitude: "-6.7924" (optional)
longitude: "39.2083" (optional)
location_type: "port" (optional)
location_accuracy: "high" (optional)
location_address: "Dar es Salaam Port, Tanzania" (optional)
google_place_id: "ChIJ..." (optional)
document_files: [File] (multiple files)
image_files: [File] (multiple files)
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "report_reference": "NTB123456",
    "tracking_code": "NTB123456",
    "status": "submitted"
  },
  "message": "NTB report created successfully"
}
```

### 30. Get NTB Feedback
**Endpoint**: `GET /api/ntb/report/web/feedback?tracking_code={tracking_code}`
**Headers**: Authorization: Bearer {token}

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "tracking_code": "NTB123456",
    "status": "resolved",
    "feedback": "Issue has been resolved successfully",
    "updated_at": "2024-01-20T10:00:00Z"
  },
  "message": "Report feedback fetched successfully"
}
```

---

## Helpdesk Endpoints

### 31. Get Helpdesk Services
**Endpoint**: `GET /api/helpdesk/services`
**Headers**: Content-Type: application/json

**Response** (Success):
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Technical Support",
      "description": "Help with technical issues"
    }
  ]
}
```

### 32. Submit Helpdesk Ticket
**Endpoint**: `POST /api/helpdesk/submit`
**Headers**: Content-Type: application/json

**Request Body**:
```json
{
  "service_id": 1,
  "subject": "Technical Issue",
  "description": "Detailed description of the issue",
  "priority": "medium",
  "contact_email": "user@example.com",
  "contact_phone": "+255123456789"
}
```

**Response** (Success):
```json
{
  "status": "success",
  "data": {
    "ticket_id": "HELP123456",
    "ticket_number": "HELP123456",
    "status": "open"
  },
  "message": "Ticket submitted successfully"
}
```

### 33. Track Helpdesk Ticket
**Endpoint**: `GET /api/helpdesk/track/{ticket_number}`
**Headers**: None required

**Response** (Success):
```json
{
  "status": "success",
  "data": {
    "ticket_number": "HELP123456",
    "subject": "Technical Issue",
    "status": "in_progress",
    "created_at": "2024-01-15T10:00:00Z",
    "last_updated": "2024-01-16T15:30:00Z"
  }
}
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized**:
```json
{
  "status": "error",
  "error": "Unauthorized - Missing authentication"
}
```

**400 Bad Request**:
```json
{
  "status": "error",
  "error": "Missing required fields",
  "details": "Specific field validation errors"
}
```

**500 Internal Server Error**:
```json
{
  "status": "error",
  "error": "Internal server error"
}
```

### JSON-RPC Error Format

```json
{
  "jsonrpc": "2.0",
  "id": null,
  "result": {
    "error": "Error message"
  }
}
```

---

## Notes for Flutter Implementation

1. **Authentication**: Store the JWT token after successful login and include it in all authenticated requests
2. **File Uploads**: Use `multipart/form-data` for endpoints that accept files (NTB submit)
3. **Error Handling**: Check both `status` field and `result.error` field in responses
4. **Response Formats**: Some endpoints return JSON-RPC format, others return standard JSON - handle both
5. **Content Types**: Most POST requests require `Content-Type: application/json` header
6. **Base URL**: All endpoints should be prefixed with `https://tccia.kalen.co.tz`

## Example Dio Implementation (Flutter)

```dart
import 'package:dio/dio.dart';

class TCCIAApiService {
  final Dio _dio = Dio();
  static const String baseUrl = 'https://tccia.kalen.co.tz';
  
  TCCIAApiService() {
    _dio.options.baseUrl = baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 30);
    _dio.options.receiveTimeout = const Duration(seconds: 30);
  }
  
  // Add token to headers
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }
  
  // Login example
  Future<Map<String, dynamic>> login(String phone, String password) async {
    try {
      final response = await _dio.post('/api/user_token', data: {
        'phone': phone,
        'password': password,
      });
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
  
  // Get user profile example
  Future<Map<String, dynamic>> getUserProfile() async {
    try {
      final response = await _dio.get('/api/user/me');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
  
  // File upload example (NTB Submit)
  Future<Map<String, dynamic>> submitNTBReport(Map<String, dynamic> data, List<File> documents, List<File> images) async {
    try {
      FormData formData = FormData();
      
      // Add text fields
      data.forEach((key, value) {
        formData.fields.add(MapEntry(key, value.toString()));
      });
      
      // Add document files
      for (File file in documents) {
        formData.files.add(MapEntry(
          'document_files',
          await MultipartFile.fromFile(file.path, filename: file.path.split('/').last),
        ));
      }
      
      // Add image files
      for (File file in images) {
        formData.files.add(MapEntry(
          'image_files',
          await MultipartFile.fromFile(file.path, filename: file.path.split('/').last),
        ));
      }
      
      final response = await _dio.post('/api/ntb/create-with-files', data: formData);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
}
```
