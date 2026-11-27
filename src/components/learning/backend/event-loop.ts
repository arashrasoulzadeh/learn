import type {BackendLesson} from './types';
const lesson = {
  "slug": "event-loop",
  "title": "Event Loop — ترتیب کارها در JavaScript",
  "description": "پشتهٔ اجرا، microtask و task را در مدل مرورگر مقایسه کنید.",
  "order": 14,
  "model": "queue",
  "actors": [
    {
      "label": "پشتهٔ JS",
      "sub": "Call stack",
      "icon": "cpu"
    },
    {
      "label": "Microtask",
      "sub": "Promise jobs",
      "icon": "queue"
    },
    {
      "label": "Task",
      "sub": "Timers / events",
      "icon": "queue"
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
    "title": "صف‌ها و خروجی کنسول",
    "labels": [
      "Stack / خروجی",
      "Microtasks",
      "Tasks"
    ],
    "context": "مدل مرورگر برای یک agent: بعد از پایان task جاری و در نقاط checkpoint، microtaskها تخلیه می‌شوند؛ سپس task آمادهٔ دیگری انتخاب می‌شود. چند منبع task ممکن است وجود داشته باشد. Node.js مدل دقیق دیگری دارد."
  },
  "teaching": {
    "goal": "ترتیب چاپ در کد synchronous، Promise.then و setTimeout را پیش‌بینی کنید.",
    "terms": [
      [
        "Task",
        "واحد کار مانند callback تایمر یا رویداد."
      ],
      [
        "Microtask",
        "کار کوتاه صفی مثل واکنش Promise که در checkpoint تخلیه می‌شود."
      ],
      [
        "Run-to-completion",
        "اجرای کد جاری تا نقطهٔ پایان بدون اجرای callback دیگر وسط آن."
      ],
      [
        "Long task",
        "کاری طولانی که پاسخ‌گویی thread اصلی را به تأخیر می‌اندازد."
      ]
    ],
    "practice": {
      "question": "console.log(1)، سپس setTimeout(()=>log(2),0)، سپس Promise.resolve().then(()=>log(3)) و log(4) اجرا می‌شوند. ترتیب مدل مرورگر؟",
      "options": [
        "1,2,3,4",
        "1,4,3,2",
        "1,3,4,2"
      ],
      "correct": 1,
      "explanation": "کد همگام ۱ و ۴، سپس microtask عدد ۳، سپس task تایمر عدد ۲.",
      "hint": "صفر میلی‌ثانیه یعنی اجرای فوری وسط پشته نیست."
    }
  },
  "scenarios": [
    {
      "id": "order",
      "label": "ترتیب عادی",
      "example": "A → D → C → B",
      "steps": [
        {
          "name": "اجرای اسکریپت",
          "short": "ثبت تایمر",
          "detail": "اسکریپت A را چاپ و تایمر را ثبت می‌کند.",
          "route": [
            0,
            2
          ],
          "packet": "TIMER",
          "input": "log('A'); setTimeout(()=>log('B'),0)",
          "output": "A",
          "result": "تایمر برای فرصت بعدی ثبت شد.",
          "explanation": "تا وقتی اسکریپت جاری فعال است callback تایمر وارد پشته نمی‌شود.",
          "state": [
            "A",
            "—",
            "B (when ready)"
          ],
          "flightLabels": [
            "schedule B"
          ],
          "diagnostic": "delay=0 یعنی task پس از فرصت اجرا، نه اجرای فوری یا مهلت دقیق."
        },
        {
          "name": "ثبت Promise و پایان اسکریپت",
          "short": "ثبت Promise",
          "detail": "واکـنش Promise آماده در microtask قرار می‌گیرد و D چاپ می‌شود.",
          "route": [
            0,
            1
          ],
          "packet": "THEN",
          "input": "Promise.resolve().then(()=>log('C')); log('D')",
          "output": "A D",
          "result": "پشتهٔ اسکریپت پایان می‌یابد.",
          "explanation": "Promise.then روی Promise fulfilled هم callback را وسط اسکریپت اجرا نمی‌کند.",
          "state": [
            "A D",
            "C",
            "B"
          ],
          "flightLabels": [
            "enqueue C"
          ],
          "diagnostic": "A و D همگام‌اند؛ Promise واکنش را در microtask قرار می‌دهد."
        },
        {
          "name": "تخلیه microtask",
          "short": "اجرای Promise",
          "detail": "در checkpoint، C اجرا می‌شود.",
          "route": [
            1,
            0
          ],
          "packet": "JOB",
          "input": "run C",
          "output": "A D C",
          "result": "microtask پیش از تایمر آماده اجرا شد.",
          "explanation": "در مدل مرورگر، checkpoint همهٔ microtaskهای موجود و تازه افزوده‌شده را تخلیه می‌کند.",
          "state": [
            "A D C",
            "—",
            "B"
          ],
          "flightLabels": [
            "run C"
          ],
          "diagnostic": "پس از stack جاری microtask checkpoint انجام می‌شود؛ C پیش از task تایمر این trace است."
        },
        {
          "name": "اجرای task تایمر",
          "short": "اجرای تایمر",
          "detail": "زمانی که تایمر آماده و task انتخاب شود، B اجرا می‌شود.",
          "route": [
            2,
            0
          ],
          "packet": "TASK",
          "input": "run B",
          "output": "A D C B",
          "result": "ترتیب کامل مشخص شد.",
          "explanation": "زمان دقیق تایمر تضمین نمی‌شود.",
          "state": [
            "A D C B",
            "—",
            "—"
          ],
          "tone": "success",
          "flightLabels": [
            "run B"
          ],
          "diagnostic": "پس از تخلیه microtask و آماده بودن timer، B اجرا می‌شود؛ زمان دقیق تضمین نیست."
        }
      ],
      "prediction": "A و D همگام‌اند، B تایمر است و C واکنش Promise؛ ترتیب چاپ چیست؟"
    },
    {
      "id": "blocking",
      "label": "کار CPU سنگین",
      "example": "long synchronous work",
      "steps": [
        {
          "name": "ثبت تایمر",
          "short": "ثبت تایمر",
          "detail": "تایمر برای اجرای بعدی ثبت شده است.",
          "route": [
            0,
            2
          ],
          "packet": "TIMER",
          "input": "setTimeout(callback,0)",
          "output": "timer scheduled",
          "result": "callback هنوز اجرا نشده است.",
          "explanation": "درخواست تایمر حداقل تأخیر است، نه تضمین زمان اجرا.",
          "state": [
            "Script running",
            "—",
            "callback"
          ],
          "flightLabels": [
            "schedule timer"
          ],
          "diagnostic": "تایمر ثبت شده ولی callback به agent اصلی نیاز دارد."
        },
        {
          "name": "مشغول بودن پشته",
          "short": "اشغال پشته",
          "detail": "حلقهٔ محاسباتی طولانی thread اصلی را اشغال می‌کند.",
          "route": [
            0
          ],
          "packet": "CPU",
          "input": "for (...) { compute() }",
          "output": "task delayed",
          "result": "تایمر منتظر می‌ماند.",
          "explanation": "async نامیدن حلقهٔ بدون yield مشکل را خودکار حل نمی‌کند.",
          "state": [
            "Long task",
            "—",
            "callback waiting"
          ],
          "tone": "error",
          "flightLabels": [
            "CPU busy"
          ],
          "diagnostic": "Long task مانع ورودی و render می‌شود؛ async keyword محاسبه را به worker منتقل نمی‌کند."
        },
        {
          "name": "آزاد شدن پشته",
          "short": "اجرای تایمر",
          "detail": "بعد از پایان کار جاری، callback می‌تواند در task بعدی اجرا شود.",
          "route": [
            2,
            0
          ],
          "packet": "TASK",
          "input": "callback()",
          "output": "timer eventually runs",
          "result": "تأخیر قابل مشاهده بود.",
          "explanation": "کار را کوچک‌تر کنید یا از Worker مناسب برای محاسبه استفاده کنید.",
          "state": [
            "Callback done",
            "—",
            "—"
          ],
          "tone": "success",
          "flightLabels": [
            "run timer"
          ],
          "diagnostic": "Performance panel فاصله زمان آماده شدن تا callback را نشان می‌دهد؛ worker یا تقسیم کار را بررسی کنید."
        }
      ],
      "edgeCase": "کار همگام طولانی مانع پاسخ‌گویی thread اصلی می‌شود.",
      "prediction": "آیا تایمر صفر میلی‌ثانیه در میانهٔ حلقهٔ CPU اجرا می‌شود؟"
    },
    {
      "id": "microtasks",
      "label": "زنجیرهٔ microtask",
      "example": "microtask checkpoint",
      "steps": [
        {
          "name": "آماده شدن دو صف",
          "short": "آماده‌سازی صف",
          "detail": "یک microtask و یک task تایمر آماده هستند.",
          "route": [
            0,
            1
          ],
          "packet": "JOB",
          "input": "queueMicrotask(job1)",
          "output": "job1 queued",
          "result": "microtask اول آماده شد.",
          "explanation": "در checkpoint صف microtask در اولویت تخلیه است.",
          "state": [
            "Script done",
            "job1",
            "timer"
          ],
          "flightLabels": [
            "enqueue job1"
          ],
          "diagnostic": "microtask و task صف‌های متفاوت دارند؛ مرورگر چند task source دارد."
        },
        {
          "name": "افزودن کار تازه",
          "short": "اجرای کار ۱",
          "detail": "job1 هنگام اجرا job2 را ثبت می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "JOB1",
          "input": "queueMicrotask(job2)",
          "output": "job2 queued",
          "result": "صف هنوز خالی نشده است.",
          "explanation": "زنجیرهٔ بی‌پایان microtask می‌تواند taskهای دیگر را عقب بیندازد.",
          "state": [
            "job1 done",
            "job2",
            "timer"
          ],
          "tone": "error",
          "flightLabels": [
            "job1 / enqueue2"
          ],
          "diagnostic": "checkpoint می‌تواند کارهای تازه ثبت‌شده را نیز تخلیه کند."
        },
        {
          "name": "اجرای microtask تازه",
          "short": "اجرای کار ۲",
          "detail": "پیش از انتخاب task تایمر، job2 از صف microtask اجرا می‌شود.",
          "route": [
            1,
            0
          ],
          "packet": "JOB2",
          "input": "run job2",
          "output": "job1 job2",
          "result": "صف microtask اکنون خالی است.",
          "explanation": "job2 در همان checkpoint اجرا می‌شود؛ تایمر تا پایان تخلیهٔ صف منتظر می‌ماند.",
          "state": [
            "job1 job2",
            "—",
            "timer"
          ],
          "flightLabels": [
            "run job2"
          ],
          "diagnostic": "تا وقتی صف microtask در checkpoint خالی نشده، task تایمر وارد نمی‌شود."
        },
        {
          "name": "اجرای task تایمر",
          "short": "اجرای تایمر",
          "detail": "پس از پایان checkpoint، task تایمر در صورت آماده بودن انتخاب می‌شود.",
          "route": [
            2,
            0
          ],
          "packet": "TASK",
          "input": "run timer",
          "output": "job1 job2 timer",
          "result": "تایمر بعد از تخلیه اجرا شد.",
          "explanation": "برای کار حجیم، زمان‌بندی منصفانه و yield مناسب اهمیت دارد.",
          "state": [
            "job1 job2 timer",
            "—",
            "—"
          ],
          "tone": "success",
          "flightLabels": [
            "run timer"
          ],
          "diagnostic": "زنجیره نامحدود microtask می‌تواند starvation بسازد؛ yield منصفانه را طراحی کنید."
        }
      ],
      "edgeCase": "microtaskهای بازگشتی می‌توانند taskهای دیگر را عقب بیندازند.",
      "prediction": "اگر یک microtask، microtask تازه بسازد، آیا تایمر بین آن‌ها اجرا می‌شود؟"
    }
  ],
  "pitfall": "Event Loop مرورگر را با مراحل دقیق libuv در Node.js یکی نگیرید. رندر مرورگر نیز در فرصت‌های مناسب انجام می‌شود، نه بعد از هر callback.",
  "takeaway": "ترتیب اجرا را با پشته، نوع صف و نقطهٔ checkpoint تحلیل کنید.",
  "quiz": {
    "question": "Promise.then آماده در مدل معمول مرورگر قبل از کدام کار اجرا می‌شود؟",
    "options": [
      "بخش همگام جاری",
      "task تایمر بعدی پس از پایان task جاری",
      "هر عملیات قبلی CPU"
    ],
    "correct": 1,
    "explanation": "در checkpoint microtaskها قبل از task بعدی تخلیه می‌شوند."
  },
  "references": [
    {
      "label": "WHATWG HTML — Event loops",
      "url": "https://html.spec.whatwg.org/multipage/webappapis.html#event-loops"
    },
    {
      "label": "MDN — Microtask guide",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide"
    }
  ],
  "field": {
    "task": "در Console مرورگر کد را اجرا و ترتیب چاپ را با پیش‌بینی مقایسه کنید.",
    "observe": "A D C B چاپ می‌شود؛ تاخیر عددی تایمر ممکن است متفاوت باشد.",
    "limit": "از حلقهٔ بی‌پایان یا زنجیرهٔ نامحدود microtask استفاده نکنید.",
    "command": "console.log('A');\nsetTimeout(()=>console.log('B'),0);\nPromise.resolve().then(()=>console.log('C'));\nconsole.log('D');",
    "next": {
      "slug": "api-routing",
      "label": "API Routing",
      "category": "software-engineering"
    }
  }
} satisfies BackendLesson;
export default lesson;
