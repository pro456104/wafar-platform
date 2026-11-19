// The layer's shell tests mount with these fixtures, so a component is proven
// to render the content it is given rather than importing the product's list
// (contracts/ui-contracts.md §8.2; T320). The layout test in apps/web proves the
// real list reaches the layer.
import type {
  AccountMenuTargets,
  BottomBarSlot,
  FooterLink,
  SidebarDestination,
} from '@wafar/shared';

export const sidebarItems: readonly SidebarDestination[] = [
  { key: 'home', label: 'الرئيسية', path: '/' },
  { key: 'parts', label: 'بحث وفر', path: '/parts' },
  { key: 'catalogs', label: 'الكتالوج', path: '/catalogs' },
  { key: 'upload', label: 'رفع كتالوج', path: '/upload' },
  { key: 'my-files', label: 'ملفاتي', path: '/my-files' },
  { key: 'cart', label: 'سلة المشتريات', path: '/cart' },
  { key: 'notifications', label: 'الإشعارات', path: '/notifications' },
  { key: 'messages', label: 'المراسلة', path: '/messages' },
  { key: 'profile', label: 'الملف الشخصي', path: '/profile' },
];

export const footerItems: readonly FooterLink[] = [
  { key: 'contact', label: 'اتصل بنا', path: '/contact' },
  { key: 'privacy', label: 'سياسة الخصوصية', path: '/privacy' },
  { key: 'terms', label: 'شروط الاستخدام', path: '/terms' },
  { key: 'faq', label: 'الأسئلة الشائعة', path: '/faq' },
];

export const barSlots: readonly BottomBarSlot[] = [
  { key: 'home', label: 'الرئيسية', path: '/', raised: false },
  { key: 'upload', label: 'رفع كتالوج', path: '/upload', raised: false },
  { key: 'search', label: 'البحث في القطع', path: '/parts', raised: true },
  { key: 'my-files', label: 'ملفاتي', path: '/my-files', raised: false },
  { key: 'more', label: 'المزيد', path: null, raised: false },
];

export const accountTargets: AccountMenuTargets = {
  profile: '/profile',
  settings: '/profile#settings',
};

export const signInPath = '/auth/sign-in';
