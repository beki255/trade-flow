import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    contactInfo: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.contactInfo.trim()) return;

    setIsSubmitting(true);
    const ticketId = `TF-${Math.floor(100000 + Math.random() * 900000)}`;

    // Prepare direct email dispatch to Bereket
    const subject = encodeURIComponent(`TradeFlow Inquiry [${ticketId}] from ${formData.fullName}`);
    const body = encodeURIComponent(
      `Hello Bereket,\n\nA new inquiry has been submitted via TradeFlow:\n\n` +
      `Reference Ticket: ${ticketId}\n` +
      `Sender Name: ${formData.fullName}\n` +
      `Sender Contact: ${formData.contactInfo}\n\n` +
      `Inquiry Message:\n${formData.message || 'No additional message provided.'}\n\n` +
      `Sent via TradeFlow Corridor Operations Desk (trade-flow-ukgu.vercel.app)`
    );

    window.open(`mailto:bereket2553@gmail.com?subject=${subject}&body=${body}`, '_blank');

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedTicket(ticketId);
    }, 600);
  };

  return (
    <section id="contact" className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {t('contact.title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Contact Info */}
        <div className="md:col-span-5 space-y-3">
          <a
            href="tel:+251925537199"
            className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5 hover:border-sky-500 transition-all block"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t('contact.hotlineLabel')}</div>
              <div className="text-sm font-black text-sky-700 dark:text-sky-400">{t('contact.hotlinePhone')}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">{t('contact.deskPhone')}</div>
            </div>
          </a>

          <a
            href="mailto:bereket2553@gmail.com"
            className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5 hover:border-emerald-500 transition-all block"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t('contact.emailLabel')}</div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{t('contact.emailAddress')}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('contact.emailResponse')}</div>
            </div>
          </a>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t('contact.hubsLabel')}</div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{t('contact.hubsCity')}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('contact.hubsDetail')}</div>
            </div>
          </div>
        </div>

        {/* Right: Clean Compact Form */}
        <div className="md:col-span-7 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
          {submittedTicket ? (
            <div className="text-center py-6 space-y-2.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">{t('contact.form.successTitle')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('contact.form.successDesc')} <strong className="text-sky-700 dark:text-sky-400">{submittedTicket}</strong>
              </p>
              <button
                type="button"
                onClick={() => setSubmittedTicket(null)}
                className="mt-2 px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold"
              >
                {t('contact.form.sendAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">{t('contact.form.nameLabel')}</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={t('contact.form.namePlaceholder')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">{t('contact.form.contactLabel')}</label>
                  <input
                    type="text"
                    required
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    placeholder={t('contact.form.contactPlaceholder')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">{t('contact.form.messageLabel')}</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('contact.form.messagePlaceholder')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-500 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 shadow-xs"
              >
                {isSubmitting ? <span>{t('contact.form.sending')}</span> : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('contact.form.submitButton')}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

    </section>
  );
};
