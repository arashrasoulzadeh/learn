import type {NetworkLesson} from './types';
const lesson = {
  "slug": "dns",
  "title": "DNS — پیدا کردن نشانی دامنه",
  "description": "حل نام و کش DNS را در یک سلسله‌مراتب فرضی یاد بگیرید؛ دامنهٔ .example و IPها فقط برای مستندات‌اند.",
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
      "sub": "Root",
      "icon": "dns"
    },
    {
      "label": "پسوند",
      "sub": "TLD",
      "icon": "dns"
    },
    {
      "label": "مرجع دامنه",
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
          "explanation": "مرورگر فقط نام میزبان را از حل‌کننده می‌پرسد. این آزمایش با دامنه و IP مستنداتی در یک سلسله‌مراتب فرضی انجام می‌شود؛ در DNS عمومی، .example پاسخ مثبت نمونهٔ ما را ندارد.",
          "state": [
            "www.shop.example",
            "MISS",
            "—"
          ]
        },
        {
          "name": "پرسش از ریشه",
          "short": "ریشه",
          "detail": "در سلسله‌مراتب فرضی این درس، ریشه نشانی مرجع پسوند را می‌دهد، نه IP نهایی. در اینترنت واقعی پسوندهایی مثل .com وجود دارند؛ .example برای مستندات رزرو شده است.",
          "route": [
            1,
            2
          ],
          "packet": "NS?",
          "input": "QNAME=www.shop.example",
          "output": "Referral: .example",
          "result": "سرور پسوند پیدا می‌شود.",
          "roundTrip": true,
          "explanation": "ریشه در نقش راهنما می‌گوید برای پسوند example باید سراغ کدام مرجع برویم؛ خود IP فروشگاه هنوز معلوم نیست.",
          "state": [
            "www.shop.example",
            "MISS",
            "Referral: .example"
          ]
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
          "explanation": "سرور پسوند نام مسئول shop.example را معرفی می‌کند. حل‌کننده اکنون می‌داند از کجا پاسخ دقیق بگیرد.",
          "state": [
            "www.shop.example",
            "MISS",
            "NS ns.shop.example"
          ]
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
          "explanation": "رکورد A برابر 192.0.2.10 است. TTL=300 اجازه می‌دهد این نتیجه تا ۳۰۰ ثانیه کش شود.",
          "state": [
            "www.shop.example",
            "A · TTL=300",
            "192.0.2.10"
          ]
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
          "explanation": "پاسخ به همان مرورگری می‌رسد که سؤال را پرسیده بود. حالا مرورگر IP مقصد را دارد و می‌تواند TCP را آغاز کند.",
          "state": [
            "www.shop.example",
            "A · TTL=300",
            "192.0.2.10"
          ]
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
          "explanation": "این بار سؤال همان سؤال قبلی است. حل‌کننده به‌جای رفتن سراغ چند سرور، رکورد موجود را پیدا می‌کند.",
          "state": [
            "www.shop.example",
            "HIT",
            "192.0.2.10"
          ]
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
          "explanation": "۱۸۰ ثانیه از اعتبار کش باقی مانده؛ بنابراین پاسخ قدیمی هنوز معتبر است. اگر TTL صفر شود باید دوباره حل نام کنیم.",
          "state": [
            "www.shop.example",
            "TTL=180",
            "192.0.2.10"
          ]
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
          "explanation": "این پاسخ همان IP را دارد، اما فقط یک رفت‌وبرگشت میان کلاینت و حل‌کننده لازم بوده است.",
          "state": [
            "www.shop.example",
            "HIT · TTL=180",
            "192.0.2.10"
          ]
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
          "explanation": "اگر کاربر نام اشتباهی وارد کند، حل‌کننده هنوز باید از مرجع معتبر دربارهٔ همان نام بپرسد.",
          "state": [
            "missing.shop.example",
            "MISS",
            "—"
          ]
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
          "explanation": "NXDOMAIN یعنی خود نام وجود ندارد؛ با NOERROR همراه پاسخ خالی (رکورد نوع A موجود نیست) فرق دارد.",
          "state": [
            "missing.shop.example",
            "Negative answer",
            "NXDOMAIN"
          ]
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
          "explanation": "بدون IP مقصد، مرحلهٔ اتصال HTTP شروع نمی‌شود. برنامه باید خطای حل نام را نمایش دهد.",
          "state": [
            "missing.shop.example",
            "Negative cache",
            "NXDOMAIN"
          ]
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
          "explanation": "اگر آدرس فروشگاه عوض شود، نباید کش منقضی‌شده را به‌عنوان پاسخ معتبر استفاده کرد.",
          "state": [
            "www.shop.example",
            "TTL=0 · stale",
            "192.0.2.10 (old)"
          ]
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
          "roundTrip": true,
          "state": [
            "www.shop.example",
            "TTL=300 · refreshed",
            "192.0.2.11"
          ]
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
          "tone": "success",
          "state": [
            "www.shop.example",
            "HIT",
            "192.0.2.11"
          ]
        }
      ]
    }
  ],
  "pitfall": "این شبیه‌سازی یک ریشه و پسوند فرضی برای .example دارد، نه DNS عمومی اینترنت. DNS همیشه از ریشه شروع نمی‌شود؛ کش، CNAME و ارجاع‌های قبلی مسیر را تغییر می‌دهند.",
  "takeaway": "DNS نگاشت نام به داده‌هایی مانند IP را فراهم می‌کند، نه انتقال صفحه یا مسیریابی HTTP.",
  "quiz": {
    "question": "در صورت وجود رکورد معتبر در کش حل‌کننده، چه اتفاقی می‌افتد؟",
    "options": [
      "همیشه از ریشه پرسش می‌شود",
      "پاسخ از کش داده می‌شود",
      "TCP حذف می‌شود"
    ],
    "correct": 1,
    "explanation": "رکورد معتبر در کش حل‌کننده می‌تواند بدون پرسش دوباره پاسخ داده شود. کش مرورگر و سیستم‌عامل نیز ممکن است قبل از این مرحله پاسخ بدهند."
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
    },
    {
      "label": "RFC 2606 — نام‌های رزروشده برای مثال",
      "url": "https://www.rfc-editor.org/rfc/rfc2606.html"
    }
  ],
  "visual": {
    "title": "جدول حل نام و حافظهٔ نهان",
    "labels": [
      "نام مورد پرسش",
      "وضعیت کش",
      "پاسخ شناخته‌شده"
    ],
    "context": "در این شبکهٔ فرضی، حل‌کننده به دنبال رکورد معتبر می‌گردد. .example در DNS عمومی یک پسوند عملیاتی نیست؛ هیچ پرسش واقعی ارسال نمی‌شود."
  },
  "teaching": {
    "goal": "مسیر حل نام را توضیح دهید و تشخیص دهید چه زمانی کش معتبر مانع پرسش دوباره می‌شود.",
    "practice": {
      "question": "رکورد دامنه در کش تا ۱۲۰ ثانیه دیگر معتبر است، اما مدیر سایت همین حالا IP را عوض کرده. حل‌کنندهٔ عادی چه پاسخی می‌تواند بدهد؟",
      "options": [
        "IP قبلی تا انقضای TTL",
        "حتماً IP تازه از ریشه",
        "همیشه NXDOMAIN"
      ],
      "correct": 0,
      "explanation": "TTL معتبر به حل‌کننده اجازه می‌دهد پاسخ قبلی را تا پایان اعتبار نگه دارد؛ تغییر رکورد فوراً همهٔ کش‌ها را به‌روز نمی‌کند.",
      "hint": "به زمان اعتبار رکورد در کش فکر کنید."
    },
    "terms": [
      [
        "Resolver",
        "حل‌کننده‌ای که پاسخ نهایی را برای کلاینت پیدا می‌کند."
      ],
      [
        "Authoritative",
        "مرجع معتبر رکوردهای یک ناحیهٔ DNS."
      ],
      [
        "TTL",
        "مدت مجاز نگهداری پاسخ در حافظهٔ نهان، بر حسب ثانیه."
      ]
    ]
  }
} satisfies NetworkLesson;
export default lesson;
