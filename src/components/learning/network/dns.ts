import type {NetworkLesson} from './types';
const lesson = {
  "slug": "dns",
  "title": "DNS — پیدا کردن نشانی دامنه",
  "description": "چطور نام یک دامنه به IP تبدیل می‌شود؟ مسیر حل نام و نقش حافظهٔ نهان را ببینید.",
  "order": 2,
  "actors": [
    {
      "label": "مرورگر",
      "sub": "کلاینت",
      "icon": "browser"
    },
    {
      "label": "حل‌کننده",
      "sub": "Recursive DNS",
      "icon": "dns"
    },
    {
      "label": "ریشه",
      "sub": "Root DNS",
      "icon": "dns"
    },
    {
      "label": "پسوند",
      "sub": "TLD DNS",
      "icon": "dns"
    },
    {
      "label": "سرور معتبر",
      "sub": "Authoritative",
      "icon": "app"
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
    ],
    [
      1,
      3
    ],
    [
      1,
      4
    ]
  ],
  "scenarios": [
    {
      "id": "cold",
      "label": "جست‌وجوی کامل بدون کش",
      "example": "www.shop.example A",
      "steps": [
        {
          "name": "شروع حل نام",
          "short": "پرسش",
          "detail": "مرورگر برای برقراری اتصال به IP نیاز دارد؛ مسیر URL به DNS فرستاده نمی‌شود.",
          "route": [
            0,
            1
          ],
          "packet": "A?",
          "input": "QNAME=www.shop.example\nQTYPE=A",
          "output": "Cache MISS",
          "result": "حل‌کننده پاسخ ذخیره‌شده ندارد.",
          "explanation": "مثل وقتی آدرس یک فروشگاه را از دفتر راهنما می‌خواهیم، مرورگر ابتدا نام www.shop.example را می‌دهد، نه /products/42. حل‌کننده در کش چیزی ندارد."
        },
        {
          "name": "پرسش از ریشه",
          "short": "ریشه",
          "detail": "ریشه معمولاً نشانی نهایی سایت را نمی‌دهد؛ حل‌کننده را به سرور پسوند مربوط راهنمایی می‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "NS?",
          "input": "QNAME=www.shop.example",
          "output": "Referral: .example",
          "result": "سرور پسوند پیدا می‌شود.",
          "roundTrip": true,
          "explanation": "ریشه در نقش راهنما می‌گوید برای پسوند example باید سراغ کدام مرجع برویم؛ خود IP فروشگاه هنوز معلوم نیست."
        },
        {
          "name": "پرسش از سرور پسوند",
          "short": "پسوند",
          "detail": "سرور TLD ارجاع به سرور معتبر دامنه را می‌دهد.",
          "route": [
            1,
            3
          ],
          "packet": "NS?",
          "input": "QNAME=www.shop.example",
          "output": "NS ns.shop.example",
          "result": "سرور معتبر شناخته شد.",
          "roundTrip": true,
          "explanation": "سرور پسوند نام مسئول shop.example را معرفی می‌کند. حل‌کننده اکنون می‌داند از کجا پاسخ دقیق بگیرد."
        },
        {
          "name": "دریافت رکورد معتبر",
          "short": "رکورد",
          "detail": "سرور معتبر رکورد A را برمی‌گرداند. TTL زمان مجاز نگهداری در کش را نشان می‌دهد.",
          "route": [
            1,
            4
          ],
          "packet": "A",
          "input": "QTYPE=A",
          "output": "A 192.0.2.10\nTTL 300",
          "result": "نشانی IP دریافت شد.",
          "roundTrip": true,
          "explanation": "رکورد A برابر 192.0.2.10 است. TTL=300 اجازه می‌دهد این نتیجه تا ۳۰۰ ثانیه کش شود."
        },
        {
          "name": "بازگشت IP به مرورگر",
          "short": "پاسخ",
          "detail": "حل‌کننده پاسخ را کش می‌کند و IP را به مرورگر تحویل می‌دهد.",
          "route": [
            1,
            0
          ],
          "packet": "IP",
          "input": "A 192.0.2.10",
          "output": "192.0.2.10",
          "result": "مرورگر می‌تواند اتصال را شروع کند.",
          "tone": "success",
          "explanation": "پاسخ به همان مرورگری می‌رسد که سؤال را پرسیده بود. حالا مرورگر IP مقصد را دارد و می‌تواند TCP را آغاز کند."
        }
      ]
    },
    {
      "id": "warm",
      "label": "پاسخ از کش",
      "example": "www.shop.example A",
      "steps": [
        {
          "name": "ارسال پرسش تکراری",
          "short": "پرسش",
          "detail": "کلاینت برای همان دامنه درخواست حل نام می‌دهد.",
          "route": [
            0,
            1
          ],
          "packet": "A?",
          "input": "QNAME=www.shop.example",
          "output": "Cache HIT",
          "result": "رکورد در کش موجود است.",
          "explanation": "این بار سؤال همان سؤال قبلی است. حل‌کننده به‌جای رفتن سراغ چند سرور، رکورد موجود را پیدا می‌کند."
        },
        {
          "name": "بررسی TTL",
          "short": "کش",
          "detail": "حل‌کننده زمان باقی‌مانده را می‌سنجد؛ رکورد منقضی نشده است.",
          "route": [
            1
          ],
          "packet": "TTL",
          "input": "TTL remaining: 180",
          "output": "Valid cached answer",
          "result": "نیازی به پرسش از ریشه نیست.",
          "explanation": "۱۸۰ ثانیه از اعتبار کش باقی مانده؛ بنابراین پاسخ قدیمی هنوز معتبر است. اگر TTL صفر شود باید دوباره حل نام کنیم."
        },
        {
          "name": "پاسخ مستقیم",
          "short": "پاسخ",
          "detail": "پاسخ معتبر کش‌شده مستقیماً به کلاینت برمی‌گردد.",
          "route": [
            1,
            0
          ],
          "packet": "IP",
          "input": "Cached A record",
          "output": "192.0.2.10",
          "result": "حل نام با رفت‌وبرگشت کمتر تمام شد.",
          "tone": "success",
          "explanation": "این پاسخ همان IP را دارد، اما فقط یک رفت‌وبرگشت میان کلاینت و حل‌کننده لازم بوده است."
        }
      ],
      "edgeCase": "رکورد معتبر در کش؛ مسیر کوتاه‌تر."
    },
    {
      "id": "missing",
      "label": "دامنهٔ پیدا نشده",
      "example": "missing.shop.example A",
      "steps": [
        {
          "name": "پرسش نام ناموجود",
          "short": "پرسش",
          "detail": "در این نمونه حل‌کننده مسیر سرور معتبر را از قبل می‌داند.",
          "route": [
            0,
            1
          ],
          "packet": "A?",
          "input": "QNAME=missing.shop.example",
          "output": "Cache MISS",
          "result": "حل‌کننده باید از مرجع بپرسد.",
          "explanation": "اگر کاربر نام اشتباهی وارد کند، حل‌کننده هنوز باید از مرجع معتبر دربارهٔ همان نام بپرسد."
        },
        {
          "name": "پاسخ منفی سرور معتبر",
          "short": "مرجع",
          "detail": "NXDOMAIN یعنی نام مورد پرسش وجود ندارد؛ با نبودن یک نوع رکورد برای نام موجود فرق دارد.",
          "route": [
            1,
            4
          ],
          "packet": "DNS",
          "input": "QTYPE=A",
          "output": "RCODE=NXDOMAIN",
          "result": "نام موجود نیست.",
          "roundTrip": true,
          "tone": "error",
          "explanation": "NXDOMAIN یعنی خود نام وجود ندارد؛ با NOERROR همراه پاسخ خالی (رکورد نوع A موجود نیست) فرق دارد."
        },
        {
          "name": "اعلام خطا",
          "short": "پاسخ",
          "detail": "حل‌کننده پاسخ منفی را برمی‌گرداند؛ ممکن است برای مدت محدود نیز کش شود.",
          "route": [
            1,
            0
          ],
          "packet": "NX",
          "input": "RCODE=3",
          "output": "NXDOMAIN",
          "result": "مرورگر IP دریافت نکرد.",
          "tone": "error",
          "explanation": "بدون IP مقصد، مرحلهٔ اتصال HTTP شروع نمی‌شود. برنامه باید خطای حل نام را نمایش دهد."
        }
      ],
      "edgeCase": "نام ناموجود و پاسخ منفی NXDOMAIN."
    },
    {
      "id": "expired",
      "label": "انقضای TTL و تغییر IP",
      "example": "TTL=0 → new A record",
      "edgeCase": "رکورد کش منقضی شده و نشانی سرور تغییر کرده است.",
      "steps": [
        {
          "name": "رکورد منقضی شده",
          "short": "کش",
          "detail": "حل‌کننده رکورد قدیمی را دیگر معتبر نمی‌داند.",
          "route": [
            0,
            1
          ],
          "packet": "TTL",
          "input": "A 192.0.2.10\nTTL=0",
          "output": "Cache expired",
          "result": "باید رکورد تازه دریافت شود.",
          "explanation": "اگر آدرس فروشگاه عوض شود، نباید کش منقضی‌شده را به‌عنوان پاسخ معتبر استفاده کرد."
        },
        {
          "name": "پرسش دوباره از مرجع",
          "short": "مرجع",
          "detail": "مسیر سرور معتبر در کش موجود است و حل‌کننده رکورد جدید را می‌گیرد.",
          "route": [
            1,
            4
          ],
          "packet": "A?",
          "input": "QNAME=www.shop.example",
          "output": "A 192.0.2.11 TTL=300",
          "result": "IP جدید پیدا شد.",
          "explanation": "مرجع معتبر اکنون .11 را برمی‌گرداند؛ نیازی نیست حتماً از ریشه شروع کنیم.",
          "roundTrip": true
        },
        {
          "name": "تحویل نشانی تازه",
          "short": "پاسخ",
          "detail": "کلاینت IP جدید را دریافت می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "IP",
          "input": "A 192.0.2.11",
          "output": "192.0.2.11",
          "result": "کش با پاسخ جدید به‌روز شد.",
          "explanation": "اتصال تازه باید به IP جدید برود؛ اتصال قبلی لزوماً خودکار جابه‌جا نمی‌شود.",
          "tone": "success"
        }
      ]
    }
  ],
  "pitfall": "DNS همیشه از ریشه شروع نمی‌شود؛ کش، CNAME و ارجاع‌های قبلی مسیر را تغییر می‌دهند. مثال .example و IP مستنداتی است.",
  "takeaway": "DNS نگاشت نام به داده‌هایی مانند IP را فراهم می‌کند، نه انتقال صفحه یا مسیریابی HTTP.",
  "quiz": {
    "question": "در صورت وجود رکورد معتبر در کش حل‌کننده، چه اتفاقی می‌افتد؟",
    "options": [
      "همیشه از ریشه پرسش می‌شود",
      "پاسخ از کش داده می‌شود",
      "TCP حذف می‌شود"
    ],
    "correct": 1,
    "explanation": "کش معتبر پرسش‌های اضافی DNS را حذف می‌کند."
  },
  "references": [
    {
      "label": "RFC 1034 — مفاهیم DNS",
      "url": "https://www.rfc-editor.org/rfc/rfc1034.html"
    },
    {
      "label": "RFC 1035 — پیاده‌سازی DNS",
      "url": "https://www.rfc-editor.org/rfc/rfc1035.html"
    },
    {
      "label": "RFC 2308 — کش پاسخ منفی",
      "url": "https://www.rfc-editor.org/rfc/rfc2308.html"
    }
  ]
} satisfies NetworkLesson;
export default lesson;
