import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "dependency-injection",
  "order": 36,
  "title": "Dependency Injection — ساخت خارج از مصرف",
  "description": "تزریق constructor، scope و captive dependency.",
  "actors": [
    [
      "Use case",
      "Consumer",
      "app"
    ],
    [
      "Composition",
      "Container",
      "cpu"
    ],
    [
      "Adapter",
      "Dependency",
      "db"
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
    ],
    [
      0,
      2
    ]
  ],
  "labels": [
    "مصرف‌کننده",
    "عمر وابستگی",
    "پیاده‌سازی"
  ],
  "context": "مدل container با scope درخواست؛ singleton برای کل container و transient برای resolve جدید.",
  "goal": "وابستگی را آشکار کنید و lifetime را با مالکیت state تطبیق دهید.",
  "scenarios": [
    [
      "constructor",
      "تزریق سازنده",
      "آیا use case باید خودش اتصال بسازد؟",
      "Checkout(payment)",
      [
        [
          "ترکیب",
          [
            1,
            2
          ],
          [
            "create adapter"
          ],
          "payment = FakePayment()",
          "Fake ready",
          [
            "Unbuilt",
            "Startup",
            "Fake #1"
          ],
          "composition root نمونه مناسب را می‌سازد.",
          "ساخت و استفاده از dependency را جدا کنید."
        ],
        [
          "تزریق",
          [
            1,
            0
          ],
          [
            "new Checkout"
          ],
          "Checkout(payment)",
          "Dependency explicit",
          [
            "Checkout #1",
            "Constructor",
            "Fake #1"
          ],
          "وابستگی ضروری از سازنده وارد می‌شود.",
          "بدون container هم DI ممکن است."
        ],
        [
          "اجرا",
          [
            0,
            2
          ],
          [
            "charge",
            "receipt"
          ],
          "checkout.pay(100)",
          "Fake receipt",
          [
            "Checkout #1",
            "Stable",
            "Receipt"
          ],
          "تست بدون تماس شبکه اجرا می‌شود.",
          "تست contract و integration adapter واقعی جداست.",
          "success"
        ]
      ]
    ],
    [
      "scoped",
      "Scope درخواست",
      "دو درخواست به یک DbContext نیاز دارند؟",
      "scope per request",
      [
        [
          "scope A",
          [
            1,
            2
          ],
          [
            "resolve A"
          ],
          "scopeA.resolve(DbContext)",
          "DB #1",
          [
            "A",
            "Scope A",
            "DB #1"
          ],
          "درون همان scope نمونه مشترک است.",
          "DbContext معمولاً thread-safe نیست."
        ],
        [
          "scope B",
          [
            1,
            2
          ],
          [
            "resolve B"
          ],
          "scopeB.resolve(DbContext)",
          "DB #2",
          [
            "B",
            "Scope B",
            "DB #2"
          ],
          "scope B نمونه مستقل می‌گیرد.",
          "تراکنش و lifecycle را به scope مناسب محدود کنید."
        ],
        [
          "dispose",
          [
            1,
            2
          ],
          [
            "dispose A"
          ],
          "scopeA.dispose()",
          "A disposed",
          [
            "B active",
            "Scope A ended",
            "DB #2 active"
          ],
          "مالک scope منابع متعلق به خود را آزاد می‌کند.",
          "dispose نباید وابستگی مشترک B را ببندد.",
          "success"
        ]
      ]
    ],
    [
      "captive",
      "Captive dependency",
      "singleton می‌تواند DbContext scoped را نگه دارد؟",
      "SingletonService(scopedDb)",
      [
        [
          "ساخت",
          [
            1,
            0
          ],
          [
            "singleton"
          ],
          "new SingletonService(dbA)",
          "Captures scoped DB",
          [
            "Singleton",
            "Root scope",
            "DB A"
          ],
          "مصرف‌کننده بلندعمر وابستگی کوتاه‌عمر را نگه می‌دارد.",
          "scope validation در containerهای مناسب فعال کنید."
        ],
        [
          "پایان A",
          [
            1,
            2
          ],
          [
            "dispose A"
          ],
          "request A ends",
          "DB A disposed",
          [
            "Singleton",
            "A ended",
            "Disposed"
          ],
          "reference در singleton هنوز موجود است.",
          "پایان scope با عمر reference متفاوت است."
        ],
        [
          "درخواست B",
          [
            0,
            2
          ],
          [
            "use DB A"
          ],
          "service.run(B)",
          "Disposed / leaked scope",
          [
            "Singleton",
            "Wrong scope",
            "Invalid DB"
          ],
          "وابستگی ممکن است disposed یا به root ارتقا یافته باشد؛ مدل اول را نشان می‌دهد.",
          "برای کار جدید scope تازه بسازید، نه capture.",
          "error"
        ]
      ],
      "وابستگی کوتاه‌عمر نباید در مصرف‌کننده بلندعمر حبس شود."
    ]
  ],
  "pitfall": "DI با DIP یکی نیست؛ service locator وابستگی واقعی را پنهان می‌کند.",
  "takeaway": "constructor injection و عمر سازگار، طراحی را قابل آزمون می‌کند.",
  "quiz": [
    "کدام lifetime برای state درخواست مناسب است؟",
    [
      "Singleton",
      "Scoped",
      "Global static"
    ],
    1,
    "scope مالک state و cleanup درخواست است."
  ],
  "practice": [
    "یک background worker بلندعمر نیاز به DbContext دارد؛ چه کنید؟",
    [
      "یک DbContext سراسری",
      "برای هر کار scope جدید بسازید",
      "از dispose صرف‌نظر کنید"
    ],
    1,
    "عمر وابستگی با واحد کار تنظیم می‌شود."
  ],
  "hint": "عمر worker از واحد کار بیشتر است.",
  "terms": [
    [
      "DI",
      "تزریق وابستگی"
    ],
    [
      "Scope",
      "مرز مالکیت"
    ],
    [
      "Captive dependency",
      "حبس وابستگی کوتاه‌عمر"
    ]
  ],
  "references": [
    [
      "DI lifetimes",
      "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-lifetimes"
    ],
    [
      "DI guidelines",
      "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines"
    ]
  ],
  "exercise": [
    "با constructor injection یک fake را اجرا کنید.",
    "class Fake:\n    def charge(self,n): return n\nclass Checkout:\n    def __init__(self,payment): self.payment=payment\nassert Checkout(Fake()).payment.charge(42)==42\nprint('injected')",
    "تست بدون ساخت SDK.",
    "container واقعی و lifecycle ندارد."
  ],
  "deep": {
    "title": "Scope leak در دو درخواست",
    "question": "آیا identity دو درخواست مستقل می‌ماند؟",
    "assumptions": "دو درخواست متوالی و context با tenant؛ مدل lifecycle محلی.",
    "lanes": [
      "Request A",
      "Container",
      "Request B"
    ],
    "fields": {
      "a": "context A",
      "b": "context B",
      "created": "تعداد context",
      "outcome": "نتیجه"
    },
    "code": "using var scope = provider.CreateScope();\nvar db = scope.ServiceProvider.GetRequiredService<DbContext>();",
    "cases": [
      [
        "capture",
        "capture context",
        {
          "a": "—",
          "b": "—",
          "created": 0,
          "outcome": "Pending"
        },
        [
          [
            0,
            0,
            1,
            "ساخت A",
            "resolve",
            "context A ساخته شد.",
            {
              "a": "ctx1/A",
              "created": 1
            }
          ],
          [
            1,
            1,
            null,
            "capture",
            "singleton holds ctx1",
            "عمر نامناسب.",
            {
              "outcome": "Captured"
            }
          ],
          [
            2,
            0,
            1,
            "پایان A",
            "dispose",
            "context قبلی پایان یافت.",
            {
              "a": "Disposed ctx1"
            }
          ],
          [
            3,
            2,
            1,
            "اجرای B",
            "reuse ctx1",
            "reference کهنه استفاده می‌شود.",
            {
              "b": "ctx1/A",
              "outcome": "Invalid scope"
            },
            "error"
          ]
        ],
        "context درخواست‌ها جدا نیست."
      ],
      [
        "scope",
        "scope مستقل",
        {
          "a": "—",
          "b": "—",
          "created": 0,
          "outcome": "Pending"
        },
        [
          [
            0,
            0,
            1,
            "ساخت A",
            "scope A",
            "context نخست.",
            {
              "a": "ctx1/A",
              "created": 1
            }
          ],
          [
            1,
            0,
            1,
            "پایان A",
            "dispose",
            "مالک scope آزاد می‌کند.",
            {
              "a": "Disposed ctx1"
            }
          ],
          [
            2,
            2,
            1,
            "ساخت B",
            "scope B",
            "context تازه.",
            {
              "b": "ctx2/B",
              "created": 2
            }
          ],
          [
            3,
            2,
            null,
            "اجرا B",
            "query",
            "state جداست.",
            {
              "outcome": "Isolated"
            },
            "success"
          ]
        ],
        "دو context برای دو واحد کار."
      ]
    ],
    "diagnose": "scope ID، dispose، validation و تست tenant isolation.",
    "tradeoff": "scope کوتاه‌تر هزینه ساخت دارد؛ connection pooling مستقل از DbContext است."
  }
});
export default lesson;
