import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { projectsApi } from '@/lib/api/projects';

interface BookmarkState {
  bookmarkedIds: string[];
  isLoading: boolean;
  toggleBookmark: (projectId: string) => Promise<void>;
  isBookmarked: (projectId: string) => boolean;
  fetchBookmarks: () => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarkedIds: [],
      isLoading: false,

      isBookmarked: (projectId: string) => {
        return get().bookmarkedIds.includes(projectId);
      },

      toggleBookmark: async (projectId: string) => {
        const isCurrentlyBookmarked = get().bookmarkedIds.includes(projectId);
        
        // Optimistic update
        set((state) => ({
          bookmarkedIds: isCurrentlyBookmarked
            ? state.bookmarkedIds.filter((id) => id !== projectId)
            : [...state.bookmarkedIds, projectId],
        }));

        try {
          await projectsApi.toggleBookmark(projectId);
        } catch (error) {
          // Revert on error
          set((state) => ({
            bookmarkedIds: isCurrentlyBookmarked
              ? [...state.bookmarkedIds, projectId]
              : state.bookmarkedIds.filter((id) => id !== projectId),
          }));
          console.error('Failed to toggle bookmark:', error);
        }
      },

      fetchBookmarks: async () => {
        set({ isLoading: true });
        try {
          const response = await projectsApi.getBookmarkedProjects();
          if (response.data) {
            set({ bookmarkedIds: response.data.map((p) => p.id) });
          }
        } catch (error) {
          console.error('Failed to fetch bookmarks:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'stellar-aid-bookmarks',
    }
  )
);
