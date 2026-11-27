import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "singleton",
  "title": "Singleton — عمر و محدودهٔ نمونه",
  "order": 32,
  "description": "یک نمونه در محدوده مشخص، رقابت هنگام ساخت و تفاوت با singleton توزیع‌شده.",
  "actors": [
    [
      "درخواست A",
      "Caller A",
      "app"
    ],
    [
      "Provider",
      "Instance scope",
      "memory"
    ],
    [
      "درخواست B",
      "Caller B",
      "app"
    ]
  ],
  "edges": [
    [
      0,
      1
    ],
    [
      2,
      1
    ]
  ],
  "labels": [
    "درخواست A",
    "نمونه / مالکیت",
    "درخواست B"
  ],
  "context": "یک process و یک provider نمونه؛ حافظهٔ چند process مشترک فرض نشده.",
  "goal": "scope، initialization و thread safety را از یکدیگر جدا کنید.",
  "scenarios": [
    [
      "reuse",
      "استفاده مجدد",
      "آیا هر get یک شیء تازه می‌سازد؟",
      "provider.get()",
      [
        [
          "ساخت اول",
          [
            0,
            1
          ],
          [
            "get",
            "instance #1"
          ],
          "get()",
          "A=#1",
          [
            "#1",
            "Created #1",
            "—"
          ],
          "provider نمونه را یک بار می‌سازد.",
          "هویت شیء را با reference equality تست کنید."
        ],
        [
          "خواندن دوباره",
          [
            2,
            1
          ],
          [
            "get",
            "instance #1"
          ],
          "get()",
          "B=#1",
          [
            "#1",
            "Cached #1",
            "#1"
          ],
          "هر دو caller همان reference را می‌گیرند.",
          "عمر نمونه به provider وابسته است."
        ],
        [
          "مقایسه",
          [
            1
          ],
          [
            "identity"
          ],
          "A is B",
          "True",
          [
            "#1",
            "One instance",
            "#1"
          ],
          "یکسان بودن هویت به معنی thread-safe بودن state نیست.",
          "mutable state را جدا محافظت کنید.",
          "success"
        ]
      ]
    ],
    [
      "race",
      "ساخت lazy ناامن",
      "اگر دو thread هم‌زمان null ببینند چه می‌شود؟",
      "if instance is None: create()",
      [
        [
          "خواندن A",
          [
            0,
            1
          ],
          [
            "check null"
          ],
          "A reads null",
          "Empty",
          [
            "null",
            "Empty",
            "—"
          ],
          "A پیش از ساخت متوقف می‌شود.",
          "check-then-act اتمیک نیست."
        ],
        [
          "خواندن B",
          [
            2,
            1
          ],
          [
            "check null"
          ],
          "B reads null",
          "Both saw null",
          [
            "null",
            "Empty",
            "null"
          ],
          "B هم مقدار خالی دیده است.",
          "این interleaving مدل قطعی است."
        ],
        [
          "دو ساخت",
          [
            1
          ],
          [
            "create twice"
          ],
          "A creates #1; B creates #2",
          "Two instances",
          [
            "#1",
            "#2",
            "#2"
          ],
          "آخرین reference ثبت می‌شود اما نمونهٔ اول هنوز دست A است.",
          "lock یا initialization اتمیک لازم است.",
          "error"
        ]
      ],
      "رقابت ساخت singleton را می‌شکند."
    ],
    [
      "processes",
      "محدوده چند فرایند",
      "آیا singleton در دو process یکتا است؟",
      "P1 and P2",
      [
        [
          "ساخت P1",
          [
            0,
            1
          ],
          [
            "init P1"
          ],
          "P1 get()",
          "P1#1",
          [
            "P1#1",
            "P1 memory",
            "—"
          ],
          "فرایند اول حافظه مستقل دارد.",
          "container DI معمولاً scope خودش را دارد."
        ],
        [
          "ساخت P2",
          [
            2,
            1
          ],
          [
            "init P2"
          ],
          "P2 get()",
          "P2#1",
          [
            "P1#1",
            "Two process scopes",
            "P2#1"
          ],
          "فرایند دوم نمونه مستقل می‌سازد.",
          "شناسه process را همراه reference log کنید."
        ],
        [
          "نتیجه",
          [
            1
          ],
          [
            "compare scopes"
          ],
          "P1 != P2",
          "Not cluster-wide",
          [
            "P1#1",
            "2 instances",
            "P2#1"
          ],
          "singleton هماهنگی سراسری خوشه نیست.",
          "برای invariant سراسری storage/consensus لازم است.",
          "error"
        ]
      ],
      "scope محلی با خوشه فرق دارد."
    ]
  ],
  "pitfall": "singleton را برای global mutable state یا session کاربر استفاده نکنید.",
  "takeaway": "scope و lifecycle را مشخص کنید؛ ترجیحاً نمونه را از composition root تزریق کنید.",
  "quiz": [
    "Singleton معمولی چه محدوده‌ای دارد؟",
    [
      "کل اینترنت",
      "provider/process مشخص",
      "تمام DBها"
    ],
    1,
    "هر provider یا process می‌تواند نمونه مستقل داشته باشد."
  ],
  "practice": [
    "دو replica باید فقط یک job را ثبت کنند؛ singleton محلی کافی است؟",
    [
      "بله",
      "با static کافی است",
      "خیر؛ هماهنگی/قید مشترک لازم است"
    ],
    2,
    "singleton محلی exclusivity توزیع‌شده ندارد."
  ],
  "hint": "حافظه فرایندها جدا است.",
  "terms": [
    [
      "Instance",
      "هویت نمونه"
    ],
    [
      "Lazy initialization",
      "ساخت هنگام نیاز"
    ],
    [
      "Scope",
      "محدوده عمر"
    ]
  ],
  "references": [
    [
      "Singleton",
      "https://refactoring.guru/design-patterns/singleton"
    ],
    [
      "DI lifetimes",
      "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-lifetimes"
    ]
  ],
  "exercise": [
    "هویت یک provider محلی را امتحان کنید.",
    "class Provider:\n    def __init__(self): self.value=object()\n    def get(self): return self.value\np=Provider(); q=Provider()\nassert p.get() is p.get()\nassert p.get() is not q.get()\nprint('scope matters')",
    "در یک provider هویت ثابت، در provider دوم متفاوت.",
    "thread safety و توزیع‌شدگی را پیاده نمی‌کند."
  ],
  "deep": {
    "title": "هزینه ساخت هم‌زمان",
    "question": "قفل initialization چگونه دو ساخت را به یک ساخت تبدیل می‌کند؟",
    "assumptions": "دو caller هم‌زمان؛ کارخانه هزینه فرضی 10ms؛ فقط initialization مدل شده.",
    "lanes": [
      "A",
      "Provider",
      "B"
    ],
    "fields": {
      "a": "reference A",
      "b": "reference B",
      "created": "تعداد ساخت",
      "lock": "قفل"
    },
    "code": "with lock:\n    if instance is None: instance = create()\n    return instance",
    "cases": [
      [
        "racy",
        "بدون قفل",
        {
          "a": "—",
          "b": "—",
          "created": 0,
          "lock": "None"
        },
        [
          [
            0,
            0,
            1,
            "خواندن A",
            "null",
            "A خالی می‌بیند.",
            {
              "a": "null"
            }
          ],
          [
            1,
            2,
            1,
            "خواندن B",
            "null",
            "B نیز خالی می‌بیند.",
            {
              "b": "null"
            }
          ],
          [
            10,
            0,
            1,
            "ساخت A",
            "#1",
            "A نمونه اول می‌سازد.",
            {
              "a": "#1",
              "created": 1
            }
          ],
          [
            11,
            2,
            1,
            "ساخت B",
            "#2",
            "B تصمیم قبلی را اجرا می‌کند.",
            {
              "b": "#2",
              "created": 2
            },
            "error"
          ]
        ],
        "دو نمونه ساخته شد."
      ],
      [
        "locked",
        "قفل و بررسی مجدد",
        {
          "a": "—",
          "b": "—",
          "created": 0,
          "lock": "Free"
        },
        [
          [
            0,
            0,
            1,
            "گرفتن قفل",
            "lock",
            "A وارد شد.",
            {
              "lock": "A"
            }
          ],
          [
            1,
            2,
            1,
            "انتظار B",
            "wait",
            "B هنوز null را نخوانده.",
            {
              "b": "Waiting"
            }
          ],
          [
            10,
            0,
            1,
            "ساخت و release",
            "#1",
            "نمونه ثبت شد.",
            {
              "a": "#1",
              "created": 1,
              "lock": "Free"
            }
          ],
          [
            11,
            2,
            1,
            "خواندن بعد قفل",
            "#1",
            "B نمونه موجود را برمی‌گرداند.",
            {
              "b": "#1",
              "lock": "Free"
            },
            "success"
          ]
        ],
        "یک ساخت، دو reference یکسان."
      ]
    ],
    "diagnose": "شمار constructor و scope ID را در تست هم‌زمانی ثبت کنید.",
    "tradeoff": "قفل ساخت، thread safety متدهای نمونه را تضمین نمی‌کند."
  }
});
export default lesson;
