# Quick Reference - Admin Dashboard Toast & Auto-Refetch

## 🎯 TL;DR

- **Real-time updates**: Tables auto-refresh after any action (no manual refresh)
- **Toast notifications**: All actions show loading → success/error feedback
- **Implementation**: Already done for Users, Transactions, Subscriptions, Email Templates

## 📋 How to Use in New Admin Tables

### Step 1: Import useToast
```typescript
import { useToast } from "@/hooks/useToast";
```

### Step 2: Initialize in Component
```typescript
export const MyAdminTable = () => {
  const toast = useToast();
  // ... rest of code
};
```

### Step 3: Wrap Mutations with Toast
```typescript
const handleDelete = async (id: string) => {
  const toastId = toast.loading("Deleting...");
  try {
    await deleteMutation.mutateAsync(id);
    toast.dismiss(toastId);
    toast.success("Deleted successfully!");
  } catch (error: any) {
    toast.dismiss(toastId);
    const msg = error?.response?.data?.detail || error?.message || "Failed";
    toast.error(msg);
  }
};
```

## 🔄 How Auto-Refetch Works

All CRUD hooks in `useAdminCrud.ts` automatically refetch after mutation:

```typescript
// In useAdminCrud.ts - ALREADY IMPLEMENTED
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      await axiosWithAuth.delete(`/api/v1/admin/crud/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      // ^ This triggers automatic refetch of users list
    },
  });
};
```

## ✅ What's Already Done

- [x] Users Table → toast + auto-refetch
- [x] Transactions Table → toast + auto-refetch
- [x] Subscriptions Table → toast + auto-refetch
- [x] Email Templates → toast + auto-refetch
- [x] Toast hook created (`useToast.ts`)
- [x] Toaster provider in `App.tsx`

## 🚀 Usage Summary

| Action | Before | After |
|--------|--------|-------|
| Delete user | Reload page, console error | Toast appears, data auto-updates |
| Create transaction | Reload page | Toast appears, data auto-updates |
| Update subscription | Reload page | Toast appears, data auto-updates |

## 📍 Toast Positions Available

```typescript
toast.success("Message", { position: 'top-right' });
// Options: top-left, top-center, top-right, 
//          bottom-left, bottom-center, bottom-right
```

## ⏱️ Toast Auto-Dismiss Times

```typescript
toast.success(msg)  // 3 seconds
toast.error(msg)    // 4 seconds
toast.loading(msg)  // NEVER (manual dismiss required)
toast.info(msg)     // 3 seconds
```

## 🎨 Styling

Toasts are styled by `react-hot-toast` theme and integrate with your Tailwind CSS. No custom styling needed!

## 🐛 Common Issues & Fixes

### Data not updating?
- Check network tab for API errors
- Verify query key matches: `["admin_users"]` must match the key used in `useAdminUsers()`
- Check browser console for React Query errors

### Toast not showing?
- Verify `<Toaster />` is in `App.tsx`
- Check if browser dev tools shows errors
- Make sure component imports `useToast`

### Multiple toasts showing?
- Always dismiss loading toast before showing success/error: `toast.dismiss(toastId)`

## 📝 File Checklist

- [x] `src/hooks/useToast.ts` - Toast hook
- [x] `src/components/admin/UsersTable.tsx` - Updated
- [x] `src/components/admin/TransactionsTable.tsx` - Updated
- [x] `src/components/admin/SubscriptionsTable.tsx` - Updated
- [x] `src/components/admin/EmailTemplateManagement.tsx` - Updated
- [x] `src/hooks/useAdminCrud.ts` - Has invalidateQueries
- [x] `src/App.tsx` - Has Toaster component

## 🔗 Related Files

- Guide: `frontend/ADMIN_DASHBOARD_GUIDE.md`
- Backend .env: `backend/.env` (updated with FRONTEND_URL)
- Backend config: `backend/app/config.py` (added FRONTEND_URL setting)

## 💡 Pro Tips

1. **Always use `toast.promise()` for longer operations**
   ```typescript
   await toast.promise(
     asyncFunction(),
     { loading: "Loading...", success: "Done!", error: "Failed" }
   );
   ```

2. **Extract API errors properly**
   ```typescript
   const msg = error?.response?.data?.detail || "Operation failed";
   ```

3. **Combine with confirmation dialogs for destructive actions**
   ```typescript
   if (!confirm("Really delete?")) return;
   // ... then show toast and delete
   ```
