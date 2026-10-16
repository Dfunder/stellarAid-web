import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth, useAuthStore } from '@/features/auth'
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

      // The single auth store is the only copy of the signed-in user
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
