# DATABASE_SCHEMA.md — Cloud Firestore Data Architecture & Indexes

## 1. Overview & Data Design Principles

To support **~10,000 registered users** with high concurrency, cost-efficiency, and sub-50ms response times, the Cloud Firestore schema avoids deep array mutations, prevents document bloat, and adheres to strict normalization boundaries.

```
Firestore Root Collections:
 ├── users/ {userId}
 ├── volunteer_profiles/ {userId}
 ├── opportunities/ {opportunityId}
 ├── applications/ {applicationId}
 ├── assignments/ {assignmentId}
 ├── notifications/ {notificationId}
 └── engagements/ {engagementId}
```

---

## 2. Collection Schemas

### 2.1. `users` Collection
Stores core identity, credentials, and authorization roles.
- **Document ID**: `userId` (corresponds to Firebase Auth UID)
```typescript
interface UserDocument {
  userId: string;              // Primary Key
  name: string;                // Volunteer Full Name
  email: string;               // Unique Email address
  phone: string;               // E.164 formatted phone number (+91...)
  role: 'VOLUNTEER' | 'COORDINATOR' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  fcmTokens: string[];         // Max 5 device tokens per user
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

### 2.2. `volunteer_profiles` Collection
Contains extended onboarding criteria, skills, and background verification data.
- **Document ID**: `userId` (1:1 with `users`)
```typescript
interface VolunteerProfileDocument {
  userId: string;
  dateOfBirth: string;         // ISO YYYY-MM-DD
  gender?: string;
  address: {
    line1?: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
  skills: string[];            // e.g. ["Teaching", "Logistics", "Medical"]
  availability: {
    weekdays: ('MORNING' | 'AFTERNOON' | 'EVENING')[];
    weekends: ('MORNING' | 'AFTERNOON' | 'EVENING')[];
  };
  identityVerified: boolean;
  identityDocUrl?: string;     // Cloud Storage signed reference
  backgroundCheckStatus: 'UNSUBMITTED' | 'PENDING' | 'VERIFIED' | 'FLAGGED';
  backgroundCheckNotes?: string;
  termsAccepted: boolean;
  termsAcceptedAt?: FirebaseFirestore.Timestamp;
  termsVersion?: string;
  totalServiceHours: number;   // Aggregated counter
  completedEngagementsCount: number;
  ratingAverage: number;       // 1.0 to 5.0
  updatedAt: FirebaseFirestore.Timestamp;
}
```

### 2.3. `opportunities` Collection
Stores volunteer projects, criteria, and slot limits.
- **Document ID**: `opportunityId` (`opp_uuid`)
```typescript
interface OpportunityDocument {
  opportunityId: string;
  title: string;
  description: string;
  category: 'EDUCATION' | 'HEALTHCARE' | 'RELIEF' | 'ENVIRONMENT' | 'COMMUNITY';
  location: {
    venueName: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  requiredSkills: string[];
  scheduledDate: FirebaseFirestore.Timestamp;
  durationHours: number;
  capacity: number;            // Total volunteer quota (e.g. 20)
  assignedCount: number;       // Current filled quota (atomically incremented)
  expectedImpact: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'FILLED' | 'COMPLETED' | 'CANCELLED';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  createdBy: string;           // Admin/Coordinator userId
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

### 2.4. `applications` Collection
Captures volunteer applications and match scores.
- **Document ID**: `applicationId`
```typescript
interface ApplicationDocument {
  applicationId: string;
  opportunityId: string;
  volunteerId: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'WAITLISTED' | 'REJECTED' | 'WITHDRAWN';
  matchScore: number;          // Calculated 0 to 100
  matchBreakdown: {
    skillsMatch: number;
    availabilityMatch: number;
    locationMatch: number;
  };
  aiRecommendationRationale?: string;
  appliedAt: FirebaseFirestore.Timestamp;
  reviewedAt?: FirebaseFirestore.Timestamp;
  reviewedBy?: string;
}
```

### 2.5. `assignments` Collection
Active slot allocations and scheduling rosters.
- **Document ID**: `assignmentId`
```typescript
interface AssignmentDocument {
  assignmentId: string;
  opportunityId: string;
  volunteerId: string;
  scheduledStartTime: FirebaseFirestore.Timestamp;
  scheduledEndTime: FirebaseFirestore.Timestamp;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  checkInTime?: FirebaseFirestore.Timestamp;
  checkOutTime?: FirebaseFirestore.Timestamp;
  assignedAt: FirebaseFirestore.Timestamp;
}
```

### 2.6. `notifications` Collection
In-app and push notification log for volunteers.
- **Document ID**: `notificationId`
```typescript
interface NotificationDocument {
  notificationId: string;
  userId: string;
  type: 'OPPORTUNITY_MATCH' | 'APPLICATION_STATUS' | 'SCHEDULE_REMINDER' | 'ONBOARDING_UPDATE' | 'GENERAL_ANNOUNCEMENT';
  title: string;
  message: string;
  screenTarget: string;        // Deep-link target: 'opportunity_details', 'schedule', etc.
  targetEntityId?: string;
  read: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}
```

### 2.7. `engagements` Collection
Historical verified service hours and certificates.
- **Document ID**: `engagementId`
```typescript
interface EngagementDocument {
  engagementId: string;
  volunteerId: string;
  opportunityId: string;
  hoursLogged: number;
  impactSummary: string;
  status: 'VERIFIED' | 'DISPUTED';
  verifiedBy: string;          // Coordinator ID
  completedAt: FirebaseFirestore.Timestamp;
}
```

---

## 3. Required Firestore Composite Indexes

For 10,000 users, compound filtering without composite indexes will throw execution errors. The following indexes are deployed in `firestore.indexes.json`:

1. **Opportunities Discovery Index**:
   - Collection: `opportunities`
   - Fields: `status` (Ascending) + `category` (Ascending) + `scheduledDate` (Ascending)
2. **Volunteer Schedule Index**:
   - Collection: `assignments`
   - Fields: `volunteerId` (Ascending) + `status` (Ascending) + `scheduledStartTime` (Ascending)
3. **Application Review Queue Index**:
   - Collection: `applications`
   - Fields: `opportunityId` (Ascending) + `status` (Ascending) + `appliedAt` (Descending)
4. **Volunteer Notifications Feed**:
   - Collection: `notifications`
   - Fields: `userId` (Ascending) + `read` (Ascending) + `createdAt` (Descending)
5. **Volunteer Engagement History**:
   - Collection: `engagements`
   - Fields: `volunteerId` (Ascending) + `completedAt` (Descending)

---

## 4. 10,000-User Capacity & Storage Planning
- **Total Storage Footprint**: ~50 MB to 120 MB (excluding PDF docs stored on Cloud Storage).
- **Daily Read Operations**: ~60,000 to 150,000 reads/day (comfortably inside standard tier limits).
- **Daily Write Operations**: ~8,000 to 20,000 writes/day.
- **Cost Projection**: ~$2.50 to $7.00 / month on standard Google Cloud billing.
