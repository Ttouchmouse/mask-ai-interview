import { create } from 'zustand';

export interface UploadedImage {
  id: string;
  name: string;
  previewUrl: string;
  file?: File;
  base64?: string;
}

export interface PersonaState {
  region: string;
  ageGroup: string;
  userType: string;
}

export interface Message {
  id: string;
  role: 'moderator' | 'ai-user';
  content: string;
  createdAt: string;
}

interface AppState {
  sessionId: string | null;
  image: UploadedImage | null;
  persona: PersonaState;
  messages: Message[];
  isStreaming: boolean;
  isDemoMode: boolean;
  
  // Actions
  setSessionId: (id: string | null) => void;
  setImage: (image: UploadedImage | null) => void;
  setPersona: (persona: Partial<PersonaState>) => void;
  addMessage: (message: Message) => void;
  appendToLastMessage: (chunk: string) => void;
  clearMessages: () => void;
  setStreaming: (streaming: boolean) => void;
  setDemoMode: (isDemo: boolean) => void;
  resetSession: () => void;
}

export const useStore = create<AppState>((set) => ({
  sessionId: null,
  image: null,
  persona: {
    region: 'Korea',
    ageGroup: '30s / 40s',
    userType: 'new user',
  },
  messages: [],
  isStreaming: false,
  isDemoMode: true,

  setSessionId: (id) => set({ sessionId: id }),
  setImage: (image) => set({ image }),
  setPersona: (personaUpdate) => set((state) => ({ 
    persona: { ...state.persona, ...personaUpdate } 
  })),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  appendToLastMessage: (chunk) => set((state) => {
    if (state.messages.length === 0) return state;
    const updated = [...state.messages];
    const last = updated[updated.length - 1];
    updated[updated.length - 1] = { ...last, content: last.content + chunk };
    return { messages: updated };
  }),
  clearMessages: () => set({ messages: [], sessionId: null }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
  resetSession: () => set({
    sessionId: null,
    image: null,
    messages: [],
  }),
}));
