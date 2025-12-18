import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { AIModel, PromptCategory, NewPromptInput, User, Prompt } from '../types';
import { generateDescriptionWithGemini } from '../services/geminiService';
import { validatePromptInput } from '../services/validation';

interface AddPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (input: NewPromptInput) => void;
  onUpdate?: (id: string, input: NewPromptInput) => void;
  initialData?: Prompt | null;
  currentUser: User;
}

const AddPromptModal: React.FC<AddPromptModalProps> = ({ isOpen, onClose, onAdd, onUpdate, initialData, currentUser }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [model, setModel] = useState<string>(initialData?.model || AIModel.GEMINI_FLASH);
  const [modelUrl, setModelUrl] = useState(initialData?.modelUrl || '');
  const [category, setCategory] = useState<PromptCategory>(initialData?.category || PromptCategory.OTHER);
  const [tags, setTags] = useState(initialData?.tags ? initialData.tags.join(', ') : '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);


  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setContent(initialData?.content || '');
      setModel(initialData?.model || AIModel.GEMINI_FLASH);
      setModelUrl(initialData?.modelUrl || '');
      setCategory((initialData?.category as PromptCategory) || PromptCategory.OTHER);
      setTags(initialData?.tags ? initialData.tags.join(', ') : '');
      setImageUrl(initialData?.imageUrl || '');
      setErrors({}); // Clear errors when modal opens or initialData changes
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    // 1. Construct the input object first
    const inputForValidation: NewPromptInput = {
      title,
      content,
      description: initialData?.description || '', // Ensure existing description is passed or it will be lost/regenerated
      model,
      modelUrl: modelUrl.trim() || undefined,
      category,
      imageUrl: imageUrl.trim() || null,
      author: currentUser.username,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    };

    // 2. Validate
    const validation = validatePromptInput(inputForValidation);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // 3. Logic: If editing, keep description or regenerate?
    // User requested "save edit changes" so we must prioritize existing description unless user asks to regen?
    // For now, if we have initialData, we assume description is part of the edit (though not visible in form, it's preserved).
    // Or we should allow regenerating if content changed drastically?
    // Simple logic: If initialData exists, use passed description (preserved) unless empty.

    if (initialData && onUpdate) {
      // If content changed significantly, maybe regenerate? But that's complex.
      // Let's just pass the payload. The API handles description update now.
      // However, we need to ensure description is set.
      let finalDesc = inputForValidation.description;

      // Fallback: if description is missing (e.g. legacy data), generate new one
      if (!finalDesc || finalDesc.length < 5) {
        finalDesc = await generateDescriptionWithGemini(content);
      }

      onUpdate(initialData.id, { ...inputForValidation, description: finalDesc });
    } else {
      // New Post
      const desc = await generateDescriptionWithGemini(content);
      onAdd({ ...inputForValidation, description: desc });
    }

    resetForm();
    onClose();
  };



  const resetForm = () => {
    setTitle('');
    setContent('');
    setModel(AIModel.GEMINI_FLASH);
    setModelUrl('');
    setCategory(PromptCategory.OTHER);
    setTags('');
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Sparkles className="text-primary-500 mr-2" />
            {initialData ? 'Edit Prompt' : 'Share a Prompt'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title & Model Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Prompt Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., React Component Generator"
                  className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-white focus:outline-none transition-all ${errors.title ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={10} className="mr-1" /> {errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Target Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="model-options"
                  placeholder="e.g. Gemini 1.5 Pro"
                  className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-white focus:outline-none transition-all ${errors.model ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-700 focus:border-primary-500'}`}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
                <datalist id="model-options">
                  {Object.values(AIModel).map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                {errors.model && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={10} className="mr-1" /> {errors.model}</p>}
              </div>
            </div>

            {/* Model URL */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                <LinkIcon size={14} /> Model Website (Optional)
              </label>
              <input
                type="url"
                placeholder="https://deepmind.google/technologies/gemini/"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                value={modelUrl}
                onChange={(e) => setModelUrl(e.target.value)}
              />
            </div>

            {/* Content Area */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-400">
                  Prompt Content <span className="text-red-500">*</span>
                </label>
              </div>
              <textarea
                rows={6}
                placeholder="Type your prompt here..."
                className={`w-full bg-slate-800 border rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none transition-all ${errors.content ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'}`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              {errors.content && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={10} className="mr-1" /> {errors.content}</p>}
              <p className="text-xs text-slate-500 mt-1">
                Tip: Be specific about the role, context, and constraints.
              </p>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-white focus:outline-none transition-all ${errors.category ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-700 focus:border-primary-500'}`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PromptCategory)}
                >
                  {Object.values(PromptCategory).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={10} className="mr-1" /> {errors.category}</p>}
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="coding, web, react"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            {/* Image URL Input */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Result Image URL (Optional)</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste a Google Drive link or direct image URL to show results"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">
                For Google Drive links, make sure "Anyone with the link" can view.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold shadow-lg shadow-primary-500/20 transition-all transform active:scale-95"
              >
                {initialData ? 'Save Changes' : 'Share Prompt'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPromptModal;