import { redirect } from 'next/navigation';

export const dynamic = 'force-static';

export default function Home() {
  // Delegate root route to the SPA in /public/index.html
  redirect('/index.html');
}

