import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language } from '@/types/document';
import { t } from '@/lib/translations';

interface LanguageContextType {
  uiLang: Language;
  docLang: Language;
  setUiLang: (lang: Language) => void;
  setDocLang: (lang: Language) => void;
  isRTL: boolean;
  isDocRTL: boolean;
  tr: Record<string, string>;
  docTr: Record<string, string>;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiLang, setUiLang] = useState<Language>('en');
  const [docLang, setDocLang] = useState<Language>('en');

  const isRTL = uiLang === 'ar';
  const isDocRTL = docLang === 'ar';
  const tr = t[uiLang];
  const docTr = t[docLang];

  return (
    <LanguageContext.Provider value={{ uiLang, docLang, setUiLang, setDocLang, isRTL, isDocRTL, tr, docTr }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-cairo' : 'font-inter'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
