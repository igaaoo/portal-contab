import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const session = await verifyToken(token);
    if (session) {
      redirect('/dashboard');
    }
  }

  redirect('/login');
}
