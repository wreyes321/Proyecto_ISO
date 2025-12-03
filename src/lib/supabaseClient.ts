//src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

// Obtener las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. ' 
  );
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Tipos auxiliares para usar en la aplicación
export type SupabaseClient = typeof supabase;

// Manejo de errores
export function handleSupabaseError(error: any): string {
  if (error.message) {
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Credenciales de inicio de sesión inválidas',
      'User already registered': 'El usuario ya está registrado',
      'Email not confirmed': 'Email no confirmado',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'Unable to validate email address: invalid format': 'Formato de email inválido',
      'duplicate key value violates unique constraint': 'Ya existe un registro con estos datos',
      'JWT expired': 'Sesión expirada. Por favor, inicia sesión nuevamente',
    };

    for (const [key, value] of Object.entries(errorMessages)) {
      if (error.message.includes(key)) {
        return value;
      }
    }

    return error.message;
  }

  return 'Ha ocurrido un error inesperado';
}

// Verificar si usuario esta autenticado
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// Obtener el ID del usuario actual
 
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

// Obtener el perfil del usuario actual
 
export async function getCurrentUserProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error al obtener perfil:', error);
    return null;
  }

  return data;
}

// Subir una imagen
 
export async function uploadImage(
  file: File,
  bucket: string = 'product-images',
  folder: string = 'products'
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error al subir imagen:', uploadError);
      return null;
    }

    // Obtener la URL pública de la imagen
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return null;
  }
}

// Eliminar una imagen
 
export async function deleteImage(
  imageUrl: string,
  bucket: string = 'product-images'
): Promise<boolean> {
  try {
    // Extraer el path de la URL
    const urlParts = imageUrl.split(`${bucket}/`);
    if (urlParts.length < 2) return false;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error al eliminar imagen:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return false;
  }
}

export default supabase;