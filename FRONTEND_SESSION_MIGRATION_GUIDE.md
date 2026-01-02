# Frontend Session Migration Guide

## Overview
When a guest user signs up or logs in, their search history should be migrated to their new account. This requires sending the guest session ID to the authentication endpoints.

## How It Works

1. **Guest User Session**: Frontend generates a unique session ID and stores it (e.g., in sessionStorage)
   - Format: `guest-{timestamp}-{random}`
   - Example: `guest-1767304648674-3mgzoqoshbv`

2. **Session Tracking**: Guest session ID is sent with every search request
   - Header: `x-session-id: guest-1767304648674-3mgzoqoshbv`
   - Backend tracks searches using this session ID

3. **Session Migration**: When guest signs up/logs in, the session ID must be sent to auth endpoints
   - The backend migrates all guest searches to the user account
   - Free registered users then get 3 searches per day (instead of 1 total)

## Implementation

### 1. Generate & Store Session ID

```javascript
// On app initialization (first load)
function initializeSession() {
  let sessionId = sessionStorage.getItem('session_id');
  
  if (!sessionId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    sessionId = `guest-${timestamp}-${random}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  
  return sessionId;
}
```

### 2. Send Session ID with Search Requests

```javascript
async function performSearch(keyword, country, city) {
  const sessionId = sessionStorage.getItem('session_id');
  
  const response = await fetch('http://localhost:8000/api/v1/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
      // Include Authorization header if user is logged in
      ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` })
    },
    body: JSON.stringify({
      keyword,
      country,
      city
    })
  });
  
  return response.json();
}
```

### 3. Send Session ID on Signup

```javascript
async function signup(email, password, fullName) {
  const sessionId = sessionStorage.getItem('session_id');
  
  const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId  // Send guest session ID for migration
    },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    // Store authentication token
    localStorage.setItem('auth_token', data.access_token);
    return data;
  }
  
  throw new Error('Signup failed');
}
```

### 4. Send Session ID on Signin

```javascript
async function signin(email, password) {
  const sessionId = sessionStorage.getItem('session_id');
  
  const response = await fetch('http://localhost:8000/api/v1/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId  // Send guest session ID for migration
    },
    body: JSON.stringify({
      email,
      password
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    // Store authentication token
    localStorage.setItem('auth_token', data.access_token);
    return data;
  }
  
  throw new Error('Signin failed');
}
```

## Backend Behavior

### Before Migration (Guest)
- Session ID: `guest-1767304648674-3mgzoqoshbv`
- User ID: `null`
- Search limit: **1 search total** per day
- Results shown: **5 results max**

### During Signup/Signin
Backend logs show:
```
[Auth] Signup request received - x_session_id: guest-1767304648674-3mgzoqoshbv
[Session Migration] Migrating session guest-1767304648674-3mgzoqoshbv to user 5a34b145-...
[Session Migration] Transferred guest usage (1) to user 5a34b145-...
[Auth] Session migration successful
```

### After Migration (Free Registered)
- User ID: `5a34b145-edbf-417a-a444-2df9e16c349c`
- Session ID: `null` (migrated)
- Search limit: **3 searches per day** (from 1 total)
- Results shown: **10 results max** (from 5)

## Expected Behavior

### Scenario: Guest searches twice, then signs up

1. **First search**: Guest uses 1 of 1 search
   - 0 searches remaining

2. **Second search attempt**: REJECTED - limit reached
   - Error: "You've used your 1 free search. Sign up to get 3 free searches per day!"

3. **User signs up** (with `x-session-id` header)
   - Backend migrates the 1 search from guest session to user account
   - User now has 2 more searches available today (3 total - 1 used)

4. **Next search**: SUCCESS - user has 2 remaining
   - Limit is now 3 per day, not 1 total

## API Endpoints

### POST `/api/v1/auth/signup`
**Headers:**
- `x-session-id` (optional): Guest session ID to migrate

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "access_token": "jwt-token",
  "refresh_token": "refresh-jwt-token",
  "token_type": "bearer",
  "roles": ["user"]
}
```

### POST `/api/v1/auth/signin`
**Headers:**
- `x-session-id` (optional): Guest session ID to migrate

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:** Same as signup

### POST `/api/v1/search`
**Headers:**
- `x-session-id` (required for guests): Guest session ID
- `Authorization` (optional for registered users): `Bearer {access_token}`

**Body:**
```json
{
  "keyword": "ps5",
  "country": "India",
  "city": "Bengaluru"
}
```

**Response:**
```json
{
  "success": true,
  "keyword": "ps5",
  "total_results": 10,
  "remaining_searches": 2,
  "search_limit_message": "2 of 3 searches remaining today",
  "results": [...]
}
```

## Debugging

### Check Current Limits
Frontend can call the limits endpoint to verify:
```javascript
async function checkSearchLimits() {
  const sessionId = sessionStorage.getItem('session_id');
  const authToken = localStorage.getItem('auth_token');
  
  const response = await fetch('http://localhost:8000/api/v1/search/limits', {
    headers: {
      'x-session-id': sessionId,
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  });
  
  const data = await response.json();
  console.log({
    user_type: data.user_type,
    remaining_searches: data.remaining_searches,
    is_unlimited: data.is_unlimited,
    daily_limit: data.daily_limit,
    message: data.message
  });
}
```

### Backend Logs
Look for these log patterns:
- `[Auth] Signup request received - x_session_id:` - Auth endpoint received header
- `[Session Migration] Migrating session` - Migration started
- `[Session Migration] Transferred guest usage` - Migration successful
- `[Search] User Type: registered` - Search confirmed as registered user
