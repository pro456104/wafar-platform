// The one message table of contracts/ui-contracts.md §4.5: one Arabic row per
// intake code, the page's own transfer-failure row, and R1's reused rows
// selected from R1's table when the code is outside the intake set.
import { formatDuration, type IntakeErrorCode, type RefusalCode } from '@wafar/shared';
import { messageFor } from '../auth/useAuthMessages.ts';

const rows: Record<IntakeErrorCode, string> = {
  UPLOAD_INVALID_NAME: 'ملف باسم غير صالح. اختر ملفا باسم آخر.',
  UPLOAD_UNSUPPORTED_FORMAT:
    'صيغة الملف غير مدعومة. الصيغ المدعومة: Excel (xls، xlsx)، PDF، Word (doc، docx).',
  UPLOAD_TOO_LARGE: 'حجم الملف يتجاوز 100 MB. اختر ملفا أصغر.',
  UPLOAD_EMPTY: 'الملف فارغ. اختر ملفا يحتوي محتوى.',
  UPLOAD_CONTENT_MISMATCH:
    'محتوى الملف لا يطابق امتداده. لم يتم حفظ الملف. تأكد من نوع الملف ثم اختر ملفا آخر.',
  UPLOAD_CORRUPT: 'ملف تالف لا يمكن فتحه. لم يتم حفظ الملف. اختر ملفا آخر.',
  UPLOAD_PASSWORD_PROTECTED:
    'الملف محمي بكلمة مرور. لم يتم حفظ الملف. أزل الحماية ثم اختر ملفا آخر.',
  UPLOAD_INFECTED:
    'فشل فحص الملف: يحتوي على برمجيات ضارة. لم يتم حفظ الملف. اختر ملفا آخر.',
  UPLOAD_EXPANSION_CAP:
    'يتجاوز محتوى الملف بعد فك الضغط الحد الآمن. لم يتم حفظ الملف. اختر ملفا آخر.',
  UPLOAD_SANITIZATION_FAILED:
    'تعذر تأمين الملف: يحتوي على محتوى تنفيذي لا يمكن إزالته. لم يتم حفظ الملف. اختر ملفا آخر.',
  UPLOAD_SCAN_UNAVAILABLE: 'تعذر فحص الملف الآن. لم يتم حفظ الملف. أعد المحاولة بعد قليل.',
  UPLOAD_TOO_MANY_ATTEMPTS: 'محاولات كثيرة. أعد المحاولة بعد {wait}.',
  UPLOAD_STORAGE_UNAVAILABLE: 'تعذر حفظ الملف. أعد المحاولة.',
  UPLOAD_INCOMPLETE: 'لم يكتمل نقل الملف. اختر ملفا آخر.',
  UPLOAD_INVALID_REQUEST: 'تعذر بدء الرفع. اختر الملف من جديد.',
  UPLOAD_MONTHLY_LIMIT: 'بلغت حد الرفع الشهري.',
  UPLOAD_ACTIVE_LIMIT: 'بلغت حد الملفات النشطة.',
};

/** The page's own cause: no response arrived, so no code selects it. */
export function transferFailureMessage(): string {
  return 'تعذر إكمال نقل الملف. تحقق من اتصالك ثم أعد المحاولة.';
}

export function isIntakeCode(code: string): code is IntakeErrorCode {
  return Object.prototype.hasOwnProperty.call(rows, code);
}

/**
 * One row per cause: an intake code takes its own text, a reused R1 code takes
 * R1's, and a code outside the platform union falls back to the internal row.
 */
export function refusalMessage(code: string, retryAfterSeconds?: number): string {
  if (isIntakeCode(code)) {
    const row = rows[code];
    if (code === 'UPLOAD_TOO_MANY_ATTEMPTS') {
      const wait = formatDuration(retryAfterSeconds ?? 1);
      return row.replace('{wait}', wait);
    }
    return row;
  }
  return messageFor({ code: code as RefusalCode });
}

export const refusalRows = rows;
