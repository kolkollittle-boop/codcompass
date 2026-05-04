import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        planType: true,
        subscriptionStatus: true,
        isBanned: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (e) {
    console.error('[Admin Users]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
