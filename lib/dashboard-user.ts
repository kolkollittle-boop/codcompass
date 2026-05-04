import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Prisma User id for dashboard/bookmark APIs: NextAuth session first, then Supabase JWT email lookup.
 */
export async function resolvePrismaUserIdFromRequest(req?: NextRequest): Promise<string | null> {
  const session = await auth();
  const directId = session?.user?.id;
  if (directId) return directId;

  const authHeader = req?.headers.get('authorization');
  const token =
    authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !anon) return null;

  const supabaseAuth = createClient(url, anon);
  const { data: udata, error } = await supabaseAuth.auth.getUser(token);
  if (error || !udata.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: udata.user.email.trim() },
    select: { id: true },
  });
  return user?.id ?? null;
}
