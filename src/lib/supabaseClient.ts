import { createClient } from '@supabase/supabase-js';
import { CategoryItem } from '../types';

// Helper functions to sanitize inputs (e.g. if the user pastes NEXT_PUBLIC_SUPABASE_URL=http... or quotes)
const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  let cleaned = url.trim();
  
  // Look for any substring that starts with http:// or https://
  const httpIndex = cleaned.indexOf('http://');
  const httpsIndex = cleaned.indexOf('https://');
  
  if (httpsIndex !== -1) {
    cleaned = cleaned.substring(httpsIndex);
  } else if (httpIndex !== -1) {
    cleaned = cleaned.substring(httpIndex);
  }
  
  // Now clean up trailing quotes, semicolons, commas, or spaces
  cleaned = cleaned.split(/[\s'";,]/)[0];
  
  return cleaned.trim();
};

const sanitizeKey = (key: string): string => {
  if (!key) return '';
  let cleaned = key.trim();
  
  // If it's a key-value assignment like SUPABASE_KEY=eyJ..., grab only the part after =
  const eqIndex = cleaned.indexOf('=');
  if (eqIndex !== -1) {
    cleaned = cleaned.substring(eqIndex + 1);
  }
  
  // Clean up quotes, semicolons, commas, or spaces
  cleaned = cleaned.split(/[\s'";,]/)[0];
  
  return cleaned.trim();
};

// Let's grab keys from environment variables or let the client fallback to localStorage
const getSupabaseConfig = () => {
  const envUrl = sanitizeUrl((import.meta as any).env?.VITE_SUPABASE_URL || '');
  const envKey = sanitizeKey((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '');

  const localUrl = sanitizeUrl(localStorage.getItem('gondola_supabase_url') || '');
  const localKey = sanitizeKey(localStorage.getItem('gondola_supabase_key') || '');

  const finalUrl = envUrl || localUrl;
  const finalKey = envKey || localKey;

  return {
    url: finalUrl,
    key: finalKey,
    isUsingEnv: !!envUrl && !!envKey
  };
};

export const { url: supabaseUrl, key: supabaseAnonKey, isUsingEnv } = getSupabaseConfig();

export const createDynamicSupabaseClient = (customUrl?: string, customKey?: string) => {
  const configUrl = sanitizeUrl(customUrl || supabaseUrl);
  const configKey = sanitizeKey(customKey || supabaseAnonKey);

  if (!configUrl || !configKey) {
    return null;
  }

  // Ensure valid URL structure
  try {
    new URL(configUrl);
  } catch (e) {
    console.error('URL do Supabase inválida:', configUrl);
    return null;
  }

  return createClient(configUrl, configKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
};

// Default client instance
export const supabase = createDynamicSupabaseClient();

/**
 * SQL SCHEMA SUGGESTION (Use in Supabase SQL Editor):
 * 
 * -- Create the categories table
 * CREATE TABLE public.gondola_categories (
 *     id text primary key,
 *     category text not null,
 *     target_space float8 default 0,
 *     actual_space float8 default 0,
 *     ype_meta_percent float8 default 0,
 *     shelf_level text default 'Olhos',
 *     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- Enable Row Level Security (RLS) or allow anonymous access depending on requirements
 * ALTER TABLE public.gondola_categories ENABLE ROW LEVEL SECURITY;
 * 
 * -- Create a policy to allow anyone to read/write/modify (for quick prototyping)
 * CREATE POLICY "Permitir acesso público total para testes" 
 * ON public.gondola_categories 
 * FOR ALL 
 * USING (true) 
 * WITH CHECK (true);
 */

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  error?: any;
}

// Check database connection and verify table exists
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<boolean> {
  const client = createDynamicSupabaseClient(customUrl, customKey);
  if (!client) return false;

  try {
    // Attempt a quick query of ype_gondola_categories or gondola_categories
    const { error } = await client
      .from('gondola_categories')
      .select('id')
      .limit(1);

    if (error) {
      console.warn('Erro ao conectar ao Supabase:', error.message);
      // If error is code PGRST116 or table not found, we connected but table might not exist yet
      if (error.code === 'PGRST116') return true; // row not found, table exists
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        // Table doesn't exist, but connection credentials are correct
        return true; 
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error('Falha de rede ou configuração no Supabase:', err);
    return false;
  }
}

// Convert DB schema back to front-end types
export function mapDbCategoryToFrontend(dbItem: any): CategoryItem {
  return {
    id: dbItem.id,
    category: dbItem.category,
    targetSpace: dbItem.target_space ?? 0,
    actualSpace: dbItem.actual_space ?? 0,
    ypeMetaPercent: dbItem.ype_meta_percent ?? 0,
    shelfLevel: (dbItem.shelf_level || 'Olhos') as CategoryItem['shelfLevel']
  };
}

// Convert front-end types to DB schema
export function mapFrontendCategoryToDb(item: CategoryItem) {
  return {
    id: item.id,
    category: item.category,
    target_space: item.targetSpace,
    actual_space: item.actualSpace,
    ype_meta_percent: item.ypeMetaPercent,
    shelf_level: item.shelfLevel,
    updated_at: new Date().toISOString()
  };
}

// Load categories from Supabase
export async function fetchCategoriesFromSupabase(customUrl?: string, customKey?: string): Promise<{ success: boolean; categories?: CategoryItem[]; error?: string }> {
  const client = createDynamicSupabaseClient(customUrl, customKey);
  if (!client) {
    return { success: false, error: 'Cliente Supabase não inicializado ou credenciais em falta.' };
  }

  try {
    const { data, error } = await client
      .from('gondola_categories')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const categories = (data || []).map(mapDbCategoryToFrontend);
    return { success: true, categories };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro de rede ao buscar do Supabase.' };
  }
}

// Sync local state Categories with Supabase using upsert
export async function syncCategoriesToSupabase(categories: CategoryItem[], customUrl?: string, customKey?: string): Promise<SupabaseSyncResult> {
  const client = createDynamicSupabaseClient(customUrl, customKey);
  if (!client) {
    return { success: false, message: 'Cliente Supabase não inicializado ou credenciais em falta.' };
  }

  try {
    const dbRows = categories.map(mapFrontendCategoryToDb);

    // Perform bulk upsert matching on the 'id' field
    const { error } = await client
      .from('gondola_categories')
      .upsert(dbRows, { onConflict: 'id' });

    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'A tabela "gondola_categories" não foi criada no seu Supabase. Siga as instruções acima para criar a tabela no painel do Supabase SQL Editor.'
        };
      }
      return { success: false, message: `Erro ao salvar: ${error.message}`, error };
    }

    return { success: true, message: 'Seus dados foram salvos com sucesso e estão sincronizados com o Supabase!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Erro inesperado na sincronização.', error: err };
  }
}

// Delete item from Supabase
export async function deleteCategoryFromSupabase(id: string, customUrl?: string, customKey?: string): Promise<boolean> {
  const client = createDynamicSupabaseClient(customUrl, customKey);
  if (!client) return false;

  try {
    const { error } = await client
      .from('gondola_categories')
      .delete()
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}
