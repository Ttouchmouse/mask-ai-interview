import { useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { useStore } from "../store/useStore.ts";
import type { AppState } from "../store/useStore.ts";
import toast from "react-hot-toast";

export const useGlobalImageUpload = () => {
  const setImage = useStore((s: AppState) => s.setImage);
  const isStreaming = useStore((s: AppState) => s.isStreaming);
  const previewUrlRef = useRef<string | null>(null);

  const showToast = (msg: string) => {
    toast.success(msg, {
      position: 'top-center',
      duration: 3000,
    });
  };

  const handleImageUpload = (file: File) => {
    if (isStreaming) {
      toast.error('답변이 생성되는 동안에는 이미지를 변경할 수 없습니다.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    
    // 이전에 생성된 URL이 있다면 메모리 누수 방지를 위해 해제
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = objectUrl;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImage({
        id: nanoid(),
        name: file.name,
        previewUrl: objectUrl,
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: ClipboardEvent) => {
    // 입력창(input, textarea) 등에서 텍스트를 붙여넣는 경우는 무시
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).isContentEditable
    ) {
      return;
    }

    const items = e.clipboardData?.items;
    if (!items) return;

    let hasImage = false;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        hasImage = true;
        const file = item.getAsFile();
        if (file) {
          handleImageUpload(file);
          showToast("클립보드 이미지가 첨부되었습니다 📋");
        }
        break;
      }
    }

    // 이미지일 때만 기본 동작(붙여넣기) 방지
    if (hasImage) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, [isStreaming]); // isStreaming 상태가 변경될 때마다 이벤트 리스너 업데이트

  return { handleImageUpload };
};
