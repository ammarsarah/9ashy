import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';
import { reportSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = reportSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { reason, listingId } = result.data;

    const report = await prisma.report.create({
      data: {
        reason,
        reporterId: authUser.userId,
        listingId,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
