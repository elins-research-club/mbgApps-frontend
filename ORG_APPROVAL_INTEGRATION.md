# Frontend Organization Approval Flow Integration

## Overview

This document describes the frontend implementation for the organization approval flow, where organization owners create accounts and super admins approve/reject them.

---

## Files Modified/Created

### New Files

| File | Purpose |
|------|---------|
| `src/pages/admin/organizations.jsx` | Admin page for reviewing org approvals |
| `src/components/OrgApprovalBanner.jsx` | Banner component for pending/rejected status |

### Modified Files

| File | Changes |
|------|---------|
| `src/services/orgService.js` | Added approval API functions |
| `src/components/CreateOrganization.jsx` | Updated success message with pending status |
| `src/components/OrgOwnerDashboard.jsx` | Added approval status overlays |
| `src/contexts/AuthContext.js` | Added org status flags |
| `src/components/AdminNavbar.jsx` | Added Organizations nav link |

---

## Service Layer (`src/services/orgService.js`)

### New Functions

```javascript
// Get all organizations with optional filtering
getAllOrganizations(query = {})

// Get pending organizations only
getPendingOrganizations()

// Approve an organization (super admin)
approveOrganization(orgId)

// Reject an organization (super admin)
rejectOrganization(orgId, reason = "")
```

### Usage Example

```javascript
import { getPendingOrganizations, approveOrganization } from "@/services/orgService";

// Load pending orgs
const pending = await getPendingOrganizations();

// Approve
await approveOrganization(orgId);

// Reject
await rejectOrganization(orgId, "Incomplete information");
```

---

## Authentication Context (`src/contexts/AuthContext.js`)

### New Context Values

```javascript
{
  isOrgPending: boolean,    // true if org status is "pending"
  isOrgRejected: boolean,   // true if org status is "rejected"
  isOrgActive: boolean,     // true if org status is "active" or null
  orgStatus: string | null  // "pending" | "active" | "rejected" | null
}
```

### Usage Example

```javascript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { isOrgPending, isOrgRejected, organization } = useAuth();

  if (isOrgPending) {
    return <div>Waiting for admin approval...</div>;
  }

  if (isOrgRejected) {
    return <div>Organization was rejected</div>;
  }

  return <div>Organization: {organization?.name}</div>;
}
```

---

## Components

### `OrgApprovalBanner.jsx`

A banner component that displays at the top of the page when the user's organization is pending or rejected.

**Features:**
- Shows amber banner for pending status
- Shows red banner for rejected status
- Provides helpful tips for organization owners
- Auto-hides when org is active

**Usage:**

```javascript
import OrgApprovalBanner from "@/components/OrgApprovalBanner";

function Page() {
  return (
    <div>
      <OrgApprovalBanner />
      {/* Rest of page */}
    </div>
  );
}
```

---

### `CreateOrganization.jsx` (Updated)

**Changes:**
- Shows detailed success message after creation
- Displays pending approval notice
- Provides option to view dashboard or create another org
- Updated info box to mention approval requirement

**User Flow:**
1. User fills organization form
2. Submits and org is created with `status: "pending"`
3. Success message shows with approval notice
4. User can view dashboard (with restrictions) or create another

---

### `OrgOwnerDashboard.jsx` (Updated)

**Changes:**
- Added `OrgApprovalBanner` at top
- Added modal overlay for pending status
- Added modal overlay for rejected status
- Blocks full functionality until approved

**Pending Overlay:**
- Shows clock icon
- Explains approval is pending
- Suggests contacting admin
- Provides refresh button

**Rejected Overlay:**
- Shows alert icon
- Explains org was rejected
- Provides option to create new org
- Provides refresh button

---

### `admin/organizations.jsx` (New)

Admin dashboard for managing organization approvals.

**Features:**
- Two tabs: "Pending Approval" and "All Organizations"
- Shows pending count badge
- Approve/Reject buttons for pending orgs
- Rejection modal with reason input
- Displays org details: name, description, owner ID, invite code, created date

**Tabs:**

1. **Pending Approval:**
   - Shows organizations with `status: "pending"`
   - Approve button (green)
   - Reject button (red)
   - Empty state when no pending orgs

2. **All Organizations:**
   - Shows all organizations with status
   - Status badges: Active (green), Pending (yellow), Rejected (red)
   - Read-only view

---

### `AdminNavbar.jsx` (Updated)

**Changes:**
- Added navigation tabs
- "Users" tab → `/admin/dashboard`
- "Organizations" tab → `/admin/organizations`
- Active tab highlighting

---

## User Flows

### 1. Organization Owner Registration

```
1. User navigates to /organization/create
2. Fills name and description
3. Clicks "Buat Organisasi"
4. Organization created with status: "pending"
5. Success message shows:
   - Organization name
   - "Menunggu Persetujuan Admin" notice
   - "Lihat Dashboard" button
   - "Buat Organisasi Lain" button
6. User clicks "Lihat Dashboard"
7. Dashboard shows with overlay:
   - "Menunggu Persetujuan Admin" modal
   - Refresh Status button
```

### 2. Super Admin Approval

```
1. Admin navigates to /admin/organizations
2. Sees pending count in tab badge
3. Reviews pending organizations table
4. Clicks "Approve" or "Reject"
5. If Reject:
   - Modal opens for reason input
   - Enters reason
   - Clicks "Confirm Rejection"
6. Success message shows
7. Organization status updated
8. Owner can now access features (if approved)
```

### 3. Organization Owner After Approval

```
1. User refreshes page or logs in again
2. AuthContext loads org with status: "active"
3. OrgApprovalBanner doesn't show
4. Dashboard overlay doesn't appear
5. Full functionality available
```

---

## UI States

### Pending Status

**Banner:**
```
┌─────────────────────────────────────────────────────┐
│ ⏰ Organisasi Menunggu Persetujuan                  │
│                                                     │
│ "Organization Name" sedang menunggu persetujuan    │
│ dari administrator. Anda tidak dapat mengakses      │
│ fitur organisasi hingga disetujui.                  │
│                                                     │
│ 💡 Tips: Hubungi administrator untuk mempercepat   │
│    proses persetujuan.                              │
└─────────────────────────────────────────────────────┘
```

**Dashboard Overlay:**
```
┌──────────────────────────────────────┐
│              ⏰                       │
│   Menunggu Persetujuan Admin         │
│                                      │
│ "Organization Name" sedang menunggu  │
│ persetujuan dari administrator.       │
│ Anda dapat melihat dashboard ini,    │
│ tetapi belum dapat mengakses fitur   │
│ organisasi.                          │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 💡 Hubungi administrator untuk   │ │
│ │    mempercepat proses persetujuan│ │
│ └──────────────────────────────────┘ │
│                                      │
│      [ Refresh Status ]              │
└──────────────────────────────────────┘
```

### Rejected Status

**Banner:**
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  Organisasi Ditolak                              │
│                                                     │
│ "Organization Name" telah ditolak oleh             │
│ administrator.                                      │
│                                                     │
│ Silakan hubungi administrator untuk informasi      │
│ lebih lanjut atau buat organisasi baru.             │
└─────────────────────────────────────────────────────┘
```

**Dashboard Overlay:**
```
┌──────────────────────────────────────┐
│              ⚠️                       │
│   Organisasi Ditolak                 │
│                                      │
│ "Organization Name" telah ditolak    │
│ oleh administrator.                  │
│                                      │
│    [ Buat Organisasi Baru ] [Refresh]│
└──────────────────────────────────────┘
```

---

## API Integration

### Endpoints Used

| Method | Endpoint | Function |
|--------|----------|----------|
| `GET` | `/api/organizations/pending` | `getPendingOrganizations()` |
| `GET` | `/api/organizations` | `getAllOrganizations()` |
| `POST` | `/api/organizations/:id/approve` | `approveOrganization(orgId)` |
| `POST` | `/api/organizations/:id/reject` | `rejectOrganization(orgId, reason)` |

### Request/Response Examples

**Get Pending Organizations:**
```javascript
// Request
GET /api/organizations/pending

// Response
[
  {
    "id": "uuid",
    "name": "My Organization",
    "description": "Description",
    "owner_id": "user-uuid",
    "status": "pending",
    "invite_code": "ABCD1234",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Approve Organization:**
```javascript
// Request
POST /api/organizations/org-uuid/approve
Authorization: Bearer admin-token

// Response
{
  "id": "org-uuid",
  "name": "My Organization",
  "status": "active",
  "approved_by": "admin-uuid",
  "approved_at": "2024-01-01T00:00:00Z"
}
```

**Reject Organization:**
```javascript
// Request
POST /api/organizations/org-uuid/reject
Authorization: Bearer admin-token
Content-Type: application/json

{
  "reason": "Incomplete information"
}

// Response
{
  "id": "org-uuid",
  "name": "My Organization",
  "status": "rejected",
  "approved_by": "admin-uuid",
  "approved_at": "2024-01-01T00:00:00Z",
  "rejection_reason": "Incomplete information"
}
```

---

## Styling

### Color Scheme

| Status | Background | Border | Text | Icon |
|--------|-----------|--------|------|------|
| Pending | `bg-amber-50` | `border-amber-200` | `text-amber-700/800` | `text-amber-600` |
| Rejected | `bg-red-50` | `border-red-200` | `text-red-700/800` | `text-red-600` |
| Active | `bg-green-50` | `border-green-200` | `text-green-700/800` | `text-green-600` |

### Badge Classes

```javascript
// Status badges in tables
{
  active:   "bg-green-100 text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700"
}
```

---

## Best Practices

### 1. Always Check Org Status

```javascript
const { isOrgPending, isOrgActive } = useAuth();

if (!isOrgActive) {
  // Show appropriate message
  return <OrgApprovalBanner />;
}
```

### 2. Handle Loading States

```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadOrganizations().finally(() => setLoading(false));
}, []);

if (loading) return <LoadingSpinner />;
```

### 3. Show Helpful Messages

```javascript
{isOrgPending && (
  <p className="text-xs text-amber-600 mt-2">
    💡 Tips: Hubungi administrator untuk mempercepat proses persetujuan.
  </p>
)}
```

### 4. Provide Clear Actions

```javascript
<div className="flex gap-3">
  <button onClick={handleApprove} className="btn-primary">
    Approve
  </button>
  <button onClick={handleReject} className="btn-danger">
    Reject
  </button>
</div>
```

---

## Testing Checklist

### Organization Owner Flow

- [ ] Create organization with valid name
- [ ] Verify success message shows pending status
- [ ] Verify dashboard shows pending overlay
- [ ] Verify org banner appears on all pages
- [ ] Verify restricted functionality
- [ ] Refresh after admin approval
- [ ] Verify overlay disappears
- [ ] Verify full functionality available

### Super Admin Flow

- [ ] Navigate to /admin/organizations
- [ ] Verify pending tab shows count
- [ ] Verify pending orgs listed correctly
- [ ] Click approve button
- [ ] Verify success message
- [ ] Verify org removed from pending list
- [ ] Create another test org
- [ ] Click reject button
- [ ] Enter rejection reason
- [ ] Confirm rejection
- [ ] Verify org status changed to rejected

### Edge Cases

- [ ] No pending orgs (empty state)
- [ ] No orgs at all (empty state)
- [ ] Network error during approval
- [ ] Network error during rejection
- [ ] Org approved while owner viewing dashboard
- [ ] Org rejected while owner viewing dashboard

---

## Troubleshooting

### Issue: Org status not updating

**Solution:** Call `refresh()` from AuthContext after approval/rejection

```javascript
const { refresh } = useAuth();

await approveOrganization(orgId);
await refresh(); // Reloads org status
```

### Issue: Banner not showing

**Solution:** Ensure `OrgApprovalBanner` is imported and rendered

```javascript
import OrgApprovalBanner from "@/components/OrgApprovalBanner";

<OrgApprovalBanner />
```

### Issue: Admin can't access organizations page

**Solution:** Verify user has `SuperAdmin` role in Userext table

```sql
SELECT role FROM "public"."Userext" WHERE id = 'user-uuid';
-- Should return 'SuperAdmin'
```

---

## Next Steps / Enhancements

1. **Email Notifications:** Send emails on approval/rejection
2. **Real-time Updates:** Use Supabase realtime for instant status updates
3. **Bulk Actions:** Approve/reject multiple orgs at once
4. **Org Edit During Pending:** Allow owners to edit pending orgs
5. **Resubmission Flow:** Allow rejected orgs to be resubmitted
6. **Approval History:** Track all approval/rejection actions
7. **Admin Notes:** Allow admins to add internal notes
