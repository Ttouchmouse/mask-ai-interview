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
  language: string;
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
  // Persona
  persona: PersonaState;
  setPersona: (persona: Partial<PersonaState>) => void;

  // Image
  image: UploadedImage | null;
  setImage: (image: UploadedImage | null) => void;

  // Initial Questions (shown before first message)
  initialQuestions: string[];
  isGeneratingInitialQuestions: boolean;
  setInitialQuestions: (questions: string[]) => void;
  setIsGeneratingInitialQuestions: (isGenerating: boolean) => void;
  clearInitialQuestions: () => void;

  // Follow Up Questions
  followUpQuestions: string[];
  isGeneratingFollowUp: boolean;
  lastMessageId: string;
  setFollowUpQuestions: (questions: string[]) => void;
  setIsGeneratingFollowUp: (isGenerating: boolean) => void;
  clearFollowUpQuestions: () => void;

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
    region: '북미',
    language: '영어',
    ageGroup: '30s / 40s',
    userType: 'new user',
  },
  messages: [],
  isStreaming: false,
  initialQuestions: [],
  isGeneratingInitialQuestions: false,
  followUpQuestions: [],
  isGeneratingFollowUp: false,
  lastMessageId: '',

  setImage: (image) => set({ image }),
  setPersona: (personaUpdate) => set((state) => ({
    persona: { ...state.persona, ...personaUpdate }
  })),
  setInitialQuestions: (questions) => set({ initialQuestions: questions }),
  setIsGeneratingInitialQuestions: (isGenerating) => set({ isGeneratingInitialQuestions: isGenerating }),
  clearInitialQuestions: () => set({ initialQuestions: [], isGeneratingInitialQuestions: false }),
  setFollowUpQuestions: (questions) => set({ followUpQuestions: questions }),
  setIsGeneratingFollowUp: (isGenerating) => set({ isGeneratingFollowUp: isGenerating }),
  clearFollowUpQuestions: () => set({ followUpQuestions: [], lastMessageId: '', isGeneratingFollowUp: false }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
    lastMessageId: message.id
  })),
  updateLastMessage: (content) => set((state) => {
    if (state.messages.length === 0) return state;
    const updated = [...state.messages];
    const last = updated[updated.length - 1];
    updated[updated.length - 1] = { ...last, content };
    return { messages: updated };
  }),
  clearChat: () => set({ messages: [], initialQuestions: [], isGeneratingInitialQuestions: false, followUpQuestions: [], lastMessageId: '', isGeneratingFollowUp: false }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
}));
