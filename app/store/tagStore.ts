import { create } from 'zustand';
import { Tag } from '@/app/types/tag';
import { getAllTags } from '@/app/lib/tagService';

interface TagStore {
  tags: Tag[];
  loading: boolean;
  fetchTags: () => Promise<void>;
  updateTag: (updatedTag: Tag) => void;
  deleteTag: (tagId: string) => void;
  addTag: (tag: Tag) => void;
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  loading: false,
  fetchTags: async () => {
    set({ loading: true });
    try {
      const tags = await getAllTags();
      set({ tags });
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      set({ loading: false });
    }
  },
  updateTag: (updatedTag: Tag) => {
    set(state => ({
      tags: state.tags.map(tag => 
        tag.id === updatedTag.id ? updatedTag : tag
      )
    }));
  },
  deleteTag: (tagId: string) => {
    set(state => ({
      tags: state.tags.filter(tag => tag.id !== tagId)
    }));
  },
  addTag: (tag: Tag) => {
    set(state => ({
      tags: [...state.tags, tag]
    }));
  }
})); 