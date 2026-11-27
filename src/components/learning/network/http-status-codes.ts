import type {NetworkLesson} from './types';
const lesson = {
  "slug": "http-status-codes",
  "title": "HTTP Status Codes — کدهای وضعیت",
  "description": "کد وضعیت نتیجهٔ درخواست را نشان می‌دهد. تفاوت پاسخ اطلاعاتی، موفق، تغییر مسیر، خطای درخواست و خطای سرور را تمرین کنید.",
  "order": 8,
  "actors": [
    {
      "label": "کلاینت",
      "sub": "HTTP client",
      "icon": "browser"
    },
    {
      "label": "سرور وب",
      "sub": "API",
      "icon": "app"
    },
    {
      "label": "سرویس داخلی",
      "sub": "Backend",
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
      "id": "continue",
      "label": "۱۰۰ · ادامهٔ ارسال",
      "example": "100 Continue",
      "steps": [
        {
          "name": "ارسال سرآیندها",
          "short": "درخواست",
          "detail": "کلاینت با Expect: 100-continue اعلام می‌کند پیش از ارسال بدنهٔ بزرگ، منتظر پاسخ اولیه است.",
          "route": [
            0,
            1
          ],
          "packet": "POST",
          "input": "POST /upload HTTP/1.1\nExpect: 100-continue",
          "output": "Headers received",
          "result": "سرور می‌تواند پذیرش اولیه را اعلام کند."
        },
        {
          "name": "پاسخ اطلاعاتی",
          "short": "۱۰۰",
          "detail": "پاسخ ۱۰۰ نهایی نیست؛ فقط اعلام می‌کند ارسال بدنه می‌تواند ادامه یابد.",
          "route": [
            1,
            0
          ],
          "packet": "100",
          "input": "HTTP/1.1 100 Continue",
          "output": "Send request body",
          "result": "کلاینت هنوز منتظر پاسخ نهایی است."
        },
        {
          "name": "ارسال بدنه و پاسخ نهایی",
          "short": "۲۰۰",
          "detail": "کلاینت بدنه را ارسال می‌کند و سرور پس از پردازش پاسخ نهایی ۲۰۰ می‌دهد.",
          "route": [
            0,
            1
          ],
          "packet": "DATA",
          "input": "Request body",
          "output": "200 OK",
          "result": "پاسخ نهایی از پاسخ اطلاعاتی جداست.",
          "roundTrip": true,
          "tone": "success"
        }
      ]
    },
    {
      "id": "ok",
      "label": "۲۰۰ · درخواست موفق",
      "example": "200 OK",
      "steps": [
        {
          "name": "درخواست منبع",
          "short": "درخواست",
          "detail": "کلاینت محصول موجود را درخواست می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /products/42",
          "output": "Request accepted",
          "result": "درخواست به سرور رسید."
        },
        {
          "name": "پردازش موفق",
          "short": "پردازش",
          "detail": "سرور محصول را از سرویس داخلی دریافت می‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "READ",
          "input": "id=42",
          "output": "Product found",
          "result": "منبع موجود است.",
          "roundTrip": true
        },
        {
          "name": "پاسخ ۲۰۰",
          "short": "موفق",
          "detail": "کد ۲۰۰ به معنای موفقیت درخواست با توجه به متد است.",
          "route": [
            1,
            0
          ],
          "packet": "200",
          "input": "HTTP/1.1 200 OK",
          "output": "200 OK",
          "result": "درخواست موفق است.",
          "tone": "success"
        }
      ]
    },
    {
      "id": "redirect",
      "label": "۳۰۱ · انتقال دائمی",
      "example": "301 Moved Permanently",
      "steps": [
        {
          "name": "درخواست URL قدیمی",
          "short": "درخواست",
          "detail": "کلاینت آدرس قدیمی منبع را فراخوانی می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /old",
          "output": "Old resource URL",
          "result": "سرور آدرس جدید را می‌شناسد."
        },
        {
          "name": "بازگشت Location",
          "short": "۳۰۱",
          "detail": "سرور ۳۰۱ و Location آدرس جدید را اعلام می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "301",
          "input": "HTTP/1.1 301 Moved Permanently\nLocation: /new",
          "output": "Redirect to /new",
          "result": "این پاسخ مسیر جدید را معرفی می‌کند."
        },
        {
          "name": "دنبال کردن تغییر مسیر",
          "short": "درخواست دوم",
          "detail": "کلاینت در این مثال یک GET جدید به /new می‌فرستد و پاسخ موفق می‌گیرد.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /new",
          "output": "200 OK after redirect",
          "result": "درخواست دوم به مقصد جدید رسید.",
          "roundTrip": true,
          "tone": "success"
        }
      ]
    },
    {
      "id": "missing",
      "label": "۴۰۴ · منبع پیدا نشد",
      "example": "404 Not Found",
      "steps": [
        {
          "name": "درخواست محصول ناموجود",
          "short": "درخواست",
          "detail": "کلاینت URL محصولی را درخواست می‌کند که در این API موجود نیست.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /products/999",
          "output": "Request received",
          "result": "درخواست از نظر قالب معتبر است."
        },
        {
          "name": "بررسی وجود منبع",
          "short": "پردازش",
          "detail": "سرور رکورد را جست‌وجو می‌کند و نتیجه‌ای پیدا نمی‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "READ",
          "input": "id=999",
          "output": "No matching resource",
          "result": "منبع پیدا نشد.",
          "roundTrip": true
        },
        {
          "name": "پاسخ خطای درخواست",
          "short": "۴۰۴",
          "detail": "سرور با ۴۰۴ اعلام می‌کند نمایش فعلی منبع را پیدا نکرده یا نمی‌خواهد وجود آن را آشکار کند.",
          "route": [
            1,
            0
          ],
          "packet": "404",
          "input": "HTTP/1.1 404 Not Found",
          "output": "404 Not Found",
          "result": "کلاینت باید وضعیت را مدیریت کند.",
          "tone": "error"
        }
      ]
    },
    {
      "id": "server-error",
      "label": "۵۰۰ · خطای داخلی",
      "example": "500 Internal Server Error",
      "steps": [
        {
          "name": "درخواست معتبر",
          "short": "درخواست",
          "detail": "کلاینت درخواست معمولی می‌فرستد.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /products/42",
          "output": "Request accepted",
          "result": "درخواست به سرور رسید."
        },
        {
          "name": "خرابی پیش‌بینی‌نشده",
          "short": "خطا",
          "detail": "در این نمونه سرویس داخلی هنگام پردازش دچار خطای غیرمنتظره می‌شود.",
          "route": [
            1,
            2
          ],
          "packet": "ERR",
          "input": "Read product",
          "output": "Unexpected exception",
          "result": "سرور نتوانست عملیات را انجام دهد.",
          "roundTrip": true,
          "tone": "error"
        },
        {
          "name": "پاسخ خطای سرور",
          "short": "۵۰۰",
          "detail": "سرور پاسخ عمومی ۵۰۰ می‌دهد و جزئیات حساس خطا را در پاسخ افشا نمی‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "500",
          "input": "HTTP/1.1 500 Internal Server Error",
          "output": "500 Internal Server Error",
          "result": "درخواست ناموفق است.",
          "tone": "error"
        }
      ]
    }
  ],
  "pitfall": "همهٔ پاسخ‌های HTTP خطای شبکه نیستند. ۴۰۱ برای نبود اعتبار احراز هویت معتبر است و ۴۰۳ یعنی سرور از انجام درخواست خودداری می‌کند. ۵۰۳ برای عدم دسترسی موقت مناسب است.",
  "takeaway": "رقم اول خانوادهٔ کد را مشخص می‌کند: ۱xx اطلاعاتی، ۲xx موفق، ۳xx تغییر مسیر، ۴xx خطای سمت درخواست و ۵xx خطای سمت سرور.",
  "quiz": {
    "question": "کدام پاسخ اطلاعاتی است و پایان درخواست نیست؟",
    "options": [
      "۱۰۰ Continue",
      "۲۰۰ OK",
      "۴۰۴ Not Found"
    ],
    "correct": 0,
    "explanation": "کد ۱۰۰ پاسخ میانی است؛ یک پاسخ نهایی بعد از آن لازم است."
  },
  "references": [
    {
      "label": "RFC 9110 — Status Codes",
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
    },
    {
      "label": "IANA — فهرست کدهای HTTP",
      "url": "https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml"
    }
  ]
} satisfies NetworkLesson;
export default lesson;
