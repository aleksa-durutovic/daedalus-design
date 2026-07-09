import { NextResponse } from 'next/server';
import { isLocale, LOCALE_COOKIE } from '@/lib/getLocale';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const locale =
    typeof body === 'object' && body !== null && 'locale' in body
      ? (body as { locale: unknown }).locale
      : undefined;

  if (!isLocale(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: ONE_YEAR_SECONDS,
    path: '/',
  });
  return response;
}
