import { useEffect } from 'react';
import { useTagStore } from '@/app/store/tagStore';
import { motion } from 'framer-motion';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
}

export default function TagSelector({ selectedTagIds, onTagToggle }: TagSelectorProps) {
  const { tags, loading, fetchTags } = useTagStore();

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  if (loading) {
    return (
      <div className="flex justify-center my-6">
        <div className="animate-pulse flex flex-wrap gap-2 justify-center max-w-3xl">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) return null;

  return (
    <div className="my-6">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="flex flex-wrap gap-2 justify-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {tags.map(tag => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <motion.button
                key={tag.id}
                onClick={() => onTagToggle(tag.id)}
                className={`
                  relative px-4 py-1.5 rounded-md text-sm font-medium
                  transition-all duration-200 ease-in-out
                  border-2 cursor-pointer
                  ${isSelected 
                    ? 'bg-white hover:opacity-90' 
                    : 'hover:opacity-90'
                  }
                `}
                style={{ 
                  backgroundColor: isSelected ? 'white' : tag.color || '#F3F4F6',
                  borderColor: tag.color || '#F3F4F6',
                  color: '#000000',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {tag.name}
                  {isSelected && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3.5 h-3.5 text-black"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </motion.svg>
                  )}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
        {selectedTagIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex justify-center"
          >
            <button
              onClick={() => selectedTagIds.forEach(id => onTagToggle(id))}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 
                bg-white border border-gray-200 rounded-md hover:bg-gray-50 
                transition-colors duration-200"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 