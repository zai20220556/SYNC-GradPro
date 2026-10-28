import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English is the default. Arabic strings are drafts to review. Add new text to BOTH languages.
const resources = {
  en: {
    translation: {
      tagline: 'Sponsorships made simple.',
      heroText: 'Find the right sponsor or the right opportunity in Jordan. One place for listings, packages, messages, and results.',
      nav: { browse: 'Browse', login: 'Log in', register: 'Sign up', logout: 'Log out', post: 'Post opportunity', profile: 'Profile', requests: 'Requests', tracker: 'Tracker', admin: 'Admin' },
      post: { title: 'Post an opportunity', name: 'Title', category: 'Category', city: 'City', description: 'Description', audience: 'Target audience', reach: 'Expected reach (people)', date: 'Event date', packages: 'Packages', pkgName: 'Package name', pkgPrice: 'Price (JOD)', pkgBenefits: 'What the sponsor gets', addPkg: 'Add another package', removePkg: 'Remove package', publish: 'Publish listing' },
      detail: { back: 'Back to results', audience: 'Audience', date: 'Date', packages: 'Packages', message: 'Message to the seeker', messageHint: 'Say what you would like and why it fits your business.', send: 'Send request', loginToRequest: 'as a sponsor to send a request.' },
      profile: { title: 'Your profile', save: 'Save changes', saved: 'Saved.', myListings: 'Your listings', noListings: 'You have no listings yet.', delete: 'Delete', name: 'Name', seekerType: 'Type (club, athlete, creator...)', city: 'City', phone: 'Phone', audienceSize: 'Audience size', description: 'Description', businessName: 'Business name', industry: 'Industry', budgetMin: 'Budget from (JOD)', budgetMax: 'Budget up to (JOD)', preferredAudience: 'Preferred audience' },
      browse: { title: 'Browse opportunities', search: 'Search events, creators, teams', all: 'All categories', allCities: 'All cities', empty: 'No listings match. Clear a filter to see more.', reach: 'expected reach', verified: 'Verified', from: 'From' },
      auth: { loginTitle: 'Log in to SYNC', registerTitle: 'Create your SYNC account', email: 'Email', password: 'Password', name: 'Name or business name', role: 'I am a', seeker: 'Seeker (I need sponsorship)', sponsor: 'Sponsor (I offer sponsorship)', submitLogin: 'Log in', submitRegister: 'Create account', noAccount: 'New to SYNC?', haveAccount: 'Already have an account?', passwordHint: 'At least 8 characters' },
      cat: { events: 'Events', sports: 'Sports', creators: 'Creators', student: 'Student activities', charity: 'Charity', music: 'Music and arts', gaming: 'Gaming and esports', tech: 'Tech and startups', education: 'Education and workshops', culture: 'Culture and community' },
      home: { how: 'How SYNC works', s1: 'Create a profile', s1t: 'Sign up as a sponsor or a seeker. Seekers join free.', s2: 'Post or browse', s2t: 'Seekers post packages. Sponsors search, filter, and compare.', s3: 'Connect', s3t: 'Send a request, message, and agree the terms.', s4: 'Track results', s4t: 'Record the deal and add reach, engagement, and sales.', cta: 'Browse opportunities' },
      status: { PENDING: 'Pending', ACCEPTED: 'Accepted', DECLINED: 'Declined', CONFIRMED: 'Confirmed', ACTIVE: 'Active', COMPLETED: 'Completed' },
      req: { title: 'Requests', empty: 'No requests yet.', accept: 'Accept', decline: 'Decline', agreed: 'Agreed value (JOD)', record: 'Record agreed deal', inTracker: 'Open in tracker' },
      tracker: { title: 'Booking and tracking', empty: 'No deals yet. Accepted requests can be recorded as deals.', deal: 'Deal', with: 'With', package: 'Package', value: 'Value', status: 'Status', markAs: 'Mark as {{status}}' },
      admin: { title: 'Admin', users: 'Users', listings: 'Listings', verify: 'Verify', unverify: 'Remove badge', by: 'By' },
      msg: { show: 'Messages', hide: 'Hide messages', placeholder: 'Write a message', send: 'Send', empty: 'No messages yet.' },
      notif: { title: 'Notifications', none: 'Nothing new.', markAll: 'Mark all as read' },
      cmp: { add: 'Compare', go: 'Compare selected', title: 'Compare listings', need: 'Pick at least two listings in Browse to compare.', match: 'Match', sorted: 'Sorted by match with your profile. Edit your profile to improve the matches.', row: { category: 'Category', city: 'City', reach: 'Expected reach', audience: 'Audience', lowest: 'Lowest package', packages: 'Packages', verified: 'Verified', yes: 'Yes', no: 'No' } },
      dash: { deals: 'Deals', value: 'Total value (JOD)', reach: 'Total reach', engagement: 'Average engagement (%)', sales: 'Reported sales', resultsFor: 'Results', note: 'Reported by you and the other side. SYNC does not verify these numbers.', reachLabel: 'Reach (people)', engLabel: 'Engagement rate (%)', salesLabel: 'Sales noticed', notes: 'Notes', submit: 'Save results', history: 'Reports so far', none: 'No results added yet.', select: 'Results', you: 'You', other: 'Other side' },
      up: { logo: 'Logo or photo', photo: 'Listing photo (optional)', uploading: 'Uploading...', hint: 'JPG, PNG or WebP, up to 3 MB.', logoReady: 'Logo uploaded. Click Save changes to keep it.' },
      ver: { title: 'Verification', verified: 'Your account is verified.', none: 'Upload a photo of your student ID, club registration, or commercial registration. An admin will review it.', pending: 'Your request is being reviewed.', rejected: 'Your last request was rejected. You can send a new photo.', sent: 'Sent. We will notify you.', choose: 'Choose a document photo' },
      adminv: { title: 'Verification requests', none: 'No pending requests.', open: 'Open document', approve: 'Approve', reject: 'Reject', noDoc: 'Uploads are not set up' },
      welcome: 'Signed in as',
    },
  },
  ar: {
    translation: {
      tagline: 'الرعايات بكل بساطة.',
      heroText: 'اعثر على الراعي المناسب أو الفرصة المناسبة في الأردن. مكان واحد للإعلانات والباقات والرسائل والنتائج.',
      nav: { browse: 'تصفّح', login: 'تسجيل الدخول', register: 'إنشاء حساب', logout: 'تسجيل الخروج', post: 'انشر فرصة', profile: 'الملف الشخصي', requests: 'الطلبات', tracker: 'المتابعة', admin: 'الإدارة' },
      post: { title: 'انشر فرصة رعاية', name: 'العنوان', category: 'الفئة', city: 'المدينة', description: 'الوصف', audience: 'الجمهور المستهدف', reach: 'الوصول المتوقع (عدد الأشخاص)', date: 'تاريخ الفعالية', packages: 'الباقات', pkgName: 'اسم الباقة', pkgPrice: 'السعر (دينار)', pkgBenefits: 'ما يحصل عليه الراعي', addPkg: 'أضف باقة أخرى', removePkg: 'احذف الباقة', publish: 'انشر الإعلان' },
      detail: { back: 'العودة إلى النتائج', audience: 'الجمهور', date: 'التاريخ', packages: 'الباقات', message: 'رسالة إلى الباحث عن رعاية', messageHint: 'اكتب ما تريده ولماذا يناسب نشاطك التجاري.', send: 'أرسل الطلب', loginToRequest: 'كراعٍ لإرسال طلب.' },
      profile: { title: 'ملفك الشخصي', save: 'احفظ التغييرات', saved: 'تم الحفظ.', myListings: 'إعلاناتك', noListings: 'ليس لديك إعلانات بعد.', delete: 'حذف', name: 'الاسم', seekerType: 'النوع (نادٍ، رياضي، صانع محتوى...)', city: 'المدينة', phone: 'الهاتف', audienceSize: 'حجم الجمهور', description: 'الوصف', businessName: 'اسم النشاط التجاري', industry: 'المجال', budgetMin: 'الميزانية من (دينار)', budgetMax: 'الميزانية حتى (دينار)', preferredAudience: 'الجمهور المفضّل' },
      browse: { title: 'تصفّح الفرص', search: 'ابحث عن فعاليات أو صنّاع محتوى أو فرق', all: 'كل الفئات', allCities: 'كل المدن', empty: 'لا توجد إعلانات مطابقة. أزل أحد الفلاتر لعرض المزيد.', reach: 'الوصول المتوقع', verified: 'موثّق', from: 'ابتداءً من' },
      auth: { loginTitle: 'تسجيل الدخول إلى SYNC', registerTitle: 'أنشئ حسابك في SYNC', email: 'البريد الإلكتروني', password: 'كلمة المرور', name: 'الاسم أو اسم النشاط التجاري', role: 'أنا', seeker: 'باحث عن رعاية', sponsor: 'راعٍ (أقدّم الرعاية)', submitLogin: 'دخول', submitRegister: 'إنشاء الحساب', noAccount: 'جديد في SYNC؟', haveAccount: 'لديك حساب بالفعل؟', passwordHint: '٨ أحرف على الأقل' },
      cat: { events: 'فعاليات', sports: 'رياضة', creators: 'صنّاع المحتوى', student: 'أنشطة طلابية', charity: 'أعمال خيرية', music: 'موسيقى وفنون', gaming: 'ألعاب ورياضات إلكترونية', tech: 'تقنية وشركات ناشئة', education: 'تعليم وورش عمل', culture: 'ثقافة ومجتمع' },
      home: { how: 'كيف يعمل SYNC', s1: 'أنشئ ملفًا شخصيًا', s1t: 'سجّل كراعٍ أو كباحث عن رعاية. التسجيل مجاني للباحثين.', s2: 'انشر أو تصفّح', s2t: 'ينشر الباحثون باقاتهم، ويبحث الرعاة ويفلترون ويقارنون.', s3: 'تواصل', s3t: 'أرسل طلبًا وراسل الطرف الآخر واتفقا على الشروط.', s4: 'تابع النتائج', s4t: 'سجّل الصفقة وأضف الوصول والتفاعل والمبيعات.', cta: 'تصفّح الفرص' },
      status: { PENDING: 'قيد الانتظار', ACCEPTED: 'مقبول', DECLINED: 'مرفوض', CONFIRMED: 'مؤكد', ACTIVE: 'نشط', COMPLETED: 'مكتمل' },
      req: { title: 'الطلبات', empty: 'لا توجد طلبات بعد.', accept: 'قبول', decline: 'رفض', agreed: 'القيمة المتفق عليها (دينار)', record: 'سجّل الصفقة المتفق عليها', inTracker: 'افتح في المتابعة' },
      tracker: { title: 'الحجز والمتابعة', empty: 'لا توجد صفقات بعد. يمكن تسجيل الطلبات المقبولة كصفقات.', deal: 'الصفقة', with: 'مع', package: 'الباقة', value: 'القيمة', status: 'الحالة', markAs: 'ضعها كـ {{status}}' },
      admin: { title: 'الإدارة', users: 'المستخدمون', listings: 'الإعلانات', verify: 'توثيق', unverify: 'إزالة الشارة', by: 'بواسطة' },
      msg: { show: 'الرسائل', hide: 'إخفاء الرسائل', placeholder: 'اكتب رسالة', send: 'إرسال', empty: 'لا توجد رسائل بعد.' },
      notif: { title: 'الإشعارات', none: 'لا جديد.', markAll: 'تحديد الكل كمقروء' },
      cmp: { add: 'قارن', go: 'قارن المحدد', title: 'مقارنة الإعلانات', need: 'اختر إعلانين على الأقل من صفحة التصفّح للمقارنة.', match: 'التوافق', sorted: 'مرتّبة حسب توافقها مع ملفك الشخصي. عدّل ملفك لتحسين التوافق.', row: { category: 'الفئة', city: 'المدينة', reach: 'الوصول المتوقع', audience: 'الجمهور', lowest: 'أقل باقة', packages: 'الباقات', verified: 'موثّق', yes: 'نعم', no: 'لا' } },
      dash: { deals: 'الصفقات', value: 'إجمالي القيمة (دينار)', reach: 'إجمالي الوصول', engagement: 'متوسط التفاعل (%)', sales: 'المبيعات المبلّغ عنها', resultsFor: 'النتائج', note: 'مُبلَّغ عنها منك ومن الطرف الآخر. لا يتحقق SYNC من هذه الأرقام.', reachLabel: 'الوصول (عدد الأشخاص)', engLabel: 'معدل التفاعل (%)', salesLabel: 'المبيعات الملحوظة', notes: 'ملاحظات', submit: 'احفظ النتائج', history: 'التقارير السابقة', none: 'لم تُضف نتائج بعد.', select: 'النتائج', you: 'أنت', other: 'الطرف الآخر' },
      up: { logo: 'الشعار أو الصورة', photo: 'صورة الإعلان (اختياري)', uploading: 'جارٍ الرفع...', hint: 'JPG أو PNG أو WebP، حتى ٣ ميغابايت.', logoReady: 'تم رفع الشعار. اضغط حفظ التغييرات للاحتفاظ به.' },
      ver: { title: 'التوثيق', verified: 'حسابك موثّق.', none: 'ارفع صورة عن هويتك الجامعية أو تسجيل النادي أو السجل التجاري. سيراجعها أحد المشرفين.', pending: 'طلبك قيد المراجعة.', rejected: 'تم رفض طلبك الأخير. يمكنك إرسال صورة جديدة.', sent: 'تم الإرسال. سنُعلمك بالنتيجة.', choose: 'اختر صورة المستند' },
      adminv: { title: 'طلبات التوثيق', none: 'لا توجد طلبات معلّقة.', open: 'افتح المستند', approve: 'قبول', reject: 'رفض', noDoc: 'الرفع غير مفعّل' },
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
