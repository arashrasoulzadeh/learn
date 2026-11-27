import type {BackendLesson} from '../backend/types';
const lesson = {
  "slug": "connection-pooling",
  "title": "Connection Pooling — مدیریت اتصال محدود",
  "description": "اجاره، بازگشت، صف انتظار و نشت اتصال در یک pool دو عضوی.",
  "order": 26,
  "actors": [
    {
      "label": "درخواست‌ها",
      "sub": "Requests",
      "icon": "app"
    },
    {
      "label": "مخزن اتصال",
      "sub": "Pool",
      "icon": "queue"
    },
    {
      "label": "پایگاه داده",
      "sub": "DB connections",
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
    "title": "ظرفیت و مالکیت اتصال‌ها",
    "labels": [
      "درخواست‌ها",
      "دو اتصال pool",
      "وضعیت DB"
    ],
    "context": "pool نمونه دو اتصال دارد و یک درخواست در هر لحظه مالک هر اتصال است. pool واقعی ممکن است اندازهٔ پویا و سیاست timeout متفاوتی داشته باشد."
  },
  "teaching": {
    "goal": "ظرفیت pool، صف و زمان آزادسازی را تحلیل کنید و تفاوت نشت اتصال با خرابی DB را بفهمید.",
    "terms": [
      [
        "Acquire",
        "اجارهٔ اتصال از pool."
      ],
      [
        "Release",
        "بازگرداندن اتصال پس از پایان کار."
      ],
      [
        "Pool exhaustion",
        "تمام اتصال‌ها در استفاده یا غیرقابل دسترس‌اند."
      ],
      [
        "Acquire timeout",
        "پایان مهلت انتظار برای گرفتن اتصال."
      ]
    ],
    "practice": {
      "question": "pool دو اتصال دارد، هر دو مشغول‌اند و درخواست سوم می‌رسد. رفتار مناسب چیست؟",
      "options": [
        "باز کردن نامحدود اتصال",
        "انتظار محدود یا رد کنترل‌شده طبق سیاست",
        "اشتراک هم‌زمان تراکنش مستقل روی همان اتصال"
      ],
      "correct": 1,
      "explanation": "ظرفیت محدود از فشار نامحدود به DB جلوگیری می‌کند؛ صف و timeout باید کنترل‌شده باشند.",
      "hint": "pool یک منبع محدود است."
    }
  },
  "scenarios": [
    {
      "id": "reuse",
      "label": "اجاره و استفادهٔ مجدد",
      "example": "pool max=2",
      "prediction": "بعد از پایان درخواست، اتصال باید بسته شود یا به pool برگردد؟",
      "steps": [
        {
          "name": "اتصال آماده",
          "short": "آماده‌سازی",
          "detail": "دو اتصال آماده برای استفاده وجود دارند.",
          "route": [
            1,
            2
          ],
          "packet": "OPEN",
          "input": "pool max=2; initialized",
          "output": "2 connections ready",
          "result": "pool ظرفیت مشخص دارد.",
          "explanation": "برقراری اتصال و handshake هزینه دارد؛ reuse هزینهٔ تکرار را کم می‌کند.",
          "state": [
            "R1 ready",
            "FREE C1 | FREE C2",
            "2 open"
          ]
        },
        {
          "name": "اجاره C1",
          "short": "اجاره",
          "detail": "R1 اتصال C1 را می‌گیرد و query می‌زند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "QUERY",
          "input": "acquire C1; SELECT ...",
          "output": "R1 using C1",
          "result": "C1 در اختیار R1 است.",
          "explanation": "در تراکنش چند statement باید همان اتصال متعلق به تراکنش استفاده شود.",
          "state": [
            "R1 active",
            "C1→R1 | FREE C2",
            "1 busy"
          ],
          "roundTrip": true
        },
        {
          "name": "بازگشت و استفادهٔ مجدد",
          "short": "بازگشت",
          "detail": "پس از پایان و پاک‌سازی وضعیت لازم، C1 به pool برمی‌گردد.",
          "route": [
            2,
            1
          ],
          "packet": "RELEASE",
          "input": "release C1",
          "output": "C1 available for next request",
          "result": "اتصال برای درخواست بعدی آماده است.",
          "explanation": "release معمولاً socket را نمی‌بندد؛ اتصال خراب باید کنار گذاشته شود.",
          "state": [
            "R1 done",
            "FREE C1 | FREE C2",
            "2 open"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "full",
      "label": "pool پر و صف انتظار",
      "example": "R1,R2 busy; R3 arrives",
      "prediction": "وقتی هر دو slot مشغول‌اند، R3 چه می‌کند؟",
      "steps": [
        {
          "name": "دو اتصال مشغول",
          "short": "اشباع",
          "detail": "R1 و R2 هر کدام یک اتصال را گرفته‌اند.",
          "route": [
            1
          ],
          "packet": "BUSY",
          "input": "R1→C1; R2→C2",
          "output": "Pool full",
          "result": "اتصال آزاد نداریم.",
          "explanation": "این وضعیت الزاماً خرابی پایگاه داده نیست.",
          "state": [
            "R1 | R2",
            "C1→R1 | C2→R2",
            "2 busy"
          ]
        },
        {
          "name": "درخواست سوم",
          "short": "صف",
          "detail": "R3 طبق سیاست در صف محدود pool منتظر می‌ماند.",
          "route": [
            0,
            1
          ],
          "packet": "WAIT",
          "input": "acquire for R3",
          "output": "R3 waiting",
          "result": "ظرفیت ثابت مانده است.",
          "explanation": "اگر مهلت acquire تمام شود باید پاسخ کنترل‌شده بدهیم.",
          "state": [
            "R1 | R2 | WAIT R3",
            "FULL",
            "2 busy"
          ]
        },
        {
          "name": "واگذاری به منتظر",
          "short": "پیشرفت",
          "detail": "R1 اتصال را آزاد می‌کند و R3 آن را می‌گیرد.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "GRANT",
          "input": "release C1; grant R3",
          "output": "R3 using C1",
          "result": "R3 بدون اتصال اضافه پیش رفت.",
          "explanation": "در این مدل مهلت R3 هنوز تمام نشده؛ ترتیب صف وابسته به pool است.",
          "state": [
            "R1 done | R2 | R3",
            "C1→R3 | C2→R2",
            "2 busy"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "صف کنترل‌شده به‌جای افزایش نامحدود اتصال."
    },
    {
      "id": "leak",
      "label": "نشت اتصال در مسیر خطا",
      "example": "release omitted on exception",
      "prediction": "اگر مسیر خطا release را انجام ندهد چه رخ می‌دهد؟",
      "steps": [
        {
          "name": "اجاره و خطا",
          "short": "خطا",
          "detail": "R1 اتصال C1 را اجاره می‌کند و query خطا می‌دهد.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "ERR",
          "input": "acquire C1; query throws",
          "output": "R1 failed",
          "result": "اتصال هنوز اجاره شده است.",
          "explanation": "در کد واقعی باید تراکنش ناموفق پاک‌سازی شود.",
          "state": [
            "R1 failed",
            "C1→R1 | FREE C2",
            "C1 leased"
          ],
          "tone": "error"
        },
        {
          "name": "بازگشت فراموش‌شده",
          "short": "نشت",
          "detail": "R1 بدون release پایان می‌یابد؛ R2 اتصال دوم را می‌گیرد.",
          "route": [
            1
          ],
          "packet": "LEAK",
          "input": "R1 exits without release",
          "output": "No free slot",
          "result": "ظرفیت مفید کاهش یافت.",
          "explanation": "نشت می‌تواند در حضور DB سالم هم رخ دهد.",
          "state": [
            "R1 exited | R2",
            "C1 leaked | C2→R2",
            "FULL"
          ],
          "tone": "error"
        },
        {
          "name": "مهلت انتظار و اصلاح",
          "short": "timeout",
          "detail": "R3 منتظر می‌ماند و پس از مهلت پاسخ خطا می‌گیرد.",
          "route": [
            1,
            0
          ],
          "packet": "TIME",
          "input": "acquire timeout",
          "output": "R3 timed out",
          "result": "مسیر خطا باید cleanup/release را تضمین کند.",
          "explanation": "از finally و API مناسب driver استفاده کنید؛ اتصال تراکنش failed را بدون rollback به کاربر بعدی ندهید.",
          "state": [
            "R3 timeout",
            "FULL",
            "DB may be healthy"
          ],
          "tone": "error"
        }
      ],
      "edgeCase": "فراموشی release می‌تواند حتی با DB سالم pool را اشباع کند."
    }
  ],
  "pitfall": "بزرگ کردن pool همیشه throughput را بهتر نمی‌کند. مجموع poolهای تمام instanceها باید در ظرفیت DB جا شود.",
  "takeaway": "اندازهٔ pool، صف، timeout و بازگشت مطمئن اتصال را با هم طراحی کنید.",
  "quiz": {
    "question": "برای جلوگیری از نشت اتصال در مسیر خطا چه رویکردی مناسب است؟",
    "options": [
      "release در finally همراه cleanup",
      "افزایش نامحدود pool",
      "نادیده گرفتن exception"
    ],
    "correct": 0,
    "explanation": "cleanup و release باید حتی در مسیر خطا انجام شود."
  },
  "references": [
    {
      "label": "node-postgres — Pooling",
      "url": "https://node-postgres.com/features/pooling"
    },
    {
      "label": "PostgreSQL — Connections",
      "url": "https://www.postgresql.org/docs/current/runtime-config-connection.html"
    }
  ],
  "field": {
    "task": "با Python Queue یک pool دو slot را به‌صورت محلی مدل کنید.",
    "observe": "گرفتن slot سوم بدون آزادسازی باعث Empty می‌شود؛ بعد از put دوباره slot قابل استفاده است.",
    "limit": "این فقط مدل ظرفیت pool است، نه اتصال واقعی پایگاه داده.",
    "command": "from queue import Queue, Empty\np=Queue(maxsize=2)\np.put('C1'); p.put('C2')\na=p.get(); b=p.get()\ntry: p.get(timeout=.1)\nexcept Empty: print('pool full')\np.put(a)\nprint(p.get())\np.put(b)",
    "next": {
      "slug": "caching",
      "label": "Caching",
      "category": "databases"
    }
  },
  "model": "database"
} satisfies BackendLesson;
export default lesson;
