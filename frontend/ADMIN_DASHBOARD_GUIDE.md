# Admin Dashboard - Real-Time Updates & Toast Notifications

## Overview

The admin dashboard now features:
- **Real-time updates** without page refresh
- **React Hot Toast** notifications for all actions
- **Automatic data refetching** after mutations
- **Auto-dismissing loading toasts** for user feedback

## Features Implemented

### 1. Real-Time Updates (Auto-Refetch)

All admin tables automatically refetch data after mutations using TanStack Query's `invalidateQueries`:

#### Pages with Real-Time Updates:
- ✅ **Users Table** - Create, Update, Delete users
- ✅ **Transactions Table** - Create, Update, Delete transactions
- ✅ **Subscriptions Table** - Create, Update, Delete subscriptions
- ✅ **Email Templates** - Create, Update, Delete email templates

#### How It Works:
```typescript
// In useAdminCrud.ts
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      await axiosWithAuth.delete(`${API_BASE}/users/${userId}`);
    },
    onSuccess: () => {
      // Auto-refetch the users list after deletion
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });
};
```

### 2. React Hot Toast Notifications

All actions show user-friendly toast notifications with three states:
- 🔄 **Loading** - Shows while action is processing
- ✅ **Success** - Shows when action completes successfully
- ❌ **Error** - Shows with error message if action fails

#### Toast Hook Usage:

```typescript
import { useToast } from "@/hooks/useToast";

export const UsersTable = () => {
  const toast = useToast();

  const handleDelete = async (userId: string) => {
    const toastId = toast.loading("Deleting user...");
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.dismiss(toastId);
      toast.success("User deleted successfully!");
    } catch (error: any) {
      toast.dismiss(toastId);
      const errorMsg = error?.response?.data?.detail || "Failed to delete user";
      toast.error(errorMsg);
    }
  };
};
```

#### Toast Methods Available:

```typescript
const toast = useToast();

// Success toast (auto-dismisses after 3 seconds)
toast.success("Operation completed!");

// Error toast (auto-dismisses after 4 seconds)
toast.error("Something went wrong!");

// Loading toast (persistent until dismissed)
const toastId = toast.loading("Processing...");

// Dismiss a specific toast
toast.dismiss(toastId);

// Info/default toast
toast.info("Information message");

// Promise-based toast (shows loading, then success/error)
await toast.promise(
  myAsyncFunction(),
  {
    loading: "Loading data...",
    success: "Data loaded successfully!",
    error: "Failed to load data",
  }
);
```

### 3. Updated Components

#### Users Table (`UsersTable.tsx`)
- ✅ Create User → Toast feedback + Auto-refetch
- ✅ Update User → Toast feedback + Auto-refetch
- ✅ Delete User → Confirmation + Toast feedback + Auto-refetch

#### Transactions Table (`TransactionsTable.tsx`)
- ✅ Create Transaction → Toast feedback + Auto-refetch
- ✅ Update Transaction → Toast feedback + Auto-refetch
- ✅ Delete Transaction → Confirmation + Toast feedback + Auto-refetch

#### Subscriptions Table (`SubscriptionsTable.tsx`)
- ✅ Create Subscription → Toast feedback + Auto-refetch
- ✅ Update Subscription → Toast feedback + Auto-refetch
- ✅ Delete Subscription → Confirmation + Toast feedback + Auto-refetch

#### Email Template Management (`EmailTemplateManagement.tsx`)
- ✅ Create Template → Toast feedback + Auto-refetch
- ✅ Update Template → Toast feedback + Auto-refetch
- ✅ Delete Template → Confirmation + Toast feedback + Auto-refetch

## Usage Example

### Without Toast (Before)
```typescript
const handleDelete = async (userId: string) => {
  try {
    await deleteUserMutation.mutateAsync(userId);
    // User doesn't know if it worked - no feedback!
  } catch (error) {
    console.error("Failed:", error);
    // Silent failure
  }
};
```

### With Toast & Auto-Refetch (After)
```typescript
import { useToast } from "@/hooks/useToast";

const handleDelete = async (userId: string) => {
  const toastId = toast.loading("Deleting user...");
  try {
    await deleteUserMutation.mutateAsync(userId);
    toast.dismiss(toastId);
    toast.success("User deleted successfully!");
    // Data automatically refetches via queryClient.invalidateQueries()
  } catch (error: any) {
    toast.dismiss(toastId);
    const errorMsg = error?.response?.data?.detail || "Failed to delete user";
    toast.error(errorMsg);
  }
};
```

## Key Differences

| Feature | Before | After |
|---------|--------|-------|
| **Page Refresh** | Manual refresh needed | Automatic refresh after action |
| **User Feedback** | Silent or console errors | Toast notifications |
| **Loading State** | No visual indicator | Loading toast shown |
| **Error Messages** | Console only | User-friendly toast |
| **Success Feedback** | No indication | Success toast appears |

## Configuration

### Toast Position & Duration
Edit `useToast.ts` to customize toast behavior:

```typescript
// Current settings:
success: toast.success(message, {
  duration: 3000,      // 3 seconds before auto-dismiss
  position: 'top-right',
  ...options,
});

error: toast.error(message, {
  duration: 4000,      // 4 seconds before auto-dismiss
  position: 'top-right',
  ...options,
});
```

### Supported Positions:
- `'top-left'`
- `'top-center'`
- `'top-right'`
- `'bottom-left'`
- `'bottom-center'`
- `'bottom-right'`

## Toaster Setup

The `Toaster` component is already configured in `App.tsx`:

```typescript
<Toaster position="bottom-left" />
```

This means:
- ✅ All toasts automatically render in the bottom-left corner
- ✅ No manual JSX needed in individual components
- ✅ Toasts persist across route changes within admin dashboard

## Best Practices

### 1. Always Use Loading Toast for Long Operations
```typescript
const toastId = toast.loading("Processing large file...");
// ... do work ...
toast.dismiss(toastId);
toast.success("Done!");
```

### 2. Extract Error Messages Properly
```typescript
const errorMsg = error?.response?.data?.detail || error?.message || "Operation failed";
toast.error(errorMsg);
```

### 3. Use Confirmation Dialogs Before Destructive Actions
```typescript
if (!confirm("Are you sure you want to delete this?")) return;
// ... proceed with deletion ...
```

### 4. Keep Toast Messages Concise
```typescript
// ✅ Good
toast.success("User created!");

// ❌ Avoid
toast.success("The user has been successfully created in the database and is now active");
```

## Testing the Features

### Test Case 1: Delete User (Real-Time Update)
1. Open Users table
2. Click delete button on any user
3. Confirm deletion
4. See "Deleting user..." loading toast
5. See "User deleted successfully!" toast
6. **Observe**: User disappears from table WITHOUT page refresh

### Test Case 2: Create Transaction (Auto-Refetch)
1. Open Transactions table
2. Click "Create Transaction"
3. Fill form and submit
4. See "Creating transaction..." loading toast
5. See "Transaction created successfully!" toast
6. **Observe**: New transaction appears in table WITHOUT page refresh

### Test Case 3: Error Handling
1. Try to create/update with invalid data
2. See "Creating..." loading toast
3. See error toast with API error message
4. **Observe**: Table remains unchanged, error is clearly shown

## Troubleshooting

### Toasts Not Showing
- Check that `<Toaster position="bottom-left" />` exists in `App.tsx`
- Check browser console for errors
- Verify `useToast` hook is imported correctly

### Data Not Updating After Mutation
- Verify the query key in `invalidateQueries` matches the query key in `useQuery`
- Check network tab - API call should return 200 status
- Look for console errors in DevTools

### Multiple Toasts Showing
- Make sure to `toast.dismiss(toastId)` before showing success/error toast
- Use `toast.promise()` for automatic state management

## File Locations

- **Toast Hook**: `src/hooks/useToast.ts`
- **CRUD Mutations**: `src/hooks/useAdminCrud.ts`
- **Admin Tables**: 
  - `src/components/admin/UsersTable.tsx`
  - `src/components/admin/TransactionsTable.tsx`
  - `src/components/admin/SubscriptionsTable.tsx`
  - `src/components/admin/EmailTemplateManagement.tsx`

## Future Enhancements

Possible improvements:
1. Add sound notifications for critical operations
2. Add undo functionality to deletion toasts
3. Add batch operation toasts
4. Add websocket support for real-time multi-user updates
5. Add optimistic updates (show change immediately, revert if fails)
