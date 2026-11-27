import type {BackendLesson} from '../backend/types';
const lesson = {
  "slug": "cache-invalidation",
  "title": "Cache Invalidation — حفظ تازگی داده",
  "description": "کش قدیمی، حذف پس از commit و رقابت بین پر کردن و invalidation را بررسی کنید.",
  "order": 28,
  "actors": [
    {
      "label": "برنامه",
      "sub": "Readers / writers",
      "icon": "app"
    },
    {
      "label": "کش",
      "sub": "Cached value",
      "icon": "cache"
    },
    {
      "label": "پایگاه داده",
      "sub": "Committed value",
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
    "title": "نسخهٔ داده در کش و DB",
    "labels": [
      "رویداد",
      "کش product:42",
      "DB committed"
    ],
    "context": "فرض cache-aside با نویسنده و خوانندهٔ هم‌زمان. ترتیب commit سپس حذف کش خطر را کم می‌کند، ولی بدون هماهنگی یا کنترل نسخه تضمین اتمیک بین دو سیستم نیست."
  },
  "teaching": {
    "goal": "توضیح دهید چرا تغییر DB به‌تنهایی کش را تازه نمی‌کند و یک race پر کردن کش را تشخیص دهید.",
    "terms": [
      [
        "Invalidation",
        "نامعتبر کردن یا حذف ورودی کش."
      ],
      [
        "Stale read",
        "خواندن مقدار قدیمی نسبت به منبع اصلی."
      ],
      [
        "Version",
        "نشانهٔ ترتیب نسخه‌ها برای کنترل مقادیر قدیمی."
      ],
      [
        "Single-flight",
        "ادغام درخواست‌های هم‌زمان برای پر کردن یک کلید."
      ]
    ],
    "practice": {
      "question": "خواننده مقدار v1 را پیش از commit نویسنده خوانده؛ نویسنده v2 را commit و کش را حذف می‌کند. سپس خواننده v1 را در کش می‌گذارد. چه رخ می‌دهد؟",
      "options": [
        "کش قطعاً v2 است",
        "کش ممکن است v1 قدیمی داشته باشد",
        "DB به v1 rollback می‌شود"
      ],
      "correct": 1,
      "explanation": "خوانندهٔ دیررس می‌تواند ورودی قدیمی را پس از حذف دوباره وارد کند. کنترل نسخه یا هماهنگی لازم است.",
      "hint": "به ترتیب آخرین نوشتن در کش توجه کنید."
    }
  },
  "scenarios": [
    {
      "id": "stale",
      "label": "DB تغییر کرده، کش قدیمی مانده",
      "example": "v1=50 → v2=45",
      "prediction": "پس از commit بدون invalidation، خواننده چه قیمتی ممکن است ببیند؟",
      "steps": [
        {
          "name": "وضعیت اولیه",
          "short": "نسخه اول",
          "detail": "کش و DB قیمت ۵۰ را دارند.",
          "route": [
            1
          ],
          "packet": "INIT",
          "input": "cache=v1; DB=v1",
          "output": "Both v1",
          "result": "نسخه‌ها برابرند.",
          "explanation": "ورودی کش تا انقضا معتبر فرض می‌شود.",
          "state": [
            "Ready",
            "50 v1",
            "50 v1"
          ]
        },
        {
          "name": "ثبت قیمت تازه",
          "short": "نوشتن",
          "detail": "نویسنده قیمت ۴۵ را در DB commit می‌کند ولی کش را تغییر نمی‌دهد.",
          "route": [
            0,
            2
          ],
          "packet": "COMMIT",
          "input": "UPDATE price=45; COMMIT",
          "output": "DB=v2; cache=v1",
          "result": "نسخه‌ها جدا شدند.",
          "explanation": "commit یک DB به‌صورت خودکار تغییر در کش مستقل ایجاد نمی‌کند.",
          "state": [
            "COMMIT v2",
            "STALE 50 v1",
            "45 v2"
          ],
          "tone": "error"
        },
        {
          "name": "خواندن قدیمی",
          "short": "نتیجه",
          "detail": "خواننده hit دارد و ۵۰ را دریافت می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET product:42",
          "output": "HIT 50 (stale)",
          "result": "قیمت قدیمی مشاهده شد.",
          "explanation": "TTL عمر مشکل را محدود می‌کند، اما سازگاری آنی نمی‌دهد.",
          "state": [
            "Read=50",
            "STALE 50 v1",
            "45 v2"
          ],
          "roundTrip": true,
          "tone": "error"
        }
      ],
      "edgeCase": "نوشتن DB بدون هماهنگی کش باعث دادهٔ کهنه می‌شود."
    },
    {
      "id": "invalidate",
      "label": "حذف کش بعد از commit",
      "example": "commit → DEL → miss",
      "prediction": "اگر کش بعد از commit حذف شود و رقابت دیگری نباشد، خواننده چه می‌گیرد؟",
      "steps": [
        {
          "name": "ثبت منبع اصلی",
          "short": "Commit",
          "detail": "قیمت ۴۵ با نسخه v2 در DB ثبت می‌شود.",
          "route": [
            0,
            2
          ],
          "packet": "COMMIT",
          "input": "update price=45; commit",
          "output": "DB=v2",
          "result": "منبع اصلی تغییر کرد.",
          "explanation": "حذف کش قبل از commit ممکن است باعث پر شدن با مقدار قبلی شود.",
          "state": [
            "COMMIT v2",
            "50 v1",
            "45 v2"
          ]
        },
        {
          "name": "حذف کلید",
          "short": "حذف",
          "detail": "برنامه کلید کش را حذف می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "DEL",
          "input": "DEL product:42",
          "output": "MISS",
          "result": "کش قدیمی حذف شد.",
          "explanation": "اگر حذف شکست بخورد، retry یا outbox/سازوکار هماهنگی لازم است.",
          "state": [
            "Invalidated",
            "MISS",
            "45 v2"
          ],
          "roundTrip": true
        },
        {
          "name": "خواندن بعدی",
          "short": "پر کردن",
          "detail": "درخواست بعدی miss دارد و DB مقدار ۴۵ را می‌دهد.",
          "route": [
            0,
            2
          ],
          "packet": "SELECT",
          "input": "read after invalidation",
          "output": "45 v2",
          "result": "خواننده مقدار تازه را دارد.",
          "explanation": "این مرحله فقط خواندن DB است؛ سپس برنامه می‌تواند کش را پر کند.",
          "state": [
            "Read=45",
            "MISS",
            "45 v2"
          ],
          "roundTrip": true
        },
        {
          "name": "ثبت کش تازه",
          "short": "نتیجه",
          "detail": "بدون نویسندهٔ هم‌زمان دیگر، مقدار v2 در کش قرار می‌گیرد.",
          "route": [
            0,
            1
          ],
          "packet": "SET",
          "input": "cache 45 v2 with TTL",
          "output": "Cache=45 v2",
          "result": "نسخه‌ها دوباره برابر شدند.",
          "explanation": "این ترتیب یک سناریوی بدون race است، نه تضمین سازگاری قوی.",
          "state": [
            "Done",
            "45 v2",
            "45 v2"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "race",
      "label": "پر کردن دیررس بعد از حذف",
      "example": "reader v1 races writer v2",
      "prediction": "آیا حذف کلید بعد از commit برای جلوگیری از تمام stale readها کافی است؟",
      "steps": [
        {
          "name": "خواننده نسخهٔ قدیمی را می‌گیرد",
          "short": "خواندن",
          "detail": "R بعد از miss نسخه v1 را از DB می‌خواند و قبل از SET متوقف می‌شود.",
          "route": [
            0,
            2
          ],
          "packet": "READ",
          "input": "R reads 50 v1",
          "output": "R holds v1",
          "result": "خواننده مقدار قدیمی را در حافظه دارد.",
          "explanation": "توقف بین SELECT و SET در برنامهٔ هم‌زمان ممکن است رخ دهد.",
          "state": [
            "R holds v1",
            "MISS",
            "50 v1"
          ],
          "roundTrip": true
        },
        {
          "name": "ثبت نسخهٔ تازه",
          "short": "نوشتن",
          "detail": "W نسخه v2 را commit می‌کند.",
          "route": [
            0,
            2
          ],
          "packet": "COMMIT",
          "input": "W commits 45 v2",
          "output": "DB=v2",
          "result": "خواندن قبلی دیگر تازه نیست.",
          "explanation": "R هنوز دادهٔ خودش را نگه داشته است.",
          "state": [
            "R holds v1 | W done",
            "MISS",
            "45 v2"
          ]
        },
        {
          "name": "حذف ورودی کش",
          "short": "حذف",
          "detail": "W کلید را حذف می‌کند؛ در این لحظه کش خالی است.",
          "route": [
            0,
            1
          ],
          "packet": "DEL",
          "input": "W deletes key",
          "output": "MISS",
          "result": "کش خالی شد.",
          "explanation": "DEL صرفاً ورودی فعلی را حذف می‌کند؛ جلوی نوشتن آینده را نمی‌گیرد.",
          "state": [
            "R holds v1",
            "MISS",
            "45 v2"
          ]
        },
        {
          "name": "نوشتن دیررس",
          "short": "رقابت",
          "detail": "R مقدار v1 را بعد از DEL ذخیره می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "SET",
          "input": "R sets 50 v1",
          "output": "STALE 50 v1",
          "result": "کش دوباره قدیمی شد.",
          "explanation": "در طراحی واقعی می‌توان از کنترل نسخه با marker پایدار، هماهنگی نویسنده/خواننده یا پذیرش محدود stale read استفاده کرد؛ حذف ساده کافی نیست.",
          "state": [
            "R done",
            "STALE 50 v1",
            "45 v2"
          ],
          "tone": "error"
        }
      ],
      "edgeCase": "race خواندن و نوشتن بین دو ذخیره‌ساز مستقل."
    }
  ],
  "pitfall": "حذف کش و commit DB دو عمل مستقل‌اند. TTL، retry و کنترل نسخه هر کدام محدودیت دارند؛ هیچ الگوی ساده‌ای به‌تنهایی سازگاری قوی نمی‌دهد.",
  "takeaway": "سازگاری مورد نیاز را مشخص کنید و ترتیب رویدادها، شکست حذف و پر کردن دیررس را طراحی کنید.",
  "quiz": {
    "question": "آیا commit در DB به خودی خود یک Redis مستقل را به‌روز می‌کند؟",
    "options": [
      "خیر",
      "بله همیشه",
      "فقط با GET"
    ],
    "correct": 0,
    "explanation": "هماهنگی کش باید به‌طور صریح طراحی شود."
  },
  "references": [
    {
      "label": "Microsoft — Cache-Aside consistency",
      "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside"
    },
    {
      "label": "Redis — DEL",
      "url": "https://redis.io/docs/latest/commands/del/"
    }
  ],
  "field": {
    "task": "ترتیب رقابت را با یک دیکشنری محلی بازسازی کنید.",
    "observe": "در پایان DB برابر ۴۵ و کش برابر ۵۰ است.",
    "limit": "این فقط ترتیب منطقی است؛ Redis واقعی یا تراکنش توزیع‌شده اجرا نمی‌شود.",
    "command": "db=50\ncache={}\nreader=db\ndb=45\ncache.pop('p',None)\ncache['p']=reader\nprint(db,cache['p'])",
    "next": {
      "slug": "replication",
      "label": "Replication",
      "category": "databases"
    }
  },
  "model": "database"
} satisfies BackendLesson;
export default lesson;
