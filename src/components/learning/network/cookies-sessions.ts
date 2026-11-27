import type {NetworkLesson} from './types';
const lesson = {
  "slug": "cookies-sessions",
  "title": "Cookie و Session — حفظ نشست کاربر",
  "description": "HTTP ذاتاً نشست کاربردی ندارد؛ Cookie شناسه را همراه درخواست می‌برد و سرور می‌تواند وضعیت نشست را جداگانه نگه دارد.",
  "order": 9,
  "actors": [
    {
      "label": "مرورگر",
      "sub": "Cookie jar",
      "icon": "browser"
    },
    {
      "label": "برنامهٔ وب",
      "sub": "Session middleware",
      "icon": "app"
    },
    {
      "label": "مخزن نشست",
      "sub": "Session store",
      "icon": "db"
    }
  ],
  "edges": [
    [
      0,
      1
    ],
    [
      1,
      2
    ]
  ],
  "scenarios": [
    {
      "id": "login",
      "label": "ورود و درخواست احراز هویت‌شده",
      "example": "Cookie: sid=opaque-demo",
      "steps": [
        {
          "name": "ارسال اطلاعات ورود",
          "short": "ورود",
          "detail": "کاربر به endpoint ورود درخواست می‌فرستد. اطلاعات نمونه صرفاً آموزشی است.",
          "route": [
            0,
            1
          ],
          "packet": "POST",
          "input": "POST /login\n{credentials: demo}",
          "output": "Credentials verified",
          "result": "سرور هویت را تأیید کرد."
        },
        {
          "name": "ساخت نشست",
          "short": "نشست",
          "detail": "برنامه یک شناسهٔ تصادفی و غیرقابل حدس تولید می‌کند و دادهٔ نشست را در مخزن سرور ذخیره می‌کند؛ مقدار اینجا نمایشی است.",
          "route": [
            1,
            2
          ],
          "packet": "SAVE",
          "input": "sid=opaque-demo",
          "output": "Session user=42 stored",
          "result": "نشست سمت سرور ساخته شد.",
          "roundTrip": true
        },
        {
          "name": "تنظیم Cookie",
          "short": "Set-Cookie",
          "detail": "سرور Set-Cookie را برمی‌گرداند. مرورگر در صورت پذیرش آن را نگه می‌دارد.",
          "route": [
            1,
            0
          ],
          "packet": "COOKIE",
          "input": "Set-Cookie: sid=opaque-demo; Path=/; Secure; HttpOnly; SameSite=Lax",
          "output": "Cookie stored",
          "result": "شناسه در مرورگر ذخیره شد."
        },
        {
          "name": "درخواست بعدی",
          "short": "Cookie",
          "detail": "مرورگر طبق محدودیت دامنه، مسیر و ویژگی‌های Cookie شناسه را همراه درخواست مناسب می‌فرستد.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /profile\nCookie: sid=opaque-demo",
          "output": "Session lookup requested",
          "result": "مرورگر دوباره گذرواژه نمی‌فرستد."
        },
        {
          "name": "بازیابی نشست",
          "short": "پاسخ",
          "detail": "برنامه نشست معتبر را با شناسه پیدا می‌کند و در صورت مجاز بودن پاسخ پروفایل می‌دهد.",
          "route": [
            1,
            2
          ],
          "packet": "LOOKUP",
          "input": "sid=opaque-demo",
          "output": "200 OK · user=42",
          "result": "نشست معتبر است.",
          "roundTrip": true,
          "tone": "success"
        }
      ]
    },
    {
      "id": "expired",
      "label": "نشست منقضی یا حذف‌شده",
      "example": "Cookie: sid=expired-demo",
      "steps": [
        {
          "name": "ارسال شناسهٔ قدیمی",
          "short": "درخواست",
          "detail": "مرورگر هنوز Cookie دارد، اما وجود Cookie تضمین نمی‌کند نشست سمت سرور معتبر است.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /profile\nCookie: sid=expired-demo",
          "output": "Lookup requested",
          "result": "شناسه به سرور رسید."
        },
        {
          "name": "نبود نشست معتبر",
          "short": "بررسی",
          "detail": "مخزن نشست داده‌ای برای این شناسه ندارد یا زمان اعتبارش گذشته است.",
          "route": [
            1,
            2
          ],
          "packet": "LOOKUP",
          "input": "sid=expired-demo",
          "output": "Session expired",
          "result": "نشست معتبر پیدا نشد.",
          "roundTrip": true,
          "tone": "error"
        },
        {
          "name": "نیاز به ورود مجدد",
          "short": "پاسخ",
          "detail": "این API پاسخ ۴۰۱ می‌دهد و Cookie نامعتبر را پاک می‌کند؛ ورود دوباره لازم است.",
          "route": [
            1,
            0
          ],
          "packet": "401",
          "input": "HTTP/1.1 401 Unauthorized\nSet-Cookie: sid=; Max-Age=0; Path=/",
          "output": "401 Unauthorized",
          "result": "کاربر باید دوباره وارد شود.",
          "tone": "error"
        }
      ]
    },
    {
      "id": "logout",
      "label": "خروج و ابطال نشست",
      "example": "POST /logout",
      "steps": [
        {
          "name": "درخواست خروج",
          "short": "خروج",
          "detail": "کاربر با نشست معتبر درخواست خروج می‌دهد؛ در سامانهٔ واقعی حفاظت CSRF نیز لازم است.",
          "route": [
            0,
            1
          ],
          "packet": "POST",
          "input": "POST /logout\nCookie: sid=opaque-demo",
          "output": "Logout requested",
          "result": "سرور درخواست خروج را گرفت."
        },
        {
          "name": "ابطال سمت سرور",
          "short": "ابطال",
          "detail": "برنامه شناسه را از مخزن نشست حذف می‌کند تا حتی نسخهٔ قدیمی Cookie قابل استفاده نباشد.",
          "route": [
            1,
            2
          ],
          "packet": "DEL",
          "input": "DELETE session opaque-demo",
          "output": "Session revoked",
          "result": "نشست دیگر معتبر نیست.",
          "roundTrip": true
        },
        {
          "name": "پاک کردن Cookie",
          "short": "پاسخ",
          "detail": "سرور Cookie با همان محدوده را منقضی می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "COOKIE",
          "input": "Set-Cookie: sid=; Max-Age=0; Path=/",
          "output": "Session revoked; cookie cleared",
          "result": "خروج انجام شد.",
          "tone": "success"
        }
      ]
    }
  ],
  "pitfall": "Cookie همان Session نیست. HttpOnly دسترسی اسکریپت به Cookie را محدود می‌کند، Secure ارسال را به ارتباط امن محدود می‌کند و SameSite بخشی از حفاظت CSRF است؛ هیچ‌کدام جایگزین کنترل امنیت سمت سرور نیست.",
  "takeaway": "شناسهٔ نشست را محرمانه و تصادفی نگه دارید و اعتبار و ابطال را سمت سرور بررسی کنید.",
  "quiz": {
    "question": "اگر Cookie وجود داشته باشد ولی نشست سرور منقضی شده باشد، چه می‌شود؟",
    "options": [
      "کاربر همیشه وارد شده است",
      "سرور باید اعتبار نشست را بررسی و در صورت نامعتبر بودن رد کند",
      "مرورگر خودکار گذرواژه را می‌فرستد"
    ],
    "correct": 1,
    "explanation": "Cookie حامل شناسه است؛ اعتبار نشست به وضعیت سرور وابسته است."
  },
  "references": [
    {
      "label": "RFC 6265 — HTTP State Management",
      "url": "https://www.rfc-editor.org/rfc/rfc6265.html"
    },
    {
      "label": "OWASP — مدیریت نشست",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html"
    }
  ]
} satisfies NetworkLesson;
export default lesson;
