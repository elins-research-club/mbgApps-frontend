# Frontend Documentation

## Base URLs

- **Development:** `http://localhost:3000`
- **API:** `http://localhost:3001/api`

---

## Table of Contents

1. [Pages](#pages)
2. [Components](#components)
3. [Services](#services)
4. [Context](#context)
5. [Middleware](#middleware)
6. [Authentication Flow](#authentication-flow)
7. [Styling](#styling)

---

## Pages

### Public Pages

#### `/auth/login`
**File:** `src/pages/auth/login.jsx`
**Component:** `LoginForm`

User login page with email/password.

**Features:**
- Email/password authentication
- Redirects based on organization status
- Links to signup and forgot password

---

#### `/auth/sign-up`
**File:** `src/pages/auth/sign-up.jsx`
**Component:** `SignUpForm`

User registration page.

**Features:**
- Creates user account
- Auto-creates organization
- Auto-login after signup
- Redirects to pending approval

---

#### `/auth/forgot-password`
**File:** `src/pages/auth/forgot-password.jsx`

Password reset request page.

---

#### `/auth/update-password`
**File:** `src/pages/auth/update-password.jsx`

Update password after reset.

---

### Admin Pages

#### `/admin/login`
**File:** `src/pages/admin/login.jsx`

Super admin login page.

**Features:**
- Admin-specific authentication
- Checks `is_super_admin` flag
- Redirects to admin dashboard

**Code Example:**
```javascript
const response = await fetch(`${API_URL}/auth/admin/sign-in`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();
// data.admin.is_super_admin === true
```

---

#### `/admin/dashboard`
**File:** `src/pages/admin/dashboard.jsx`

Admin dashboard for user management.

**Features:**
- Two tabs: "Pending Users" and "Pending Orgs"
- Approve/reject users
- Approve/reject organizations
- View all users

**Tabs:**
1. **Pending Users** - Shows users awaiting approval
2. **Pending Orgs** - Shows organizations awaiting approval
3. **All Users** - Shows all users with roles

---

#### `/admin/organizations`
**File:** `src/pages/admin/organizations.jsx`

Dedicated organization management page.

**Features:**
- View pending organizations
- Approve/reject organizations
- View all organizations

---

### User Pages

#### `/pending-approval`
**File:** `src/pages/pending-approval.jsx`

Page shown to users waiting for admin approval.

**Features:**
- Shows approval status
- Auto-refreshes every 5 seconds
- Displays rejection reason if rejected
- Redirects to dashboard when approved

**States:**
- **Pending:** Shows "Under Review" message
- **Active:** Redirects to dashboard
- **Rejected:** Shows rejection reason + option to create new org

---

#### `/organization/create`
**File:** `src/pages/organization/create.jsx`
**Component:** `CreateOrganization`

Create new organization or sub-organization.

**Features:**
- Create main organization
- Create sub-organization (max depth: 2)
- Shows pending approval notice

---

#### `/organization/[id]/dashboard`
**File:** `src/pages/organization/[id]/dashboard.jsx`
**Component:** `OrgOwnerDashboard`

Organization management dashboard.

**Features:**
- View organization details
- Manage members
- Manage roles
- Create sub-organizations
- View invite code

**Tabs:**
1. **Pending** - Member requests
2. **Members** - Active members
3. **Roles** - Organization roles

---

## Components

### Auth Components

#### `LoginForm`
**File:** `src/components/login-form.jsx`

Regular user login form.

**Props:** None

**Behavior:**
1. Calls `/api/auth/sign-in`
2. Sets Supabase session
3. Redirects based on org status

---

#### `SignUpForm`
**File:** `src/components/sign-up-form.jsx`

User registration form.

**Props:** None

**Behavior:**
1. Calls `/api/auth/sign-up`
2. Auto-login
3. Redirects to `/pending-approval`

---

#### `OrgApprovalBanner`
**File:** `src/components/OrgApprovalBanner.jsx`

Banner showing organization approval status.

**Props:** None (uses AuthContext)

**Shows:**
- Amber banner when pending
- Red banner when rejected
- Nothing when active

---

### Admin Components

#### `AdminNavbar`
**File:** `src/components/AdminNavbar.jsx`

Navigation for admin pages.

**Props:**
- `onLogout`: Function to call on logout

**Features:**
- Tabs: Users, Organizations
- Logout button

---

### Organization Components

#### `CreateOrganization`
**File:** `src/components/CreateOrganization.jsx`

Form to create organization.

**Props:** None

**Features:**
- Main organization creation
- Sub-organization creation
- Shows approval notice

---

#### `OrgOwnerDashboard`
**File:** `src/components/OrgOwnerDashboard.jsx`

Full organization management dashboard.

**Props:**
- `orgId`: Organization ID

**Features:**
- Member management
- Role management
- Sub-organization management

---

### UI Components (shadcn/ui)

Located in `src/components/ui/`:
- `button.jsx`
- `card.jsx`
- `input.jsx`
- `label.jsx`
- And more...

---

## Services

### API Service

**File:** `src/services/api.js`

General API utilities.

**Functions:**
- `request(path, options)` - Base API caller
- `getAccessToken()` - Get current user token

---

### Organization Service

**File:** `src/services/orgService.js`

Organization-related API calls.

**Functions:**
```javascript
// Create
createOrganization({ name, description })
createSubOrganization(parentOrgId, { name, description })

// Read
getOrganization(orgId)
getAllOrganizations(query)
getPendingOrganizations()
getSubOrganizations(orgId)

// Update
updateOrganization(orgId, { name, description })

// Admin
approveOrganization(orgId)
rejectOrganization(orgId, reason)

// Members
getOrgMembers(orgId)
acceptMember(orgId, memberId)
rejectMember(orgId, memberId)
removeMember(orgId, memberId)
assignRole(orgId, memberId, roleId)

// Roles
getOrgRoles(orgId)
createRole(orgId, { name, permissions })
updateRole(orgId, roleId, { name, permissions })
deleteRole(orgId, roleId)

// Profile
updateProfile({ fullName, phone, bio })
```

**Usage Example:**
```javascript
import { createOrganization } from '@/services/orgService';

const org = await createOrganization({
  name: 'My Org',
  description: 'Description',
});
```

---

### Admin Service

**File:** `src/services/adminService.js`

Admin-related API calls.

**Functions:**
```javascript
getPendingUsers()
approveUser(userId)
rejectUser(userId, reason)
getAllUsers(query)
updateUserRole(userId, role)
deleteUser(userId)
```

---

## Context

### AuthContext

**File:** `src/contexts/AuthContext.js`

Provides authentication state to entire app.

**Provider:** `AuthProvider`

**Hook:** `useAuth()`

**Values:**
```javascript
{
  user: User | null,              // Current Supabase user
  profile: Profile | null,        // Userext profile
  orgMembership: Membership | null,
  organizations: Organization[],  // User's organizations
  loading: boolean,
  
  // Flags
  isOrgOwner: boolean,
  isOrgPending: boolean,
  isOrgRejected: boolean,
  isOrgActive: boolean,
  orgStatus: string | null,
  
  // Permissions
  canSave: boolean,
  canValidate: boolean,
  canManagePlans: boolean,
  canEditRecipe: boolean,
  canManageUsers: boolean,
  canManageRoles: boolean,
  
  // Actions
  logout: () => Promise<void>,
  refresh: () => Promise<void>,
}
```

**Usage Example:**
```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isOrgPending, logout } = useAuth();
  
  if (isOrgPending) {
    return <div>Waiting for approval...</div>;
  }
  
  return <div>Welcome, {user?.email}!</div>;
}
```

---

## Middleware

**File:** `src/lib/middleware.js`

Next.js middleware for route protection.

**Location:** Runs on every request

**Checks:**

### Admin Routes (`/admin/*`)
1. Allows `/admin/login` without check
2. Redirects to login if no session
3. Allows access if user is logged in

### Regular Routes
1. Redirects to `/auth/login` if no session
2. Allows access if logged in

**Code:**
```javascript
export async function middleware(request) {
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const pathname = request.nextUrl.pathname;
  
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    if (!user) {
      return NextResponse.redirect('/admin/login');
    }
    
    return NextResponse.next();
  }
  
  // Regular routes...
}
```

---

## Authentication Flow

### User Signup

```
1. User fills form
   ↓
2. SignUpForm submits to /api/auth/sign-up
   ↓
3. Backend creates:
   - Auth user
   - Userext profile
   - Organization
   - Membership
   ↓
4. Auto-login via Supabase
   ↓
5. Redirect to /pending-approval
   ↓
6. Page polls for status changes
   ↓
7. When approved → redirect to dashboard
```

### User Login

```
1. User enters credentials
   ↓
2. LoginForm submits to /api/auth/sign-in
   ↓
3. Backend validates and returns data
   ↓
4. Frontend checks organization status:
   - pending → /pending-approval
   - rejected → /pending-approval
   - active → /
   - no org → /organization/create
```

### Admin Login

```
1. Admin enters credentials
   ↓
2. Form submits to /api/auth/admin/sign-in
   ↓
3. Backend checks is_super_admin
   ↓
4. Returns admin data + tokens
   ↓
5. Set Supabase session
   ↓
6. Redirect to /admin/dashboard
```

---

## Styling

### Tailwind CSS

All components use Tailwind CSS v4.

**Example:**
```jsx
<div className="flex items-center justify-center p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-slate-800">Title</h1>
</div>
```

### shadcn/ui

Pre-built components from shadcn/ui.

**Import:**
```javascript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

### Icons

Using Lucide React icons.

**Import:**
```javascript
import { User, LogOut, Settings } from 'lucide-react';
```

---

## Environment Variables

**File:** `.env.local`

```bash
# API
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="eyJ..."
```

---

## Testing

### Manual Testing Checklist

#### User Signup
- [ ] Fill signup form
- [ ] Verify redirect to pending approval
- [ ] Check database for created records

#### User Login
- [ ] Login with valid credentials
- [ ] Verify redirect based on org status
- [ ] Test with pending org
- [ ] Test with active org

#### Admin Login
- [ ] Login with admin credentials
- [ ] Verify redirect to dashboard
- [ ] Check admin data loads

#### Organization Approval
- [ ] Create new org as user
- [ ] Login as admin
- [ ] Approve organization
- [ ] Verify user can access dashboard

---

## Common Issues

### "is_super_admin is null"
**Fix:** Run SQL to set flag:
```sql
UPDATE "public"."Userext"
SET is_super_admin = true
WHERE email = 'admin@example.com';
```

### Middleware redirect loop
**Fix:** Clear browser cache and cookies

### API returns 401
**Fix:** Check if token is valid, re-login

### Session not persisting
**Fix:** Ensure Supabase cookies are enabled

---

## Support

For frontend issues:
1. Check browser console (F12)
2. Check Network tab for failed requests
3. Verify environment variables
4. Clear cache and cookies
