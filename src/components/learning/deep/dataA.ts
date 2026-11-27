import type {DeepLesson} from './types';
export const dataA = [
  {
    "slug": "sql-nosql",
    "title": "مدل داده بر اساس invariant و هزینهٔ نوشتن",
    "question": "نام جاری مشتری را در هزار سفارش چگونه سازگار نگه داریم؟",
    "assumptions": "نمونهٔ سه سفارش به مشتری 7؛ هدف نمایش نام جاری، نه نام تاریخی سفارش. تعداد نوشتن‌ها مدل منطقی است.",
    "lanes": [
      "App",
      "Customer",
      "Orders"
    ],
    "fields": {
      "source": "نام مرجع",
      "o1": "سفارش ۱",
      "o2": "سفارش ۲",
      "o3": "سفارش ۳",
      "writes": "نوشتن‌های منطقی"
    },
    "code": "-- normalized reference\nSELECT o.id,c.name FROM orders o\nJOIN customers c ON c.id=o.customer_id;\n-- embedded current name needs explicit update policy",
    "cases": [
      {
        "id": "reference",
        "label": "ارجاع به مشتری",
        "initial": {
          "source": "Sara",
          "o1": "ref 7",
          "o2": "ref 7",
          "o3": "ref 7",
          "writes": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "خواندن نام",
            "wire": "customer 7",
            "why": "نام از مرجع خوانده می‌شود.",
            "patch": {
              "source": "Sara"
            }
          },
          {
            "at": 1,
            "lane": 0,
            "to": 1,
            "name": "ویرایش نام",
            "wire": "UPDATE customer",
            "why": "نام جاری یک بار تغییر می‌کند.",
            "patch": {
              "source": "Sam",
              "writes": 1
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 2,
            "name": "خواندن سفارش ۱",
            "wire": "JOIN",
            "why": "ارجاع 7 نام تازه را می‌دهد.",
            "patch": {
              "o1": "ref 7 → Sam"
            }
          },
          {
            "at": 3,
            "lane": 0,
            "to": 2,
            "name": "خواندن سایر سفارش‌ها",
            "wire": "JOIN",
            "why": "همه از مرجع جاری خوانده می‌شوند.",
            "patch": {
              "o2": "ref 7 → Sam",
              "o3": "ref 7 → Sam"
            },
            "tone": "success"
          }
        ],
        "verdict": "یک نوشتن منطقی؛ خواندن نام جاری نیاز به lookup/join دارد."
      },
      {
        "id": "embedded",
        "label": "نام تکراری بدون تراکنش جمعی",
        "initial": {
          "source": "Sara",
          "o1": "Sara",
          "o2": "Sara",
          "o3": "Sara",
          "writes": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ویرایش مرجع",
            "wire": "UPDATE",
            "why": "نام تازه ثبت می‌شود.",
            "patch": {
              "source": "Sam",
              "writes": 1
            }
          },
          {
            "at": 1,
            "lane": 0,
            "to": 2,
            "name": "به‌روزرسانی کپی ۱",
            "wire": "UPDATE order1",
            "why": "یک سند به‌روز شد.",
            "patch": {
              "o1": "Sam",
              "writes": 2
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 2,
            "name": "به‌روزرسانی کپی ۲",
            "wire": "UPDATE order2",
            "why": "سند دوم تغییر کرد.",
            "patch": {
              "o2": "Sam",
              "writes": 3
            }
          },
          {
            "at": 3,
            "lane": 0,
            "name": "خرابی میانی",
            "wire": "Process failure",
            "why": "سند سوم هنوز نام قدیمی دارد.",
            "patch": {
              "o3": "Sara (stale)"
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 0,
            "to": 2,
            "name": "خواندن گزارش",
            "wire": "Mixed names",
            "why": "نام جاری سازگار نیست؛ بازیابی لازم است.",
            "patch": {
              "writes": 3
            },
            "tone": "error"
          }
        ],
        "verdict": "تکرار داده هزینه هماهنگی دارد؛ snapshot تاریخی اگر عمدی باشد مسئله دیگری است."
      }
    ],
    "diagnose": "query pattern، cardinality، write amplification، constraints و schema evolution را بررسی کنید.",
    "tradeoff": "MongoDB هم references و multi-document transaction دارد؛ SQL هم JSON دارد. انتخاب بر اساس نیاز است.",
    "sources": [
      {
        "label": "MongoDB references",
        "url": "https://www.mongodb.com/docs/manual/data-modeling/referencing/"
      },
      {
        "label": "PostgreSQL constraints",
        "url": "https://www.postgresql.org/docs/current/ddl-constraints.html"
      }
    ]
  },
  {
    "slug": "database-index",
    "title": "ایندکس مرکب و انتخاب‌پذیری",
    "question": "برای WHERE tenant=7 AND created_at>=... ترتیب ستون‌ها چه اثری دارد؟",
    "assumptions": "مدل سادهٔ ۱۰۰۰ ردیف، ده tenant برابر، ۲۰ ردیف recent در هر tenant. شمارش candidate آموزشی است نه planner واقعی؛ پوشش visibility/skip scan فرض نشده.",
    "lanes": [
      "Query",
      "Index",
      "Table"
    ],
    "fields": {
      "index": "ایندکس",
      "range": "بازه بررسی",
      "candidates": "ورودی کاندید",
      "matches": "نتیجه",
      "sort": "ترتیب"
    },
    "code": "CREATE INDEX ix ON orders(tenant_id, created_at);\nSELECT * FROM orders\nWHERE tenant_id=7 AND created_at >= :t\nORDER BY created_at;\nEXPLAIN (ANALYZE, BUFFERS) SELECT ...;",
    "cases": [
      {
        "id": "tenant-first",
        "label": "(tenant_id, created_at)",
        "initial": {
          "index": "tenant,date",
          "range": "—",
          "candidates": 0,
          "matches": 0,
          "sort": "Pending"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "تحلیل شرط",
            "wire": "tenant=7",
            "why": "برابری ستون اول بازه را محدود می‌کند.",
            "patch": {
              "range": "tenant 7"
            }
          },
          {
            "at": 1,
            "lane": 0,
            "to": 1,
            "name": "شروع بازه زمان",
            "wire": "date >= t",
            "why": "در مدل، محدودهٔ اخیر همان tenant مشخص می‌شود.",
            "patch": {
              "range": "tenant 7 / recent",
              "candidates": 20
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 2,
            "name": "واکشی ردیف‌ها",
            "wire": "20 candidates",
            "why": "همه در این نمونه مطابق‌اند.",
            "patch": {
              "matches": 20
            }
          },
          {
            "at": 3,
            "lane": 1,
            "to": 0,
            "name": "خروجی مرتب",
            "wire": "20 rows",
            "why": "ترتیب ایندکس برای این شرط با ORDER BY سازگار است.",
            "patch": {
              "sort": "Index order"
            },
            "tone": "success"
          }
        ],
        "verdict": "۲۰ ورودی کاندید در مدل؛ ترتیب ستون با الگوی query سازگار است."
      },
      {
        "id": "date-first",
        "label": "(created_at, tenant_id)",
        "initial": {
          "index": "date,tenant",
          "range": "—",
          "candidates": 0,
          "matches": 0,
          "sort": "Pending"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "شروع بازه زمان",
            "wire": "date >= t",
            "why": "بازه اخیر شامل ده tenant است.",
            "patch": {
              "range": "All recent"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "name": "پیمایش بازه",
            "wire": "200 candidates",
            "why": "در مدل ساده ۲۰۰ ورودی باید بررسی شوند.",
            "patch": {
              "candidates": 200
            }
          },
          {
            "at": 2,
            "lane": 1,
            "name": "فیلتر tenant",
            "wire": "tenant=7",
            "why": "۱۸۰ مورد دیگر رد می‌شوند.",
            "patch": {
              "matches": 20
            }
          },
          {
            "at": 3,
            "lane": 1,
            "to": 2,
            "name": "واکشی و نتیجه",
            "wire": "20 rows",
            "why": "اگر plan مناسب باشد ترتیب تاریخ حفظ می‌شود.",
            "patch": {
              "sort": "Index order"
            }
          }
        ],
        "verdict": "در این مدل بازه بزرگ‌تر بررسی شد؛ موتور واقعی ممکن است skip scan یا plan دیگری انتخاب کند."
      }
    ],
    "diagnose": "EXPLAIN (ANALYZE, BUFFERS) را روی SELECT آزمایشی، آمار واقعی و workload مقایسه کنید.",
    "tradeoff": "ایندکس چندستونه به همه queryها کمک نمی‌کند؛ write cost و اندازه را بسنجید.",
    "sources": [
      {
        "label": "PostgreSQL multicolumn indexes",
        "url": "https://www.postgresql.org/docs/current/indexes-multicolumn.html"
      },
      {
        "label": "PostgreSQL EXPLAIN",
        "url": "https://www.postgresql.org/docs/current/using-explain.html"
      }
    ]
  },
  {
    "slug": "b-tree",
    "title": "Page split و رشد ارتفاع در B+ tree",
    "question": "با اضافه کردن کلید در برگ پر، مسیر جست‌وجو چگونه تغییر می‌کند؟",
    "assumptions": "B+ tree آموزشی با گنجایش ۳ کلید در برگ؛ کلید یکتا و split متوازن. نه فرمت واقعی صفحه، نه WAL واقعی.",
    "lanes": [
      "Root",
      "Leaf L",
      "Leaf R"
    ],
    "fields": {
      "root": "جداکننده ریشه",
      "left": "برگ چپ",
      "right": "برگ راست",
      "pages": "صفحات مدل",
      "writes": "تغییر صفحه"
    },
    "code": "insert 25 into [10,20,30]\n# conceptual split: [10,20] | [25,30]\n# parent separator: 25",
    "cases": [
      {
        "id": "room",
        "label": "درج در برگ دارای فضا",
        "initial": {
          "root": "sep=30",
          "left": "10",
          "right": "30,40",
          "pages": 3,
          "writes": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "انتخاب برگ",
            "wire": "25 < 30",
            "why": "کلید به برگ چپ می‌رود.",
            "patch": {
              "root": "sep=30"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "name": "بررسی ظرفیت",
            "wire": "1/3",
            "why": "برگ جا دارد.",
            "patch": {
              "left": "10"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "name": "درج مرتب",
            "wire": "insert 25",
            "why": "کلید در جای مرتب اضافه شد.",
            "patch": {
              "left": "10,25",
              "writes": 1
            }
          },
          {
            "at": 3,
            "lane": 1,
            "to": 0,
            "name": "نتیجه",
            "wire": "No split",
            "why": "ریشه تغییر نکرد.",
            "patch": {
              "pages": 3
            },
            "tone": "success"
          }
        ],
        "verdict": "در مدل فقط یک برگ تغییر کرد."
      },
      {
        "id": "split",
        "label": "درج در ریشهٔ برگ پر",
        "initial": {
          "root": "Leaf [10,20,30]",
          "left": "—",
          "right": "—",
          "pages": 1,
          "writes": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "name": "بررسی ظرفیت",
            "wire": "3/3",
            "why": "درج کلید چهارم جا ندارد.",
            "patch": {
              "root": "FULL"
            }
          },
          {
            "at": 1,
            "lane": 0,
            "to": 1,
            "name": "تخصیص برگ چپ",
            "wire": "10,20",
            "why": "تقسیم مفهومی کلیدهای مرتب.",
            "patch": {
              "left": "10,20",
              "pages": 2,
              "writes": 1
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 2,
            "name": "تخصیص برگ راست",
            "wire": "25,30",
            "why": "نیمه بالایی در برگ راست قرار دارد.",
            "patch": {
              "right": "25,30",
              "pages": 3,
              "writes": 2
            }
          },
          {
            "at": 3,
            "lane": 0,
            "name": "ساخت جداکننده",
            "wire": "sep=25",
            "why": "ریشه مسیر فرزندان را مشخص می‌کند.",
            "patch": {
              "root": "sep=25",
              "writes": 3
            }
          },
          {
            "at": 4,
            "lane": 0,
            "to": 2,
            "name": "اعتبارسنجی مسیر",
            "wire": "seek 25",
            "why": "۲۵ به برگ راست می‌رود.",
            "patch": {
              "right": "25 ✓,30"
            },
            "tone": "success"
          }
        ],
        "verdict": "split باعث تغییر چند صفحه و رشد ارتفاع شد؛ این تعداد I/O واقعی نیست."
      }
    ],
    "diagnose": "با آمار اندازه ایندکس، page utilization و EXPLAIN بررسی کنید؛ برای مشاهده واقعی page layout ابزار موتور لازم است.",
    "tradeoff": "split، fillfactor، deduplication، WAL و concurrency وابسته به موتورند.",
    "sources": [
      {
        "label": "PostgreSQL B-tree implementation",
        "url": "https://www.postgresql.org/docs/current/btree.html"
      },
      {
        "label": "SQLite file format",
        "url": "https://www.sqlite.org/fileformat2.html"
      }
    ]
  },
  {
    "slug": "transactions-acid",
    "title": "Write skew و isolation serializable",
    "question": "آیا دو تراکنش که ردیف‌های متفاوت را تغییر می‌دهند همیشه invariant را حفظ می‌کنند؟",
    "assumptions": "مدل پزشک کشیک؛ حداقل یک پزشک باید on-call باشد. PostgreSQL Repeatable Read (snapshot isolation) در برابر Serializable؛ هر دو ابتدا snapshot مشترک می‌خوانند.",
    "lanes": [
      "Tx A",
      "DB / snapshot",
      "Tx B"
    ],
    "fields": {
      "a": "دید A",
      "b": "دید B",
      "committed": "وضعیت ثبت‌شده",
      "total": "تعداد on-call",
      "result": "نتیجه B"
    },
    "code": "-- invariant: at least one doctor on call\nBEGIN ISOLATION LEVEL SERIALIZABLE;\nSELECT count(*) FROM doctors WHERE on_call;\n-- if count > 1, set own row off call\nCOMMIT; -- retry entire tx on SQLSTATE 40001",
    "cases": [
      {
        "id": "snapshot",
        "label": "Repeatable Read",
        "initial": {
          "a": "—",
          "b": "—",
          "committed": "A:on B:on",
          "total": 2,
          "result": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "خواندن A",
            "wire": "count=2",
            "why": "A بر snapshot تصمیم می‌گیرد.",
            "patch": {
              "a": "2 on-call"
            }
          },
          {
            "at": 1,
            "lane": 2,
            "to": 1,
            "name": "خواندن B",
            "wire": "count=2",
            "why": "B هم همان وضعیت را می‌بیند.",
            "patch": {
              "b": "2 on-call"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 1,
            "name": "تغییر ردیف A",
            "wire": "A off",
            "why": "دو تراکنش روی ردیف متفاوت می‌نویسند.",
            "patch": {
              "a": "A off pending"
            }
          },
          {
            "at": 3,
            "lane": 2,
            "to": 1,
            "name": "تغییر ردیف B",
            "wire": "B off",
            "why": "B بر اساس snapshot قبلی تصمیم می‌گیرد.",
            "patch": {
              "b": "B off pending"
            }
          },
          {
            "at": 4,
            "lane": 0,
            "to": 1,
            "name": "ثبت A",
            "wire": "COMMIT A",
            "why": "A خاموش شد.",
            "patch": {
              "committed": "A:off B:on",
              "total": 1
            }
          },
          {
            "at": 5,
            "lane": 2,
            "to": 1,
            "name": "ثبت B",
            "wire": "COMMIT B",
            "why": "در این schedule snapshot isolation مانع write skew نشده.",
            "patch": {
              "committed": "A:off B:off",
              "total": 0,
              "result": "Committed"
            },
            "tone": "error"
          }
        ],
        "verdict": "دو ردیف متفاوت تغییر کردند اما invariant شکسته شد."
      },
      {
        "id": "serializable",
        "label": "Serializable + retry",
        "initial": {
          "a": "—",
          "b": "—",
          "committed": "A:on B:on",
          "total": 2,
          "result": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "خواندن A",
            "wire": "count=2",
            "why": "تصمیم به snapshot وابسته است.",
            "patch": {
              "a": "2 on-call"
            }
          },
          {
            "at": 1,
            "lane": 2,
            "to": 1,
            "name": "خواندن B",
            "wire": "count=2",
            "why": "وابستگی خواندن-نوشتن متقاطع ایجاد می‌شود.",
            "patch": {
              "b": "2 on-call"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 1,
            "name": "نوشتن A",
            "wire": "A off",
            "why": "تراکنش A تغییر می‌دهد.",
            "patch": {
              "a": "A off pending"
            }
          },
          {
            "at": 3,
            "lane": 2,
            "to": 1,
            "name": "نوشتن B",
            "wire": "B off",
            "why": "تراکنش B نیز تلاش می‌کند.",
            "patch": {
              "b": "B off pending"
            }
          },
          {
            "at": 4,
            "lane": 0,
            "to": 1,
            "name": "ثبت یکی",
            "wire": "COMMIT A",
            "why": "در این trace A ثبت می‌شود؛ انتخاب واقعی قربانی قطعی نیست.",
            "patch": {
              "committed": "A:off B:on",
              "total": 1
            }
          },
          {
            "at": 5,
            "lane": 1,
            "to": 2,
            "name": "رد تراکنش ناسازگار",
            "wire": "40001",
            "why": "یکی از تراکنش‌ها باید rollback شود.",
            "patch": {
              "b": "Rollback",
              "result": "Serialization failure"
            },
            "tone": "error"
          },
          {
            "at": 6,
            "lane": 2,
            "to": 1,
            "name": "retry و ارزیابی مجدد",
            "wire": "count=1",
            "why": "B دوباره شرط را بررسی می‌کند و خاموش نمی‌شود.",
            "patch": {
              "b": "1 on-call; no update",
              "result": "Invariant preserved"
            },
            "tone": "success"
          }
        ],
        "verdict": "Serializable با abort/retry می‌تواند از نتیجهٔ غیرقابل سری‌سازی جلوگیری کند."
      }
    ],
    "diagnose": "در دو اتصال PostgreSQL آزمایشی schedule را بازسازی و SQLSTATE 40001 را بررسی کنید.",
    "tradeoff": "Serializable رایگان نیست؛ retry باید کل تراکنش را تکرار کند و اثر خارجی idempotent باشد.",
    "sources": [
      {
        "label": "PostgreSQL transaction isolation",
        "url": "https://www.postgresql.org/docs/current/transaction-iso.html"
      },
      {
        "label": "PostgreSQL serialization failure handling",
        "url": "https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html"
      }
    ]
  },
  {
    "slug": "database-locking",
    "title": "Lock timeout در مقابل deadlock",
    "question": "آیا هر انتظار طولانی یک بن‌بست است؟",
    "assumptions": "دو تراکنش PostgreSQL نمونه؛ زمان منطقی، lock_timeout فرضی. خطای 55P03 برای lock_not_available و 40P01 برای deadlock.",
    "lanes": [
      "Tx A",
      "Lock manager",
      "Tx B"
    ],
    "fields": {
      "x": "مالک X",
      "y": "مالک Y",
      "wait": "گراف انتظار",
      "a": "وضعیت A",
      "b": "وضعیت B"
    },
    "code": "SET LOCAL lock_timeout='2s';\nSELECT * FROM demo WHERE id=1 FOR UPDATE;\n-- on error: ROLLBACK; decide bounded retry",
    "cases": [
      {
        "id": "timeout",
        "label": "انتظار بدون چرخه",
        "initial": {
          "x": "Free",
          "y": "Free",
          "wait": "—",
          "a": "Ready",
          "b": "Ready"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "A قفل X",
            "wire": "LOCK X",
            "why": "A مالک X است.",
            "patch": {
              "x": "A",
              "a": "Holding"
            }
          },
          {
            "at": 1,
            "lane": 2,
            "to": 1,
            "name": "B درخواست X",
            "wire": "WAIT",
            "why": "تنها یال B→A.",
            "patch": {
              "wait": "B→A",
              "b": "Waiting"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "name": "A هنوز فعال",
            "wire": "Work",
            "why": "هیچ وابستگی A به B وجود ندارد.",
            "patch": {
              "a": "Holding"
            }
          },
          {
            "at": 3,
            "lane": 1,
            "to": 2,
            "name": "پایان مهلت B",
            "wire": "55P03",
            "why": "lock_timeout انتظار B را قطع می‌کند.",
            "patch": {
              "b": "Failed",
              "wait": "—"
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 2,
            "name": "پاک‌سازی",
            "wire": "ROLLBACK",
            "why": "A هنوز می‌تواند کارش را انجام دهد.",
            "patch": {
              "b": "Rolled back"
            }
          }
        ],
        "verdict": "انتظار بدون چرخه هم timeout می‌شود؛ این deadlock نیست."
      },
      {
        "id": "cycle",
        "label": "چرخهٔ انتظار",
        "initial": {
          "x": "Free",
          "y": "Free",
          "wait": "—",
          "a": "Ready",
          "b": "Ready"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "A قفل X",
            "wire": "LOCK X",
            "why": "A مالک X است.",
            "patch": {
              "x": "A",
              "a": "Holding X"
            }
          },
          {
            "at": 1,
            "lane": 2,
            "to": 1,
            "name": "B قفل Y",
            "wire": "LOCK Y",
            "why": "B مالک Y است.",
            "patch": {
              "y": "B",
              "b": "Holding Y"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 1,
            "name": "A درخواست Y",
            "wire": "WAIT",
            "why": "A منتظر B شد.",
            "patch": {
              "wait": "A→B",
              "a": "Waiting Y"
            }
          },
          {
            "at": 3,
            "lane": 2,
            "to": 1,
            "name": "B درخواست X",
            "wire": "WAIT",
            "why": "چرخه A→B→A ایجاد شد.",
            "patch": {
              "wait": "A→B→A",
              "b": "Waiting X"
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 1,
            "to": 2,
            "name": "شکستن چرخه",
            "wire": "40P01 (B victim)",
            "why": "نمونه فرض می‌کند detector قبل از timeout عمل می‌کند و B قربانی است.",
            "patch": {
              "y": "Free",
              "b": "Rolled back",
              "wait": "—"
            },
            "tone": "error"
          },
          {
            "at": 5,
            "lane": 1,
            "to": 0,
            "name": "ادامه A",
            "wire": "GRANT Y",
            "why": "قفل Y آزاد شده و A پیش می‌رود.",
            "patch": {
              "y": "A",
              "a": "Holding X,Y"
            },
            "tone": "success"
          }
        ],
        "verdict": "deadlock چرخه دارد؛ timeout می‌تواند پیش از detector رخ دهد."
      }
    ],
    "diagnose": "pg_stat_activity.wait_event، pg_locks و pg_blocking_pids را با SQLSTATE در محیط آزمایشی تطبیق دهید.",
    "tradeoff": "ترتیب ثابت قفل‌گیری، تراکنش کوتاه و retry محدود کمک می‌کنند؛ افزایش timeout درمان چرخه نیست.",
    "sources": [
      {
        "label": "PostgreSQL explicit locking",
        "url": "https://www.postgresql.org/docs/current/explicit-locking.html"
      },
      {
        "label": "PostgreSQL error codes",
        "url": "https://www.postgresql.org/docs/current/errcodes-appendix.html"
      }
    ]
  }
] satisfies DeepLesson[];
