import type {BackendLesson} from './types';
const lesson = {
  "slug": "async-await",
  "title": "Async / Await — انتظار بدون مسدودسازی",
  "description": "Promise و توقف موقت تابع async را در مدل JavaScript یاد بگیرید.",
  "order": 13,
  "model": "queue",
  "actors": [
    {
      "label": "تابع async",
      "sub": "Continuation",
      "icon": "app"
    },
    {
      "label": "محیط اجرا",
      "sub": "Runtime / queue",
      "icon": "queue"
    },
    {
      "label": "عملیات I/O",
      "sub": "Async operation",
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
    "title": "وضعیت Promise و ادامهٔ اجرا",
    "labels": [
      "تابع",
      "Promise",
      "کار دیگر"
    ],
    "context": "await اجرای ادامهٔ همان تابع را عقب می‌اندازد؛ رشتهٔ JavaScript برای عملیات ناهمگام آزاد می‌شود. کار CPU سنگین خودکار ناهمگام نمی‌شود."
  },
  "teaching": {
    "goal": "زمان اجرای قبل و بعد await را پیش‌بینی کنید و تفاوت خطای reject با پاسخ موفق را توضیح دهید.",
    "terms": [
      [
        "Promise",
        "شیئی نمایندهٔ نتیجهٔ آینده: pending، fulfilled یا rejected."
      ],
      [
        "await",
        "توقف موقت ادامهٔ تابع async تا تعیین نتیجه."
      ],
      [
        "Continuation",
        "بخش باقی‌ماندهٔ اجرا بعد از انتظار."
      ],
      [
        "Promise.all",
        "ترکیب نتایج چند Promise؛ رد شدن یکی نتیجهٔ ترکیبی را reject می‌کند."
      ]
    ],
    "practice": {
      "question": "دو عملیات مستقل I/O دارید. چگونه انتظار غیرضروری متوالی را حذف می‌کنید؟",
      "options": [
        "await A سپس await B بدون شروع قبلی B",
        "ابتدا هر دو را شروع و سپس Promise.all کنید",
        "حلقهٔ CPU سنگین را async بنامید"
      ],
      "correct": 1,
      "explanation": "شروع هر دو عملیات قبل از انتظار، امکان هم‌پوشانی انتظار I/O را می‌دهد.",
      "hint": "await به تنهایی عملیات بعدی را شروع نمی‌کند."
    }
  },
  "scenarios": [
    {
      "id": "await",
      "label": "انتظار یک Promise",
      "example": "async function load()",
      "steps": [
        {
          "name": "شروع تابع",
          "short": "Start",
          "detail": "تابع async قبل از نخستین await به شکل عادی اجرا می‌شود.",
          "route": [
            0
          ],
          "packet": "START",
          "input": "console.log('A'); const p=fetchData()",
          "output": "A",
          "result": "عملیات آغاز شد.",
          "explanation": "تابع async یک Promise برمی‌گرداند؛ synchronous بودن بخش اولیه همچنان برقرار است.",
          "state": [
            "Running",
            "pending",
            "—"
          ]
        },
        {
          "name": "رسیدن به await",
          "short": "Suspend",
          "detail": "ادامهٔ تابع به تعیین نتیجه وابسته می‌شود.",
          "route": [
            0,
            1
          ],
          "packet": "AWAIT",
          "input": "const data=await p",
          "output": "caller continues",
          "result": "تابع موقتاً متوقف شد.",
          "explanation": "در این مدل I/O واقعاً ناهمگام است؛ await خودش یک CPU thread جدید نمی‌سازد.",
          "state": [
            "Suspended",
            "pending",
            "Can run"
          ]
        },
        {
          "name": "تکمیل عملیات",
          "short": "Resolve",
          "detail": "محیط نتیجه را به Promise می‌رساند و ادامهٔ تابع برای اجرا آماده می‌شود.",
          "route": [
            2,
            1
          ],
          "packet": "DONE",
          "input": "resolve(42)",
          "output": "fulfilled: 42",
          "result": "ادامهٔ تابع در صف آماده است.",
          "explanation": "تعیین Promise به معنای اجرای فوری callback وسط پشتهٔ فعال نیست.",
          "state": [
            "Queued",
            "fulfilled=42",
            "Can run"
          ]
        },
        {
          "name": "ادامهٔ تابع",
          "short": "Resume",
          "detail": "ادامهٔ async پس از فرصت اجرای job/microtask انجام می‌شود.",
          "route": [
            1,
            0
          ],
          "packet": "RESUME",
          "input": "console.log(data)",
          "output": "42",
          "result": "نتیجه در تابع استفاده شد.",
          "explanation": "پشتهٔ فعال پیشین باید به نقطهٔ مناسب برسد.",
          "state": [
            "Done",
            "fulfilled=42",
            "Completed"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "reject",
      "label": "رد شدن Promise",
      "example": "try { await p } catch (e)",
      "steps": [
        {
          "name": "انتظار نتیجه",
          "short": "Await",
          "detail": "تابع درون try منتظر Promise است.",
          "route": [
            0,
            1
          ],
          "packet": "AWAIT",
          "input": "try { await p }",
          "output": "pending",
          "result": "ادامه به نتیجه وابسته است.",
          "explanation": "خطای آینده را در مسیر await می‌توان با try/catch گرفت.",
          "state": [
            "Suspended",
            "pending",
            "Can run"
          ]
        },
        {
          "name": "شکست I/O",
          "short": "Reject",
          "detail": "عملیات نمونه با خطا تمام می‌شود.",
          "route": [
            2,
            1
          ],
          "packet": "REJECT",
          "input": "reject(new Error('offline'))",
          "output": "rejected",
          "result": "Promise شکست خورد.",
          "explanation": "fetch در JS برای خطای شبکه reject می‌شود؛ پاسخ HTTP 404 به‌خودی‌خود reject نیست.",
          "state": [
            "Queued",
            "rejected",
            "Can run"
          ],
          "tone": "error"
        },
        {
          "name": "مدیریت خطا",
          "short": "Catch",
          "detail": "ادامهٔ تابع در شاخهٔ catch اجرا می‌شود.",
          "route": [
            1,
            0
          ],
          "packet": "CATCH",
          "input": "catch (e) { showError(e) }",
          "output": "error handled",
          "result": "خطا مدیریت شد.",
          "explanation": "اگر خطا گرفته نشود، Promise تابع async ممکن است رد شود.",
          "state": [
            "Handled",
            "rejected",
            "Can run"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "Promise رد شده و مسیر خطا باید به‌درستی مدیریت شود."
    },
    {
      "id": "parallel-io",
      "label": "شروع دو I/O مستقل",
      "example": "Promise.all([a,b])",
      "steps": [
        {
          "name": "آغاز هر دو عملیات",
          "short": "Start",
          "detail": "دو تابع مستقل قبل از await فراخوانی می‌شوند.",
          "route": [
            0,
            1
          ],
          "packet": "START",
          "input": "const a=loadA(); const b=loadB()",
          "output": "A pending; B pending",
          "result": "هر دو عملیات آغاز شده‌اند.",
          "explanation": "هم‌پوشانی I/O به معنای اجرای موازی JS روی همان thread نیست.",
          "state": [
            "Running",
            "A pending | B pending",
            "I/O active"
          ]
        },
        {
          "name": "پایان A",
          "short": "A done",
          "detail": "A تکمیل می‌شود اما B هنوز منتظر است.",
          "route": [
            2,
            1
          ],
          "packet": "A",
          "input": "resolveA('a')",
          "output": "A fulfilled; B pending",
          "result": "Promise.all هنوز منتظر B است.",
          "explanation": "Promise.all ترتیب خروجی را مطابق ورودی حفظ می‌کند.",
          "state": [
            "Suspended",
            "A fulfilled | B pending",
            "I/O active"
          ]
        },
        {
          "name": "پایان B و ادامه",
          "short": "Resume",
          "detail": "هر دو نتیجه آماده‌اند و Promise ترکیبی fulfilled می‌شود.",
          "route": [
            1,
            0
          ],
          "packet": "ALL",
          "input": "await Promise.all([a,b])",
          "output": "['a','b']",
          "result": "تابع با دو نتیجه ادامه می‌دهد.",
          "explanation": "رد شدن یک Promise، بقیهٔ عملیات را خودکار لغو نمی‌کند.",
          "state": [
            "Done",
            "A fulfilled | B fulfilled",
            "Done"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "انتظار متوالی برای عملیات مستقل می‌تواند زمان بیهوده ایجاد کند."
    }
  ],
  "pitfall": "async و await کار CPU-bound را خودکار به thread دیگر نمی‌برند. برای cancellation و timeout سازوکار جدا لازم است.",
  "takeaway": "عملیات را آغاز کنید، انتظار و ادامه را مدیریت کنید و شکست‌ها را صریحاً بگیرید.",
  "quiz": {
    "question": "await چه چیزی را متوقف می‌کند؟",
    "options": [
      "تمام سیستم‌عامل",
      "ادامهٔ همان تابع تا آماده شدن نتیجه",
      "همهٔ درخواست‌های شبکه"
    ],
    "correct": 1,
    "explanation": "await ادامهٔ تابع را به نتیجه وابسته می‌کند، نه کل سیستم."
  },
  "references": [
    {
      "label": "MDN — async function",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function"
    },
    {
      "label": "MDN — await",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await"
    },
    {
      "label": "MDN — Promise.all",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all"
    }
  ],
  "field": {
    "task": "در Console یا Node.js ترتیب چاپ‌ها را پیش‌بینی و سپس کد را اجرا کنید.",
    "observe": "A سپس C و سپس B چاپ می‌شوند.",
    "limit": "این مثال فقط ترتیب Promise job را نشان می‌دهد، نه parallelism CPU.",
    "command": "async function run() {\n  console.log('A');\n  await Promise.resolve();\n  console.log('B');\n}\nrun();\nconsole.log('C');",
    "next": {
      "slug": "event-loop",
      "label": "Event Loop",
      "category": "software-engineering"
    }
  }
} satisfies BackendLesson;
export default lesson;
