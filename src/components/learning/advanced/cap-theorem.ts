import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "cap-theorem",
  "order": 49,
  "title": "CAP Theorem — انتخاب هنگام partition",
  "description": "Linearizability، availability و trade-off در قطع ارتباط.",
  "actors": [
    [
      "Client",
      "Read/write",
      "browser"
    ],
    [
      "Replica A",
      "Partition side A",
      "db"
    ],
    [
      "Replica B",
      "Partition side B",
      "db"
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
    ],
    [
      1,
      2
    ]
  ],
  "labels": [
    "عملیات client",
    "نسخه A",
    "نسخه B"
  ],
  "context": "مدل register دو replica؛ partition بین A/B؛ Consistency در CAP یعنی linearizability و Availability یعنی پاسخ غیرخطا به هر درخواست گره غیرخراب.",
  "goal": "در partition تشخیص دهید کدام تضمین قربانی شده است؛ CAP قانون انتخاب همیشگی دو مورد نیست.",
  "scenarios": [
    [
      "healthy",
      "ارتباط سالم",
      "آیا قبل از partition می‌توان هر دو هدف را داشت؟",
      "x=0 → x=1",
      [
        [
          "نوشتن",
          [
            0,
            1
          ],
          [
            "write x=1"
          ],
          "write(1)",
          "Pending",
          [
            "Write pending",
            "x=1 pending",
            "x=0"
          ],
          "A تغییر تازه دارد اما هنوز پاسخ نداده.",
          "linearizability ترتیب زمانی عملیات کامل‌شده را رعایت می‌کند."
        ],
        [
          "هماهنگی",
          [
            1,
            2
          ],
          [
            "replicate",
            "ACK"
          ],
          "B stores x=1",
          "Both x=1",
          [
            "Write complete",
            "x=1",
            "x=1"
          ],
          "در مدل هر دو نسخه قبل از ACK هماهنگ شدند.",
          "این پروتکل ساده همه شرایط crash را مدل نمی‌کند."
        ],
        [
          "خواندن",
          [
            0,
            2
          ],
          [
            "read",
            "1"
          ],
          "read after write completed",
          "1",
          [
            "Read 1",
            "x=1",
            "x=1"
          ],
          "خواندن بعد از write کامل‌شده مقدار تازه را دید.",
          "در partition هماهنگی ممکن نیست.",
          "success"
        ]
      ]
    ],
    [
      "cp",
      "اولویت سازگاری",
      "اگر B از A جدا باشد چه پاسخی باید بدهد؟",
      "partition; A authoritative",
      [
        [
          "قطع",
          [
            1,
            2
          ],
          [
            "partition"
          ],
          "link unavailable",
          "Partition",
          [
            "Pending",
            "x=0",
            "x=0"
          ],
          "پیام بین replicaها نمی‌رسد.",
          "partition failure شبکه است، نه یک تنظیم اختیاری.",
          "error"
        ],
        [
          "ثبت روی A",
          [
            0,
            1
          ],
          [
            "write",
            "ACK"
          ],
          "A is fixed authority; write 1",
          "Write complete",
          [
            "Write complete",
            "x=1",
            "x=0"
          ],
          "A در مدل تنها مرجع معتبر است؛ B حق پاسخ مستقل ندارد.",
          "failover بدون fencing این فرض را می‌شکند."
        ],
        [
          "خواندن B",
          [
            0,
            2
          ],
          [
            "read",
            "Unavailable"
          ],
          "read after completed write",
          "Unavailable",
          [
            "Read unavailable",
            "x=1",
            "x=0 (not served)"
          ],
          "B برای حفظ consistency پاسخ موفق کهنه نمی‌دهد.",
          "رد/انتظار در گره غیرخراب availability CAP را نقض می‌کند.",
          "error"
        ]
      ],
      "حفظ linearizability با از دست دادن پاسخ موفق در یک سمت."
    ],
    [
      "ap",
      "اولویت availability",
      "اگر B با وجود partition پاسخ دهد؟",
      "partition; read locally",
      [
        [
          "قطع",
          [
            1,
            2
          ],
          [
            "partition"
          ],
          "link unavailable",
          "Partition",
          [
            "Pending",
            "x=0",
            "x=0"
          ],
          "replicaها مستقل شده‌اند.",
          "عدم ارتباط مانع اطلاع B از write A است.",
          "error"
        ],
        [
          "نوشتن A",
          [
            0,
            1
          ],
          [
            "write",
            "ACK"
          ],
          "write 1 acknowledged",
          "Write complete",
          [
            "Write complete",
            "x=1",
            "x=0"
          ],
          "A درخواست را محلی کامل کرد.",
          "در این مدل هر سمت پاسخ محلی می‌دهد."
        ],
        [
          "خواندن B",
          [
            0,
            2
          ],
          [
            "read",
            "0"
          ],
          "read after write complete",
          "Stale read 0",
          [
            "Read 0",
            "x=1",
            "x=0"
          ],
          "B مقدار قبلی را موفق برمی‌گرداند؛ linearizability نقض شد.",
          "reconciliation بعداً نقض گذشته را حذف نمی‌کند.",
          "error"
        ]
      ],
      "AP در partition ممکن است پاسخ کهنه یا تعارض بدهد."
    ]
  ],
  "pitfall": "CAP consistency با ACID consistency و availability با درصد uptime معمولی فرق دارد.",
  "takeaway": "وقتی ارتباط قطع است نمی‌توان هم پاسخ موفق همگانی و هم linearizability را تضمین کرد.",
  "quiz": [
    "C در CAP به چه معناست؟",
    [
      "قیدهای SQL",
      "Linearizability",
      "Cache hit"
    ],
    1,
    "هر عملیات باید در ترتیبی سازگار با زمان واقعی قابل تصور باشد."
  ],
  "practice": [
    "بعد از ACK write=1، B جدا شده و 0 برمی‌گرداند؛ کدام تضمین شکسته؟",
    [
      "Linearizability",
      "Partition تحمل شده نیست",
      "هیچ"
    ],
    0,
    "خواندن بعد از write کامل‌شده مقدار قبلی دیده."
  ],
  "hint": "ترتیب زمانی عملیات کامل‌شده را بررسی کنید.",
  "terms": [
    [
      "Partition",
      "قطع ارتباط میان بخش‌ها"
    ],
    [
      "Linearizability",
      "سازگاری با ترتیب زمانی واقعی"
    ],
    [
      "Availability",
      "پاسخ غیرخطا به درخواست گره غیرخراب"
    ]
  ],
  "references": [
    [
      "Gilbert and Lynch — CAP perspectives",
      "https://dspace.mit.edu/entities/publication/dfcb6512-af44-4fc9-8e8b-1a8f28f1b53a"
    ],
    [
      "Brewer — CAP twelve years later",
      "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/"
    ]
  ],
  "exercise": [
    "تعارض مشاهده بعد از write را مدل کنید.",
    "a=b=0\na=1 # write acknowledged at A during partition\nassert b!=a\nprint('stale read:',b)",
    "B هنوز صفر دارد.",
    "اثبات CAP نیست؛ یک execution نمونه است."
  ],
  "deep": {
    "title": "Partition و مشاهده بعد از write کامل‌شده",
    "question": "چند پاسخ موفق و چند خواندن ناسازگار رخ می‌دهد؟",
    "assumptions": "A تنها writer مجاز در CP؛ B isolated؛ client write A را کامل می‌کند سپس دو read از B. AP مدل read محلی.",
    "lanes": [
      "Client",
      "A",
      "B"
    ],
    "fields": {
      "a": "نسخه A",
      "b": "نسخه B",
      "ok": "پاسخ موفق",
      "stale": "خواندن کهنه"
    },
    "code": "// CP: B cannot prove freshness during partition => unavailable\n// AP: serve local state; reconcile later",
    "cases": [
      [
        "cp",
        "حفظ consistency",
        {
          "a": 0,
          "b": 0,
          "ok": 0,
          "stale": 0
        },
        [
          [
            0,
            1,
            2,
            "قطع شبکه",
            "partition",
            "پیام replication نمی‌رسد.",
            {
              "b": 0
            },
            "error"
          ],
          [
            1,
            0,
            1,
            "write کامل",
            "x=1 ACK",
            "A تغییر را ثبت کرد.",
            {
              "a": 1,
              "ok": 1
            }
          ],
          [
            2,
            0,
            2,
            "read اول",
            "unavailable",
            "پاسخ موفق داده نمی‌شود.",
            {
              "ok": 1,
              "stale": 0
            },
            "error"
          ],
          [
            3,
            0,
            2,
            "read دوم",
            "unavailable",
            "B همچنان نمی‌تواند freshness را ثابت کند.",
            {
              "ok": 1,
              "stale": 0
            },
            "error"
          ]
        ],
        "۱ پاسخ موفق، ۰ read کهنه؛ دو read unavailable."
      ],
      [
        "ap",
        "پاسخ محلی AP",
        {
          "a": 0,
          "b": 0,
          "ok": 0,
          "stale": 0
        },
        [
          [
            0,
            1,
            2,
            "قطع شبکه",
            "partition",
            "پیام replication نمی‌رسد.",
            {
              "b": 0
            },
            "error"
          ],
          [
            1,
            0,
            1,
            "write کامل",
            "x=1 ACK",
            "A تغییر را ثبت کرد.",
            {
              "a": 1,
              "ok": 1
            }
          ],
          [
            2,
            0,
            2,
            "read اول",
            "0",
            "پاسخ موفق ولی کهنه.",
            {
              "ok": 2,
              "stale": 1
            },
            "error"
          ],
          [
            3,
            0,
            2,
            "read دوم",
            "0",
            "نقض consistency تکرار شد.",
            {
              "ok": 3,
              "stale": 2
            },
            "error"
          ]
        ],
        "۳ پاسخ موفق، ۲ read کهنه."
      ]
    ],
    "diagnose": "partition injection در محیط تست، history عملیات، ACK time و read value را مقایسه کنید.",
    "tradeoff": "تصمیم ممکن است per operation باشد؛ recovery و latency عادی موضوعات جدا هستند."
  }
});
export default lesson;
