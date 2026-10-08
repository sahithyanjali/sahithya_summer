# API_SPEC.md — Backend API Specification & Contract

This document defines the REST API contract for the **Seva Sphoorthi Volunteer Portal** backend service running on Cloud Run / Express. All authenticated endpoints require a Bearer token (`Authorization: Bearer <Firebase_ID_Token>`).

---

## 1. System & Health Endpoints

### `GET /api/health`
Checks service health and external connectivity.
- **Access**: Public
- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-03T10:30:00.000Z",
    "version": "1.0.0"
  }
  ```

---

## 2. Authentication & User Profile Endpoints

### `POST /api/v1/auth/sync`
Synchronizes Firebase Auth credentials with the `users` collection.
- **Access**: Authenticated Volunteer / Admin
- **Request Body**:
  ```json
  {
    "name": "Anjali Sharma",
    "email": "anjali@example.com",
    "phone": "+919876543210"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "userId": "usr_99812",
    "role": "VOLUNTEER",
    "status": "ACTIVE",
    "isProfileComplete": false
  }
  ```

### `GET /api/v1/profile`
Retrieves full volunteer profile including skills, availability, and verification status.
- **Access**: Authenticated Volunteer / Admin
- **Response `200 OK`**:
  ```json
  {
    "userId": "usr_99812",
    "dateOfBirth": "1995-04-12",
    "address": {
      "city": "Bengaluru",
      "state": "Karnataka",
      "pincode": "560001"
    },
    "skills": ["First Aid", "Teaching", "Event Coordination"],
    "availability": {
      "weekdays": ["EVENING"],
      "weekends": ["MORNING", "AFTERNOON"]
    },
    "identityVerified": true,
    "backgroundCheckStatus": "VERIFIED",
    "termsAccepted": true
  }
  ```

### `PUT /api/v1/profile`
Updates volunteer profile demographics, skills, and availability.
- **Access**: Authenticated Volunteer
- **Request Body**:
  ```json
  {
    "address": { "city": "Bengaluru", "pincode": "560001" },
    "skills": ["First Aid", "Teaching"],
    "availability": { "weekends": ["MORNING"] }
  }
  ```
- **Response `200 OK`**: Updated profile object.

---

## 3. Onboarding & Identity Verification Endpoints

### `POST /api/v1/onboarding/identity`
Submits identity documents for background check.
- **Access**: Authenticated Volunteer
- **Request Body**:
  ```json
  {
    "documentType": "AADHAAR",
    "documentStorageUrl": "gs://seva-storage/docs/usr_99812/id.pdf"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "status": "IN_REVIEW",
    "referenceNumber": "BG-2026-9921",
    "submittedAt": "2026-09-03T10:30:00.000Z"
  }
  ```

### `POST /api/v1/onboarding/accept-terms`
Submits signed terms and volunteer code of conduct.
- **Access**: Authenticated Volunteer
- **Request Body**:
  ```json
  {
    "termsVersion": "2026.1",
    "clientTimestamp": "2026-09-03T10:30:00.000Z",
    "signatureHash": "sha256_9f83acb742..."
  }
  ```
- **Response `200 OK`**: `{ "termsAccepted": true }`

---

## 4. Opportunity Management Endpoints

### `GET /api/v1/opportunities`
List published volunteer opportunities with pagination and filters.
- **Access**: Authenticated Users
- **Query Parameters**:
  - `category` (optional, string)
  - `city` (optional, string)
  - `limit` (default: 20, max: 50)
  - `startAfter` (cursor for pagination)
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "opportunityId": "opp_4401",
        "title": "Aahara Food Distribution Drive",
        "description": "Distributing 1000 nutritious meal packets to urban shelters.",
        "category": "RELIEF",
        "location": "Majestic, Bengaluru",
        "requiredSkills": ["Logistics", "Crowd Management"],
        "scheduledDate": "2026-09-12T09:00:00.000Z",
        "durationHours": 4,
        "capacity": 25,
        "assignedCount": 18,
        "status": "PUBLISHED"
      }
    ],
    "nextCursor": "opp_4420",
    "hasMore": true
  }
  ```

### `POST /api/v1/opportunities` (Admin Only)
Creates a new opportunity draft.
- **Access**: Admin / Opportunity Manager
- **Request Body**:
  ```json
  {
    "title": "Vidya Weekend Tutoring",
    "description": "Mathematics and Science tutoring for grade 6-8 students.",
    "category": "EDUCATION",
    "location": "Whitefield Community Center",
    "requiredSkills": ["Teaching", "Mathematics"],
    "scheduledDate": "2026-09-15T10:00:00.000Z",
    "durationHours": 3,
    "capacity": 10,
    "expectedImpact": "Support 40 students with board exam preparations."
  }
  ```
- **Response `201 Created`**: Returns created opportunity with `status: "PENDING_APPROVAL"`.

### `PUT /api/v1/opportunities/:id/approve` (Admin Only)
Approves an opportunity for public discovery.
- **Access**: Admin

---

## 5. Applications & Schedule Endpoints

### `POST /api/v1/opportunities/:id/apply`
Expresses interest / applies to join an opportunity slot.
- **Access**: Authenticated Volunteer (Must have completed onboarding)
- **Response `200 OK`**:
  ```json
  {
    "applicationId": "app_8812",
    "opportunityId": "opp_4401",
    "status": "APPROVED",
    "matchScore": 92,
    "scheduledSlot": "2026-09-12T09:00:00.000Z"
  }
  ```

### `GET /api/v1/my-schedule`
Retrieves upcoming assigned opportunities for the authenticated volunteer.
- **Access**: Authenticated Volunteer
- **Response `200 OK`**: List of confirmed assignment objects.

---

## 6. AI & Hybrid Matching Engine Endpoints

### `POST /api/v1/matching/recommendations`
Generates ranked opportunities with deterministic scoring and AI match explanation.
- **Access**: Authenticated Volunteer
- **Response `200 OK`**:
  ```json
  {
    "recommendations": [
      {
        "opportunityId": "opp_4401",
        "title": "Aahara Food Distribution Drive",
        "matchScore": 95,
        "scoreBreakdown": {
          "skillMatch": 100,
          "availabilityMatch": 100,
          "locationMatch": 85
        },
        "aiExplanation": "Your certified Logistics skill and Saturday morning availability perfectly match this high-impact hunger relief drive."
      }
    ]
  }
  ```

---

## 7. Push Notifications & Reminders

### `POST /api/v1/notifications/register-token`
Registers a device FCM token for targeted push notifications.
- **Access**: Authenticated Volunteer
- **Request Body**:
  ```json
  {
    "fcmToken": "fcm_token_string...",
    "platform": "android"
  }
  ```
- **Response `200 OK`**: `{ "success": true }`
