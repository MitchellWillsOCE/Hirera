import { redirect } from 'next/navigation';
import UserSettings from '@/components/user-settings';
import { cookies } from 'next/headers';

export default async function SettingsPage() {
  // Consider authenticated if access_token cookie exists
  const access = (await cookies()).get('access_token')?.value;
  if (!access) {
    redirect('/auth/signin?callbackUrl=/dashboard/settings');
  }
  return <UserSettings />;
}