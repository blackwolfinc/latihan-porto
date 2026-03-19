import { create } from 'zustand';
import { Language, getLanguage, setLanguage as setLangUtil } from '../i18n';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: getLanguage(),
  setLanguage: (lang: Language) => {
    setLangUtil(lang);
    set({ language: lang });
  },
}));
