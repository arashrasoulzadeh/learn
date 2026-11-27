import type {BackendLesson} from '../backend/types';
const lesson = {
  "slug": "sql-nosql",
  "title": "SQL و NoSQL — انتخاب مدل داده",
  "description": "مدل رابطه‌ای و مدل سندی را با سفارش فروشگاه و قواعد یکپارچگی مقایسه کنید.",
  "order": 21,
  "actors": [
    {
      "label": "برنامه",
      "sub": "Order service",
      "icon": "app"
    },
    {
      "label": "مدل داده",
      "sub": "Query / validation",
      "icon": "router"
    },
    {
      "label": "ذخیره‌ساز",
      "sub": "Database",
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
    ]
  ],
  "visual": {
    "title": "دادهٔ سفارش و قواعد آن",
    "labels": [
      "درخواست",
      "ساختار ذخیره‌شده",
      "نتیجه"
    ],
    "context": "SQL و NoSQL خانواده‌های گسترده‌اند. این درس مشخصاً جدول‌های رابطه‌ای و سند JSON را مقایسه می‌کند؛ هر دو می‌توانند امکانات تراکنش و ایندکس داشته باشند."
  },
  "teaching": {
    "goal": "بر اساس رابطه‌ها، الگوی خواندن و نیاز به یکپارچگی، مدل داده مناسب را انتخاب کنید.",
    "terms": [
      [
        "Foreign key",
        "قید ارجاع به رکورد معتبر در جدول دیگر."
      ],
      [
        "Document",
        "ساختار داده‌ای مانند سند JSON با فیلدهای تو در تو."
      ],
      [
        "Join",
        "ترکیب ردیف‌ها با شرط رابطه."
      ],
      [
        "Denormalization",
        "نگهداری دادهٔ تکراری برای ساده‌سازی خواندن، با هزینهٔ هماهنگی نوشتن."
      ]
    ],
    "practice": {
      "question": "نام مشتری باید در تمام نمایش‌های سفارش همواره از یک منبع جاری خوانده شود. کدام طراحی نمونه احتمال ناسازگاری نسخه‌های نام را کمتر می‌کند؟",
      "options": [
        "کپی نام در هر سند و بدون سازوکار به‌روزرسانی",
        "جدول مشتری و ارجاع سفارش به شناسهٔ مشتری",
        "حذف شناسهٔ مشتری"
      ],
      "correct": 1,
      "explanation": "ارجاع به یک رکورد مشتری و خواندن نام جاری با join از تکثیر بی‌قاعدهٔ نام جلوگیری می‌کند. اگر نام زمان خرید لازم باشد، snapshot عمدی می‌تواند درست باشد.",
      "hint": "نام جاری را با snapshot تاریخی اشتباه نگیرید."
    }
  },
  "scenarios": [
    {
      "id": "relational",
      "label": "سفارش با رابطهٔ مشتری",
      "example": "JOIN orders + customers",
      "prediction": "اگر نام مشتری عوض شود، join نام جاری را از کجا می‌خواند؟",
      "steps": [
        {
          "name": "تعریف جدول‌ها",
          "short": "ساختار",
          "detail": "مشتری و سفارش در جدول‌های جدا با شناسه و کلید خارجی نگهداری می‌شوند.",
          "route": [
            2
          ],
          "packet": "SCHEMA",
          "input": "customers(id PRIMARY KEY, name)\norders(id PRIMARY KEY, customer_id REFERENCES customers(id))",
          "output": "customers: (7, Sara); orders: (42,7)",
          "result": "سفارش به مشتری موجود ارجاع دارد.",
          "explanation": "جدول مشتری یک منبع نام جاری است؛ سفارش رابطه را با شناسه نگه می‌دارد.",
          "state": [
            "Read order 42",
            "customers: 7,Sara | orders: 42,7",
            "FK valid"
          ]
        },
        {
          "name": "درخواست ترکیب",
          "short": "Join",
          "detail": "برنامه سفارش و نام مشتری را با شرط برابری شناسه می‌خواند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "JOIN",
          "input": "SELECT o.id,c.name FROM orders o JOIN customers c ON o.customer_id=c.id WHERE o.id=42;",
          "output": "42 | Sara",
          "result": "ردیف مرتبط پیدا شد.",
          "explanation": "پایگاه داده نحوهٔ اجرای join را انتخاب می‌کند؛ join لزوماً به معنی اسکن همهٔ جدول‌ها نیست.",
          "state": [
            "SELECT order 42",
            "orders.customer_id → customers.id",
            "42,Sara"
          ],
          "roundTrip": true
        },
        {
          "name": "تغییر نام و خواندن تازه",
          "short": "خواندن جاری",
          "detail": "نام مشتری در جدول مشتری تغییر می‌کند؛ خواندن تازه سفارش نام جدید را برمی‌گرداند.",
          "route": [
            1,
            2
          ],
          "packet": "UPDATE",
          "input": "UPDATE customers SET name='Sam' WHERE id=7;",
          "output": "JOIN result: 42,Sam",
          "result": "نام جاری از همان منبع خوانده شد.",
          "explanation": "نام ثبت‌شده هنگام خرید ممکن است باید مستقل و تغییرناپذیر باشد؛ این قرارداد فقط نام جاری می‌خواهد.",
          "state": [
            "Read again",
            "customers: 7,Sam | orders: 42,7",
            "42,Sam"
          ],
          "tone": "success",
          "roundTrip": true
        }
      ]
    },
    {
      "id": "document",
      "label": "خواندن سند یکپارچهٔ سفارش",
      "example": "order document with items",
      "prediction": "اگر نمایش سفارش همهٔ آیتم‌ها را نیاز داشته باشد، قرار دادن آن‌ها در یک سند چه مزیتی دارد؟",
      "steps": [
        {
          "name": "ساخت سند سفارش",
          "short": "سند",
          "detail": "آیتم‌های سفارش به‌عنوان آرایهٔ تو در تو در سند نمونه ثبت می‌شوند.",
          "route": [
            1,
            2
          ],
          "packet": "INSERT",
          "input": "{id:42, customerId:7, items:[{sku:'A',qty:2}]}",
          "output": "Document stored",
          "result": "آیتم و سفارش در یک aggregate هستند.",
          "explanation": "این مدل برای الگوی خواندن کامل سفارش مناسب است؛ رشد نامحدود آرایه می‌تواند نامناسب باشد.",
          "state": [
            "Create order",
            "order42 | items:[A×2]",
            "Stored"
          ]
        },
        {
          "name": "خواندن یک سند",
          "short": "خواندن",
          "detail": "برنامه سند سفارش را با شناسه می‌خواند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "FIND",
          "input": "findOne({id:42})",
          "output": "{id:42, customerId:7, items:[{sku:'A',qty:2}]}",
          "result": "اطلاعات لازم از سند خوانده شد.",
          "explanation": "نیاز نبود آیتم‌ها از مجموعهٔ جدا join شوند؛ این تضمین سرعت برای همهٔ مدل‌ها نیست.",
          "state": [
            "Find id=42",
            "order42 | items:[A×2]",
            "HIT document"
          ],
          "roundTrip": true,
          "tone": "success"
        },
        {
          "name": "تغییر یک آیتم",
          "short": "ویرایش",
          "detail": "عملیات نمونه فقط تعداد آیتم A را به ۳ تغییر می‌دهد.",
          "route": [
            1,
            2
          ],
          "packet": "UPDATE",
          "input": "update item A: qty=3",
          "output": "order42.items[0].qty=3",
          "result": "سند به‌روز شد.",
          "explanation": "در MongoDB عملیات نوشتن یک سند اتمیک است؛ قواعد چندسندی جداگانه‌اند.",
          "state": [
            "Update qty",
            "order42 | items:[A×3]",
            "qty=3"
          ],
          "roundTrip": true,
          "tone": "success"
        }
      ]
    },
    {
      "id": "invalid-reference",
      "label": "ارجاع به مشتری ناموجود",
      "example": "customer_id=99",
      "prediction": "آیا کلید خارجی اجازهٔ ثبت سفارش برای مشتری ناموجود می‌دهد؟",
      "steps": [
        {
          "name": "ارسال سفارش نامعتبر",
          "short": "درخواست",
          "detail": "برنامه قصد ثبت سفارش با شناسهٔ مشتری ۹۹ را دارد.",
          "route": [
            0,
            1
          ],
          "packet": "INSERT",
          "input": "INSERT INTO orders VALUES (43,99);",
          "output": "Customer 99 absent",
          "result": "قید ارجاع باید بررسی شود.",
          "explanation": "اعتبارسنجی برنامه به تنهایی در حضور نویسندگان دیگر کافی نیست.",
          "state": [
            "Insert 43",
            "customers: 7 | orders: 42,7",
            "Pending"
          ]
        },
        {
          "name": "اعمال قید",
          "short": "رد قید",
          "detail": "پایگاه داده رابطه را بررسی و درج نامعتبر را رد می‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "FK",
          "input": "customer_id=99",
          "output": "Foreign key violation",
          "result": "رکورد نامعتبر ثبت نشد.",
          "explanation": "در مثال سندی بدون قید مشابه باید یکپارچگی با طراحی مناسب تضمین شود؛ NoSQL به معنای نبود اعتبارسنجی نیست.",
          "state": [
            "Insert 43",
            "orders: 42,7",
            "CONFLICT FK"
          ],
          "tone": "error",
          "roundTrip": true
        },
        {
          "name": "پاسخ برنامه",
          "short": "نتیجه",
          "detail": "برنامه خطای قید را به پاسخ قابل فهم تبدیل می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "ERR",
          "input": "invalid customer reference",
          "output": "Order not created",
          "result": "وضعیت معتبر حفظ شد.",
          "explanation": "نوع خطای HTTP وابسته به قرارداد API است؛ خطای خام دیتابیس را افشا نکنید.",
          "state": [
            "Rejected",
            "orders: 42,7",
            "No order 43"
          ],
          "tone": "error"
        }
      ],
      "edgeCase": "ثبت ارجاع نامعتبر باید با قید یا سیاست صریح جلوگیری شود."
    }
  ],
  "pitfall": "NoSQL مترادف بی‌قید، بدون تراکنش یا همیشه سریع‌تر نیست؛ SQL هم امکان نگهداری JSON دارد.",
  "takeaway": "مدل داده را با invariant و الگوی دسترسی انتخاب کنید، نه صرفاً نام فناوری.",
  "quiz": {
    "question": "کدام سازوکار نمونه از ارجاع سفارش به مشتری ناموجود جلوگیری می‌کند؟",
    "options": [
      "Foreign key",
      "TTL",
      "TCP"
    ],
    "correct": 0,
    "explanation": "کلید خارجی ارجاع را طبق قید تعریف‌شده بررسی می‌کند."
  },
  "references": [
    {
      "label": "PostgreSQL — Constraints",
      "url": "https://www.postgresql.org/docs/current/ddl-constraints.html"
    },
    {
      "label": "MongoDB — Data modeling",
      "url": "https://www.mongodb.com/docs/manual/data-modeling/"
    }
  ],
  "field": {
    "task": "در Python یک دیتابیس SQLite حافظه‌ای بسازید و رابطه و join را اجرا کنید.",
    "observe": "خروجی [(42, 'Sara')] است.",
    "limit": "SQLite و PostgreSQL دقیقاً یکسان نیستند؛ این نمونه صرفاً رابطه و join را نشان می‌دهد.",
    "command": "import sqlite3\nc=sqlite3.connect(':memory:')\nc.executescript(\"PRAGMA foreign_keys=ON; CREATE TABLE customers(id PRIMARY KEY,name); CREATE TABLE orders(id PRIMARY KEY,customer_id REFERENCES customers(id)); INSERT INTO customers VALUES(7,'Sara'); INSERT INTO orders VALUES(42,7);\")\nprint(c.execute(\"SELECT o.id,c.name FROM orders o JOIN customers c ON o.customer_id=c.id\").fetchall())",
    "next": {
      "slug": "database-index",
      "label": "Database Index",
      "category": "databases"
    }
  },
  "model": "database"
} satisfies BackendLesson;
export default lesson;
