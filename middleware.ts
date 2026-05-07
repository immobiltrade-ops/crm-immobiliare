export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/((?!login|setup|api/auth|api/setup|api/reset-temp|_next/static|_next/image|favicon.ico).*)',
  ],
};