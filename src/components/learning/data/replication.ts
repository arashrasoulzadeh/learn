import type {BackendLesson} from '../backend/types';
const lesson = {
  "slug": "replication",
  "title": "Replication — تکثیر و عقب‌ماندگی نسخه‌ها",
  "description": "تکثیر غیرهمگام primary/replica، read-after-write و failover را با شمارهٔ لاگ نمونه بررسی کنید.",
  "order": 29,
  "actors": [
    {
      "label": "Primary",
      "sub": "Write leader",
      "icon": "db"
    },
    {
      "label": "Replica A",
      "sub": "Follower",
      "icon": "db"
    },
    {
      "label": "Replica B",
      "sub": "Follower",
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
    "title": "موقعیت لاگ و دادهٔ قابل مشاهده",
    "labels": [
      "Primary",
      "Replica A",
      "Replica B"
    ],
    "context": "مدل تکثیر غیرهمگام با یک primary، دو replica و شمارهٔ لاگ آموزشی؛ شماره‌ها LSN واقعی PostgreSQL نیستند. دریافت، flush و replay در موتور واقعی متفاوت‌اند."
  },
  "teaching": {
    "goal": "اثر lag بر خواندن پس از نوشتن و خطر از دست رفتن commit در failover غیرهمگام را توضیح دهید.",
    "terms": [
      [
        "Primary",
        "گره پذیرا و ثبت‌کنندهٔ نوشتن در مدل تک‌رهبر."
      ],
      [
        "Replica",
        "گره دارای کپی داده از primary."
      ],
      [
        "Replication lag",
        "فاصلهٔ پیشرفت replica از primary."
      ],
      [
        "Failover",
        "انتقال نقش سرویس‌دهی به گره دیگر پس از خرابی."
      ]
    ],
    "practice": {
      "question": "primary نوشتن شمارهٔ ۱۰۲ را تأیید کرده ولی replica فقط تا ۱۰۱ replay کرده. خواندن فوری از replica چه می‌تواند ببیند؟",
      "options": [
        "نسخهٔ قبلی",
        "حتماً ۱۰۲",
        "همیشه خطای DNS"
      ],
      "correct": 0,
      "explanation": "در تکثیر غیرهمگام تأیید primary به معنی replay در replica نیست.",
      "hint": "موقعیت replay replica را مقایسه کنید."
    }
  },
  "scenarios": [
    {
      "id": "healthy",
      "label": "تکثیر عادی لاگ",
      "example": "log 101 → 102",
      "prediction": "بعد از commit در primary، آیا هر دو replica همان لحظه جلو رفته‌اند؟",
      "steps": [
        {
          "name": "ثبت نوشتن",
          "short": "Commit",
          "detail": "primary قیمت را به ۴۵ تغییر می‌دهد و لاگ ۱۰۲ را ثبت می‌کند.",
          "route": [
            0
          ],
          "packet": "WAL",
          "input": "commit price=45 at 102",
          "output": "Primary=102",
          "result": "نوشتن در primary ثبت شد.",
          "explanation": "در مدل async تأیید منتظر replay replicaها نیست. در این مدل ACK بعد از دوام محلی فرض می‌شود؛ گزینه‌های synchronous_commit و synchronous standby سیاست را تغییر می‌دهند.",
          "state": [
            "102 · 45",
            "101 · 50",
            "101 · 50"
          ],
          "flightLabels": [
            "COMMIT WAL 102"
          ],
          "diagnostic": "در async replication، ACK primary لزوماً منتظر دریافت/flush/replay standby نیست."
        },
        {
          "name": "ارسال و replay A",
          "short": "تکثیر A",
          "detail": "A لاگ را دریافت و در این snapshot replay می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "LOG",
          "input": "replicate log 102",
          "output": "A=102",
          "result": "A به primary رسید.",
          "explanation": "دریافت و replay در موتور واقعی دو مرحلهٔ متفاوت‌اند.",
          "state": [
            "102 · 45",
            "102 · 45",
            "101 · 50"
          ],
          "flightLabels": [
            "send + replay 102"
          ],
          "diagnostic": "receive، durable flush و replay سه وضعیت جدا هستند؛ در این snapshot A تا replay پیش رفته."
        },
        {
          "name": "رسیدن B",
          "short": "تکثیر B",
          "detail": "B نیز لاگ را replay می‌کند.",
          "route": [
            0,
            2
          ],
          "packet": "LOG",
          "input": "replicate log 102",
          "output": "Both replicas caught up",
          "result": "نسخه‌ها در این لحظه برابرند.",
          "explanation": "نوشتن تازه می‌تواند دوباره فاصله ایجاد کند.",
          "state": [
            "102 · 45",
            "SYNC 102 · 45",
            "SYNC 102 · 45"
          ],
          "tone": "success",
          "flightLabels": [
            "send + replay 102"
          ],
          "diagnostic": "B نیز اکنون همگام است؛ همگامی لحظه‌ای با نبود lag در آینده یکی نیست."
        }
      ]
    },
    {
      "id": "lag",
      "label": "خواندن قدیمی از replica",
      "example": "Primary=102; A=101",
      "prediction": "کاربر بلافاصله بعد از نوشتن از A بخواند، چه می‌بیند؟",
      "steps": [
        {
          "name": "ثبت روی primary",
          "short": "نوشتن",
          "detail": "primary نوشتن ۱۰۲ را تأیید کرده ولی A هنوز replay نکرده است.",
          "route": [
            0
          ],
          "packet": "COMMIT",
          "input": "price=45; commit 102",
          "output": "Write acknowledged",
          "result": "تأیید نوشتن به client رسیده است.",
          "explanation": "مدل فرض می‌کند primary ثبت محلی پایدار دارد.",
          "state": [
            "102 · 45",
            "LAG 101 · 50",
            "101 · 50"
          ],
          "flightLabels": [
            "local commit"
          ],
          "diagnostic": "نوشتن در primary پایدار فرض شده؛ replica هنوز offset 101 دارد."
        },
        {
          "name": "خواندن از A",
          "short": "خواندن قدیمی",
          "detail": "خواندن روی A قیمت ۵۰ را می‌بیند.",
          "route": [
            1
          ],
          "packet": "READ",
          "input": "SELECT price on replica A",
          "output": "50 (stale read)",
          "result": "read-after-write برقرار نیست.",
          "explanation": "این مشکل با cache stale مشابه به نظر می‌رسد، اما اینجا منبع خواندن replica عقب‌مانده است.",
          "state": [
            "102 · 45",
            "LAG 101 · 50",
            "101 · 50"
          ],
          "tone": "error",
          "flightLabels": [
            "read replica A"
          ],
          "diagnostic": "SELECT تازه روی A مقدار 50 را می‌بیند؛ read-after-write شکسته است."
        },
        {
          "name": "سیاست خواندن سازگارتر",
          "short": "راهکار",
          "detail": "خواندن بعد از نوشتن به primary هدایت می‌شود یا تا replay نسخهٔ لازم صبر می‌کند.",
          "route": [
            0
          ],
          "packet": "READ",
          "input": "read primary / wait for replay ≥102",
          "output": "45",
          "result": "نسخهٔ لازم خوانده شد.",
          "explanation": "مسیر primary هزینهٔ توزیع خواندن دارد؛ wait ممکن است timeout شود.",
          "state": [
            "102 · 45",
            "LAG 101 · 50",
            "101 · 50"
          ],
          "tone": "success",
          "flightLabels": [
            "read primary"
          ],
          "diagnostic": "هدایت خواندن پس از نوشتن به primary یا انتظار replay نسخه لازم tradeoff latency دارد."
        }
      ],
      "edgeCase": "replica عقب‌مانده ممکن است پاسخ کهنه دهد."
    },
    {
      "id": "failover",
      "label": "خرابی primary پیش از تکثیر",
      "example": "commit 102 not replicated",
      "prediction": "اگر primary پس از تأیید ۱۰۲ از دست برود و replica تا ۱۰۱ باشد، ۱۰۲ چه می‌شود؟",
      "steps": [
        {
          "name": "commit تأییدشدهٔ محلی",
          "short": "ثبت",
          "detail": "primary شماره ۱۰۲ را ثبت و به client تأیید می‌کند.",
          "route": [
            0
          ],
          "packet": "COMMIT",
          "input": "ack 102 before replica receives",
          "output": "Acknowledged locally",
          "result": "replicaها هنوز ۱۰۱ دارند.",
          "explanation": "async replication پنجرهٔ از دست رفتن داده دارد.",
          "state": [
            "102 · 45",
            "101 · 50",
            "101 · 50"
          ],
          "flightLabels": [
            "ack commit 102"
          ],
          "diagnostic": "تأیید محلی async پنجرهٔ از دست رفتن نوشتن تأییدشده ایجاد می‌کند."
        },
        {
          "name": "خرابی primary",
          "short": "خرابی",
          "detail": "primary و لاگ ۱۰۲ در این فرض قابل بازیابی نیستند.",
          "route": [
            0
          ],
          "packet": "DOWN",
          "input": "Primary lost before replication",
          "output": "Primary unavailable",
          "result": "هیچ replica نسخه ۱۰۲ ندارد.",
          "explanation": "اگر primary قابل بازیابی باشد، نتیجه متفاوت است؛ اینجا از دست رفتن دائمی را فرض می‌کنیم.",
          "state": [
            "DOWN",
            "101 · 50",
            "101 · 50"
          ],
          "tone": "error",
          "flightLabels": [
            "primary down"
          ],
          "diagnostic": "در مدل primary و لاگ قابل بازیابی نیستند؛ اگر قابل بازیابی بود نتیجه فرق داشت."
        },
        {
          "name": "ارتقای replica با fencing",
          "short": "ارتقا",
          "detail": "هماهنگ‌کننده پس از جلوگیری از نویسندگی primary قدیمی، A را ارتقا می‌دهد.",
          "route": [
            1
          ],
          "packet": "PROMOTE",
          "input": "fence old primary; promote A",
          "output": "New primary at 101; 102 lost",
          "result": "سرویس بازمی‌گردد اما commit ۱۰۲ از دست رفته است.",
          "explanation": "تکثیر همگام با تضمین مناسب می‌تواند این خطر را کاهش دهد، اما هزینهٔ latency و availability دارد.",
          "state": [
            "FENCED",
            "PRIMARY 101 · 50",
            "101 · 50"
          ],
          "tone": "error",
          "flightLabels": [
            "fence + promote"
          ],
          "diagnostic": "فقط بعد از fencing نویسندهٔ قدیمی promote کنید؛ 102 در هیچ replica موجود نیست و از دست رفته است."
        }
      ],
      "edgeCase": "در failover غیرهمگام ممکن است نوشتن تأییدشده از دست برود."
    }
  ],
  "pitfall": "replication جای backup نیست؛ حذف و خرابی منطقی می‌تواند تکثیر شود. جلوگیری از split-brain به fencing و هماهنگی نیاز دارد.",
  "takeaway": "بین تازگی خواندن، تضمین دوام، latency و دسترس‌پذیری انتخاب کنید.",
  "quiz": {
    "question": "آیا replica غیرهمگام لزوماً آخرین commit را بلافاصله دارد؟",
    "options": [
      "خیر",
      "بله همیشه",
      "فقط با TTL"
    ],
    "correct": 0,
    "explanation": "تأیید primary و replay replica رویدادهای جدا هستند."
  },
  "references": [
    {
      "label": "PostgreSQL — Log-shipping standby servers",
      "url": "https://www.postgresql.org/docs/current/warm-standby.html"
    },
    {
      "label": "PostgreSQL — Replication configuration",
      "url": "https://www.postgresql.org/docs/current/runtime-config-replication.html"
    }
  ],
  "field": {
    "task": "یک primary و replica را با دو دیکشنری محلی مدل کنید و قبل و بعد replay بخوانید.",
    "observe": "قبل از کپی ۵۰ و بعد از کپی ۴۵ مشاهده می‌شود.",
    "limit": "این مدل زمان‌بندی، WAL و crash recovery واقعی ندارد.",
    "command": "primary={'price':50}\nreplica=primary.copy()\nprimary['price']=45\nprint(replica['price'])\nreplica=primary.copy()\nprint(replica['price'])",
    "next": {
      "slug": "sharding",
      "label": "Sharding",
      "category": "databases"
    }
  },
  "model": "database"
} satisfies BackendLesson;
export default lesson;
