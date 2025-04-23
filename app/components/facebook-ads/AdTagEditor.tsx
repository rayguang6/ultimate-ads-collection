import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Tag } from '@/app/types/tag';
import { getAllTags, getTagsForAd, tagAd, removeTagFromAd, addTag, deleteTag, updateTag } from '@/app/lib/tagService';
import { TAG_COLORS, TagColorKey } from '@/app/constants/colors';
import { useTagStore } from '@/app/store/tagStore';

interface AdTagEditorProps {
  adId: string;
  onClose: () => void;
  anchorRect?: DOMRect | null;
  currentTags: Tag[];
  onTagsChange: (newTags: Tag[]) => void;
}

export default function AdTagEditor({ adId, onClose, anchorRect, currentTags, onTagsChange }: AdTagEditorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [adTags, setAdTags] = useState<Tag[]>(currentTags);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const popupRef = useRef<HTMLDivElement>(null);
  const menuPortalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const { tags: availableTagsFromStore, updateTag: updateTagFromStore, deleteTag: deleteTagFromStore, addTag: addTagToStore } = useTagStore();
  const [previewColor, setPreviewColor] = useState('');
  const [editMenuPosition, setEditMenuPosition] = useState<{ top: number; left: number; } | null>(null);

  // Move getRandomColor outside the component
  const getRandomColor = () => {
    const colors = Object.values(TAG_COLORS);
    return colors[Math.floor(Math.random() * colors.length)].bg;
  };

  // Initialize the preview color on the client side only
  useEffect(() => {
    setPreviewColor(getRandomColor());
  }, []); // Run once on mount

  // Update the search query effect
  useEffect(() => {
    if (!searchQuery) {
      // Only generate new color when creating a new tag
      setPreviewColor(getRandomColor());
    }
  }, [searchQuery]);

  // Filter tags based on search query
  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shouldShowCreateOption = searchQuery.trim() !== '' && 
    !filteredTags.some(tag => tag.name.toLowerCase() === searchQuery.toLowerCase());

  // Handle scroll lock
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInPopup = popupRef.current && popupRef.current.contains(target);
      const isClickInPortal = menuPortalRef.current && menuPortalRef.current.contains(target);
      
      if (!isClickInPopup && !isClickInPortal) {
        setEditingTag(null);
        setEditMenuPosition(null);
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Calculate popup position
  const getPopupStyle = () => {
    if (!anchorRect) return {};

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 280;
    let menuHeight = 400;
    const padding = 16;

    let left = anchorRect.left;
    let top = anchorRect.bottom + 8;

    // Check right edge
    if (left + menuWidth > viewportWidth - padding) {
      left = Math.max(padding, viewportWidth - menuWidth - padding);
    }

    // Check left edge
    if (left < padding) {
      left = padding;
    }

    // Check bottom edge
    if (top + menuHeight > viewportHeight - padding) {
      // Try to position above the anchor if there's more space there
      const spaceAbove = anchorRect.top;
      const spaceBelow = viewportHeight - anchorRect.bottom;

      if (spaceAbove > spaceBelow && spaceAbove >= menuHeight + padding) {
        // Position above
        top = Math.max(padding, anchorRect.top - menuHeight - 8);
      } else {
        // Position below but constrain height
        const availableHeight = viewportHeight - top - padding;
        menuHeight = Math.min(menuHeight, availableHeight);
      }
    }

    // Check top edge
    if (top < padding) {
      top = padding;
    }

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      width: `${menuWidth}px`,
      maxHeight: `${menuHeight}px`,
      zIndex: 50,
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const allTags = await getAllTags();
        setAvailableTags(allTags);
      } catch (error) {
        console.error('Error loading tags:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Focus input when component mounts
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, []);

  useEffect(() => {
    // Reset highlighted index when filtered options change
    setHighlightedIndex(0);
  }, [filteredTags, shouldShowCreateOption]);

  // Pass tag changes to parent
  useEffect(() => {
    onTagsChange(adTags);
  }, [adTags, onTagsChange]);

  const handleCreateTag = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const newTag = await addTag(searchQuery.trim(), previewColor);
      addTagToStore(newTag);
      await handleTagToggle(newTag);
      setSearchQuery('');
      setPreviewColor(getRandomColor());
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleTagToggle = async (tag: Tag) => {
    try {
      const isTagged = adTags.some(t => t.id === tag.id);
      
      // Update UI immediately
      if (isTagged) {
        setAdTags(prev => prev.filter(t => t.id !== tag.id));
      } else {
        setAdTags(prev => [...prev, tag]);
      }
      
      // Then update the database
      if (isTagged) {
        await removeTagFromAd(adId, tag.id);
      } else {
        await tagAd(adId, tag.id);
      }
    } catch (error) {
      console.error('Error toggling tag:', error);
      // Revert UI if there's an error
      const isTagged = adTags.some(t => t.id === tag.id);
      if (isTagged) {
        setAdTags(prev => [...prev, tag]);
      } else {
        setAdTags(prev => prev.filter(t => t.id !== tag.id));
      }
    }
  };

  const handleUpdateTagColor = async (tag: Tag, color: string) => {
    try {
      const updatedTag = { ...tag, color };
      await updateTag(tag.id, updatedTag);
      updateTagFromStore(updatedTag);
      setEditingTag(null);
    } catch (error) {
      console.error('Error updating tag color:', error);
    }
  };

  const handleRenameTag = async (tag: Tag, newName: string) => {
    if (!tag || !newName.trim() || newName.trim() === tag.name) {
      setIsRenaming(null);
      return;
    }

    try {
      const updatedTag = { ...tag, name: newName.trim() };
      await updateTag(tag.id, updatedTag);
      
      // Update both the store and local state
      updateTagFromStore(updatedTag);
      setAvailableTags(prev => prev.map(t => t.id === tag.id ? updatedTag : t));
      setAdTags(prev => prev.map(t => t.id === tag.id ? updatedTag : t));
      
      setIsRenaming(null);
      setEditingTag(null);
    } catch (error) {
      console.error('Error renaming tag:', error);
      // Keep the menu open if there's an error
      setNewTagName(tag.name);
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    if (!confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) return;
    
    try {
      await deleteTag(tag.id);
      deleteTagFromStore(tag.id);
      setEditingTag(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleRemoveTag = async (tag: Tag) => {
    try {
      await removeTagFromAd(adId, tag.id);
      setAdTags(prev => prev.filter(t => t.id !== tag.id));
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const totalOptions = filteredTags.length + (shouldShowCreateOption ? 1 : 0);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % totalOptions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + totalOptions) % totalOptions);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (shouldShowCreateOption && highlightedIndex === 0) {
        handleCreateTag();
      } else {
        const index = shouldShowCreateOption ? highlightedIndex - 1 : highlightedIndex;
        if (filteredTags[index]) {
          handleTagToggle(filteredTags[index]);
        }
      }
    } else if (e.key === 'Backspace' && searchQuery === '' && adTags.length > 0) {
      const lastTag = adTags[adTags.length - 1];
      handleRemoveTag(lastTag);
    }
  };

  // Calculate edit menu position
  const calculateEditMenuPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect();
    const menuWidth = 192; // w-48 = 12rem = 192px
    const menuHeight = 150; // Approximate height of edit menu
    const padding = 8;
    
    let left = rect.right;
    let top = rect.top;

    // Check right edge
    if (left + menuWidth > window.innerWidth - padding) {
      left = rect.left - menuWidth;
    }

    // Check bottom edge
    if (top + menuHeight > window.innerHeight - padding) {
      top = Math.max(padding, window.innerHeight - menuHeight - padding);
    }

    // Check top edge
    if (top < padding) {
      top = padding;
    }

    return { top, left };
  };

  const handleEditButtonClick = (e: React.MouseEvent, tag: Tag) => {
    e.stopPropagation();
    const button = e.currentTarget as HTMLElement;
    const position = calculateEditMenuPosition(button);
    setEditMenuPosition(position);
    setEditingTag(editingTag?.id === tag.id ? null : tag);
  };

  const handleMenuItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleRenameClick = (e: React.MouseEvent, tag: Tag) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRenaming(tag.id);
    setNewTagName(tag.name);
  };

  const handleRenameInputKeyDown = (e: React.KeyboardEvent, tag: Tag) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameTag(tag, newTagName);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsRenaming(null);
    }
  };

  const handleColorClick = (e: React.MouseEvent, tag: Tag, color: string) => {
    e.stopPropagation();
    e.preventDefault();
    handleUpdateTagColor(tag, color);
  };

  const handleDeleteClick = (e: React.MouseEvent, tag: Tag) => {
    e.stopPropagation();
    e.preventDefault();
    handleDeleteTag(tag);
  };

  return (
    <div 
      ref={popupRef}
      className="fixed bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
      style={getPopupStyle()}
    >
      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="flex flex-wrap items-center gap-1 mb-2">
          {adTags.map(tag => (
            <div 
              key={tag.id}
              className="flex items-center px-2 py-0.5 text-xs rounded"
              style={{ backgroundColor: tag.color || '#FFFFFF' }}
            >
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 cursor-pointer hover:text-gray-700"
              >
                <svg className="w-3 h-3 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search or create tag..."
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tags List */}
      <div className="max-h-[300px] overflow-y-auto p-2">
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-6 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {/* Create Option */}
            {shouldShowCreateOption && (
              <div
                onClick={handleCreateTag}
                className={`
                  w-full text-left px-3 py-2 text-sm rounded-md 
                  cursor-pointer select-none
                  ${highlightedIndex === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Create:</span>
                  {previewColor && (
                    <span 
                      className="px-2 py-0.5 text-xs rounded"
                      style={{ backgroundColor: previewColor }}
                    >
                      {searchQuery}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Filtered Tags */}
            {filteredTags.map((tag, index) => {
              const isHighlighted = shouldShowCreateOption 
                ? index + 1 === highlightedIndex 
                : index === highlightedIndex;
              
              return (
                <div
                  key={tag.id}
                  className={`
                    group flex items-center justify-between px-3 py-2 text-sm rounded-md
                    cursor-pointer select-none
                    ${isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  `}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTagToggle(tag);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                    {adTags.some(t => t.id === tag.id) && (
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleEditButtonClick(e, tag)}
                    className="opacity-0 group-hover:opacity-100 p-1 transition-opacity cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tag Edit Menu Portal */}
      {editingTag && editMenuPosition && createPortal(
        <div 
          ref={menuPortalRef}
          onClick={handleMenuItemClick}
          className="fixed bg-white rounded-md shadow-lg py-1 z-50 w-48 border border-gray-200"
          style={{
            top: `${editMenuPosition.top}px`,
            left: `${editMenuPosition.left}px`,
          }}
        >
          {isRenaming === editingTag.id ? (
            <div className="px-3 py-2" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => handleRenameInputKeyDown(e, editingTag)}
                onBlur={() => {
                  if (newTagName.trim() && newTagName !== editingTag.name) {
                    handleRenameTag(editingTag, newTagName);
                  } else {
                    setIsRenaming(null);
                  }
                }}
                className="w-full px-2 py-1 text-sm border rounded"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={(e) => handleRenameClick(e, editingTag)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
            >
              Rename
            </button>
          )}
          <div className="px-3 py-2">
            <div className="grid grid-cols-5 gap-1">
              {Object.values(TAG_COLORS).map(({ bg, name }) => (
                <button
                  key={name}
                  onClick={(e) => handleColorClick(e, editingTag, bg)}
                  className="w-6 h-6 rounded border border-gray-200 cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: bg }}
                  title={name}
                />
              ))}
            </div>
          </div>
          <button
            onClick={(e) => handleDeleteClick(e, editingTag)}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
          >
            Delete Tag
          </button>
        </div>,
        document.body
      )}
    </div>
  );
} 