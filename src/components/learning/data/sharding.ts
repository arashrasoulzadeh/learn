import type {BackendLesson} from '../backend/types';
const lesson = {
  "slug": "sharding",
  "title": "Sharding — تقسیم داده میان گره‌ها",
  "description": "مسیریابی بر اساس shard key، scatter-gather و توزیع نامتوازن داده را بررسی کنید.",
  "order": 30,
  "actors": [
    {
      "label": "مسیریاب",
      "sub": "Shard router",
      "icon": "router"
    },
    {
      "label": "Shard A",
      "sub": "Even user IDs",
      "icon": "db"
    },
    {
      "label": "Shard B",
      "sub": "Odd user IDs",
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
    "title": "مسیر query و سهم دادهٔ هر shard",
    "labels": [
      "Router / درخواست",
      "Shard A",
      "Shard B"
    ],
    "context": "مدل آموزشی دو shard با user_id % 2؛ هر shard بخشی متفاوت از داده را دارد. الگوریتم واقعی hash، range یا جدول مسیر می‌تواند متفاوت باشد."
  },
  "teaching": {
    "goal": "از روی shard key مسیر query را تعیین کنید و هزینهٔ درخواست بین shardها و hotspot را تشخیص دهید.",
    "terms": [
      [
        "Shard key",
        "کلیدی که توزیع و مسیریابی داده را تعیین می‌کند."
      ],
      [
        "Targeted query",
        "درخواست قابل هدایت به shard مشخص."
      ],
      [
        "Scatter-gather",
        "ارسال پرس‌وجو به چند shard و ترکیب پاسخ‌ها."
      ],
      [
        "Hotspot",
        "تمرکز نامتوازن بار روی یک shard."
      ]
    ],
    "practice": {
      "question": "شارد بر اساس user_id%2 تعیین شده. query فقط user_id=17 را می‌خواهد. کدام shard کافی است؟",
      "options": [
        "A (زوج)",
        "B (فرد)",
        "همیشه هر دو"
      ],
      "correct": 1,
      "explanation": "۱۷ فرد است؛ در همین مدل B مالک داده است. query دارای shard key می‌تواند targeted باشد.",
      "hint": "باقی‌ماندهٔ تقسیم بر ۲ را حساب کنید."
    }
  },
  "scenarios": [
    {
      "id": "targeted",
      "label": "خواندن با shard key",
      "example": "user_id=42; modulo 2",
      "prediction": "آیا لازم است هر دو shard خوانده شوند؟",
      "steps": [
        {
          "name": "محاسبه مسیر",
          "short": "مسیریابی",
          "detail": "router برای شناسهٔ ۴۲ باقی‌ماندهٔ تقسیم بر ۲ را محاسبه می‌کند.",
          "route": [
            0
          ],
          "packet": "ROUTE",
          "input": "42 % 2 = 0",
          "output": "Target shard A",
          "result": "مقصد مشخص شد.",
          "explanation": "این یک الگوریتم ثابت ساده است؛ تغییر تعداد shard با modulo می‌تواند جابه‌جایی گسترده ایجاد کند.",
          "state": [
            "user=42 → A",
            "users 42,44",
            "users 17,19"
          ]
        },
        {
          "name": "درخواست فقط به A",
          "short": "خواندن",
          "detail": "router query را تنها به A ارسال می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "QUERY",
          "input": "SELECT orders WHERE user_id=42",
          "output": "2 orders",
          "result": "B خوانده نشد.",
          "explanation": "ایندکس محلی در هر shard هنوز مهم است.",
          "state": [
            "A only",
            "2 matching",
            "Not queried"
          ],
          "roundTrip": true
        },
        {
          "name": "تحویل نتیجه",
          "short": "نتیجه",
          "detail": "نتیجهٔ A به caller برمی‌گردد.",
          "route": [
            0
          ],
          "packet": "RETURN",
          "input": "merge one result",
          "output": "2 orders; 1 shard contacted",
          "result": "مسیریابی هدفمند انجام شد.",
          "explanation": "شاردینگ لزوماً latency یک query را کم نمی‌کند؛ توزیع بار و ظرفیت مهم‌اند.",
          "state": [
            "Done",
            "2 orders",
            "Not queried"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "scatter",
      "label": "گزارش بدون shard key",
      "example": "COUNT(*) all orders",
      "prediction": "بدون shard key و بدون خلاصهٔ از قبل محاسبه‌شده، کدام shardها لازم‌اند؟",
      "steps": [
        {
          "name": "پرس‌وجوی کلی",
          "short": "برنامه",
          "detail": "router نمی‌تواند query را به یک shard محدود کند.",
          "route": [
            0
          ],
          "packet": "PLAN",
          "input": "SELECT COUNT(*) FROM orders",
          "output": "Scatter to A and B",
          "result": "هر دو سهم داده لازم‌اند.",
          "explanation": "در سامانهٔ واقعی این query می‌تواند هم‌زمان به shardها ارسال شود؛ گام‌ها ترتیب نمایشی‌اند.",
          "state": [
            "Scatter",
            "3 rows",
            "5 rows"
          ]
        },
        {
          "name": "خواندن A",
          "short": "شارد A",
          "detail": "A شمارش محلی ۳ را برمی‌گرداند.",
          "route": [
            0,
            1
          ],
          "packet": "COUNT",
          "input": "COUNT(*) on A",
          "output": "3",
          "result": "یک نتیجهٔ جزئی رسید.",
          "explanation": "اگر خواندن‌ها snapshot مشترک نداشته باشند، گزارش در حضور تغییر هم‌زمان ممکن است سازگار نباشد.",
          "state": [
            "A=3; waiting B",
            "3",
            "5"
          ],
          "roundTrip": true
        },
        {
          "name": "خواندن B و ترکیب",
          "short": "شارد B",
          "detail": "B شمارش ۵ را می‌دهد؛ router ۳ و ۵ را جمع می‌کند.",
          "route": [
            0,
            2
          ],
          "packet": "COUNT",
          "input": "COUNT(*) on B; merge",
          "output": "Total=8",
          "result": "دو shard خوانده شدند.",
          "explanation": "جمع COUNT ساده است؛ sort، limit و join بین shardها هماهنگی بیشتری می‌خواهند.",
          "state": [
            "Total=8",
            "3",
            "5"
          ],
          "roundTrip": true,
          "tone": "success"
        }
      ],
      "edgeCase": "گزارش بدون کلید مسیریابی هزینهٔ fan-out دارد."
    },
    {
      "id": "hotspot",
      "label": "بار نامتوازن روی یک shard",
      "example": "80 requests for user=42",
      "prediction": "اگر بیشتر درخواست‌ها متعلق به یک کاربر باشد، آیا hash کردن همیشه بار را متوازن می‌کند؟",
      "steps": [
        {
          "name": "بار متوازن نمونه",
          "short": "شروع",
          "detail": "در شروع هر shard ۱۰ درخواست دارد.",
          "route": [
            0
          ],
          "packet": "LOAD",
          "input": "A=10; B=10",
          "output": "Balanced sample",
          "result": "بار اولیه نزدیک است.",
          "explanation": "تعداد داده و تعداد درخواست دو معیار مستقل‌اند.",
          "state": [
            "20 requests",
            "10 requests",
            "10 requests"
          ]
        },
        {
          "name": "تمرکز بار یک کلید",
          "short": "Hotspot",
          "detail": "۸۰ درخواست تازه برای user=42 به A هدایت می‌شوند.",
          "route": [
            0,
            1
          ],
          "packet": "HOT",
          "input": "80 additional requests for 42",
          "output": "A=90; B=10",
          "result": "یک shard داغ شد.",
          "explanation": "hash یک کلید داغ را بین shardها تقسیم نمی‌کند؛ همهٔ درخواست‌های همان کلید مسیر ثابت دارند.",
          "state": [
            "100 requests",
            "HOT 90 requests",
            "10 requests"
          ],
          "tone": "error"
        },
        {
          "name": "بررسی راهکار",
          "short": "طراحی",
          "detail": "اندازه‌گیری نشان می‌دهد باید سیاست بار کلید داغ بررسی شود.",
          "route": [
            0
          ],
          "packet": "PLAN",
          "input": "consider cache / key redesign",
          "output": "Hot key identified",
          "result": "صرف افزودن shard لزوماً مشکل را حل نمی‌کند.",
          "explanation": "تقسیم کلید یا cache می‌تواند خواندن را پخش کند اما تراکنش‌ها و سازگاری را پیچیده‌تر کند.",
          "state": [
            "Plan needed",
            "HOT 90 requests",
            "10 requests"
          ]
        }
      ],
      "edgeCase": "توزیع یکنواخت کلید به معنی توزیع یکنواخت درخواست نیست."
    }
  ],
  "pitfall": "sharding با replication فرق دارد: اولی داده را تقسیم می‌کند، دومی کپی می‌سازد. تراکنش و جابه‌جایی بین shardها پیچیدگی دارند.",
  "takeaway": "shard key را با الگوی query، توزیع بار و نیازهای تراکنش انتخاب کنید.",
  "quiz": {
    "question": "تفاوت اصلی shard با replica در این مدل چیست؟",
    "options": [
      "shard بخش متفاوت داده دارد؛ replica کپی دارد",
      "هر دو همیشه کپی کامل‌اند",
      "shard فقط cache است"
    ],
    "correct": 0,
    "explanation": "sharding داده را تقسیم می‌کند؛ replication داده را تکثیر می‌کند."
  },
  "references": [
    {
      "label": "MongoDB — Sharding",
      "url": "https://www.mongodb.com/docs/manual/sharding/"
    },
    {
      "label": "MongoDB — Shard keys",
      "url": "https://www.mongodb.com/docs/manual/core/sharding-shard-key/"
    }
  ],
  "field": {
    "task": "در Python کاربران نمونه را بر اساس زوج یا فرد بودن شناسه تقسیم کنید و سپس تعداد درخواست‌ها برای کلید داغ را بشمارید.",
    "observe": "۴۲ و ۴۴ در A، ۱۷ و ۱۹ در B قرار می‌گیرند؛ ۸۰ درخواست ۴۲ همگی A را هدف می‌گیرند.",
    "limit": "این مدل فقط modulo ثابت است؛ resharding، تراکنش بین shardها و hash واقعی را پیاده نمی‌کند.",
    "command": "shards={0:[],1:[]}\nfor user in [42,17,44,19]: shards[user%2].append(user)\nprint(shards)\nprint('hot shard:',42%2)"
  },
  "model": "database"
} satisfies BackendLesson;
export default lesson;
