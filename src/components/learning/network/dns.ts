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
          "result": "حل‌کننده پاسخ ذخیره‌شده ندارد."
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
          "roundTrip": true
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
          "roundTrip": true
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
          "roundTrip": true
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
          "tone": "success"
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
          "result": "رکورد در کش موجود است."
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
          "result": "نیازی به پرسش از ریشه نیست."
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
          "tone": "success"
        }
      ]
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
          "result": "حل‌کننده باید از مرجع بپرسد."
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
          "tone": "error"
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
          "tone": "error"
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
