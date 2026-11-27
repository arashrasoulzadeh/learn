import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "rate-limiting",
  "order": 46,
  "title": "Rate Limiting — کنترل نرخ و burst",
  "description": "Token bucket، 429، نرخ توزیع‌شده و اتمیک بودن شمارنده.",
  "actors": [
    [
      "Client",
      "Requests",
      "browser"
    ],
    [
      "Limiter",
      "Token bucket",
      "queue"
    ],
    [
      "API",
      "Protected capacity",
      "app"
    ]
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
  "labels": [
    "درخواست",
    "توکن / سیاست",
    "پاسخ"
  ],
  "context": "Token bucket ظرفیت 3 و نرخ 1 token/s؛ هر درخواست یک توکن؛ زمان منطقی و refill سقف‌دار.",
  "goal": "تفاوت نرخ پایدار، burst و هم‌زمانی شمارنده را محاسبه کنید.",
  "scenarios": [
    [
      "burst",
      "Burst مجاز",
      "سه درخواست در t=0 می‌توانند عبور کنند؟",
      "capacity=3",
      [
        [
          "توکن اولیه",
          [
            1
          ],
          [
            "3 tokens"
          ],
          "tokens=3",
          "Ready",
          [
            "t=0",
            "3 tokens",
            "0 allowed"
          ],
          "bucket پر است و burst سه‌تایی را می‌پذیرد.",
          "ظرفیت bucket با نرخ refill متفاوت است."
        ],
        [
          "درخواست اول",
          [
            0,
            1,
            2
          ],
          [
            "consume",
            "forward"
          ],
          "tokens-=1",
          "Allowed 1",
          [
            "R1",
            "2 tokens",
            "1 allowed"
          ],
          "هر درخواست یک واحد مصرف می‌کند.",
          "check و decrement باید اتمیک باشند."
        ],
        [
          "دو درخواست دیگر",
          [
            0,
            1,
            2
          ],
          [
            "consume ×2",
            "forward ×2"
          ],
          "tokens=0",
          "3 allowed",
          [
            "R2,R3",
            "0 tokens",
            "3 allowed"
          ],
          "burst کامل شد؛ refill با زمان انجام می‌شود.",
          "metric allowed و rejected را جدا ثبت کنید.",
          "success"
        ]
      ]
    ],
    [
      "refill",
      "رد و پرشدن دوباره",
      "درخواست چهارم بدون توکن چه می‌گیرد؟",
      "bucket empty",
      [
        [
          "رد",
          [
            0,
            1
          ],
          [
            "R4",
            "429"
          ],
          "tokens=0",
          "429 Too Many Requests",
          [
            "t=0",
            "0 tokens",
            "429"
          ],
          "سیاست نمونه بدون صف درخواست را رد می‌کند.",
          "Retry-After زمان مناسب تلاش را اعلام می‌کند.",
          "error"
        ],
        [
          "گذشت زمان",
          [
            1
          ],
          [
            "refill"
          ],
          "t=1; tokens=min(3,0+1)",
          "1 token",
          [
            "t=1",
            "1 token",
            "Ready"
          ],
          "یک توکن تازه اضافه شد.",
          "از ساعت monotonic برای elapsed محلی استفاده کنید."
        ],
        [
          "تلاش تازه",
          [
            0,
            1,
            2
          ],
          [
            "consume",
            "forward"
          ],
          "tokens=1→0",
          "Allowed",
          [
            "R5",
            "0 tokens",
            "200"
          ],
          "کلاینت دوباره مجاز شد.",
          "backoff و jitter از retry storm جلوگیری می‌کنند.",
          "success"
        ]
      ]
    ],
    [
      "distributed",
      "شمارنده محلی چند instance",
      "اگر هر replica سقف سه‌تایی مستقل داشته باشد؟",
      "A cap=3; B cap=3",
      [
        [
          "Replica A",
          [
            0,
            1
          ],
          [
            "3 requests"
          ],
          "A bucket 3→0",
          "3 allowed",
          [
            "3 requests",
            "A=0",
            "3 allowed"
          ],
          "A محدودیت محلی را اعمال می‌کند.",
          "scope کلید مشخص شود: tenant، user یا IP."
        ],
        [
          "Replica B",
          [
            0,
            1
          ],
          [
            "3 requests"
          ],
          "B bucket 3→0",
          "6 total allowed",
          [
            "6 requests",
            "A=0 B=0",
            "6 allowed"
          ],
          "B شمارنده مستقل دارد؛ سقف سراسری رعایت نشده.",
          "coordination هزینه latency دارد.",
          "error"
        ],
        [
          "سیاست مشترک",
          [
            1
          ],
          [
            "atomic shared bucket"
          ],
          "shared budget=3",
          "Global policy needed",
          [
            "6 attempts",
            "Shared cap=3",
            "3 intended"
          ],
          "عملیات refill/check/consume باید در scope مشترک اتمیک باشد.",
          "در خرابی store تصمیم fail-open/closed را بر اساس ریسک بگیرید.",
          "success"
        ]
      ],
      "نرخ محلی با نرخ سراسری یکی نیست."
    ]
  ],
  "pitfall": "Rate limiting با concurrency limiting و quota روزانه یکی نیست؛ کلید نامناسب fairness را خراب می‌کند.",
  "takeaway": "نرخ، burst، scope، atomicity و سیاست failure را مشخص کنید.",
  "quiz": [
    "ظرفیت ۳ و نرخ ۱/s یعنی؟",
    [
      "همیشه سه در ثانیه",
      "burst تا ۳، نرخ پایدار حدود ۱/s",
      "سه درخواست در عمر سرویس"
    ],
    1,
    "توکن‌های اولیه burst را مجاز می‌کنند."
  ],
  "practice": [
    "دو replica هرکدام سقف 100 دارند، سقف جهانی دقیق 100 می‌خواهیم؛ چه لازم است؟",
    [
      "شمارنده مشترک اتمیک یا تقسیم بودجه هماهنگ",
      "فقط round robin",
      "retry بیشتر"
    ],
    0,
    "شمارنده مستقل تا ۲۰۰ اجازه می‌دهد."
  ],
  "hint": "scope محدودیت باید با هدف یکی باشد.",
  "terms": [
    [
      "Token bucket",
      "ذخیره ظرفیت burst"
    ],
    [
      "Refill",
      "تولید توکن با زمان"
    ],
    [
      "429",
      "رد به دلیل سیاست نرخ"
    ]
  ],
  "references": [
    [
      "Azure throttling",
      "https://learn.microsoft.com/en-us/azure/architecture/patterns/throttling"
    ],
    [
      "RFC 6585",
      "https://www.rfc-editor.org/rfc/rfc6585.html"
    ]
  ],
  "exercise": [
    "bucket را با زمان‌های مشخص مدل کنید.",
    "tokens=3; accepted=0\nfor _ in range(4):\n    if tokens: tokens-=1; accepted+=1\nassert accepted==3\nprint(accepted)",
    "سه عبور و یک رد.",
    "زمان و رقابت واقعی مدل نشده‌اند."
  ],
  "deep": {
    "title": "Fixed window در مقابل token bucket",
    "question": "درخواست‌های نزدیک مرز پنجره چند بار عبور می‌کنند؟",
    "assumptions": "سقف 3 در پنجره 1s؛ شش درخواست در t=.9 و 1.0، token bucket cap=3 rate=3/s؛ از t=.9 bucket پر.",
    "lanes": [
      "Client",
      "Limiter",
      "API"
    ],
    "fields": {
      "allowed": "مجاز",
      "rejected": "رد",
      "budget": "بودجه",
      "time": "زمان منطقی"
    },
    "code": "tokens = min(capacity, tokens + elapsed * rate)\nif tokens >= 1: tokens -= 1; allow()",
    "cases": [
      [
        "fixed",
        "Fixed window",
        {
          "allowed": 0,
          "rejected": 0,
          "budget": 3,
          "time": "0.9"
        },
        [
          [
            0,
            0,
            1,
            "burst اول",
            "3 requests",
            "سه مورد در پنجره اول.",
            {
              "allowed": 3,
              "budget": 0
            }
          ],
          [
            1,
            1,
            null,
            "مرز پنجره",
            "reset",
            "شمارنده صفر شد.",
            {
              "time": "1.0",
              "budget": 3
            }
          ],
          [
            2,
            0,
            1,
            "burst دوم",
            "3 requests",
            "سه مورد دیگر مجاز.",
            {
              "allowed": 6,
              "budget": 0
            }
          ],
          [
            3,
            1,
            2,
            "نتیجه",
            "6 accepted",
            "شش درخواست نزدیک مرز عبور کردند.",
            {
              "rejected": 0
            },
            "error"
          ]
        ],
        "fixed window burst مرزی دارد."
      ],
      [
        "token",
        "Token bucket",
        {
          "allowed": 0,
          "rejected": 0,
          "budget": 3,
          "time": "0.9"
        },
        [
          [
            0,
            0,
            1,
            "burst اول",
            "3 requests",
            "توکن‌ها مصرف شدند.",
            {
              "allowed": 3,
              "budget": 0
            }
          ],
          [
            1,
            1,
            null,
            "گذشت 0.1s",
            "refill 0.3",
            "بودجه فقط ۰٫۳ است.",
            {
              "time": "1.0",
              "budget": 0.3
            }
          ],
          [
            2,
            0,
            1,
            "burst دوم",
            "3 requests",
            "توکن کامل وجود ندارد.",
            {
              "rejected": 3
            },
            "error"
          ],
          [
            3,
            1,
            2,
            "نتیجه",
            "3 accepted",
            "نرخ و burst کنترل شدند.",
            {
              "allowed": 3
            },
            "success"
          ]
        ],
        "در این trace سه عبور و سه رد."
      ]
    ],
    "diagnose": "allowed/rejected، key cardinality، refill و latency store را اندازه بگیرید.",
    "tradeoff": "token bucket از burst پشتیبانی می‌کند؛ الگوریتم دقیق باید زمان و اتمیک بودن را رعایت کند."
  }
});
export default lesson;
