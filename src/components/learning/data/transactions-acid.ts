import type {BackendLesson} from '../backend/types';
const lesson = {
  "slug": "transactions-acid",
  "title": "Transactions و ACID — انتقال اتمیک",
  "description": "انتقال موجودی بین دو حساب، commit، rollback و تضمین‌های ACID در مدل پایگاه داده رابطه‌ای.",
  "order": 24,
  "actors": [
    {
      "label": "تراکنش",
      "sub": "Transaction",
      "icon": "app"
    },
    {
      "label": "حساب A",
      "sub": "Balance A",
      "icon": "db"
    },
    {
      "label": "حساب B",
      "sub": "Balance B",
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
    ]
  ],
  "visual": {
    "title": "موجودی درون تراکنش و وضعیت ثبت",
    "labels": [
      "وضعیت تراکنش",
      "حساب A",
      "حساب B"
    ],
    "context": "مقادیر در مراحل میانی نمای همین تراکنش‌اند، نه الزاماً نمای دیگر خوانندگان. مجموع اولیه ۱۵۰ است. دوام ثبت به تنظیمات موتور و خرابی مورد نظر وابسته است."
  },
  "teaching": {
    "goal": "با انتقال ۳۰ واحد نشان دهید Atomicity، Consistency، Isolation و Durability چه تفاوتی دارند.",
    "terms": [
      [
        "Atomicity",
        "همهٔ تغییرات تراکنش ثبت می‌شوند یا هیچ‌کدام."
      ],
      [
        "Consistency",
        "حفظ قیود و invariantهای تعریف‌شده به کمک منطق صحیح."
      ],
      [
        "Isolation",
        "قواعد مشاهده و تداخل تراکنش‌های هم‌زمان."
      ],
      [
        "Durability",
        "حفظ تغییرات commitشده تحت تضمین‌های پایداری تعریف‌شده."
      ]
    ],
    "practice": {
      "question": "پس از کم کردن ۳۰ از A، نوشتن B شکست می‌خورد. برای حفظ مجموع موجودی چه کنید؟",
      "options": [
        "COMMIT همان تغییر",
        "ROLLBACK کل انتقال",
        "فقط دوباره A را کم کنید"
      ],
      "correct": 1,
      "explanation": "rollback هر دو تغییر تراکنش را کنار می‌گذارد؛ انتقال ناقص ثبت نمی‌شود.",
      "hint": "واحد اتمیک باید کل انتقال باشد."
    }
  },
  "scenarios": [
    {
      "id": "commit",
      "label": "انتقال موفق ۳۰ واحد",
      "example": "A=100; B=50",
      "prediction": "مجموع بعد از ثبت انتقال چقدر است؟",
      "steps": [
        {
          "name": "شروع تراکنش",
          "short": "BEGIN",
          "detail": "انتقال ۳۰ واحد در یک تراکنش آغاز می‌شود.",
          "route": [
            0
          ],
          "packet": "BEGIN",
          "input": "BEGIN;",
          "output": "A=100; B=50",
          "result": "واحد عملیات مشخص شد.",
          "explanation": "شرط کافی بودن موجودی نیز باید با قواعد هم‌زمانی مناسب بررسی شود.",
          "state": [
            "Open",
            "100",
            "50"
          ],
          "flightLabels": [
            "BEGIN"
          ],
          "diagnostic": "مرز تراکنش باید شامل بررسی کافی بودن موجودی و هر دو تغییر باشد؛ invariant مجموع را ثبت کنید."
        },
        {
          "name": "کاهش حساب A",
          "short": "برداشت",
          "detail": "۳۰ واحد از A در همین تراکنش کم می‌شود.",
          "route": [
            0,
            1
          ],
          "packet": "UPDATE",
          "input": "UPDATE accounts SET balance=balance-30 WHERE id='A';",
          "output": "A=70 (uncommitted)",
          "result": "برداشت هنوز commit نشده است.",
          "explanation": "در سطحی مثل Read Committed دیگر تراکنش‌ها تغییر ثبت‌نشده را نمی‌بینند.",
          "state": [
            "Open",
            "70 (pending)",
            "50"
          ],
          "flightLabels": [
            "debit 30"
          ],
          "diagnostic": "A=70 درون تراکنش است، نه الزاماً وضعیت committed قابل مشاهده؛ dirty read را تفکیک کنید."
        },
        {
          "name": "افزایش حساب B",
          "short": "واریز",
          "detail": "۳۰ واحد به B اضافه می‌شود.",
          "route": [
            0,
            2
          ],
          "packet": "UPDATE",
          "input": "UPDATE accounts SET balance=balance+30 WHERE id='B';",
          "output": "B=80 (uncommitted)",
          "result": "مجموع دوباره ۱۵۰ است.",
          "explanation": "منطق انتقال هر دو تغییر را در یک تراکنش قرار داده است.",
          "state": [
            "Open",
            "70 (pending)",
            "80 (pending)"
          ],
          "flightLabels": [
            "credit 30"
          ],
          "diagnostic": "B=80 و مجموع در همان تراکنش 150 است؛ consistency به منطق و قید درست وابسته است."
        },
        {
          "name": "ثبت اتمیک",
          "short": "COMMIT",
          "detail": "هر دو تغییر با هم ثبت می‌شوند.",
          "route": [
            0
          ],
          "packet": "COMMIT",
          "input": "COMMIT;",
          "output": "A=70; B=80; total=150",
          "result": "انتقال کامل شد.",
          "explanation": "در تنظیمات پایدار، موتور قبل از اعلام commit الزامات دوام را رعایت می‌کند؛ صرف تغییر در حافظه کافی نیست.",
          "state": [
            "COMMIT",
            "70",
            "80"
          ],
          "tone": "success",
          "flightLabels": [
            "COMMIT"
          ],
          "diagnostic": "ثبت پایدار تحت تنظیمات موتور و نوع خرابی تعریف می‌شود؛ atomicity با durability متفاوت است."
        }
      ]
    },
    {
      "id": "rollback",
      "label": "شکست و بازگرداندن انتقال",
      "example": "Debit succeeds; credit fails",
      "prediction": "اگر پس از برداشت خطا رخ دهد، موجودی نهایی چه می‌شود؟",
      "steps": [
        {
          "name": "برداشت آزمایشی",
          "short": "برداشت",
          "detail": "در تراکنش باز، A از ۱۰۰ به ۷۰ می‌رسد.",
          "route": [
            0,
            1
          ],
          "packet": "UPDATE",
          "input": "BEGIN; UPDATE accounts SET balance=balance-30 WHERE id='A';",
          "output": "A=70 (uncommitted)",
          "result": "هنوز ثبت نشده است.",
          "explanation": "در این مثال B همچنان ۵۰ است.",
          "state": [
            "Open",
            "70 (pending)",
            "50"
          ],
          "flightLabels": [
            "debit pending"
          ],
          "diagnostic": "تغییر A هنوز uncommitted است؛ خروج موفق statement برابر با commit نیست."
        },
        {
          "name": "خطای واریز",
          "short": "خطا",
          "detail": "عملیات واریز شکست می‌خورد؛ برنامه نباید انتقال ناقص را commit کند.",
          "route": [
            0,
            2
          ],
          "packet": "ERR",
          "input": "Credit update failed",
          "output": "Transaction failed",
          "result": "کل انتقال باید بازگردد.",
          "explanation": "رفتار پس از خطا به موتور وابسته است؛ در PostgreSQL خطای statement معمولاً تراکنش را در حالت failed می‌گذارد.",
          "state": [
            "Failed",
            "70 (pending)",
            "50"
          ],
          "tone": "error",
          "flightLabels": [
            "credit failed"
          ],
          "diagnostic": "در PostgreSQL بسیاری از خطاهای statement تراکنش را failed می‌کنند؛ نباید عملیات ناقص ثبت شود."
        },
        {
          "name": "بازگرداندن کل تغییر",
          "short": "ROLLBACK",
          "detail": "برنامه تراکنش را rollback می‌کند.",
          "route": [
            0
          ],
          "packet": "ROLLBACK",
          "input": "ROLLBACK;",
          "output": "A=100; B=50; total=150",
          "result": "هیچ انتقال ناقصی ثبت نشد.",
          "explanation": "Atomicity یعنی همه یا هیچ؛ rollback با یک انتقال جبرانی بعد از commit فرق دارد.",
          "state": [
            "ROLLBACK",
            "100",
            "50"
          ],
          "tone": "success",
          "flightLabels": [
            "ROLLBACK"
          ],
          "diagnostic": "هر دو حساب به وضعیت پیشین برمی‌گردند؛ اثر خارجی مثل ارسال ایمیل rollback خودکار نمی‌شود."
        }
      ],
      "edgeCase": "خطای میانی نباید برداشت تنها را ثبت کند."
    },
    {
      "id": "isolation",
      "label": "خواندن هنگام تغییر ثبت‌نشده",
      "example": "Read Committed",
      "prediction": "آیا خوانندهٔ مستقل مقدار ۷۰ ثبت‌نشده را می‌بیند؟",
      "steps": [
        {
          "name": "نویسنده تغییر می‌دهد",
          "short": "نوشتن",
          "detail": "تراکنش نویسنده A را به ۷۰ تغییر داده اما هنوز ثبت نکرده است.",
          "route": [
            0,
            1
          ],
          "packet": "WRITE",
          "input": "T1: UPDATE A SET balance=70",
          "output": "T1 sees 70; committed A=100",
          "result": "دو نما متفاوت‌اند.",
          "explanation": "فرض نمونه PostgreSQL در Read Committed است.",
          "state": [
            "T1 open; committed total=150",
            "T1: 70 · committed: 100",
            "50"
          ],
          "flightLabels": [
            "T1 UPDATE"
          ],
          "diagnostic": "T1 تغییر خودش را می‌بیند ولی committed A هنوز 100 است؛ نماهای تراکنش‌ها را جدا کنید."
        },
        {
          "name": "خوانندهٔ مستقل",
          "short": "خواندن",
          "detail": "T2 با خواندن عادی مقدار ثبت‌شدهٔ A را می‌گیرد.",
          "route": [
            0,
            1
          ],
          "packet": "READ",
          "input": "T2: SELECT balance FROM accounts WHERE id='A'",
          "output": "T2 sees 100",
          "result": "خواندن کثیف رخ نداد.",
          "explanation": "MVCC می‌تواند نسخهٔ ثبت‌شدهٔ قبلی را ارائه کند؛ قفل‌های صریح ممکن است رفتار دیگری داشته باشند.",
          "state": [
            "T1 open; T2 read",
            "T1: 70 · T2: 100",
            "50"
          ],
          "roundTrip": true,
          "flightLabels": [
            "T2 SELECT",
            "committed 100"
          ],
          "diagnostic": "در Read Committed خواندن عادی snapshot ثبت‌شدهٔ statement را می‌بیند؛ SELECT FOR UPDATE متفاوت است."
        },
        {
          "name": "ثبت و خواندن دوباره",
          "short": "نمای تازه",
          "detail": "T1 واریز ۳۰ واحد به B را کامل و سپس هر دو تغییر را commit می‌کند. statement تازهٔ T2 در Read Committed مقدار A=70 را می‌بیند.",
          "route": [
            0
          ],
          "packet": "COMMIT",
          "input": "T1: credit B; COMMIT; T2: SELECT A",
          "output": "T2 sees 70",
          "result": "نمای خواندن تازه شد.",
          "explanation": "Repeatable Read ممکن است snapshot قبلی را حفظ کند. Read Committed همهٔ anomalyها را حذف نمی‌کند. ثبت A به تنهایی invariant مجموع را حفظ نمی‌کرد؛ در این گام واریز B نیز انجام شده است.",
          "state": [
            "COMMIT",
            "70",
            "80"
          ],
          "tone": "success",
          "flightLabels": [
            "COMMIT + new read"
          ],
          "diagnostic": "statement تازه T2 پس از commit مقدار 70 را می‌بیند؛ Repeatable Read ممکن است snapshot قبلی را حفظ کند."
        }
      ],
      "edgeCase": "Isolation تعیین می‌کند خوانندهٔ هم‌زمان چه چیزی مشاهده کند."
    }
  ],
  "pitfall": "ACID همهٔ خطاهای منطقی را حذف نمی‌کند؛ Consistency نیازمند قیود و منطق درست است و Isolation به سطح انتخابی وابسته است.",
  "takeaway": "مرز تراکنش را با invariant کسب‌وکار هماهنگ کنید و سطح جداسازی و تضمین دوام را آگاهانه انتخاب کنید.",
  "quiz": {
    "question": "کدام ویژگی مانع ثبت تنها نیمی از انتقال می‌شود؟",
    "options": [
      "Indexing",
      "Atomicity",
      "Replication"
    ],
    "correct": 1,
    "explanation": "Atomicity تغییرات واحد تراکنش را همه یا هیچ ثبت می‌کند."
  },
  "references": [
    {
      "label": "PostgreSQL — Transactions",
      "url": "https://www.postgresql.org/docs/current/tutorial-transactions.html"
    },
    {
      "label": "PostgreSQL — Transaction isolation",
      "url": "https://www.postgresql.org/docs/current/transaction-iso.html"
    },
    {
      "label": "PostgreSQL — WAL reliability",
      "url": "https://www.postgresql.org/docs/current/wal-reliability.html"
    }
  ],
  "field": {
    "task": "در SQLite حافظه‌ای برداشت را انجام دهید و قبل از واریز rollback کنید.",
    "observe": "موجودی A دوباره ۱۰۰ است.",
    "limit": "تضمین‌های SQLite و PostgreSQL در هم‌زمانی یکسان نیستند.",
    "command": "import sqlite3\nc=sqlite3.connect(':memory:')\nc.executescript(\"CREATE TABLE a(id PRIMARY KEY,balance); INSERT INTO a VALUES('A',100),('B',50);\")\nc.execute('BEGIN')\nc.execute(\"UPDATE a SET balance=balance-30 WHERE id='A'\")\nc.rollback()\nprint(c.execute('SELECT * FROM a ORDER BY id').fetchall())",
    "next": {
      "slug": "database-locking",
      "label": "Database Locking",
      "category": "databases"
    }
  },
  "model": "database"
} satisfies BackendLesson;
export default lesson;
