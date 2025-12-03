// Utility for calling Supabase Edge Functions with fallback logic
import { supabase } from './client';

interface FunctionInvokeOptions {
  body?: Record<string, any>;
  headers?: Record<string, string>;
}

interface FunctionResponse<T = any> {
  data: T | null;
  error: Error | null;
}

export async function invokeFunctionSafely<T = any>(
  functionName: string,
  options?: FunctionInvokeOptions
): Promise<FunctionResponse<T>> {
  try {
    console.log(`[Supabase] Invoking function "${functionName}"`);
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: options?.body,
      headers: options?.headers,
    });

    if (error) {
      console.error(`[Supabase] Error invoking ${functionName}:`, error);
      return { data: null, error: error as any };
    }

    console.log(`[Supabase] Function ${functionName} succeeded`);
    return { data, error: null };
  } catch (error) {
    console.error(`[Supabase] Exception invoking ${functionName}:`, error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// Export the main supabase client
export { supabase } from './client';
