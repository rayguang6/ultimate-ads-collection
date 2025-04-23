import { motion } from 'framer-motion';
import { Tag } from '@/app/types/tag';

interface AdminTagSelectorProps {
  tags: Tag[];
  selectedTags: Tag[];
  onTagSelect: (tag: Tag) => void;
  loading: boolean;
}

export default function AdminTagSelector({ tags, selectedTags, onTagSelect, loading }: AdminTagSelectorProps) {
  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-pulse flex flex-wrap gap-2 justify-center max-w-3xl">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) return null;

  const isSelected = (tag: Tag) => selectedTags.some(t => t.id === tag.id);

  return (
    <div className="">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="flex flex-wrap gap-2 justify-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {tags.map(tag => {
            const selected = isSelected(tag);
            return (
              <motion.button
                key={tag.id}
                onClick={() => onTagSelect(tag)}
                className={`
                  relative px-4 py-1.5 rounded-md text-sm font-medium
                  transition-all duration-200 ease-in-out
                  border-2 cursor-pointer
                  ${selected 
                    ? 'bg-white hover:opacity-80' 
                    : 'hover:opacity-80'
                  }
                `}
                style={{ 
                  backgroundColor: selected ? 'white' : tag.color || '#F3F4F6',
                  borderColor: tag.color || '#F3F4F6',
                  color: '#000000',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {tag.name}
                  {selected && (
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
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex justify-center"
          >
            <button
              onClick={() => selectedTags.forEach(tag => onTagSelect(tag))}
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