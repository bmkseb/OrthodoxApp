import { useAuth } from '@/contexts/auth-context';

/** Display name shown on user playlists (matches profile heading). */
export function usePlaylistOwnerLabel(): string {
  const { user, isGuest } = useAuth();
  if (user?.displayName?.trim()) return user.displayName.trim();
  if (isGuest) return 'Guest reader';
  return user?.email?.split('@')[0] ?? 'Reader';
}
