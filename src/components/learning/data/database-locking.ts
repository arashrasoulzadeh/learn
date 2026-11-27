import type {BackendLesson} from '../backend/types';
const lesson = {
  "slug": "database-locking",
  "title": "Database Locking — انتظار و بن‌بست",
  "description": "تداخل دو تراکنش، قفل ردیف، انتظار، deadlock و راهبرد retry را در مدل PostgreSQL دنبال کنید.",
  "order": 25,
  "actors": [
    {
      "label": "مدیر قفل",
      "sub": "Lock manager",
      "icon": "shield"
    },
    {
      "label": "تراکنش A",
      "sub": "Transaction A",
      "icon": "app"
    },
    {
      "label": "تراکنش B",
      "sub": "Transaction B",
      "icon": "app"
    }
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
  "visual": {
    "title": "مالک قفل و گراف انتظار",
    "labels": [
      "قفل‌ها / انتظار",
      "تراکنش A",
      "تراکنش B"
    ],
    "context": "قفل انحصاری ردیف در این مدل با نوشتن/قفل ناسازگار دیگر تعارض دارد؛ خواندن عادی MVCC الزاماً مسدود نمی‌شود."
  },
  "teaching": {
    "goal": "تفاوت انتظار عادی و چرخهٔ بن‌بست را تشخیص دهید و اثر ترتیب ثابت قفل‌گیری را توضیح دهید.",
    "terms": [
      [
        "Row lock",
        "قفل مرتبط با ردیف و عملیات ناسازگار."
      ],
      [
        "Wait-for graph",
        "یال از تراکنش منتظر به مالک منبع."
      ],
      [
        "Deadlock",
        "چرخهٔ انتظار متقابل که بدون مداخله پیشرفت ندارد."
      ],
      [
        "Retry",
        "اجرای دوبارهٔ تراکنش پس از rollback و با سیاست محدود."
      ]
    ],
    "practice": {
      "question": "A قفل X و B قفل Y را دارد. A منتظر Y و B منتظر X است. چه وضعیتی داریم؟",
      "options": [
        "cache hit",
        "بن‌بست؛ باید چرخه شکسته شود",
        "صرفاً افزایش سرعت"
      ],
      "correct": 1,
      "explanation": "هر کدام منتظر منبعی است که دیگری نگه داشته؛ چرخهٔ انتظار باید با abort یک تراکنش یا سیاست دیگری شکسته شود.",
      "hint": "به چرخهٔ انتظار دقت کنید."
    }
  },
  "scenarios": [
    {
      "id": "wait",
      "label": "انتظار برای قفل یک ردیف",
      "example": "A locks X; B waits",
      "prediction": "بعد از commit شدن A، آیا B می‌تواند قفل X را بگیرد؟",
      "steps": [
        {
          "name": "گرفتن قفل X",
          "short": "قفل A",
          "detail": "A ردیف X را با SELECT FOR UPDATE قفل می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "LOCK",
          "input": "T1: SELECT * FROM t WHERE id='X' FOR UPDATE;",
          "output": "X owner=A",
          "result": "قفل به A تعلق دارد.",
          "explanation": "تا پایان تراکنش قفل مرتبط حفظ می‌شود.",
          "state": [
            "X→A",
            "Holding X",
            "Ready"
          ]
        },
        {
          "name": "درخواست ناسازگار",
          "short": "انتظار B",
          "detail": "B همان ردیف را برای نوشتن قفل می‌خواهد.",
          "route": [
            2,
            0
          ],
          "packet": "WAIT",
          "input": "T2: SELECT ... FOR UPDATE",
          "output": "B waits for A",
          "result": "هنوز چرخه‌ای وجود ندارد.",
          "explanation": "B انتظار دارد؛ A منتظر B نیست. timeout ممکن است جداگانه تنظیم شود.",
          "state": [
            "X→A | WAIT B→A",
            "Holding X",
            "Waiting"
          ]
        },
        {
          "name": "آزادسازی و واگذاری",
          "short": "آزادسازی",
          "detail": "A commit می‌کند و B پس از آزاد شدن قفل پیشرفت می‌کند.",
          "route": [
            1,
            0,
            2
          ],
          "packet": "GRANT",
          "input": "T1 COMMIT",
          "output": "X owner=B",
          "result": "انتظار عادی پایان یافت.",
          "explanation": "در نمونهٔ واقعی B باید نتیجهٔ خواندن و شرایط تغییر را دوباره مطابق سطح isolation ارزیابی کند.",
          "state": [
            "X→B",
            "Done",
            "Holding X"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "deadlock",
      "label": "چرخهٔ بن‌بست",
      "example": "A:X then Y; B:Y then X",
      "prediction": "اگر هر دو قفل دیگری را بخواهند چه می‌شود؟",
      "steps": [
        {
          "name": "قفل‌های اولیه",
          "short": "قفل‌ها",
          "detail": "A ردیف X و B ردیف Y را قفل کرده‌اند.",
          "route": [
            0
          ],
          "packet": "LOCK",
          "input": "A locks X; B locks Y",
          "output": "X→A; Y→B",
          "result": "هر دو مالک قفل‌اند.",
          "explanation": "این ترتیب یک interleaving نمونه است.",
          "state": [
            "X→A | Y→B",
            "Holding X",
            "Holding Y"
          ]
        },
        {
          "name": "A منتظر B",
          "short": "انتظار",
          "detail": "A تلاش می‌کند Y را قفل کند.",
          "route": [
            1,
            0
          ],
          "packet": "WAIT",
          "input": "A requests Y",
          "output": "A waits for B",
          "result": "یک یال انتظار ساخته شد.",
          "explanation": "هنوز B می‌تواند کارش را تمام کند.",
          "state": [
            "WAIT A→B",
            "Waiting Y",
            "Holding Y"
          ]
        },
        {
          "name": "B منتظر A",
          "short": "چرخه",
          "detail": "B نیز X را درخواست می‌کند.",
          "route": [
            2,
            0
          ],
          "packet": "WAIT",
          "input": "B requests X",
          "output": "A→B→A deadlock",
          "result": "چرخه ایجاد شد.",
          "explanation": "PostgreSQL بن‌بست را تشخیص می‌دهد و یکی از تراکنش‌ها را abort می‌کند؛ انتخاب قربانی را فرض نکنید.",
          "state": [
            "WAIT A→B | WAIT B→A",
            "Waiting Y",
            "Waiting X"
          ],
          "tone": "error"
        },
        {
          "name": "شکستن چرخه",
          "short": "حل",
          "detail": "در این نمونه B abort می‌شود و A می‌تواند پیشرفت کند.",
          "route": [
            0,
            2
          ],
          "packet": "ABORT",
          "input": "Abort B (example victim)",
          "output": "B rolled back; A can continue",
          "result": "چرخه شکسته شد.",
          "explanation": "کل تراکنش قربانی را در صورت مناسب بودن retry کنید؛ اثر خارجی غیرقابل برگشت را دوباره کورکورانه اجرا نکنید.",
          "state": [
            "Y available to A",
            "Can proceed",
            "ROLLBACK"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "چرخهٔ انتظار با abort یک تراکنش شکسته می‌شود."
    },
    {
      "id": "ordered",
      "label": "ترتیب ثابت قفل‌ها",
      "example": "Always lock X before Y",
      "prediction": "اگر هر دو ابتدا X را بگیرند، آیا همین چرخه ساخته می‌شود؟",
      "steps": [
        {
          "name": "A نخست X",
          "short": "قفل اول",
          "detail": "A طبق قرارداد ابتدا X را می‌گیرد.",
          "route": [
            1,
            0
          ],
          "packet": "LOCK",
          "input": "A locks X",
          "output": "X→A",
          "result": "ترتیب ثابت آغاز شد.",
          "explanation": "همهٔ مسیرهای مرتبط باید قرارداد ترتیب را رعایت کنند.",
          "state": [
            "X→A",
            "Holding X",
            "Ready"
          ]
        },
        {
          "name": "B منتظر X",
          "short": "انتظار B",
          "detail": "B نیز ابتدا X می‌خواهد و هنوز Y را نگرفته است.",
          "route": [
            2,
            0
          ],
          "packet": "WAIT",
          "input": "B requests X",
          "output": "B waits for A",
          "result": "B منبع دوم را نگه نمی‌دارد.",
          "explanation": "به این ترتیب A برای گرفتن Y به B وابسته نیست.",
          "state": [
            "WAIT B→A",
            "Holding X",
            "Waiting X"
          ]
        },
        {
          "name": "A کامل و B ادامه",
          "short": "نتیجه",
          "detail": "A قفل Y را می‌گیرد و تمام می‌کند؛ B سپس کار خود را انجام می‌دهد.",
          "route": [
            1,
            0,
            2
          ],
          "packet": "DONE",
          "input": "A locks Y; commits; B proceeds",
          "output": "No cycle in this schedule",
          "result": "چرخهٔ نمونه جلوگیری شد.",
          "explanation": "ترتیب ثابت خطر این بن‌بست را کم می‌کند، نه همهٔ انواع بن‌بست را.",
          "state": [
            "FREE after both",
            "Done",
            "Done"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "ترتیب قفل‌گیری، چرخهٔ نمونه را حذف می‌کند."
    }
  ],
  "pitfall": "قفل همهٔ خواندن‌ها را مسدود نمی‌کند. تراکنش طولانی و قفل‌های غیرضروری contention را بالا می‌برند.",
  "takeaway": "قفل را کوتاه نگه دارید، ترتیب ثابت تعریف کنید و deadlock/serialization failure را با retry محدود مدیریت کنید.",
  "quiz": {
    "question": "چه چیزی بن‌بست را از انتظار عادی جدا می‌کند؟",
    "options": [
      "وجود TCP",
      "تعداد ستون‌ها",
      "چرخهٔ انتظار"
    ],
    "correct": 2,
    "explanation": "در بن‌بست، تراکنش‌ها در چرخه به هم وابسته‌اند."
  },
  "references": [
    {
      "label": "PostgreSQL — Explicit locking",
      "url": "https://www.postgresql.org/docs/current/explicit-locking.html"
    },
    {
      "label": "PostgreSQL — Error codes",
      "url": "https://www.postgresql.org/docs/current/errcodes-appendix.html"
    }
  ],
  "field": {
    "task": "در PostgreSQL محلی یک جدول demo آزمایشی بسازید، سپس در دو اتصال مستقل SELECT FOR UPDATE را روی یک ردیف اجرا کنید.",
    "observe": "اتصال دوم تا آزاد شدن قفل یا timeout منتظر می‌ماند.",
    "limit": "فقط دیتابیس محلی/آزمایشی؛ statement_timeout تنظیم کنید و هر دو تراکنش را rollback کنید.",
    "command": "-- Setup in an isolated test database\nCREATE TABLE demo(id integer PRIMARY KEY);\nINSERT INTO demo VALUES (1);\n-- Session A\nBEGIN;\nSELECT * FROM demo WHERE id=1 FOR UPDATE;\n-- Session B\nBEGIN;\nSET LOCAL lock_timeout='2s';\nSELECT * FROM demo WHERE id=1 FOR UPDATE;\nROLLBACK;\n-- Session A\nROLLBACK;",
    "next": {
      "slug": "connection-pooling",
      "label": "Connection Pooling",
      "category": "databases"
    }
  },
  "model": "database"
} satisfies BackendLesson;
export default lesson;
