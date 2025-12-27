import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useMemo } from 'react'

interface QueryClientWrapperProps {
  children: ReactNode
}

/**
 * Wrapper component that provides QueryClient only when needed.
 * This avoids initializing react-query on the Home page,
 * reducing initial JS execution and improving Time to Interactive.
 */
export function QueryClientWrapper({ children }: QueryClientWrapperProps) {
  const queryClient = useMemo(() => new QueryClient(), [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
