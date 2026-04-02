import { useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { useStore } from "../store/useStore.ts";
import type { AppState } from "../store/useStore.ts";
import toast from "react-hot-toast";

// 전역 업로드 처리 함수 (paste 리스너 없음 - 순수 upload만)
export const useImageUpload = () => {
  const setImage = useStore((s: AppState) => s.setImage);
  const previewUrlRef = useRef<string | null>(null);

  const handleImageUpload = (file: File) => {
    const isStreaming = useStore.getState().isStreaming;
    if (isStreaming) {
      toast.error('답변이 생성되는 동안에는 이미지를 변경할 수 없습니다.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);

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

  return { handleImageUpload, previewUrlRef };
};

// React StrictMode에서 useEffect가 2번 실행되는 것을 막기 위한 모듈 레벨 싱글턴 가드
let isPasteListenerAttached = false;

// 전역 paste 리스너 훅 - App.tsx에서 딱 한 번만 호출
export const useGlobalImageUpload = () => {
  const { handleImageUpload, previewUrlRef } = useImageUpload();

  useEffect(() => {
    if (isPasteListenerAttached) return; // StrictMode 2차 실행 차단
    isPasteListenerAttached = true;

    let isUploading = false;

    const handlePaste = (e: ClipboardEvent) => {
      if (isUploading) return;

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

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            isUploading = true;

            handleImageUpload(file);

            // ✅ toast는 이 한 곳에서만 호출
            toast.success("클립보드 이미지가 첨부되었습니다 📋", {
              position: "top-center",
              duration: 3000,
            });

            setTimeout(() => {
              isUploading = false;
            }, 300);
          }
          break;
        }
      }
    };

    // document에 딱 한 번만 등록
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
      isPasteListenerAttached = false; // cleanup 시 초기화 (HMR 대응)
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
