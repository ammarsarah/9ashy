import { NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateCheck = checkRateLimit(`forgot:${ip}`, 3, 600000);
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { email } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (user) {
      // In production, send email. For development, log the reset token.
      const resetToken = Math.random().toString(36).substring(2, 15);
      console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);
      console.log(`[DEV] Reset URL: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`);
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we sent a password reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
