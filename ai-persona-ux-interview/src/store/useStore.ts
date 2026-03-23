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

export interface AppState {
  // Demo Mode
  isDemoMode: boolean;
  setDemoMode: (isDemo: boolean) => void;

  // Persona
  persona: PersonaState;
  setPersona: (persona: Partial<PersonaState>) => void;

  // Image
  image: UploadedImage | null;
  setImage: (image: UploadedImage | null) => void;

  // Chat
  messages: Message[];
  isStreaming: boolean;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  clearChat: () => void;
}

export const useStore = create<AppState>((set) => ({
  image: null,
  persona: {
    region: 'Korea',
    ageGroup: '30s / 40s',
    userType: 'new user',
  },
  messages: [],
  isStreaming: false,
  isDemoMode: true,

  setImage: (image) => set({ image }),
  setPersona: (personaUpdate) => set((state) => ({ 
    persona: { ...state.persona, ...personaUpdate } 
  })),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  updateLastMessage: (content) => set((state) => {
    if (state.messages.length === 0) return state;
    const updated = [...state.messages];
    const last = updated[updated.length - 1];
    updated[updated.length - 1] = { ...last, content };
    return { messages: updated };
  }),
  clearChat: () => set({ messages: [], image: null }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
}));
