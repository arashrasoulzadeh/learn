import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "repository-pattern",
  "order": 37,
  "title": "Repository Pattern — مرز دسترسی داده",
  "description": "قرارداد دامنه، query هدفمند و واحد کار.",
  "actors": [
    [
      "Use case",
      "Domain",
      "app"
    ],
    [
      "Repository",
      "Port / adapter",
      "key"
    ],
    [
      "Storage",
      "Persistence",
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
    "عملیات دامنه",
    "قرارداد",
    "وضعیت ذخیره"
  ],
  "context": "مدل repository برای aggregate سفارش؛ transaction متعلق به واحد کار است، نه الزاماً repository.",
  "goal": "قرارداد repository را بر نیاز دامنه بنا کنید و abstraction نشت‌کننده را تشخیص دهید.",
  "scenarios": [
    [
      "load",
      "خواندن aggregate",
      "آیا use case باید SQL بداند؟",
      "orders.get(42)",
      [
        [
          "درخواست",
          [
            0,
            1
          ],
          [
            "get 42"
          ],
          "orders.get(42)",
          "Load order",
          [
            "Order 42",
            "OrderRepository",
            "Pending"
          ],
          "قرارداد از نیاز دامنه آمده است.",
          "به جای generic CRUD بی‌هدف، روش‌های معنادار تعریف کنید."
        ],
        [
          "واکشی",
          [
            1,
            2
          ],
          [
            "SELECT",
            "rows"
          ],
          "SELECT ... WHERE id=$1",
          "Rows",
          [
            "Order 42",
            "Mapping",
            "id=42"
          ],
          "adapter SQL و mapping را انجام می‌دهد.",
          "query پارامتری و tenant scope لازم‌اند."
        ],
        [
          "بازگشت",
          [
            1,
            0
          ],
          [
            "Order"
          ],
          "return Order(...)",
          "Aggregate loaded",
          [
            "Order loaded",
            "Domain object",
            "Unchanged"
          ],
          "use case با aggregate کار می‌کند نه row خام.",
          "lazy loading می‌تواند هزینه I/O را پنهان کند.",
          "success"
        ]
      ]
    ],
    [
      "save",
      "ثبت با نسخه",
      "آیا save موفق یعنی commit؟",
      "unit of work",
      [
        [
          "تغییر دامنه",
          [
            0
          ],
          [
            "cancel"
          ],
          "order.cancel()",
          "Pending cancel",
          [
            "Cancelled pending",
            "Tracked",
            "v1"
          ],
          "منطق دامنه پیش از persistence اعمال می‌شود.",
          "invariant دامنه در aggregate تست شود."
        ],
        [
          "ذخیره",
          [
            0,
            1,
            2
          ],
          [
            "save",
            "UPDATE CAS"
          ],
          "UPDATE ... WHERE version=1",
          "1 row pending",
          [
            "Cancelled",
            "Unit of work",
            "v2 pending"
          ],
          "شرط نسخه از lost update جلوگیری می‌کند.",
          "affected rows را بررسی کنید."
        ],
        [
          "commit",
          [
            1,
            2
          ],
          [
            "COMMIT",
            "OK"
          ],
          "uow.commit()",
          "Committed v2",
          [
            "Done",
            "Committed",
            "v2"
          ],
          "مرز commit مشخص است.",
          "تراکنش باید همه تغییرات مرتبط را پوشش دهد.",
          "success"
        ]
      ]
    ],
    [
      "conflict",
      "تعارض نسخه",
      "آیا overwrite کور مناسب است؟",
      "expected version=1",
      [
        [
          "خواندن قدیمی",
          [
            0,
            1
          ],
          [
            "get 42"
          ],
          "loaded v1",
          "v1",
          [
            "v1",
            "Loaded",
            "v2 committed"
          ],
          "writer دیگری نسخه را تغییر داده است.",
          "version را همراه aggregate نگه دارید."
        ],
        [
          "نوشتن شرطی",
          [
            1,
            2
          ],
          [
            "UPDATE",
            "0 rows"
          ],
          "UPDATE ... WHERE version=1",
          "Conflict",
          [
            "v1",
            "Conflict",
            "v2"
          ],
          "هیچ ردیف مطابق شرط نیست.",
          "zero affected rows باید به conflict تبدیل شود.",
          "error"
        ],
        [
          "بازگشت",
          [
            1,
            0
          ],
          [
            "conflict"
          ],
          "rollback(); reload()",
          "No overwrite",
          [
            "Retry decision",
            "Rolled back",
            "v2"
          ],
          "تصمیم retry بر اساس نیاز use case است.",
          "کل واحد کار را بازخوانی کنید.",
          "success"
        ]
      ],
      "قرارداد باید تعارض را پنهان نکند."
    ]
  ],
  "pitfall": "repository همیشه لازم نیست؛ wrapper بی‌ارزش روی ORM ممکن است پیچیدگی اضافه کند.",
  "takeaway": "قرارداد معنادار، مرز تراکنش و کنترل تعارض را صریح کنید.",
  "quiz": [
    "repository خوب چه چیزی برمی‌گرداند؟",
    [
      "همیشه SQL cursor",
      "قرارداد مناسب دامنه یا projection",
      "همیشه HTTP"
    ],
    1,
    "نوع خروجی تابع نیاز مصرف‌کننده است."
  ],
  "practice": [
    "دو repository در یک انتقال پول استفاده می‌شوند؛ هر کدام جدا commit کنند؟",
    [
      "بله",
      "نه؛ واحد کار مشترک",
      "فقط با cache"
    ],
    1,
    "atomicity به مرز تراکنش مشترک نیاز دارد."
  ],
  "hint": "ثبت نصف انتقال invariant را می‌شکند.",
  "terms": [
    [
      "Repository",
      "قرارداد مجموعه دامنه"
    ],
    [
      "Unit of Work",
      "مرز ثبت تغییرات"
    ],
    [
      "Optimistic concurrency",
      "کنترل نسخه"
    ]
  ],
  "references": [
    [
      "Fowler Repository",
      "https://martinfowler.com/eaaCatalog/repository.html"
    ],
    [
      "Microsoft persistence layer",
      "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"
    ]
  ],
  "exercise": [
    "قرارداد fake و نسخه را در Python بررسی کنید.",
    "rows={42:{'version':2}}\nexpected=1\nassert rows[42]['version']!=expected\nprint('conflict')",
    "نسخه ۱ رد می‌شود.",
    "این CAS واقعی هم‌زمان نیست."
  ],
  "deep": {
    "title": "یک واحد کار یا commit پراکنده",
    "question": "در شکست ثبت دوم، وضعیت مالی چه می‌شود؟",
    "assumptions": "دو تغییر A:-30 و B:+30، اولیه 100/50؛ مدل DB تراکنشی.",
    "lanes": [
      "Use case",
      "Repo A/B",
      "DB"
    ],
    "fields": {
      "a": "A committed",
      "b": "B committed",
      "total": "مجموع",
      "tx": "وضعیت"
    },
    "code": "with unit_of_work:\n    accounts.debit('A',30)\n    accounts.credit('B',30)\n    unit_of_work.commit()",
    "cases": [
      [
        "separate",
        "commit مستقل",
        {
          "a": 100,
          "b": 50,
          "total": 150,
          "tx": "Idle"
        },
        [
          [
            0,
            0,
            1,
            "برداشت",
            "debit",
            "repository اول.",
            {
              "tx": "A pending"
            }
          ],
          [
            1,
            1,
            2,
            "ثبت A",
            "COMMIT",
            "A پایدار شد.",
            {
              "a": 70,
              "total": 120
            }
          ],
          [
            2,
            0,
            1,
            "واریز",
            "credit",
            "عملیات دوم شکست خورد.",
            {
              "tx": "B failed"
            },
            "error"
          ],
          [
            3,
            1,
            2,
            "rollback دوم",
            "ROLLBACK",
            "A قبلاً commit شده.",
            {
              "tx": "Partial"
            },
            "error"
          ]
        ],
        "مجموع ۱۲۰؛ انتقال ناقص."
      ],
      [
        "uow",
        "تراکنش مشترک",
        {
          "a": 100,
          "b": 50,
          "total": 150,
          "tx": "Idle"
        },
        [
          [
            0,
            0,
            1,
            "آغاز",
            "BEGIN",
            "واحد کار مشترک.",
            {
              "tx": "Open"
            }
          ],
          [
            1,
            1,
            2,
            "برداشت",
            "debit pending",
            "هنوز committed نیست.",
            {
              "tx": "A pending"
            }
          ],
          [
            2,
            0,
            1,
            "واریز ناموفق",
            "credit failed",
            "خطا در همان واحد کار.",
            {
              "tx": "Failed"
            },
            "error"
          ],
          [
            3,
            1,
            2,
            "rollback همه",
            "ROLLBACK",
            "A نیز برگشت.",
            {
              "tx": "Rolled back"
            },
            "success"
          ]
        ],
        "مجموع ۱۵۰ حفظ شد."
      ]
    ],
    "diagnose": "transaction ID، affected rows، rollback و contract tests.",
    "tradeoff": "بین DBهای مستقل واحد کار محلی کافی نیست."
  }
});
export default lesson;
