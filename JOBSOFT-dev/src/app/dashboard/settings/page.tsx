import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserSettings from '@/components/user-settings';

// This is a server component to ensure the user is authenticated
export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    // Redirect to sign-in if the user is not authenticated
    redirect('/auth/signin?callbackUrl=/dashboard/settings');
  }

  // Render the UserSettings client component
  return <UserSettings />;
} 
  const session = await auth();

  if (!session?.user) {
    // Redirect to sign-in if the user is not authenticated
    redirect('/auth/signin?callbackUrl=/dashboard/settings');
  }

  // Render the UserSettings client component
  return <UserSettings />;
} 