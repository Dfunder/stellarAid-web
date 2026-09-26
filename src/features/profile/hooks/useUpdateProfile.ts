import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { authStore } from '@/features/auth/stores/authStore'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { profileService } from '../services/profileService'
import type { ProfileEditFormValues } from '../types'
import { artistProfileKey } from './useArtistProfile'

export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: Partial<ProfileEditFormValues>) => {
      if (!user) throw new Error('You must be signed in to update your profile.')
      const updatedUser = await profileService.updateProfile(user, values)

      // Sync across all stores
      authStore.setSession(updatedUser)
      useAuthStore.getState().setUser({
        ...updatedUser,
        avatarUrl: updatedUser.avatarUrl ?? null,
      })

      return updatedUser
    },
    onSuccess: (updatedUser) => {
      const handle = updatedUser.username || updatedUser.id
      void queryClient.invalidateQueries({ queryKey: artistProfileKey(handle) })
      void queryClient.invalidateQueries({ queryKey: ['auth-me'] })
    },
  })
}
