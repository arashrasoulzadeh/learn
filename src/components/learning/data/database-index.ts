import type {BackendLesson} from '../backend/types';
const lesson = {
  "slug": "database-index",
  "title": "Database Index — یافتن داده با هزینهٔ کمتر",
  "description": "اسکن، جست‌وجوی ایندکس و هزینهٔ نگهداری آن را مقایسه کنید.",
  "order": 22,
  "actors": [
    {
      "label": "پرس‌وجو",
      "sub": "Query",
      "icon": "app"
    },
    {
      "label": "ایندکس",
      "sub": "Index entries",
      "icon": "memory"
    },
    {
      "label": "جدول",
      "sub": "Table rows",
      "icon": "db"
    }
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
  "visual": {
    "title": "مسیر خواندن و تعداد رکوردهای نمونه",
    "labels": [
      "عملیات",
      "ایندکس",
      "جدول / هزینهٔ مدل"
    ],
    "context": "این شمارش فقط مدل مفهومی یک جدول کوچک است؛ هزینهٔ واقعی تابع صفحات، cache، selectivity و planner است."
  },
  "teaching": {
    "goal": "فهمید کدام query از ایندکس سود می‌برد و چرا هر ایندکس هزینهٔ نوشتن دارد.",
    "terms": [
      [
        "Index",
        "ساختار کمکی برای یافتن ردیف‌ها."
      ],
      [
        "Sequential scan",
        "خواندن جدول بدون مسیر جست‌وجوی ایندکس."
      ],
      [
        "Selectivity",
        "سهم ردیف‌هایی که شرط را برآورده می‌کنند."
      ],
      [
        "Query plan",
        "راهبرد انتخاب‌شده برای اجرای پرس‌وجو."
      ]
    ],
    "practice": {
      "question": "جدول بزرگی تقریباً هر روز خوانده می‌شود و WHERE email=... فقط یک ردیف می‌خواهد. کدام اقدام را ابتدا بررسی می‌کنید؟",
      "options": [
        "ایندکس مناسب email و EXPLAIN",
        "ایندکس همهٔ ستون‌ها بدون بررسی",
        "حذف همهٔ ایندکس‌ها"
      ],
      "correct": 0,
      "explanation": "جست‌وجوی انتخابی می‌تواند از ایندکس سود ببرد؛ با برنامهٔ اجرا و اندازه‌گیری بررسی کنید.",
      "hint": "شرط انتخابی و الگوی خواندن را بررسی کنید."
    }
  },
  "scenarios": [
    {
      "id": "scan",
      "label": "خواندن بدون ایندکس مناسب",
      "example": "WHERE sku='D'",
      "prediction": "بدون مسیر جست‌وجوی مناسب، سیستم چگونه D را می‌یابد؟",
      "steps": [
        {
          "name": "آغاز پرس‌وجو",
          "short": "درخواست",
          "detail": "جدول نمونه ۵ ردیف دارد و ایندکس sku ندارد.",
          "route": [
            0
          ],
          "packet": "SQL",
          "input": "SELECT * FROM products WHERE sku='D';",
          "output": "No usable sku index",
          "result": "مسیر اسکن انتخاب شده است.",
          "explanation": "در جدول بزرگ نیز planner ممکن است اسکن را انتخاب کند؛ این مثال پنج ردیف را بررسی می‌کند.",
          "state": [
            "sku=D",
            "No sku index",
            "A | B | C | D | E"
          ]
        },
        {
          "name": "اسکن ردیف‌ها",
          "short": "اسکن",
          "detail": "ردیف‌ها برای شرط بررسی می‌شوند.",
          "route": [
            0,
            2
          ],
          "packet": "SCAN",
          "input": "check A,B,C,D,E",
          "output": "5 rows examined (model)",
          "result": "ردیف D پیدا شد.",
          "explanation": "برای SELECT بدون LIMIT باید موارد دیگر نیز بررسی شوند؛ تعداد صفحات واقعی متفاوت است.",
          "state": [
            "Scan",
            "—",
            "5 examined | D matched"
          ]
        },
        {
          "name": "تحویل ردیف",
          "short": "نتیجه",
          "detail": "ردیف مطابق به برنامه بازمی‌گردد.",
          "route": [
            2,
            0
          ],
          "packet": "ROW",
          "input": "sku=D",
          "output": "D returned",
          "result": "پاسخ کامل شد.",
          "explanation": "ایندکس نتیجهٔ منطقی را عوض نمی‌کند؛ مسیر اجرا را تغییر می‌دهد.",
          "state": [
            "Done",
            "—",
            "D"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "lookup",
      "label": "جست‌وجو با ایندکس",
      "example": "CREATE INDEX idx_sku ON products(sku)",
      "prediction": "ایندکس چگونه ردیف D را بدون اسکن کل جدول مشخص می‌کند؟",
      "steps": [
        {
          "name": "ساخت ایندکس",
          "short": "ایندکس",
          "detail": "نگاشت مرتب sku به مکان ردیف ساخته می‌شود.",
          "route": [
            1,
            2
          ],
          "packet": "BUILD",
          "input": "CREATE INDEX idx_sku ON products(sku);",
          "output": "A→r1 B→r2 C→r3 D→r4 E→r5",
          "result": "ایندکس آماده شد.",
          "explanation": "ساخت ایندکس خود هزینه و فضای ذخیره‌سازی دارد.",
          "state": [
            "Build",
            "A→r1 | B→r2 | C→r3 | D→r4 | E→r5",
            "5 rows"
          ]
        },
        {
          "name": "جست‌وجوی کلید",
          "short": "جست‌وجو",
          "detail": "planner در این مثال ایندکس را انتخاب می‌کند و مکان D را پیدا می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "SEEK",
          "input": "WHERE sku='D'",
          "output": "index pointer r4",
          "result": "مسیر مستقیم ردیف مشخص شد.",
          "explanation": "ایندکس واقعی ممکن است چند صفحه را بخواند؛ این مدل هزینهٔ صفحه را ساده کرده است.",
          "state": [
            "sku=D",
            "D→r4",
            "Not fetched yet"
          ]
        },
        {
          "name": "دریافت ردیف",
          "short": "نتیجه",
          "detail": "ردیف r4 از جدول خوانده و نتیجه بازگردانده می‌شود.",
          "route": [
            1,
            2,
            0
          ],
          "packet": "ROW",
          "input": "fetch r4",
          "output": "D returned; 1 heap row (model)",
          "result": "خواندن انتخابی انجام شد.",
          "explanation": "در برخی شرایط index-only scan ممکن است نیازی به خواندن خود ردیف نداشته باشد.",
          "state": [
            "Done",
            "D→r4",
            "1 row fetched"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "write-cost",
      "label": "هزینهٔ نوشتن و ایندکس",
      "example": "INSERT F",
      "prediction": "هنگام درج F، فقط جدول تغییر می‌کند یا ایندکس هم؟",
      "steps": [
        {
          "name": "درخواست درج",
          "short": "درخواست",
          "detail": "برنامه محصول تازه را ثبت می‌کند.",
          "route": [
            0,
            2
          ],
          "packet": "INSERT",
          "input": "INSERT INTO products(sku) VALUES('F');",
          "output": "Row r6 inserted in transaction",
          "result": "ردیف جدید در عملیات درج قرار دارد.",
          "explanation": "این دو مرحله بخشی از یک عملیات تراکنشی‌اند، نه وضعیت نیمه‌کارهٔ قابل مشاهده برای همه.",
          "state": [
            "INSERT F",
            "A…E",
            "r6: F"
          ]
        },
        {
          "name": "نگهداری ایندکس",
          "short": "به‌روزرسانی",
          "detail": "ورودی F در ایندکس نگهداری می‌شود.",
          "route": [
            2,
            1
          ],
          "packet": "INDEX",
          "input": "add F→r6",
          "output": "Index maintained",
          "result": "نوشتن کار اضافی داشت.",
          "explanation": "هر ایندکس مرتبط می‌تواند هزینهٔ CPU، I/O و فضا داشته باشد.",
          "state": [
            "Write",
            "F→r6",
            "r6: F"
          ]
        },
        {
          "name": "انتخاب سنجیده",
          "short": "نتیجه",
          "detail": "تراکنش ثبت می‌شود و جست‌وجوی F امکان‌پذیر است.",
          "route": [
            2,
            0
          ],
          "packet": "DONE",
          "input": "COMMIT",
          "output": "Row and index consistent",
          "result": "ایندکس و داده هماهنگ‌اند.",
          "explanation": "اگر شرط بخش بزرگی از جدول را بخواهد، planner شاید اسکن را ارزان‌تر بداند.",
          "state": [
            "COMMIT",
            "F→r6",
            "6 rows"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "ایندکس رایگان نیست؛ در workload نوشتنی زیاد باید هزینه سنجیده شود."
    }
  ],
  "pitfall": "وجود ایندکس استفاده از آن را تضمین نمی‌کند؛ تعداد ردیف‌های بررسی‌شده در مدل معادل I/O واقعی نیست.",
  "takeaway": "ایندکس را با query واقعی، EXPLAIN و هزینهٔ نوشتن ارزیابی کنید.",
  "quiz": {
    "question": "ایندکس اضافه معمولاً چه هزینه‌ای دارد؟",
    "options": [
      "نگهداری هنگام نوشتن و فضا",
      "حذف نیاز به تراکنش",
      "تغییر نتیجهٔ SQL"
    ],
    "correct": 0,
    "explanation": "ایندکس ساختار کمکی است که باید با داده هماهنگ شود."
  },
  "references": [
    {
      "label": "PostgreSQL — Indexes",
      "url": "https://www.postgresql.org/docs/current/indexes.html"
    },
    {
      "label": "SQLite — Query planner",
      "url": "https://www.sqlite.org/queryplanner.html"
    }
  ],
  "field": {
    "task": "در SQLite برنامهٔ اجرای یک query را قبل و بعد از ایندکس مقایسه کنید.",
    "observe": "در این مثال معمولاً SCAN به SEARCH USING INDEX تغییر می‌کند.",
    "limit": "برنامهٔ واقعی با داده، آمار و نسخه تغییر می‌کند؛ عملکرد را با همین جدول کوچک نتیجه‌گیری نکنید.",
    "command": "import sqlite3\nc=sqlite3.connect(':memory:')\nc.execute('CREATE TABLE p(sku TEXT, name TEXT)')\nq=\"EXPLAIN QUERY PLAN SELECT * FROM p WHERE sku='D'\"\nprint(c.execute(q).fetchall())\nc.execute('CREATE INDEX idx_sku ON p(sku)')\nprint(c.execute(q).fetchall())",
    "next": {
      "slug": "b-tree",
      "label": "B-Tree",
      "category": "databases"
    }
  },
  "model": "database"
} satisfies BackendLesson;
export default lesson;
