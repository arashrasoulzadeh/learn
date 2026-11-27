import type {BackendLesson} from '../backend/types';
const lesson = {
  "slug": "b-tree",
  "title": "B-Tree — جست‌وجو در صفحات مرتب",
  "description": "مدل آموزشی B+ tree، گرهٔ راهنما، برگ مرتب و split را دنبال کنید.",
  "order": 23,
  "actors": [
    {
      "label": "ریشه",
      "sub": "Root / separators",
      "icon": "memory"
    },
    {
      "label": "برگ چپ",
      "sub": "Lower keys",
      "icon": "db"
    },
    {
      "label": "برگ راست",
      "sub": "Higher keys",
      "icon": "db"
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
    ],
    [
      1,
      2
    ]
  ],
  "visual": {
    "title": "صفحات و کلیدهای مرتب",
    "labels": [
      "ریشه / شرط",
      "برگ چپ",
      "برگ راست"
    ],
    "context": "مدل B+ tree با ظرفیت کوچک و کلیدهای یکتا؛ ریشه فقط جداکننده و برگ‌ها داده/اشاره‌گر دارند. جزئیات split و page layout وابسته به موتور است."
  },
  "teaching": {
    "goal": "مسیر جست‌وجوی کلید و بازه و اثر پر شدن صفحه را در درخت مرتب توضیح دهید.",
    "terms": [
      [
        "Separator",
        "کلید راهنما برای انتخاب فرزند."
      ],
      [
        "Leaf",
        "صفحهٔ انتهایی حاوی کلیدها و اشاره‌گرها."
      ],
      [
        "Fanout",
        "تعداد فرزندان ممکن یک گره."
      ],
      [
        "Split",
        "تقسیم صفحهٔ پر و اصلاح مسیر راهنما."
      ]
    ],
    "practice": {
      "question": "ریشه جداکنندهٔ ۳۰ دارد: کلید کمتر از ۳۰ چپ و کلید بزرگ‌تر یا مساوی ۳۰ راست. کلید ۳۵ کدام مسیر را می‌رود؟",
      "options": [
        "برگ چپ",
        "برگ راست",
        "هر دو برگ الزاماً"
      ],
      "correct": 1,
      "explanation": "شرط 35≥30 فرزند راست را انتخاب می‌کند.",
      "hint": "قاعدهٔ همین جداکننده را دنبال کنید."
    }
  },
  "scenarios": [
    {
      "id": "seek",
      "label": "جست‌وجوی نقطه‌ای",
      "example": "key=35",
      "prediction": "با جداکنندهٔ ۳۰، جست‌وجوی ۳۵ به کدام برگ می‌رود؟",
      "steps": [
        {
          "name": "خواندن ریشه",
          "short": "ریشه",
          "detail": "ریشه جداکنندهٔ ۳۰ دارد.",
          "route": [
            0
          ],
          "packet": "ROOT",
          "input": "search 35; separator=30",
          "output": "35 >= 30",
          "result": "فرزند راست انتخاب شد.",
          "explanation": "در درخت با ارتفاع بیشتر این تصمیم در چند گره تکرار می‌شود.",
          "state": [
            "sep=30",
            "10 | 20",
            "30 | 35 | 40"
          ]
        },
        {
          "name": "ورود به برگ راست",
          "short": "جست‌وجو",
          "detail": "کلید ۳۵ در برگ راست پیدا می‌شود.",
          "route": [
            0,
            2
          ],
          "packet": "SEEK",
          "input": "read right leaf",
          "output": "35 found",
          "result": "کلید مطابق پیدا شد.",
          "explanation": "برگ مرتب می‌تواند جست‌وجوی داخل صفحه را نیز آسان‌تر کند.",
          "state": [
            "seek 35",
            "10 | 20",
            "30 | 35 ✓ | 40"
          ]
        },
        {
          "name": "بازگشت اشاره‌گر",
          "short": "نتیجه",
          "detail": "اشاره‌گر رکورد به مسیر فراخواننده برمی‌گردد.",
          "route": [
            2,
            0
          ],
          "packet": "ROW",
          "input": "pointer for key 35",
          "output": "found key 35",
          "result": "فقط مسیر مربوط خوانده شد.",
          "explanation": "درخت متوازن ارتفاع کمی نسبت به تعداد کلیدها دارد.",
          "state": [
            "Found 35",
            "10 | 20",
            "30 | 35 | 40"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "range",
      "label": "جست‌وجوی بازه‌ای",
      "example": "20 <= key <= 35",
      "prediction": "آیا پس از یافتن ۲۰، باید برای هر کلید دوباره از ریشه شروع کرد؟",
      "steps": [
        {
          "name": "یافتن شروع بازه",
          "short": "شروع",
          "detail": "کلید ۲۰ در برگ چپ قرار دارد.",
          "route": [
            0,
            1
          ],
          "packet": "SEEK",
          "input": "lower bound 20",
          "output": "20 found",
          "result": "ابتدای بازه مشخص شد.",
          "explanation": "در مدل B+ tree برگ‌ها برای پیمایش مرتب به هم متصل‌اند.",
          "state": [
            "sep=30",
            "10 | 20 ✓",
            "30 | 35 | 40"
          ]
        },
        {
          "name": "حرکت به برگ بعد",
          "short": "پیمایش",
          "detail": "پس از ۲۰، پیوند برگ بعدی پیمایش می‌شود.",
          "route": [
            1,
            2
          ],
          "packet": "NEXT",
          "input": "scan next leaf until >35",
          "output": "30,35",
          "result": "کلیدهای بازه جمع شدند.",
          "explanation": "با رسیدن به ۴۰ شرط پایان برقرار می‌شود.",
          "state": [
            "Range 20…35",
            "20",
            "30 ✓ | 35 ✓ | 40"
          ]
        },
        {
          "name": "خروجی مرتب",
          "short": "نتیجه",
          "detail": "نتیجهٔ بازه به شکل مرتب در مدل بازگردانده می‌شود.",
          "route": [
            2,
            0
          ],
          "packet": "ROWS",
          "input": "keys in range",
          "output": "20,30,35",
          "result": "سه کلید مطابق یافت شد.",
          "explanation": "در SQL برای تضمین ترتیب خروجی به ORDER BY نیاز دارید، حتی اگر ایندکس مرتب باشد.",
          "state": [
            "Done",
            "20",
            "30 | 35"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "split",
      "label": "پر شدن برگ و تقسیم صفحه",
      "example": "leaf capacity=3; insert 25",
      "prediction": "وقتی برگ پر باشد، چگونه ترتیب و دسترسی حفظ می‌شود؟",
      "steps": [
        {
          "name": "برگ پر",
          "short": "ظرفیت",
          "detail": "برای این سناریو درخت هنوز یک صفحهٔ برگ در نقش ریشه دارد و ظرفیت آن سه کلید است.",
          "route": [
            0
          ],
          "packet": "FULL",
          "input": "root leaf=[10,20,30]",
          "output": "Leaf full",
          "result": "درج ۲۵ به تغییر ساختار نیاز دارد.",
          "explanation": "درخت کوچک از یک برگ شروع می‌کند؛ ستون‌های برگ در این گام هنوز تخصیص نیافته‌اند.",
          "state": [
            "FULL 10 | 20 | 30",
            "—",
            "—"
          ]
        },
        {
          "name": "تقسیم کلیدها",
          "short": "Split",
          "detail": "چهار کلید مرتب به دو برگ تقسیم می‌شوند.",
          "route": [
            0,
            1
          ],
          "packet": "SPLIT",
          "input": "insert 25; split [10,20,25,30]",
          "output": "left=[10,20]; right=[25,30]",
          "result": "دو برگ جدید ساخته شدند.",
          "explanation": "این یک snapshot مفهومی از split است، نه پروتکل crash-safe موتور.",
          "state": [
            "Root being built",
            "10 | 20",
            "25 | 30"
          ]
        },
        {
          "name": "نصب ریشهٔ راهنما",
          "short": "ریشه تازه",
          "detail": "ریشه جداکنندهٔ ۲۵ را نگه می‌دارد و دو برگ را معرفی می‌کند.",
          "route": [
            0,
            2
          ],
          "packet": "ROOT",
          "input": "separator=25",
          "output": "Balanced tree",
          "result": "جست‌وجو و ترتیب حفظ شدند.",
          "explanation": "split ممکن است در سطح‌های بالاتر هم ادامه پیدا کند؛ در این مثال ارتفاع یک سطح رشد کرد.",
          "state": [
            "sep=25",
            "10 | 20",
            "25 | 30"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "درج در صفحهٔ پر باعث split و هزینهٔ اضافی می‌شود."
    }
  ],
  "pitfall": "B-tree با درخت دودویی یکی نیست. مدل B+ tree این درس ساده‌شده است؛ فرمت صفحات و split موتورهای واقعی متفاوت‌اند.",
  "takeaway": "جداکننده‌ها جست‌وجو را محدود می‌کنند و برگ‌های مرتب بازه را آسان می‌کنند؛ تغییر ساختار هزینه دارد.",
  "quiz": {
    "question": "برای پیمایش بازه در B+ tree معمولاً چه چیزی مفید است؟",
    "options": [
      "پیوند مرتب برگ‌ها",
      "حذف همهٔ کلیدها",
      "ارسال UDP"
    ],
    "correct": 0,
    "explanation": "پیوند برگ‌ها امکان حرکت به کلیدهای بعدی را فراهم می‌کند."
  },
  "references": [
    {
      "label": "PostgreSQL — B-tree implementation",
      "url": "https://www.postgresql.org/docs/current/btree.html"
    },
    {
      "label": "SQLite — Database file format",
      "url": "https://www.sqlite.org/fileformat2.html"
    }
  ],
  "field": {
    "task": "روی SQLite یک ایندکس بسازید و EXPLAIN QUERY PLAN را برای بازه اجرا کنید.",
    "observe": "planner ممکن است از ایندکس برای شرط بازه استفاده کند.",
    "limit": "این خروجی ساختار فیزیکی split را نشان نمی‌دهد؛ سناریوی آموزشی را برای آن دنبال کنید.",
    "command": "import sqlite3\nc=sqlite3.connect(':memory:')\nc.executescript('CREATE TABLE t(k INTEGER); CREATE INDEX ix ON t(k);')\nprint(c.execute('EXPLAIN QUERY PLAN SELECT k FROM t WHERE k BETWEEN 20 AND 35 ORDER BY k').fetchall())",
    "next": {
      "slug": "transactions-acid",
      "label": "Transactions و ACID",
      "category": "databases"
    }
  },
  "model": "database"
} satisfies BackendLesson;
export default lesson;
