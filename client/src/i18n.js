import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English is the default. Arabic strings are drafts to review. Add new text to BOTH languages.
const resources = {
  en: {
    translation: {
      tagline: 'Sponsorships made simple.',
      heroText: 'Find the right sponsor or the right opportunity in Jordan. One place for listings, packages, messages, and results.',
      nav: { browse: 'Browse', login: 'Log in', register: 'Sign up', logout: 'Log out' },
      browse: { title: 'Browse opportunities', search: 'Search events, creators, teams', all: 'All categories', allCities: 'All cities', empty: 'No listings match. Clear a filter to see more.', reach: 'expected reach', verified: 'Verified', from: 'From' },
      auth: { loginTitle: 'Log in to SYNC', registerTitle: 'Create your SYNC account', email: 'Email', password: 'Password', name: 'Name or business name', role: 'I am a', seeker: 'Seeker (I need sponsorship)', sponsor: 'Sponsor (I offer sponsorship)', submitLogin: 'Log in', submitRegister: 'Create account', noAccount: 'New to SYNC?', haveAccount: 'Already have an account?', passwordHint: 'At least 8 characters' },
      home: { how: 'How SYNC works', s1: 'Create a profile', s1t: 'Sign up as a sponsor or a seeker. Seekers join free.', s2: 'Post or browse', s2t: 'Seekers post packages. Sponsors search, filter, and compare.', s3: 'Connect', s3t: 'Send a request, message, and agree the terms.', s4: 'Track results', s4t: 'Record the deal and add reach, engagement, and sales.', cta: 'Browse opportunities' },
      welcome: 'Signed in as',
    },
  },
  ar: {
    translation: {
      tagline: 'الرعايات بكل بساطة.',
      heroText: 'اعثر على الراعي المناسب أو الفرصة المناسبة في الأردن. مكان واحد للإعلانات والباقات والرسائل والنتائج.',
      nav: { browse: 'تصفّح', login: 'تسجيل الدخول', register: 'إنشاء حساب', logout: 'تسجيل الخروج' },
      browse: { title: 'تصفّح الفرص', search: 'ابحث عن فعاليات أو صنّاع محتوى أو فرق', all: 'كل الفئات', allCities: 'كل المدن', empty: 'لا توجد إعلانات مطابقة. أزل أحد الفلاتر لعرض المزيد.', reach: 'الوصول المتوقع', verified: 'موثّق', from: 'ابتداءً من' },
      auth: { loginTitle: 'تسجيل الدخول إلى SYNC', registerTitle: 'أنشئ حسابك في SYNC', email: 'البريد الإلكتروني', password: 'كلمة المرور', name: 'الاسم أو اسم النشاط التجاري', role: 'أنا', seeker: 'باحث عن رعاية', sponsor: 'راعٍ (أقدّم الرعاية)', submitLogin: 'دخول', submitRegister: 'إنشاء الحساب', noAccount: 'جديد في SYNC؟', haveAccount: 'لديك حساب بالفعل؟', passwordHint: '٨ أحرف على الأقل' },
      home: { how: 'كيف يعمل SYNC', s1: 'أنشئ ملفًا شخصيًا', s1t: 'سجّل كراعٍ أو كباحث عن رعاية. التسجيل مجاني للباحثين.', s2: 'انشر أو تصفّح', s2t: 'ينشر الباحثون باقاتهم، ويبحث الرعاة ويفلترون ويقارنون.', s3: 'تواصل', s3t: 'أرسل طلبًا وراسل الطرف الآخر واتفقا على الشروط.', s4: 'تابع النتائج', s4t: 'سجّل الصفقة وأضف الوصول والتفاعل والمبيعات.', cta: 'تصفّح الفرص' },
      welcome: 'تم تسجيل الدخول باسم',
    },
  },
};

const saved = localStorage.getItem('lang') || 'en';
i18n.use(initReactI18next).init({ resources, lng: saved, fallbackLng: 'en', interpolation: { escapeValue: false } });

export function applyLanguage(lng) {
  i18n.changeLanguage(lng);
  localStorage.setItem('lang', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
}
applyLanguage(saved);

export default i18n;
