import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "event-driven-architecture",
  "order": 40,
  "title": "Event-Driven Architecture — انتشار و مصرف رویداد",
  "description": "Outbox، تحویل تکراری، ترتیب و idempotency.",
  "actors": [
    [
      "Order service",
      "Producer",
      "app"
    ],
    [
      "Event broker",
      "Durable log",
      "queue"
    ],
    [
      "Consumer",
      "Projection",
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
    "رویداد تولیدکننده",
    "broker",
    "وضعیت مصرف‌کننده"
  ],
  "context": "مدل تحویل حداقل یک‌بار؛ event یک واقعیت گذشته است، command درخواست انجام کار.",
  "goal": "اثر asynchronous delivery، duplicate و ترتیب را در state مشاهده کنید.",
  "scenarios": [
    [
      "publish",
      "انتشار و مصرف",
      "آیا OrderCreated همان command ارسال ایمیل است؟",
      "OrderCreated(id=42)",
      [
        [
          "ثبت",
          [
            0
          ],
          [
            "commit outbox"
          ],
          "INSERT order + outbox",
          "Event persisted",
          [
            "OrderCreated e1",
            "Pending",
            "—"
          ],
          "داده و outbox در یک تراکنش ثبت می‌شوند.",
          "event از واقعیت ثبت‌شده خبر می‌دهد."
        ],
        [
          "انتشار",
          [
            0,
            1
          ],
          [
            "publish e1",
            "ACK"
          ],
          "relay.publish(e1)",
          "Broker accepted",
          [
            "e1",
            "Stored e1",
            "—"
          ],
          "relay پیام پایدار را منتشر می‌کند.",
          "ACK broker با اجرای consumer متفاوت است."
        ],
        [
          "مصرف",
          [
            1,
            2
          ],
          [
            "deliver e1",
            "ACK"
          ],
          "handle(e1); ack()",
          "Projection updated",
          [
            "e1",
            "Acknowledged",
            "Order 42"
          ],
          "consumer مستقل projection را به‌روز می‌کند.",
          "lag مصرف را اندازه بگیرید.",
          "success"
        ]
      ]
    ],
    [
      "duplicate",
      "تحویل تکراری",
      "اگر ACK بعد از commit گم شود؟",
      "event e1 twice",
      [
        [
          "مصرف",
          [
            1,
            2
          ],
          [
            "deliver e1"
          ],
          "apply e1 + inbox",
          "Count 1",
          [
            "e1",
            "Unacked",
            "Count=1"
          ],
          "ثبت اثر و event ID در یک تراکنش است.",
          "unique inbox key لازم است."
        ],
        [
          "تکرار",
          [
            1,
            2
          ],
          [
            "redeliver e1"
          ],
          "inbox contains e1",
          "Duplicate detected",
          [
            "e1",
            "Redelivered",
            "Count=1"
          ],
          "broker ممکن است دوباره تحویل دهد.",
          "dedup باید persistent باشد."
        ],
        [
          "ACK",
          [
            2,
            1
          ],
          [
            "ack"
          ],
          "skip and ack",
          "Count 1",
          [
            "e1",
            "Acked",
            "Count=1"
          ],
          "اثر دوباره ایجاد نشد.",
          "ACK را پس از ثبت موفق بفرستید.",
          "success"
        ]
      ]
    ],
    [
      "ordering",
      "رویداد خارج از ترتیب",
      "اگر v3 پیش از v2 برسد چه کنیم؟",
      "per-order version",
      [
        [
          "تحویل v3",
          [
            1,
            2
          ],
          [
            "event v3"
          ],
          "last=1; incoming=3",
          "Gap detected",
          [
            "v3",
            "Delivered",
            "last=1"
          ],
          "delta v3 به v2 نیاز دارد.",
          "ترتیب جهانی را فرض نکنید.",
          "error"
        ],
        [
          "نگهداری gap",
          [
            2
          ],
          [
            "buffer v3"
          ],
          "wait/replay v2",
          "Buffered",
          [
            "v3",
            "Replay requested",
            "last=1"
          ],
          "consumer از apply کور جلوگیری می‌کند.",
          "buffer محدود و timeout/rebuild لازم است."
        ],
        [
          "بازیابی",
          [
            1,
            2
          ],
          [
            "v2 then v3"
          ],
          "apply v2; apply v3",
          "last=3",
          [
            "v2,v3",
            "Delivered",
            "last=3"
          ],
          "ترتیب per aggregate بازسازی شد.",
          "snapshot event و delta سیاست متفاوت دارند.",
          "success"
        ]
      ],
      "parallel consumers می‌توانند ترتیب را تغییر دهند."
    ]
  ],
  "pitfall": "EDA با exactly-once عمومی یا event sourcing یکی نیست.",
  "takeaway": "رویداد پایدار، idempotent consumer و نسخه‌بندی قرارداد.",
  "quiz": [
    "ACK broker چه چیزی را اثبات می‌کند؟",
    [
      "همه subscriberها اجرا شده‌اند",
      "پذیرش طبق قرارداد broker",
      "commit همه DBها"
    ],
    1,
    "delivery و business commit مستقل‌اند."
  ],
  "practice": [
    "consumer پس از commit پیش از ACK crash می‌کند؛ چه لازم است؟",
    [
      "dedup اتمیک با اثر",
      "حذف همه retry",
      "تکیه بر RAM"
    ],
    0,
    "اثر تکرار باید با شناسه پایدار کنترل شود."
  ],
  "hint": "ACK و commit در دو سیستم مستقل‌اند.",
  "terms": [
    [
      "Event",
      "واقعیت گذشته"
    ],
    [
      "Outbox",
      "ثبت پایدار برای انتشار"
    ],
    [
      "Idempotent consumer",
      "مصرف امن تکرار"
    ]
  ],
  "references": [
    [
      "Event-driven architecture",
      "https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven"
    ],
    [
      "Transactional outbox",
      "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html"
    ]
  ],
  "exercise": [
    "مصرف تکراری را با set محلی مدل کنید.",
    "seen=set(); count=0\nfor e in ['e1','e1','e2']:\n    if e not in seen: seen.add(e); count+=1\nassert count==2\nprint(count)",
    "دو اثر برای سه delivery.",
    "set حافظه‌ای پایدار یا اتمیک با DB نیست."
  ],
  "deep": {
    "title": "اثر duplicate پس از crash",
    "question": "سه delivery برای دو رویداد، چند اثر می‌سازد؟",
    "assumptions": "e1 دوبار و e2 یک بار؛ اثر count افزایش؛ inbox و اثر در یک transaction فرض شده.",
    "lanes": [
      "Broker",
      "Consumer",
      "DB"
    ],
    "fields": {
      "count": "تعداد اثر",
      "seen": "Inbox",
      "delivery": "تعداد تحویل",
      "ack": "ACK"
    },
    "code": "BEGIN;\nINSERT INTO inbox(event_id) VALUES (?) ON CONFLICT DO NOTHING;\n-- only on inserted: apply effect\nCOMMIT; ACK",
    "cases": [
      [
        "naive",
        "بدون dedup",
        {
          "count": 0,
          "seen": "None",
          "delivery": 0,
          "ack": "—"
        },
        [
          [
            0,
            0,
            1,
            "تحویل e1",
            "e1",
            "اولین تحویل.",
            {
              "delivery": 1
            }
          ],
          [
            1,
            1,
            2,
            "ثبت اثر",
            "COMMIT",
            "ACK گم می‌شود.",
            {
              "count": 1,
              "ack": "Lost"
            }
          ],
          [
            2,
            0,
            1,
            "تکرار",
            "e1",
            "اثر دوباره ثبت شد.",
            {
              "delivery": 2,
              "count": 2
            },
            "error"
          ],
          [
            3,
            0,
            1,
            "رویداد e2",
            "e2",
            "اثر سوم.",
            {
              "delivery": 3,
              "count": 3,
              "ack": "Acked"
            }
          ]
        ],
        "۳ اثر برای دو رویداد."
      ],
      [
        "inbox",
        "Inbox اتمیک",
        {
          "count": 0,
          "seen": "Empty",
          "delivery": 0,
          "ack": "—"
        },
        [
          [
            0,
            0,
            1,
            "تحویل e1",
            "e1",
            "اولین تحویل.",
            {
              "delivery": 1
            }
          ],
          [
            1,
            1,
            2,
            "ثبت اتمیک",
            "effect + inbox",
            "ACK گم می‌شود.",
            {
              "count": 1,
              "seen": "e1",
              "ack": "Lost"
            }
          ],
          [
            2,
            0,
            1,
            "تکرار",
            "e1",
            "قید unique تکرار را رد کرد.",
            {
              "delivery": 2,
              "count": 1
            }
          ],
          [
            3,
            0,
            1,
            "رویداد e2",
            "e2",
            "اثر تازه.",
            {
              "delivery": 3,
              "count": 2,
              "seen": "e1,e2",
              "ack": "Acked"
            },
            "success"
          ]
        ],
        "۲ اثر برای دو رویداد."
      ]
    ],
    "diagnose": "consumer lag، event ID، schema version، retry و inbox conflicts.",
    "tradeoff": "dedup عمر محدود یا اثر خارجی غیراتمیک نیاز به طراحی بیشتر دارد."
  }
});
export default lesson;
