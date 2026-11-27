import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "strategy",
  "title": "Strategy Pattern — سیاست قابل تعویض",
  "order": 34,
  "description": "انتخاب الگوریتم در runtime و حفظ قرارداد رفتاری.",
  "actors": [
    [
      "Checkout",
      "Context",
      "app"
    ],
    [
      "Strategy",
      "Policy",
      "key"
    ],
    [
      "Calculator",
      "Algorithm",
      "cpu"
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
    "ورودی",
    "سیاست",
    "خروجی"
  ],
  "context": "قیمت‌ها integer cent هستند؛ مالیات و rounding واقعی در مدل حذف شده.",
  "goal": "انتخاب الگوریتم را از اجرای workflow جدا کنید.",
  "scenarios": [
    [
      "standard",
      "حمل عادی",
      "برای وزن ۲ هزینه چند است؟",
      "shipping(weight=2)",
      [
        [
          "انتخاب",
          [
            0,
            1
          ],
          [
            "standard"
          ],
          "strategy=Standard()",
          "Standard",
          [
            "2 kg",
            "Standard",
            "—"
          ],
          "context سیاست تزریق‌شده را نگه می‌دارد.",
          "شرط انتخاب را در composition root قرار دهید."
        ],
        [
          "محاسبه",
          [
            1,
            2
          ],
          [
            "300+100*w"
          ],
          "300+100*2",
          "500 cents",
          [
            "2 kg",
            "Standard",
            "500"
          ],
          "الگوریتم عادی ۵۰۰ سنت می‌دهد.",
          "واحد پول و وزن در قرارداد مشخص باشد."
        ],
        [
          "نتیجه",
          [
            1,
            0
          ],
          [
            "return 500"
          ],
          "quote.total",
          "500 cents",
          [
            "2 kg",
            "Standard",
            "500"
          ],
          "workflow فقط نتیجه قرارداد را مصرف می‌کند.",
          "تست مرز وزن صفر و مقدار منفی لازم است.",
          "success"
        ]
      ]
    ],
    [
      "express",
      "تعویض در runtime",
      "آیا checkout برای ارسال express باید بازنویسی شود؟",
      "shipping(weight=2)",
      [
        [
          "انتخاب",
          [
            0,
            1
          ],
          [
            "express"
          ],
          "strategy=Express()",
          "Express",
          [
            "2 kg",
            "Express",
            "—"
          ],
          "همان context الگوریتم دیگری می‌گیرد.",
          "تغییر state هنگام request باید کنترل شود."
        ],
        [
          "محاسبه",
          [
            1,
            2
          ],
          [
            "700+200*w"
          ],
          "700+200*2",
          "1100 cents",
          [
            "2 kg",
            "Express",
            "1100"
          ],
          "سیاست جدید خروجی با واحد مشترک دارد.",
          "محاسبه integer از خطای اعشاری ساده جلوگیری می‌کند."
        ],
        [
          "بازگشت",
          [
            1,
            0
          ],
          [
            "return 1100"
          ],
          "quote.total",
          "1100 cents",
          [
            "2 kg",
            "Express",
            "1100"
          ],
          "workflow تغییر نکرده است.",
          "تست قرارداد هر دو strategy را پوشش دهد.",
          "success"
        ]
      ]
    ],
    [
      "invalid",
      "سیاست ناسازگار",
      "اگر یک strategy هزینه منفی بدهد چه می‌شود؟",
      "BrokenShipping",
      [
        [
          "تزریق",
          [
            0,
            1
          ],
          [
            "broken"
          ],
          "strategy=Broken()",
          "Selected",
          [
            "2 kg",
            "Broken",
            "—"
          ],
          "امضای درست تضمین نتیجه معتبر نیست.",
          "LSP را روی قرارداد غیرمنفی بررسی کنید."
        ],
        [
          "خروجی بد",
          [
            1,
            2
          ],
          [
            "return -100"
          ],
          "calculate(2)",
          "-100 cents",
          [
            "2 kg",
            "Broken",
            "-100"
          ],
          "خروجی invariant قیمت را نقض می‌کند.",
          "قرارداد postcondition باید در تست و مرز حساس enforce شود.",
          "error"
        ],
        [
          "رد",
          [
            1,
            0
          ],
          [
            "reject"
          ],
          "assert fee >= 0",
          "Invalid quote",
          [
            "2 kg",
            "Rejected",
            "No quote"
          ],
          "context نباید قیمت نامعتبر صادر کند.",
          "fallback بدون سیاست تجاری شفاف خطرناک است.",
          "error"
        ]
      ],
      "جایگزینی فقط امضا نیست."
    ]
  ],
  "pitfall": "Strategy برای هر if ضروری نیست؛ خانواده الگوریتم‌های واقعی مهم است.",
  "takeaway": "context ثابت، الگوریتم متغیر و قرارداد مشترک.",
  "quiz": [
    "Strategy چه چیزی را متغیر می‌کند؟",
    [
      "الگوریتم",
      "تعداد process",
      "schema شبکه"
    ],
    0,
    "سیاست اجرای کار مستقل از context است."
  ],
  "practice": [
    "قیمت حمل از دو سیاست با واحد سنت استفاده می‌کند؛ تست مشترک چه باشد؟",
    [
      "نام کلاس یکسان",
      "خروجی غیرمنفی با واحد سنت",
      "همیشه خروجی برابر"
    ],
    1,
    "قرارداد مشترک به معنی نتیجه عددی یکسان نیست."
  ],
  "hint": "رفتار معتبر مهم است، نه مقدار دقیق یکسان.",
  "terms": [
    [
      "Context",
      "مصرف‌کننده سیاست"
    ],
    [
      "Strategy",
      "الگوریتم قابل جایگزینی"
    ],
    [
      "Contract",
      "تعهد رفتاری"
    ]
  ],
  "references": [
    [
      "Strategy",
      "https://refactoring.guru/design-patterns/strategy"
    ],
    [
      "Architectural principles",
      "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles"
    ]
  ],
  "exercise": [
    "دو تابع سیاست را به یک context بدهید.",
    "def quote(w,policy): return policy(w)\nassert quote(2,lambda w:300+100*w)==500\nassert quote(2,lambda w:700+200*w)==1100\nprint('500, 1100')",
    "یک context و دو خروجی متفاوت.",
    "وزن و ارز واقعی اعتبارسنجی نشده‌اند."
  ],
  "deep": {
    "title": "سیاست انتخاب و trace قیمت",
    "question": "تغییر shipping در دو سفارش چه مقدار هزینه تولید می‌کند؟",
    "assumptions": "وزن سفارش‌ها ۲ و ۳؛ سیاست عادی 300+100w، express 700+200w.",
    "lanes": [
      "Order",
      "Strategy",
      "Quote"
    ],
    "fields": {
      "policy": "سیاست",
      "first": "سفارش اول",
      "second": "سفارش دوم",
      "total": "جمع سنت"
    },
    "code": "quote(weight, strategy) => strategy(weight)\n// total in integer cents",
    "cases": [
      [
        "std",
        "عادی",
        {
          "policy": "Standard",
          "first": 0,
          "second": 0,
          "total": 0
        },
        [
          [
            0,
            0,
            1,
            "وزن اول",
            "2 kg",
            "انتخاب ثابت است.",
            {
              "policy": "Standard"
            }
          ],
          [
            1,
            1,
            2,
            "قیمت اول",
            "500",
            "فرمول ۳۰۰+۲۰۰.",
            {
              "first": 500,
              "total": 500
            }
          ],
          [
            2,
            0,
            1,
            "وزن دوم",
            "3 kg",
            "همان سیاست.",
            {
              "policy": "Standard"
            }
          ],
          [
            3,
            1,
            2,
            "قیمت دوم",
            "600",
            "جمع ۱۱۰۰.",
            {
              "second": 600,
              "total": 1100
            },
            "success"
          ]
        ],
        "جمع ۱۱۰۰ سنت."
      ],
      [
        "exp",
        "express",
        {
          "policy": "Express",
          "first": 0,
          "second": 0,
          "total": 0
        },
        [
          [
            0,
            0,
            1,
            "وزن اول",
            "2 kg",
            "سیاست express.",
            {
              "policy": "Express"
            }
          ],
          [
            1,
            1,
            2,
            "قیمت اول",
            "1100",
            "فرمول ۷۰۰+۴۰۰.",
            {
              "first": 1100,
              "total": 1100
            }
          ],
          [
            2,
            0,
            1,
            "وزن دوم",
            "3 kg",
            "همان سیاست.",
            {
              "policy": "Express"
            }
          ],
          [
            3,
            1,
            2,
            "قیمت دوم",
            "1300",
            "جمع ۲۴۰۰.",
            {
              "second": 1300,
              "total": 2400
            },
            "success"
          ]
        ],
        "جمع ۲۴۰۰ سنت، workflow ثابت."
      ]
    ],
    "diagnose": "نام سیاست، ورودی و خروجی quote را بدون اطلاعات حساس ثبت کنید.",
    "tradeoff": "سیاست پویا باید در طول یک quote ثابت بماند."
  }
});
export default lesson;
