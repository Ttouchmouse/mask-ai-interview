import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { useStore } from '../../store/useStore.ts';
import { useImageUpload } from '../../hooks/useGlobalImageUpload.ts';
import uploadIcon from '../../assets/upload-icon.svg';

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
      <div className="relative group w-full h-full flex-1 min-h-0 overflow-hidden bg-white flex items-center justify-center">
        <img
          src={image.previewUrl}
          alt="Uploaded UI Mockup"
          className="w-full h-full object-contain"
        />

        {/* Hover overlay actions */}
        <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <div
            {...getRootProps()}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#2E394A] rounded-[8px] cursor-pointer text-[13px] font-[500] border border-[#D0D6DD] hover:bg-[#F6F7F9] transition-colors"
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-3.5 h-3.5" />
            교체
          </div>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 rounded-[8px] cursor-pointer text-[13px] font-[500] border border-[#ffcfcf] hover:bg-[#fff0f0] transition-colors"
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
      className={`w-full h-full flex-1 min-h-0 flex flex-col items-center justify-center text-center cursor-pointer transition-colors px-6 ${
        isDragActive ? 'bg-[#EFF2F6]' : 'bg-white hover:bg-[#F6F7F9]'
      }`}
    >
      <input {...getInputProps()} />
      <div className="mb-4">
        <img src={uploadIcon} alt="Upload" className="w-10 h-10" />
      </div>
      <p className="text-[14px] font-[500] text-[#2E394A] leading-[20px] mb-1">
        클릭하거나 드래그, 붙여넣기를 통해<br />테스트 화면을 업로드해 주세요.
      </p>
      <p className="text-[12px] text-[#8996A4] mt-1">(PNG, JPG, WEBP)</p>
    </div>
  );
}
