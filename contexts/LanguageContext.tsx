'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionaries, Locale, Dictionary } from '@/lib/i18n';

interface LanguageContextType {
    language: Locale;
    setLanguage: (lang: Locale) => void;
    t: (key: string) => string;
    dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Locale>('ko'); // Default to Korean
    const [dict, setDict] = useState<Dictionary>(dictionaries.ko);

    useEffect(() => {
        // Load preserved language or detect browser language
        const saved = localStorage.getItem('app-language') as Locale;
        if (saved && (saved === 'ko' || saved === 'en')) {
            setLanguage(saved);
            setDict(dictionaries[saved]);
        } else {
            // Simple browser detection
            const browserLang = navigator.language.split('-')[0];
            if (browserLang === 'ko') {
                setLanguage('ko');
                setDict(dictionaries.ko);
            } else {
                setLanguage('en');
                setDict(dictionaries.en);
            }
        }
    }, []);

    const changeLanguage = (lang: Locale) => {
        setLanguage(lang);
        setDict(dictionaries[lang]);
        localStorage.setItem('app-language', lang);
    };

    // Helper to get nested values (e.g. t('auth.login'))
    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = dict;

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Missing translation for key: ${path}`);
                return path;
            }
            current = current[key];
        }

        return typeof current === 'string' ? current : path;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, dict }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
