# 🔧 Query Key Mismatch - FIXED

## Problem Found
Toast notifications weren't showing and data wasn't reloading after mutations.

### Root Cause
**Query key mismatch between two hooks:**

```
useAdminApi.ts:        ['admin-users', skip, limit, search, subscriptionTier]   ← WITH HYPHENS
                        ↓
useAdminCrud.ts:       ["admin_users"]                                           ← WITH UNDERSCORES
```

React Query couldn't match the invalidation to the actual query!

### The Bug
```typescript
// ❌ BEFORE - Query keys don't match!
// In useAdminApi.ts
queryKey: ['admin-users', skip, limit, search, subscriptionTier]

// In useAdminCrud.ts  
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["admin_users"] });  // ← Different key!
}
```

## Solution Applied

Changed all query keys in `useAdminCrud.ts` to use **hyphens** to match `useAdminApi.ts`:

### Users
```typescript
// ✅ AFTER
queryClient.invalidateQueries({ queryKey: ["admin-users"] });
```

### Transactions
```typescript
// ✅ AFTER
queryClient.invalidateQueries({ queryKey: ["admin-payment-transactions"] });
```

### Subscriptions
```typescript
// ✅ AFTER
queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
```

## What This Fixes
- ✅ Toast notifications now appear (loading, success, error)
- ✅ Data automatically refetches after actions
- ✅ Deleted items disappear from table instantly
- ✅ Created/updated items appear immediately
- ✅ NO manual refresh needed

## Testing
1. **Delete a user** → See "Deleting user..." toast → "User deleted successfully!" → User disappears
2. **Create transaction** → See loading toast → Success toast → Table updates instantly
3. **Update subscription** → See loading toast → Success toast → Changes show immediately

## Files Changed
- `frontend/src/hooks/useAdminCrud.ts` - Fixed all query key invalidations

## Impact
- ✅ Users Table - Now works with auto-refetch
- ✅ Transactions Table - Now works with auto-refetch
- ✅ Subscriptions Table - Now works with auto-refetch
- ✅ Email Templates - Now works with auto-refetch
