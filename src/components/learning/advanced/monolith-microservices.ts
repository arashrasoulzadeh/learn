import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "monolith-microservices",
  "order": 39,
  "title": "Monolith vs Microservices — مرز استقرار",
  "description": "تفاوت ماژول، deployment و شکست جزئی شبکه.",
  "actors": [
    [
      "Orders",
      "Order module/service",
      "app"
    ],
    [
      "Inventory",
      "Inventory module/service",
      "db"
    ],
    [
      "Payment",
      "Payment module/service",
      "key"
    ]
  ],
  "edges": [
    [
      0,
      1
    ],
    [
      0,
      2
    ]
  ],
  "labels": [
    "سفارش",
    "موجودی",
    "پرداخت"
  ],
  "context": "monolith ماژولار می‌تواند DB مشترک داشته باشد؛ microservice نمونه مالک داده جدا و شبکه دارد.",
  "goal": "انتخاب معماری بر اساس مرز تیم، تغییر، consistency و failure.",
  "scenarios": [
    [
      "monolith",
      "Monolith ماژولار",
      "آیا یک deploy یعنی کد بدون مرز؟",
      "Order + Inventory",
      [
        [
          "فراخوانی ماژول",
          [
            0,
            1
          ],
          [
            "reserve"
          ],
          "inventory.reserve(order)",
          "Reserved pending",
          [
            "Pending",
            "Reserved pending",
            "—"
          ],
          "فراخوانی درون process است؛ مرز ماژول حفظ می‌شود.",
          "وابستگی module را با تست معماری کنترل کنید."
        ],
        [
          "ثبت محلی",
          [
            0
          ],
          [
            "COMMIT"
          ],
          "commit order + inventory",
          "Atomic commit",
          [
            "Confirmed",
            "Reserved",
            "—"
          ],
          "در فرض DB مشترک، تراکنش محلی هر دو تغییر را ثبت می‌کند.",
          "پرداخت خارجی عضو خودکار تراکنش نیست."
        ],
        [
          "استقرار",
          [
            0
          ],
          [
            "deploy"
          ],
          "deploy single artifact",
          "One release",
          [
            "Released",
            "Released",
            "Released"
          ],
          "ماژول‌ها در یک deployment هستند.",
          "scale معمولاً کل instance است.",
          "success"
        ]
      ]
    ],
    [
      "micro",
      "Microservice مستقل",
      "آیا inventory جدا deploy می‌شود؟",
      "HTTP inventory",
      [
        [
          "درخواست",
          [
            0,
            1
          ],
          [
            "POST reserve",
            "reservation"
          ],
          "POST /reservations",
          "Reserved",
          [
            "Pending",
            "Reserved",
            "—"
          ],
          "فراخوانی شبکه failure مستقل دارد.",
          "timeout و idempotency را تعریف کنید."
        ],
        [
          "پرداخت",
          [
            0,
            2
          ],
          [
            "charge",
            "receipt"
          ],
          "charge(orderId)",
          "Paid",
          [
            "Pending",
            "Reserved",
            "Paid"
          ],
          "serviceها داده مستقل دارند.",
          "distributed transaction خودکار نیست."
        ],
        [
          "تأیید",
          [
            0
          ],
          [
            "confirm"
          ],
          "order.confirm()",
          "Confirmed",
          [
            "Confirmed",
            "Reserved",
            "Paid"
          ],
          "workflow نتیجه‌ها را هماهنگ می‌کند.",
          "trace ID بین serviceها لازم است.",
          "success"
        ]
      ]
    ],
    [
      "partial",
      "شکست جزئی و جبران",
      "اگر رزرو ثبت و پرداخت شکست بخورد؟",
      "Saga compensation",
      [
        [
          "رزرو",
          [
            0,
            1
          ],
          [
            "reserve",
            "OK"
          ],
          "reserve 42",
          "Reserved",
          [
            "Pending",
            "Reserved",
            "Unpaid"
          ],
          "اثر رزرو در DB مستقل ثبت شد.",
          "operation ID پایدار لازم است."
        ],
        [
          "شکست پرداخت",
          [
            0,
            2
          ],
          [
            "charge",
            "declined"
          ],
          "charge -> decline",
          "Payment failed",
          [
            "Failed",
            "Reserved",
            "Declined"
          ],
          "rollback محلی سفارش رزرو را حذف نمی‌کند.",
          "decline قطعی با timeout مبهم متفاوت است.",
          "error"
        ],
        [
          "جبران",
          [
            0,
            1
          ],
          [
            "release",
            "OK"
          ],
          "release reservation 42",
          "Cancelled / released",
          [
            "Cancelled",
            "Released",
            "Declined"
          ],
          "عملیات جبرانی اثر تجاری را بازمی‌گرداند.",
          "compensation نیز باید retry-safe باشد.",
          "success"
        ]
      ],
      "خرابی جزئی در مرز شبکه."
    ]
  ],
  "pitfall": "microservices درمان خودکار coupling نیست؛ distributed monolith می‌تواند بدتر باشد.",
  "takeaway": "ماژولار کردن قبل از توزیع، و سنجش هزینه عملیاتی.",
  "quiz": [
    "microservice چه استقلالی را هدف دارد؟",
    [
      "هر کلاس deploy",
      "deploy و مالکیت داده در مرز سرویس",
      "حذف شبکه"
    ],
    1,
    "مرز سرویس مستقل مهم است."
  ],
  "practice": [
    "تیم کوچک و نیاز تراکنش محلی قوی؛ نقطه شروع؟",
    [
      "modular monolith",
      "ده‌ها سرویس بدون نیاز",
      "یک DB برای هر تابع"
    ],
    0,
    "پیچیدگی توزیع را بدون منفعت روشن اضافه نکنید."
  ],
  "hint": "مقیاس تیم و مرز تراکنش را در نظر بگیرید.",
  "terms": [
    [
      "Modular monolith",
      "استقرار واحد با مرز ماژول"
    ],
    [
      "Bounded context",
      "مرز مدل دامنه"
    ],
    [
      "Saga",
      "توالی تراکنش و جبران"
    ]
  ],
  "references": [
    [
      "Microservices",
      "https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices"
    ],
    [
      "Architecture styles",
      "https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles"
    ]
  ],
  "exercise": [
    "یک شکست جبران را در مدل محلی آزمایش کنید.",
    "inventory=5\ninventory-=1\npaid=False\nif not paid: inventory+=1\nassert inventory==5\nprint('compensated')",
    "رزرو جبران می‌شود.",
    "این rollback توزیع‌شده واقعی نیست."
  ],
  "deep": {
    "title": "اثر failure در دو مرز استقرار",
    "question": "پس از شکست payment، آیا رزرو باقی می‌ماند؟",
    "assumptions": "مدل رزرو و پرداخت داخلی در حالت محلی، و دو DB مستقل در حالت توزیع‌شده؛ payment خارجی واقعی نیست.",
    "lanes": [
      "Orders",
      "Inventory",
      "Payment"
    ],
    "fields": {
      "order": "سفارش",
      "stock": "موجودی",
      "payment": "پرداخت",
      "action": "اقدام"
    },
    "code": "reserve(orderId)\ntry: charge(orderId)\nexcept Declined: release(orderId)",
    "cases": [
      [
        "local",
        "تراکنش محلی",
        {
          "order": "Pending",
          "stock": 5,
          "payment": "Unpaid",
          "action": "—"
        },
        [
          [
            0,
            0,
            1,
            "رزرو",
            "pending -1",
            "تغییر هنوز ثبت نشده.",
            {
              "action": "Open tx"
            }
          ],
          [
            1,
            0,
            2,
            "پرداخت داخلی",
            "decline",
            "خطای قطعی.",
            {
              "payment": "Declined"
            },
            "error"
          ],
          [
            2,
            0,
            null,
            "rollback",
            "ROLLBACK",
            "رزرو برمی‌گردد.",
            {
              "order": "Cancelled",
              "stock": 5
            }
          ],
          [
            3,
            0,
            null,
            "نتیجه",
            "done",
            "اثر ناقص نداریم.",
            {
              "action": "Rolled back"
            },
            "success"
          ]
        ],
        "مرز محلی واحد کافی بود."
      ],
      [
        "remote",
        "دو commit مستقل",
        {
          "order": "Pending",
          "stock": 5,
          "payment": "Unpaid",
          "action": "—"
        },
        [
          [
            0,
            0,
            1,
            "رزرو مستقل",
            "COMMIT",
            "موجودی کم شد.",
            {
              "stock": 4,
              "action": "Reserved"
            }
          ],
          [
            1,
            0,
            2,
            "پرداخت",
            "decline",
            "پرداخت ثبت نشد.",
            {
              "payment": "Declined"
            },
            "error"
          ],
          [
            2,
            0,
            null,
            "خرابی coordinator",
            "crash",
            "جبران هنوز انجام نشده.",
            {
              "order": "Pending recovery",
              "action": "Compensation pending"
            },
            "error"
          ],
          [
            3,
            0,
            1,
            "بازیابی workflow",
            "release",
            "ثبت جبران با ID پایدار.",
            {
              "stock": 5,
              "order": "Cancelled",
              "action": "Compensated"
            },
            "success"
          ]
        ],
        "هماهنگی پایدار برای بازیابی لازم شد."
      ]
    ],
    "diagnose": "trace توزیع‌شده، وضعیت saga، DLQ و latency هر hop.",
    "tradeoff": "سرویس مستقل scale/deploy مستقل می‌دهد ولی failure و consistency پیچیده‌تر است."
  }
});
export default lesson;
