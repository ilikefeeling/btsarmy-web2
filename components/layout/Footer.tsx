'use client';

import Link from 'next/link';
import { Youtube, Linkedin, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-[#1a1a1a] text-gray-400 py-12 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Column 1: Brand & Identity */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white tracking-tighter">
                        caretrend <span className="text-gray-500 text-sm font-normal">Co., Ltd.</span>
                    </h2>
                    <p className="text-sm font-medium leading-relaxed">
                        Innovating Daily Life with<br />AI Intelligence.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <Link href="#" className="hover:text-white transition-colors">
                            <Youtube className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            <Instagram className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Column 2: Company Information (Compliance) */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Corporate Info</h3>
                    <ul className="text-xs space-y-2 leading-relaxed font-light">
                        <li><span className="font-semibold text-gray-300">Company Name:</span> caretrend Co., Ltd.</li>
                        <li><span className="font-semibold text-gray-300">Business Registration No.:</span> 214-88-78497</li>
                        <li><span className="font-semibold text-gray-300">Mail-order Business Report No.:</span><br />2025-Seoul Seocho-0388</li>
                        <li>
                            <span className="font-semibold text-gray-300">Address:</span><br />
                            66, Nonhyeon-ro 27-gil, Seocho-gu,<br />Seoul, Republic of Korea (06744)
                        </li>
                        <li><span className="font-semibold text-gray-300">Email:</span> ilikepeople@icloud.com</li>
                    </ul>
                </div>

                {/* Column 3: Services (Strategic Growth) */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Our Solutions</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="https://icanagi.com" className="hover:text-white transition-colors">icanagi.com</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">AI-men</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Gong-gu Scout AI</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Moon Clock</Link></li>
                    </ul>
                </div>

                {/* Column 4: Support & Legal */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Navigation</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                        <li>
                            <Link href="#" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                                {t('footer.privacy')}
                            </Link>
                        </li>
                        <li><Link href="#" className="hover:text-white transition-colors">{t('footer.terms')}</Link></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center">
                <p className="text-xs text-gray-600">
                    © 2026 caretrend Co., Ltd. {t('footer.rights')}
                </p>
            </div>
        </footer>
    );
}
