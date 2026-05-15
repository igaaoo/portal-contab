import { NextRequest, NextResponse } from 'next/server';
import { createToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, login, password } = body;

    if (!provider || !login || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    // Demo: accept any credentials
    const token = await createToken({
      provider: provider.toUpperCase(),
      login,
      nome: 'Beatriz Lemos',
      role: 'Contadora',
    });

    const response = NextResponse.json({ success: true, nome: 'Beatriz Lemos' });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
