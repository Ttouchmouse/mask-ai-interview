import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { useStore } from '../../store/useStore.ts';
import { useImageUpload } from '../../hooks/useGlobalImageUpload.ts';

export function ImageUpload() {
  const { image, setImage } = useStore();
  const { handleImageUpload } = useImageUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      handleImageUpload(acceptedFiles[0]);
    }
  }, [handleImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImage(null);
  };

  if (image) {
    return (
      <div className="relative group w-full h-full flex-1 min-h-0 rounded-[12px] overflow-hidden border border-[var(--color-surface-border)] bg-[var(--color-surface-bg)] flex items-center justify-center">
        <img 
          src={image.previewUrl} 
          alt="Uploaded UI Mockup" 
          className="w-full h-full object-contain"
        />
        
        {/* Hover overlay actions */}
        <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 border-[var(--color-surface-border)]">
          <div 
            {...getRootProps()} 
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-[var(--color-text-main)] rounded-none cursor-pointer text-[13px] font-[500] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-bg)] transition-colors"
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-3.5 h-3.5" />
            교체
          </div>
          <button 
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 rounded-none cursor-pointer text-[13px] font-[500] border border-[#ffcfcf] hover:bg-[#fff0f0] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            삭제
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      {...getRootProps()} 
      className={`w-full h-full flex-1 min-h-0 border border-dashed rounded-[12px] py-10 px-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-[var(--color-primary)] bg-[var(--color-surface-chat-mod)]' : 'border-[var(--color-surface-border)] hover:border-[var(--color-primary)] bg-[var(--color-surface-bg)]'
      }`}
    >
      <input {...getInputProps()} />
      <div className="w-10 h-10 flex items-center justify-center mb-3 text-[var(--color-text-muted)]">
        <UploadCloud className="w-6 h-6" />
      </div>
      <p className="text-[var(--color-text-main)] font-[500] text-[13px]">클릭하거나 드래그하여 업로드</p>
      <p className="text-[var(--color-text-sub)] font-[400] text-[12px] mt-1 mb-2">PNG, JPG, WEBP 지원</p>
    </div>
  );
}
