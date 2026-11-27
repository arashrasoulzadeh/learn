import type {BackendLesson} from '../backend/types';
const lesson = {
  "slug": "caching",
  "title": "Caching — کاهش هزینهٔ خواندن",
  "description": "Cache-aside، hit، miss و TTL را با قیمت محصول تمرین کنید.",
  "order": 27,
  "actors": [
    {
      "label": "برنامه",
      "sub": "Application",
      "icon": "app"
    },
    {
      "label": "کش",
      "sub": "Cache",
      "icon": "cache"
    },
    {
      "label": "پایگاه داده",
      "sub": "Source of truth",
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
    "title": "کلید، تازگی و تعداد خواندن از DB",
    "labels": [
      "درخواست / شمارنده",
      "کش product:42",
      "دادهٔ اصلی"
    ],
    "context": "مدل cache-aside: برنامه ابتدا کش را می‌خواند، در miss به DB می‌رود و نتیجه را با TTL ذخیره می‌کند. کش در این مثال منبع حقیقت نیست."
  },
  "teaching": {
    "goal": "مسیر hit و miss و هزینهٔ خواندن پس از انقضای TTL را پیش‌بینی کنید.",
    "terms": [
      [
        "Cache hit",
        "وجود پاسخ قابل استفاده در کش."
      ],
      [
        "Cache miss",
        "نبود پاسخ قابل استفاده."
      ],
      [
        "TTL",
        "مدت اعتبار یا عمر ورودی طبق سیاست کش."
      ],
      [
        "Cache-aside",
        "برنامه خودش miss را از منبع اصلی پر می‌کند."
      ]
    ],
    "practice": {
      "question": "قیمت در کش ۵۰ و TTL معتبر است؛ قیمت DB به ۴۵ تغییر کرده ولی کش invalid نشده. چه چیزی ممکن است پاسخ داده شود؟",
      "options": [
        "حتماً ۴۵",
        "۵۰ تا انقضا یا invalidation",
        "همیشه خطای ۵۰۰"
      ],
      "correct": 1,
      "explanation": "cache-aside بدون سازوکار هماهنگی می‌تواند مقدار قدیمی را تا انقضا برگرداند.",
      "hint": "TTL تضمین همگامی لحظه‌ای نیست."
    }
  },
  "scenarios": [
    {
      "id": "miss",
      "label": "پر کردن کش خالی",
      "example": "GET product:42",
      "prediction": "در miss چند بار باید DB را در این درخواست بخوانیم؟",
      "steps": [
        {
          "name": "جست‌وجوی کلید",
          "short": "Miss",
          "detail": "برنامه ابتدا کلید محصول را از کش می‌پرسد.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET product:42",
          "output": "MISS",
          "result": "پاسخ در کش نیست.",
          "explanation": "miss رویداد عادی است و الزاماً خطا نیست.",
          "state": [
            "DB reads=0",
            "MISS",
            "price=50"
          ],
          "roundTrip": true
        },
        {
          "name": "خواندن منبع اصلی",
          "short": "DB",
          "detail": "برنامه از DB قیمت را می‌خواند.",
          "route": [
            0,
            2
          ],
          "packet": "SELECT",
          "input": "SELECT price FROM products WHERE id=42;",
          "output": "price=50",
          "result": "یک بار DB خوانده شد.",
          "explanation": "TTL بعد از خواندن مقدار تنظیم می‌شود؛ هم‌زمانی نوشتن در درس بعد بررسی می‌شود.",
          "state": [
            "DB reads=1",
            "MISS",
            "price=50"
          ],
          "roundTrip": true
        },
        {
          "name": "ذخیره و پاسخ",
          "short": "پر کردن",
          "detail": "برنامه مقدار را با TTL نمونه ۶۰ ثانیه در کش می‌گذارد.",
          "route": [
            0,
            1
          ],
          "packet": "SET",
          "input": "SET product:42 50 EX 60",
          "output": "Cached price=50; TTL=60",
          "result": "پاسخ و کش آماده‌اند.",
          "explanation": "اگر نوشتن کش شکست بخورد، بسته به سیاست برنامه ممکن است هنوز پاسخ DB را بدهد.",
          "state": [
            "DB reads=1",
            "50 | TTL=60",
            "price=50"
          ],
          "tone": "success",
          "roundTrip": true
        }
      ]
    },
    {
      "id": "hit",
      "label": "خواندن از کش گرم",
      "example": "GET product:42",
      "prediction": "با TTL معتبر آیا خواندن DB ضروری است؟",
      "steps": [
        {
          "name": "درخواست تکراری",
          "short": "Hit",
          "detail": "کلید با TTL باقی‌مانده ۴۰ ثانیه در کش وجود دارد.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET product:42",
          "output": "HIT: 50",
          "result": "مقدار قابل استفاده است.",
          "explanation": "در این مثال TTL هنگام خواندن تمدید نمی‌شود؛ سیاست sliding expiration متفاوت است.",
          "state": [
            "DB reads=0",
            "HIT 50 | TTL=40",
            "price=50"
          ],
          "roundTrip": true
        },
        {
          "name": "پاسخ بدون DB",
          "short": "نتیجه",
          "detail": "برنامه قیمت را از کش استفاده می‌کند.",
          "route": [
            0
          ],
          "packet": "RETURN",
          "input": "return cached value",
          "output": "50; 0 DB reads",
          "result": "خواندن DB حذف شد.",
          "explanation": "این شمارش فقط برای همین درخواست است؛ latency واقعی با شبکه و اندازهٔ داده تغییر می‌کند.",
          "state": [
            "DB reads=0",
            "50 | TTL=40",
            "Not queried"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "expiry",
      "label": "انقضای ورودی و خواندن تازه",
      "example": "TTL=0",
      "prediction": "وقتی TTL تمام شود و DB تغییر کرده باشد، درخواست بعدی چه مسیری دارد؟",
      "steps": [
        {
          "name": "انقضای منطقی",
          "short": "انقضا",
          "detail": "ورودی قدیمی دیگر معتبر نیست.",
          "route": [
            1
          ],
          "packet": "TTL",
          "input": "old=50; TTL elapsed",
          "output": "MISS",
          "result": "مقدار قبلی پاسخ عادی نیست.",
          "explanation": "حذف فیزیکی ممکن است دیرتر انجام شود؛ رفتار خواندن بر اساس سیاست انقضاست.",
          "state": [
            "DB reads=0",
            "MISS expired",
            "price=45"
          ]
        },
        {
          "name": "خواندن مقدار تازه",
          "short": "DB",
          "detail": "درخواست miss از DB قیمت ۴۵ را می‌گیرد.",
          "route": [
            0,
            2
          ],
          "packet": "SELECT",
          "input": "read current price",
          "output": "45",
          "result": "قیمت جدید خوانده شد.",
          "explanation": "این سناریو تغییر هم‌زمان دیگری ندارد.",
          "state": [
            "DB reads=1",
            "MISS",
            "price=45"
          ],
          "roundTrip": true
        },
        {
          "name": "پر کردن دوباره",
          "short": "نتیجه",
          "detail": "مقدار تازه در کش قرار می‌گیرد.",
          "route": [
            0,
            1
          ],
          "packet": "SET",
          "input": "SET product:42 45 EX 60",
          "output": "45; TTL=60",
          "result": "کش دوباره گرم شد.",
          "explanation": "هم‌زمان رسیدن missهای زیاد ممکن است باعث stampede شود؛ single-flight یا راهبرد مناسب بررسی شود.",
          "state": [
            "DB reads=1",
            "45 | TTL=60",
            "price=45"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "TTL منقضی باعث miss و هزینهٔ خواندن دوباره می‌شود."
    }
  ],
  "pitfall": "TTL تازگی لحظه‌ای را تضمین نمی‌کند. cache hit rate به الگوی بار و ظرفیت بستگی دارد؛ کش نباید خطای منبع را پنهان کند.",
  "takeaway": "کش هزینهٔ خواندن را با هزینهٔ تازگی، حافظه و پیچیدگی هماهنگی معاوضه می‌کند.",
  "quiz": {
    "question": "در cache-aside، هنگام miss معمولاً چه کسی مقدار را از DB می‌خواند و کش می‌کند؟",
    "options": [
      "برنامه",
      "TCP",
      "مرورگر همیشه"
    ],
    "correct": 0,
    "explanation": "برنامه مدیریت miss و پر کردن کش را انجام می‌دهد."
  },
  "references": [
    {
      "label": "Microsoft — Cache-Aside pattern",
      "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside"
    },
    {
      "label": "Redis — EXPIRE",
      "url": "https://redis.io/docs/latest/commands/expire/"
    }
  ],
  "field": {
    "task": "در Python یک کش ساده با دیکشنری بسازید و دو بار همان کلید را بخوانید.",
    "observe": "DB read فقط یک بار چاپ می‌شود و هر دو پاسخ ۵۰ هستند.",
    "limit": "این مثال TTL، هم‌زمانی و محدودیت حافظه ندارد؛ مناسب تولید نیست.",
    "command": "cache={}\ndef get(k):\n    if k not in cache:\n        print('DB read')\n        cache[k]=50\n    return cache[k]\nprint(get('product:42'))\nprint(get('product:42'))",
    "next": {
      "slug": "cache-invalidation",
      "label": "Cache Invalidation",
      "category": "databases"
    }
  },
  "model": "database"
} satisfies BackendLesson;
export default lesson;
