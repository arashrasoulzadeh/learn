import type {DeepLesson} from './types';
export const dataB: DeepLesson[] = [
  {
    "slug": "connection-pooling",
    "title": "بودجه اتصال و زمان انتظار",
    "question": "اگر چهار instance هر کدام pool ده‌تایی داشته باشند، DB با بودجه ۲۰ اتصال چه می‌کند؟",
    "assumptions": "بودجه ۲۰ اتصال برای همین برنامه، چهار instance، بار هم‌زمان مدل. باز کردن اتصال‌ها به‌صورت گروهی نمایش داده می‌شود. در راهبرد محدود هر pool حداکثر پنج اتصال.",
    "lanes": [
      "Instances",
      "Pools",
      "DB"
    ],
    "fields": {
      "limit": "حد هر pool",
      "open": "اتصال‌های باز",
      "waiting": "درخواست‌های منتظر",
      "rejected": "اتصال‌های ردشده",
      "done": "درخواست‌های پایان‌یافته"
    },
    "code": "// budget across every application replica\nmaxPerPool = floor(dbConnectionBudget / maxInstances)\n// acquire with bounded timeout; release in finally\n// reserve capacity for maintenance and other clients",
    "cases": [
      {
        "id": "oversized",
        "label": "چهار pool ده‌تایی",
        "initial": {
          "limit": 10,
          "open": 0,
          "waiting": 0,
          "rejected": 0,
          "done": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "بار روی دو instance",
            "wire": "20 acquires",
            "why": "دو pool اول هر کدام ده اتصال می‌گیرند.",
            "patch": {
              "waiting": 20
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 2,
            "name": "باز کردن اتصال‌ها",
            "wire": "20 accepted",
            "why": "بودجه DB پر شد.",
            "patch": {
              "open": 20,
              "waiting": 0
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 1,
            "name": "بار دو instance دیگر",
            "wire": "20 acquires",
            "why": "هر دو نیز ده اتصال می‌خواهند.",
            "patch": {
              "waiting": 20
            }
          },
          {
            "at": 3,
            "lane": 1,
            "to": 2,
            "name": "رد اتصال اضافه",
            "wire": "connection limit",
            "why": "بودجه فرضی پر است؛ ۲۰ تلاش ایجاد اتصال رد می‌شوند.",
            "patch": {
              "rejected": 20,
              "waiting": 0
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 2,
            "to": 1,
            "name": "پایان کار اول",
            "wire": "20 complete",
            "why": "اتصال‌های pool اول باز ولی آزاد می‌مانند.",
            "patch": {
              "done": 20
            }
          }
        ],
        "verdict": "مجموع max poolها از بودجه DB بیشتر است؛ افزایش replica می‌تواند مشکل را تشدید کند."
      },
      {
        "id": "budgeted",
        "label": "چهار pool پنج‌تایی",
        "initial": {
          "limit": 5,
          "open": 0,
          "waiting": 0,
          "rejected": 0,
          "done": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ورود ۴۰ درخواست",
            "wire": "40 acquires",
            "why": "برای هر instance ده درخواست می‌رسد.",
            "patch": {
              "waiting": 40
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 2,
            "name": "اختصاص بودجه",
            "wire": "20 accepted",
            "why": "هر pool پنج اتصال می‌گیرد؛ ۲۰ درخواست در صف محدود می‌مانند.",
            "patch": {
              "open": 20,
              "waiting": 20
            }
          },
          {
            "at": 2,
            "lane": 2,
            "to": 1,
            "name": "پایان موج اول",
            "wire": "release 20",
            "why": "اتصال‌ها آزاد می‌شوند، socketها باز می‌مانند.",
            "patch": {
              "done": 20
            }
          },
          {
            "at": 3,
            "lane": 1,
            "to": 0,
            "name": "واگذاری دوباره",
            "wire": "grant 20",
            "why": "منتظرها پیش از timeout اتصال می‌گیرند.",
            "patch": {
              "waiting": 0
            }
          },
          {
            "at": 4,
            "lane": 2,
            "to": 1,
            "name": "پایان موج دوم",
            "wire": "20 complete",
            "why": "همه ۴۰ درخواست پایان یافتند؛ ۲۰ اتصال حفظ شده.",
            "patch": {
              "done": 40
            },
            "tone": "success"
          }
        ],
        "verdict": "بودجه اتصال کنترل شد اما صف و latency ایجاد می‌شود؛ در بار واقعی timeout لازم است."
      }
    ],
    "diagnose": "pool total/idle/waiting، acquire latency، DB active sessions و مدت تراکنش را اندازه بگیرید.",
    "tradeoff": "بودجه واقعی باید ظرفیت سایر مصرف‌کننده‌ها، replicaهای پویا و throughput موتور را در نظر بگیرد.",
    "sources": [
      {
        "label": "node-postgres pool",
        "url": "https://node-postgres.com/apis/pool"
      },
      {
        "label": "PostgreSQL connection settings",
        "url": "https://www.postgresql.org/docs/current/runtime-config-connection.html"
      }
    ]
  },
  {
    "slug": "caching",
    "title": "Cache stampede و coalescing",
    "question": "وقتی یک کلید داغ منقضی شود، ۱۰۰ درخواست هم‌زمان چند بار DB را می‌خوانند؟",
    "assumptions": "۱۰۰ درخواست هم‌زمان، کلید واحد، خواندن DB ۳۰ms، هیچ نوشتن هم‌زمانی نداریم. گروه درخواست‌ها برای خوانایی تجمیع شده‌اند.",
    "lanes": [
      "Requests",
      "Cache / coordinator",
      "DB"
    ],
    "fields": {
      "requests": "درخواست‌ها",
      "inflight": "خواندن فعال DB",
      "reads": "کل خواندن DB",
      "waiting": "منتظرها",
      "cache": "وضعیت کش"
    },
    "code": "// process-local single-flight sketch\nif (cache.has(key)) return cache.get(key);\nreturn singleFlight(key, async () => {\n  const value = await db.read(key);\n  await cache.set(key,value,ttl);\n  return value;\n});",
    "cases": [
      {
        "id": "stampede",
        "label": "بدون هماهنگی",
        "initial": {
          "requests": 0,
          "inflight": 0,
          "reads": 0,
          "waiting": 0,
          "cache": "Expired"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ورود هم‌زمان",
            "wire": "100 GET",
            "why": "همه قبل از پر شدن کش می‌رسند.",
            "patch": {
              "requests": 100
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 0,
            "name": "miss هم‌زمان",
            "wire": "100 MISS",
            "why": "هیچ درخواست هنوز پاسخ کش ندارد.",
            "patch": {
              "waiting": 100
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 2,
            "name": "هجوم به DB",
            "wire": "100 SELECT",
            "why": "هر درخواست خودش query می‌زند.",
            "patch": {
              "inflight": 100,
              "reads": 100
            },
            "tone": "error"
          },
          {
            "at": 32,
            "lane": 2,
            "to": 0,
            "name": "دریافت نتایج",
            "wire": "100 results",
            "why": "در مدل همه queryها تمام می‌شوند.",
            "patch": {
              "inflight": 0
            }
          },
          {
            "at": 33,
            "lane": 0,
            "to": 1,
            "name": "پر کردن تکراری",
            "wire": "SET ×100",
            "why": "همه پاسخ می‌گیرند اما کار اضافی زیادی انجام شد.",
            "patch": {
              "cache": "Warm",
              "waiting": 0
            }
          }
        ],
        "verdict": "۱۰۰ خواندن DB برای یک مقدار؛ هزینه و latency واقعی ممکن است بسیار بیشتر باشد."
      },
      {
        "id": "coalesced",
        "label": "Single-flight برای هر کلید",
        "initial": {
          "requests": 0,
          "inflight": 0,
          "reads": 0,
          "waiting": 0,
          "cache": "Expired"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ورود هم‌زمان",
            "wire": "100 GET",
            "why": "همه کلید واحد را می‌خواهند.",
            "patch": {
              "requests": 100
            }
          },
          {
            "at": 1,
            "lane": 1,
            "name": "انتخاب یک loader",
            "wire": "one leader",
            "why": "۹۹ درخواست نتیجه loader را انتظار می‌کشند.",
            "patch": {
              "waiting": 99
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 2,
            "name": "یک خواندن DB",
            "wire": "1 SELECT",
            "why": "یک عملیات فعال است.",
            "patch": {
              "reads": 1,
              "inflight": 1
            }
          },
          {
            "at": 32,
            "lane": 2,
            "to": 1,
            "name": "دریافت و cache",
            "wire": "result",
            "why": "loader نتیجه را منتشر می‌کند.",
            "patch": {
              "cache": "Warm",
              "inflight": 0
            }
          },
          {
            "at": 33,
            "lane": 1,
            "to": 0,
            "name": "تحویل مشترک",
            "wire": "100 responses",
            "why": "همه نتیجه را دریافت می‌کنند.",
            "patch": {
              "waiting": 0
            },
            "tone": "success"
          }
        ],
        "verdict": "در مدل فقط یک خواندن DB؛ اگر loader شکست بخورد باید خطا و timeout همه منتظرها مدیریت شود."
      }
    ],
    "diagnose": "hit/miss، concurrent loads per key، DB QPS و tail latency را هنگام انقضای کلید داغ بررسی کنید.",
    "tradeoff": "Single-flight محلی میان instanceها مشترک نیست؛ هماهنگی توزیع‌شده، jitter TTL و stale-while-revalidate tradeoff دارند.",
    "sources": [
      {
        "label": "Redis cache-aside",
        "url": "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
      },
      {
        "label": "Microsoft Cache-Aside",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside"
      }
    ]
  },
  {
    "slug": "cache-invalidation",
    "title": "Outbox و invalidation بعد از crash",
    "question": "اگر بین commit و DEL برنامه crash کند، چه تضمینی داریم؟",
    "assumptions": "DB تراکنشی با outbox؛ consumer حداقل یک‌بار پیام را تحویل می‌دهد. کش مستقل، قیمت v1=50 و v2=45. هنوز سازگاری آنی تضمین نمی‌شود.",
    "lanes": [
      "Writer",
      "DB / outbox",
      "Cache consumer"
    ],
    "fields": {
      "db": "نسخه DB",
      "cache": "نسخه کش",
      "outbox": "پیام پایدار",
      "status": "وضعیت writer",
      "reads": "خواندن بعدی"
    },
    "code": "BEGIN;\nUPDATE product SET price=45, version=2 WHERE id=42;\nINSERT INTO outbox(type, key, version) VALUES ('invalidate',42,2);\nCOMMIT;\n-- consumer: retry idempotent invalidation, ack after success",
    "cases": [
      {
        "id": "direct",
        "label": "commit سپس DEL بدون بازیابی",
        "initial": {
          "db": "v1=50",
          "cache": "v1=50",
          "outbox": "None",
          "status": "Running",
          "reads": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "تغییر DB",
            "wire": "UPDATE v2",
            "why": "تراکنش تغییر قیمت را انجام می‌دهد.",
            "patch": {
              "status": "Transaction"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 0,
            "name": "ثبت موفق",
            "wire": "COMMIT",
            "why": "نسخه تازه پایدار است.",
            "patch": {
              "db": "v2=45"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "name": "خرابی پیش از DEL",
            "wire": "Crash",
            "why": "هیچ رویداد پایدار برای حذف کش نداریم.",
            "patch": {
              "status": "Down"
            },
            "tone": "error"
          },
          {
            "at": 3,
            "lane": 2,
            "name": "خواندن از cache",
            "wire": "HIT v1",
            "why": "مقدار قبلی همچنان قابل استفاده است.",
            "patch": {
              "reads": "50 stale"
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 2,
            "name": "انتظار انقضا",
            "wire": "TTL",
            "why": "تا invalidation/expiry سیاست دیگری وجود ندارد.",
            "patch": {
              "cache": "v1=50 until expiry"
            }
          }
        ],
        "verdict": "بین commit و حذف کش پنجره شکست وجود دارد."
      },
      {
        "id": "outbox",
        "label": "ثبت رویداد در همان تراکنش",
        "initial": {
          "db": "v1=50",
          "cache": "v1=50",
          "outbox": "None",
          "status": "Running",
          "reads": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ثبت داده و رویداد",
            "wire": "UPDATE + INSERT",
            "why": "هر دو در یک تراکنش قرار دارند.",
            "patch": {
              "outbox": "Pending (uncommitted)",
              "status": "Transaction"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 0,
            "name": "commit واحد",
            "wire": "COMMIT",
            "why": "داده و پیام با هم پایدار شدند.",
            "patch": {
              "db": "v2=45",
              "outbox": "Pending v2"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "name": "خرابی writer",
            "wire": "Crash",
            "why": "پیام پایدار از بین نرفته.",
            "patch": {
              "status": "Down"
            }
          },
          {
            "at": 3,
            "lane": 1,
            "to": 2,
            "name": "دریافت توسط consumer",
            "wire": "deliver v2",
            "why": "consumer مستقل رویداد را می‌خواند.",
            "patch": {
              "outbox": "Delivered"
            }
          },
          {
            "at": 4,
            "lane": 2,
            "name": "حذف کلید",
            "wire": "DEL",
            "why": "پس از حذف موفق ACK می‌شود؛ تکرار DEL باید امن باشد.",
            "patch": {
              "cache": "Missing",
              "outbox": "Acked"
            }
          },
          {
            "at": 5,
            "lane": 2,
            "to": 1,
            "name": "خواندن تازه",
            "wire": "MISS → DB",
            "why": "منبع اصلی v2 را می‌دهد.",
            "patch": {
              "reads": "45",
              "cache": "v2=45"
            },
            "tone": "success"
          }
        ],
        "verdict": "outbox شکست تحویل بین DB و کش را قابل بازیابی می‌کند؛ stale read پیش از مصرف ممکن است."
      }
    ],
    "diagnose": "outbox lag، retry، پیام‌های poison و نسخهٔ cache را دنبال کنید؛ برای جلوگیری از refill قدیمی نسخه/marker جداگانه لازم است.",
    "tradeoff": "outbox ارسال حداقل یک‌بار است، نه exactly-once عمومی؛ کنترل ترتیب، deduplication و تازگی را جدا طراحی کنید.",
    "sources": [
      {
        "label": "AWS transactional outbox",
        "url": "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html"
      },
      {
        "label": "Microsoft Cache-Aside",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside"
      }
    ]
  },
  {
    "slug": "replication",
    "title": "receive / flush / replay و سیاست تأیید",
    "question": "آیا synchronous_commit=on لزوماً به معنی دیدن داده در خواندن replica است؟",
    "assumptions": "PostgreSQL نمونه با یک synchronous standby مشخص؛ WAL record 102؛ زمان فرضی دریافت 10، flush 20، replay 40. انتخاب سیاست on یا remote_apply.",
    "lanes": [
      "Client",
      "Primary",
      "Standby"
    ],
    "fields": {
      "primary": "Primary WAL",
      "received": "Standby receive",
      "flushed": "Standby flush",
      "replayed": "Standby replay",
      "ack": "زمان ACK (ms)",
      "read": "خواندن بعد از ACK"
    },
    "code": "SET LOCAL synchronous_commit = 'on';\n-- waits for synchronous standby durable flush\nSET LOCAL synchronous_commit = 'remote_apply';\n-- also waits for replay on selected synchronous standby",
    "cases": [
      {
        "id": "flush",
        "label": "synchronous_commit=on",
        "initial": {
          "primary": 101,
          "received": 101,
          "flushed": 101,
          "replayed": 101,
          "ack": "—",
          "read": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ثبت تغییر",
            "wire": "COMMIT 102",
            "why": "primary WAL را محلی پایدار می‌کند.",
            "patch": {
              "primary": 102
            }
          },
          {
            "at": 10,
            "lane": 1,
            "to": 2,
            "name": "دریافت لاگ",
            "wire": "receive 102",
            "why": "دریافت به معنی replay نیست.",
            "patch": {
              "received": 102
            }
          },
          {
            "at": 20,
            "lane": 2,
            "to": 1,
            "name": "flush پایدار",
            "wire": "flush 102",
            "why": "standby تأیید flush می‌دهد.",
            "patch": {
              "flushed": 102
            }
          },
          {
            "at": 20,
            "lane": 1,
            "to": 0,
            "name": "تأیید commit",
            "wire": "ACK",
            "why": "on منتظر replay نیست.",
            "patch": {
              "ack": 20
            }
          },
          {
            "at": 21,
            "lane": 0,
            "to": 2,
            "name": "خواندن فوری",
            "wire": "SELECT",
            "why": "snapshot تازه standby هنوز replay=101 دارد.",
            "patch": {
              "read": "101 (stale)"
            },
            "tone": "error"
          },
          {
            "at": 40,
            "lane": 2,
            "name": "replay",
            "wire": "apply 102",
            "why": "اکنون query تازه می‌تواند تغییر را ببیند.",
            "patch": {
              "replayed": 102
            }
          }
        ],
        "verdict": "دوام روی standby با visibility همان لحظه متفاوت است."
      },
      {
        "id": "apply",
        "label": "synchronous_commit=remote_apply",
        "initial": {
          "primary": 101,
          "received": 101,
          "flushed": 101,
          "replayed": 101,
          "ack": "—",
          "read": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ثبت تغییر",
            "wire": "COMMIT 102",
            "why": "primary WAL محلی را ثبت می‌کند.",
            "patch": {
              "primary": 102
            }
          },
          {
            "at": 10,
            "lane": 1,
            "to": 2,
            "name": "دریافت",
            "wire": "receive 102",
            "why": "standby داده را دریافت کرد.",
            "patch": {
              "received": 102
            }
          },
          {
            "at": 20,
            "lane": 2,
            "to": 1,
            "name": "flush",
            "wire": "flush 102",
            "why": "هنوز تأیید نهایی client ارسال نشده.",
            "patch": {
              "flushed": 102
            }
          },
          {
            "at": 40,
            "lane": 2,
            "to": 1,
            "name": "اعمال WAL",
            "wire": "replay 102",
            "why": "تغییر برای query تازه در standby انتخاب‌شده قابل مشاهده است.",
            "patch": {
              "replayed": 102
            }
          },
          {
            "at": 40,
            "lane": 1,
            "to": 0,
            "name": "تأیید commit",
            "wire": "ACK",
            "why": "در مدل ۲۰ms بیشتر صبر کردیم.",
            "patch": {
              "ack": 40
            }
          },
          {
            "at": 41,
            "lane": 0,
            "to": 2,
            "name": "خواندن تازه",
            "wire": "SELECT",
            "why": "با snapshot تازه و همین standby، نسخه ۱۰۲ خوانده می‌شود.",
            "patch": {
              "read": "102"
            },
            "tone": "success"
          }
        ],
        "verdict": "remote_apply هزینه latency اضافه دارد؛ تضمین شامل standbyهای خارج از سیاست همگام نیست."
      }
    ],
    "diagnose": "pg_stat_replication write_lsn/flush_lsn/replay_lsn و commit latency را مقایسه کنید.",
    "tradeoff": "snapshot قبلی، standby دیگر، خرابی و failover قواعد جدا دارند؛ synchronous replication جای backup نیست.",
    "sources": [
      {
        "label": "PostgreSQL synchronous replication",
        "url": "https://www.postgresql.org/docs/current/warm-standby.html"
      },
      {
        "label": "PostgreSQL synchronous_commit",
        "url": "https://www.postgresql.org/docs/current/runtime-config-wal.html"
      }
    ]
  },
  {
    "slug": "sharding",
    "title": "انتخاب shard key و هزینهٔ fan-out",
    "question": "برای workload سفارش‌های tenant، توزیع متوازن کافی است یا query targeting هم مهم است؟",
    "assumptions": "چهار shard، هشت سفارش، هر tenant چهار سفارش. مدل modulo ساده؛ ابتدا shard با tenant، سپس با order_id. تعداد shardهای تماس‌گرفته و ردیف‌های بررسی‌شده آموزشی‌اند.",
    "lanes": [
      "Router",
      "Shard 0/1",
      "Shard 2/3"
    ],
    "fields": {
      "key": "کلید توزیع",
      "distribution": "توزیع ردیف‌ها",
      "contacts": "shardهای تماس",
      "candidates": "ردیف بررسی‌شده",
      "result": "سفارش‌های tenant 7"
    },
    "code": "# model only\nshard = tenant_id % 4  # targeted tenant query\n# alternative: order_id % 4\nSELECT * FROM orders WHERE tenant_id=7;",
    "cases": [
      {
        "id": "tenant",
        "label": "شارد بر اساس tenant",
        "initial": {
          "key": "tenant_id",
          "distribution": "S0=0 S1=4 S2=0 S3=4",
          "contacts": 0,
          "candidates": 0,
          "result": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "name": "تحلیل query",
            "wire": "tenant=7",
            "why": "کلید شارد در شرط وجود دارد.",
            "patch": {
              "key": "tenant_id"
            }
          },
          {
            "at": 1,
            "lane": 0,
            "name": "محاسبه مسیر",
            "wire": "7 % 4 = 3",
            "why": "تنها S3 مالک tenant=7 است.",
            "patch": {
              "contacts": 1
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 2,
            "name": "خواندن S3",
            "wire": "SELECT tenant7",
            "why": "چهار ردیف همان tenant در این مدل بررسی می‌شوند.",
            "patch": {
              "candidates": 4,
              "result": 4
            }
          },
          {
            "at": 3,
            "lane": 2,
            "to": 0,
            "name": "بازگرداندن نتیجه",
            "wire": "4 rows",
            "why": "fan-out لازم نیست.",
            "patch": {
              "result": 4
            },
            "tone": "success"
          }
        ],
        "verdict": "یک shard؛ اما توزیع داده و بار tenantها ممکن است نامتوازن باشد."
      },
      {
        "id": "order",
        "label": "شارد بر اساس order_id",
        "initial": {
          "key": "order_id",
          "distribution": "S0=2 S1=2 S2=2 S3=2",
          "contacts": 0,
          "candidates": 0,
          "result": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "name": "تحلیل query",
            "wire": "tenant=7",
            "why": "order_id در شرط وجود ندارد.",
            "patch": {
              "key": "order_id"
            }
          },
          {
            "at": 1,
            "lane": 0,
            "name": "انتخاب fan-out",
            "wire": "S0,S1,S2,S3",
            "why": "query باید چهار shard را در مدل بخواند.",
            "patch": {
              "contacts": 4
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 1,
            "name": "پاسخ S0/S1",
            "wire": "2 matches",
            "why": "چهار ردیف بررسی شدند.",
            "patch": {
              "candidates": 4,
              "result": 2
            }
          },
          {
            "at": 3,
            "lane": 0,
            "to": 2,
            "name": "پاسخ S2/S3",
            "wire": "2 matches",
            "why": "چهار ردیف دیگر بررسی شدند.",
            "patch": {
              "candidates": 8,
              "result": 4
            }
          },
          {
            "at": 4,
            "lane": 2,
            "to": 0,
            "name": "ترکیب پاسخ",
            "wire": "merge 4",
            "why": "توزیع متوازن است ولی query fan-out داشت.",
            "patch": {
              "result": 4
            }
          }
        ],
        "verdict": "چهار shard؛ توازن داده لزوماً بهترین هزینه query را نمی‌دهد."
      }
    ],
    "diagnose": "در profiler/query plan تعداد shardهای هدف، skew بار، p95 latency و هزینه resharding را بررسی کنید.",
    "tradeoff": "کلید با cardinality، توزیع بار و query pattern انتخاب می‌شود؛ index محلی می‌تواند شمار ردیف‌های بررسی‌شده را تغییر دهد.",
    "sources": [
      {
        "label": "MongoDB choose shard key",
        "url": "https://www.mongodb.com/docs/manual/core/sharding-choose-a-shard-key/"
      },
      {
        "label": "MongoDB sharding",
        "url": "https://www.mongodb.com/docs/manual/sharding/"
      }
    ]
  }
];
