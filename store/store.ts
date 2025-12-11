'use client';

import { UserProfile } from '@/lib/requests/users';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfileStore {
  userProfile: UserProfile | null;

  // Setters
  setUserProfile: (profile: UserProfile | null) => void;
  clearUserProfile: () => void;

  // Getters
  profile: () => UserProfile | null;
  userId: () => string | null;
  roleName: () => string | null;
  fullName: () => string | null;
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      userProfile: null,

      // Setters
      setUserProfile: (profile: UserProfile | null) => set({ userProfile: profile }),
      clearUserProfile: () => set({ userProfile: null }),

      // Getters
      profile: () => get().userProfile,
      userId: () => get().userProfile?.user_id ?? null,
      roleName: () => get().userProfile?.role_name ?? null,
      fullName: () => {
        const profile = get().userProfile;
        if (!profile) return null;
        return [profile.first_name, profile.other_name, profile.last_name]
          .filter(Boolean)
          .join(' ');
      },
    }),
    {
      name: 'user-profile-store', // localStorage key
    }
  )
);
