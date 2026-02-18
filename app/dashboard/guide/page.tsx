'use client';

import { Book, Shield, Star, DollarSign, MessageCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function GuidePage() {
    const { t } = useLanguage();

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-white tracking-tight">
                    {t('guide.title')}
                </h1>
                <p className="text-gray-400 text-lg">
                    {t('guide.subtitle')}
                </p>
            </div>

            <div className="grid gap-8">
                {/* Section 4: Features Guide (New) */}
                <section className="glass-card p-8 rounded-2xl border border-white/5 bg-bts-purple/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-lg bg-bts-purple text-white shadow-lg shadow-bts-purple/20">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{t('guide.sec_features_title')}</h2>
                    </div>
                    <div className="space-y-4 text-gray-300 leading-relaxed">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4 p-4 bg-black/20 rounded-lg">
                                <MessageCircle className="w-5 h-5 text-bts-purple mt-1" />
                                <div>
                                    <strong className="text-white block mb-1">Comment & Reply</strong>
                                    <span className="text-sm text-gray-400">{t('guide.sec_features_comment')}</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 p-4 bg-black/20 rounded-lg">
                                <Shield className="w-5 h-5 text-red-400 mt-1" />
                                <div>
                                    <strong className="text-white block mb-1">Report System</strong>
                                    <span className="text-sm text-gray-400">{t('guide.sec_features_report')}</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 p-4 bg-black/20 rounded-lg">
                                <Book className="w-5 h-5 text-blue-400 mt-1" />
                                <div>
                                    <strong className="text-white block mb-1">Language</strong>
                                    <span className="text-sm text-gray-400">{t('guide.sec_features_lang')}</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Section 1: Verification */}
                <section className="glass-card p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-lg bg-bts-purple/20 text-bts-purple">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{t('guide.sec_auth_title')}</h2>
                    </div>
                    <div className="space-y-4 text-gray-300 leading-relaxed">
                        <p>{t('guide.sec_auth_desc')}</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li><strong className="text-white">Level 1:</strong> {t('guide.sec_auth_l1')}</li>
                            <li><strong className="text-white">Level 2:</strong> {t('guide.sec_auth_l2')}</li>
                            <li><strong className="text-white">Level 3:</strong> {t('guide.sec_auth_l3')}</li>
                        </ul>
                    </div>
                </section>

                {/* Section 2: Market Rules */}
                <section className="glass-card p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{t('guide.sec_market_title')}</h2>
                    </div>
                    <div className="space-y-4 text-gray-300 leading-relaxed">
                        <p>{t('guide.sec_market_desc')}</p>
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="p-4 rounded-lg bg-white/5">
                                <h3 className="font-bold text-white mb-2">{t('guide.sec_market_do')}</h3>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>• Escrow System</li>
                                    <li>• Verify Rank</li>
                                </ul>
                            </div>
                            <div className="p-4 rounded-lg bg-red-500/10">
                                <h3 className="font-bold text-red-400 mb-2">{t('guide.sec_market_dont')}</h3>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>• Direct Transfer</li>
                                    <li>• Fake Goods</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Community Standards */}
                <section className="glass-card p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{t('guide.sec_comm_title')}</h2>
                    </div>
                    <div className="space-y-4 text-gray-300 leading-relaxed">
                        <p>{t('guide.sec_comm_desc')}</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <Star className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                <span>{t('guide.sec_comm_rule1')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                <span>{t('guide.sec_comm_rule2')}</span>
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}
