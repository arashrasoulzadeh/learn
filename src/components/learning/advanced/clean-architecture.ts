import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "clean-architecture",
  "order": 38,
  "title": "Clean Architecture — جهت وابستگی",
  "description": "مرز use case، ports و adapterها.",
  "actors": [
    [
      "Controller",
      "Input adapter",
      "browser"
    ],
    [
      "Use case",
      "Core / ports",
      "app"
    ],
    [
      "Gateway",
      "Output adapter",
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
    ]
  ],
  "labels": [
    "ورودی",
    "هسته",
    "جزئیات خارجی"
  ],
  "context": "فلش‌های انیمیشن مسیر اجرای runtime هستند؛ importها باید به سمت قراردادهای هسته باشند.",
  "goal": "قانون dependency را از جریان داده جدا کنید.",
  "scenarios": [
    [
      "call",
      "اجرای use case",
      "آیا خروجی به DB به معنی وابستگی import هسته به DB است؟",
      "CreateOrder",
      [
        [
          "تبدیل ورودی",
          [
            0,
            1
          ],
          [
            "command"
          ],
          "CreateOrder(inputDto)",
          "Command",
          [
            "HTTP DTO",
            "CreateOrder",
            "—"
          ],
          "controller داده HTTP را به مدل ورودی تبدیل می‌کند.",
          "هسته Request/Response framework را import نکند."
        ],
        [
          "اجرای سیاست",
          [
            1
          ],
          [
            "validate invariant"
          ],
          "order = Order.create(items)",
          "Domain order",
          [
            "Command",
            "Invariant checked",
            "—"
          ],
          "قواعد دامنه بدون framework اجرا می‌شوند.",
          "domain test بدون I/O اجرا کنید."
        ],
        [
          "خروج از port",
          [
            1,
            2
          ],
          [
            "save",
            "id"
          ],
          "orders.save(order)",
          "Order 42",
          [
            "Response DTO",
            "Port call",
            "Adapter saved"
          ],
          "runtime به بیرون می‌رود ولی قرارداد port درون هسته تعریف شده.",
          "adapter implements core port؛ compile dependency inward.",
          "success"
        ]
      ]
    ],
    [
      "swap",
      "تعویض storage",
      "تغییر DB کدام لایه را درگیر می‌کند؟",
      "SQL → fake adapter",
      [
        [
          "تعریف port",
          [
            1
          ],
          [
            "OrderStore"
          ],
          "interface OrderStore { save(order): Id }",
          "Port stable",
          [
            "Controller",
            "Core port",
            "SQL"
          ],
          "هسته contract داده را تعیین می‌کند.",
          "interface نباید نوع ORM را افشا کند."
        ],
        [
          "وایرینگ",
          [
            0,
            1,
            2
          ],
          [
            "compose use case",
            "inject fake"
          ],
          "composition: new UseCase(fake)",
          "Fake adapter",
          [
            "Composition",
            "Core stable",
            "Fake"
          ],
          "composition root concrete را انتخاب می‌کند.",
          "وایرینگ با controller منطق کسب‌وکار فرق دارد."
        ],
        [
          "تست",
          [
            1,
            2
          ],
          [
            "save",
            "42"
          ],
          "useCase.execute(command)",
          "No DB needed",
          [
            "Test",
            "Same use case",
            "Fake saved"
          ],
          "use case بدون DB واقعی تست شد.",
          "integration test SQL هنوز لازم است.",
          "success"
        ]
      ]
    ],
    [
      "leak",
      "نشت نوع framework",
      "اگر هسته ORM entity را برگرداند چه می‌شود؟",
      "Use case imports ORM",
      [
        [
          "وابستگی",
          [
            1,
            2
          ],
          [
            "import ORM"
          ],
          "import DbContext in core",
          "Outward dependency",
          [
            "Controller",
            "ORM import",
            "DB vendor"
          ],
          "هسته به جزئیات بیرونی وابسته است.",
          "dependency graph را در CI بررسی کنید.",
          "error"
        ],
        [
          "تغییر adapter",
          [
            2
          ],
          [
            "schema change"
          ],
          "ORM entity renamed",
          "Core breaks",
          [
            "Controller",
            "Build fails",
            "New ORM"
          ],
          "تغییر زیرساخت به policy سرایت می‌کند.",
          "تست معماری می‌تواند import نامجاز را رد کند.",
          "error"
        ],
        [
          "اصلاح",
          [
            1,
            2
          ],
          [
            "map port"
          ],
          "map Row -> DomainOrder",
          "Boundary restored",
          [
            "DTO",
            "Domain types",
            "Mapping adapter"
          ],
          "mapping در مرز، جزئیات را محصور می‌کند.",
          "mapping اضافی وقتی ارزش دارد که مرز واقعی باشد.",
          "success"
        ]
      ],
      "جهت dependency کد به بیرون نقض شده است."
    ]
  ],
  "pitfall": "Clean Architecture الزاماً چهار پروژه یا تعداد زیاد interface نیست.",
  "takeaway": "سیاست کسب‌وکار مستقل از framework، DB و UI بماند.",
  "quiz": [
    "جهت import در قانون dependency؟",
    [
      "از core به SQL",
      "به سمت هسته",
      "به سمت UI"
    ],
    1,
    "جزئیات به abstraction داخلی وابسته‌اند."
  ],
  "practice": [
    "use case به ORM entity وابسته است؛ چه کنید؟",
    [
      "اضافه کردن controller",
      "تعریف نوع دامنه و mapping در adapter",
      "کپی DB"
    ],
    1,
    "مرز نوع و port را داخلی کنید."
  ],
  "hint": "نوع بیرونی وارد هسته شده است.",
  "terms": [
    [
      "Port",
      "قرارداد هسته"
    ],
    [
      "Adapter",
      "ترجمه بیرونی"
    ],
    [
      "Dependency rule",
      "وابستگی به سمت سیاست"
    ]
  ],
  "references": [
    [
      "Clean Architecture",
      "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html"
    ],
    [
      "Common web architectures",
      "https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/common-web-application-architectures"
    ]
  ],
  "exercise": [
    "با fake storage قانون دامنه را بدون DB تست کنید.",
    "class Store:\n    def save(self,n): return 42\ndef create(n,store):\n    assert n>0\n    return store.save(n)\nassert create(2,Store())==42\nprint('core tested')",
    "هسته بدون DB اجرا می‌شود.",
    "معماری واقعی نیازمند بررسی import graph است."
  ],
  "deep": {
    "title": "تست مستقل از زیرساخت",
    "question": "قطع DB چه اثری بر تست policy دارد؟",
    "assumptions": "دو تست اعتبارسنجی/ثبت و DB unavailable؛ fake فقط در تست.",
    "lanes": [
      "Test",
      "Core",
      "Storage"
    ],
    "fields": {
      "dependency": "وابستگی",
      "passed": "تست موفق",
      "io": "تماس DB",
      "result": "وضعیت"
    },
    "code": "// core: useCase.execute(cmd)\n// test composition: new UseCase(new InMemoryStore())",
    "cases": [
      [
        "direct",
        "هسته وابسته به DB",
        {
          "dependency": "SQL",
          "passed": 0,
          "io": 0,
          "result": "—"
        },
        [
          [
            0,
            0,
            1,
            "ساخت use case",
            "new SQL core",
            "DB مستقیم است.",
            {
              "dependency": "SQL"
            }
          ],
          [
            1,
            1,
            2,
            "اتصال",
            "connect",
            "DB قطع است.",
            {
              "io": 1,
              "result": "Connection failed"
            },
            "error"
          ],
          [
            2,
            0,
            null,
            "تست policy",
            "blocked",
            "fixture ساخته نشد.",
            {
              "passed": 0
            }
          ],
          [
            3,
            0,
            null,
            "تست ثبت",
            "blocked",
            "تست‌ها fail شدند.",
            {
              "result": "0 passed"
            },
            "error"
          ]
        ],
        "policy مستقل آزموده نشد."
      ],
      [
        "ports",
        "port + fake",
        {
          "dependency": "Port",
          "passed": 0,
          "io": 0,
          "result": "—"
        },
        [
          [
            0,
            0,
            1,
            "وایرینگ fake",
            "inject",
            "هیچ تماس DB نیست.",
            {
              "dependency": "Fake"
            }
          ],
          [
            1,
            0,
            1,
            "اعتبارسنجی",
            "invalid qty",
            "قانون دامنه تست شد.",
            {
              "passed": 1
            }
          ],
          [
            2,
            1,
            2,
            "ذخیره fake",
            "save",
            "آداپتر حافظه‌ای.",
            {
              "io": 0
            }
          ],
          [
            3,
            1,
            0,
            "نتیجه",
            "id=42",
            "هر دو تست موفق.",
            {
              "passed": 2,
              "result": "2 passed"
            },
            "success"
          ]
        ],
        "integration SQL هنوز باید جدا اجرا شود."
      ]
    ],
    "diagnose": "dependency graph، تعداد تست‌های نیازمند I/O و boundary mapping.",
    "tradeoff": "fake رفتار واقعی DB را تضمین نمی‌کند."
  }
});
export default lesson;
