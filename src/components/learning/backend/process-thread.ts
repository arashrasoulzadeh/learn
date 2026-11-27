import type {BackendLesson} from './types';
const lesson = {
  "slug": "process-thread",
  "title": "Process و Thread — اجرای برنامه",
  "description": "فرایند، نخ، زمان‌بندی و حافظهٔ مشترک را با مثال شمارنده یاد بگیرید.",
  "order": 11,
  "model": "execution",
  "actors": [
    {
      "label": "نخ A",
      "sub": "Thread A",
      "icon": "cpu"
    },
    {
      "label": "حافظهٔ فرایند",
      "sub": "Shared memory",
      "icon": "memory"
    },
    {
      "label": "نخ B",
      "sub": "Thread B",
      "icon": "cpu"
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
    "title": "شمارنده و وضعیت نخ‌ها",
    "labels": [
      "نخ A",
      "حافظهٔ مشترک",
      "نخ B"
    ],
    "context": "نخ‌های یک فرایند فضای آدرس مشترک دارند، اما ثبات‌ها و پشتهٔ اجرای مستقل دارند. ترتیب گام‌ها فرضی است، نه زمان‌بندی واقعی."
  },
  "teaching": {
    "goal": "فرق فرایند و نخ را توضیح دهید و نتیجهٔ یک race condition را با دنبال کردن خواندن و نوشتن پیش‌بینی کنید.",
    "terms": [
      [
        "Process",
        "نمونهٔ اجرای برنامه با فضای آدرس و منابع سیستم‌عامل."
      ],
      [
        "Thread",
        "مسیر اجرای مستقل در یک فرایند."
      ],
      [
        "Race condition",
        "وابستگی نتیجه به ترتیب اجرای عملیات هم‌زمان."
      ],
      [
        "Mutex",
        "قفل انحصاری برای حفاظت از بخش بحرانی."
      ]
    ],
    "practice": {
      "question": "دو نخ می‌خواهند شمارندهٔ صفر را هر کدام یک واحد زیاد کنند. هر دو قبل از نوشتن، صفر را می‌خوانند. مقدار نهایی بدون قفل چه می‌تواند باشد؟",
      "options": [
        "۲ حتماً",
        "۱ به علت به‌روزرسانی گم‌شده",
        "۰ حتماً"
      ],
      "correct": 1,
      "explanation": "هر نخ از صفر مقدار ۱ را محاسبه می‌کند و دو نوشتنِ ۱ جایگزین هم می‌شوند.",
      "hint": "افزایش یک شمارنده ممکن است سه عمل خواندن، محاسبه و نوشتن باشد."
    }
  },
  "scenarios": [
    {
      "id": "sequential",
      "label": "اجرای نوبتی",
      "example": "counter = 0",
      "steps": [
        {
          "name": "فرایند و دو نخ",
          "short": "آماده‌سازی",
          "detail": "سیستم‌عامل فرایند را با فضای آدرس ایجاد می‌کند؛ دو نخ روی همان حافظه کار می‌کنند.",
          "route": [
            1
          ],
          "packet": "INIT",
          "input": "counter = 0",
          "output": "Two threads share one counter",
          "result": "شمارندهٔ مشترک آماده است.",
          "explanation": "فرایند دیگر معمولاً فضای آدرس جدا دارد؛ نخ A و B می‌توانند همان شیء را ببینند.",
          "state": [
            "Ready",
            "counter=0",
            "Ready"
          ]
        },
        {
          "name": "نخ A افزایش می‌دهد",
          "short": "افزایش A",
          "detail": "نخ A بدون تداخل مقدار را می‌خواند، یک واحد اضافه می‌کند و می‌نویسد.",
          "route": [
            0,
            1
          ],
          "packet": "WRITE",
          "input": "read 0; add 1; write 1",
          "output": "counter=1",
          "result": "اولین افزایش ثبت شد.",
          "explanation": "در این مرحله اجرای A را کامل فرض کرده‌ایم؛ هم‌زمانی الزاماً به معنای اجرای موازی نیست.",
          "state": [
            "Done",
            "counter=1",
            "Ready"
          ]
        },
        {
          "name": "نخ B افزایش می‌دهد",
          "short": "افزایش B",
          "detail": "نخ B مقدار تازه را می‌خواند و یک واحد دیگر اضافه می‌کند.",
          "route": [
            2,
            1
          ],
          "packet": "WRITE",
          "input": "read 1; add 1; write 2",
          "output": "counter=2",
          "result": "هر دو افزایش ثبت شدند.",
          "explanation": "زمان‌بند ممکن است ترتیب دیگری انتخاب کند؛ این ترتیب نمونه بدون تداخل است.",
          "state": [
            "Done",
            "counter=2",
            "Done"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "race",
      "label": "به‌روزرسانی گم‌شده",
      "example": "counter++ is not assumed atomic",
      "steps": [
        {
          "name": "خواندن نخ A",
          "short": "خواندن A",
          "detail": "نخ A صفر را در ثبات یا مقدار محلی می‌خواند.",
          "route": [
            1,
            0
          ],
          "packet": "READ",
          "input": "counter=0",
          "output": "A.local=0",
          "result": "A هنوز چیزی ننوشته است.",
          "explanation": "خواندن و نوشتن را به گام‌های جدا می‌شکنیم؛ این یک مدل آموزشی است.",
          "state": [
            "local=0",
            "counter=0",
            "Ready"
          ]
        },
        {
          "name": "خواندن نخ B",
          "short": "خواندن B",
          "detail": "زمان‌بند قبل از نوشتن A، اجرای B را ممکن می‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "READ",
          "input": "counter=0",
          "output": "B.local=0",
          "result": "هر دو مقدار قدیمی دارند.",
          "explanation": "حتی روی یک هسته نیز جابه‌جایی زمان‌بند می‌تواند چنین تداخلی بسازد.",
          "state": [
            "local=0",
            "counter=0",
            "local=0"
          ]
        },
        {
          "name": "نوشتن نخ A",
          "short": "نوشتن A",
          "detail": "A مقدار محلی خودش را به ۱ تبدیل و ذخیره می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "WRITE",
          "input": "A.local + 1",
          "output": "counter=1",
          "result": "افزایش A ثبت شد.",
          "explanation": "B هنوز نسخهٔ قدیمی را دارد.",
          "state": [
            "Done",
            "counter=1",
            "local=0"
          ]
        },
        {
          "name": "نوشتن نخ B",
          "short": "خطا",
          "detail": "B مقدار قدیمی خودش را یک واحد زیاد می‌کند و روی حافظه می‌نویسد.",
          "route": [
            2,
            1
          ],
          "packet": "WRITE",
          "input": "B.local + 1",
          "output": "counter=1 (lost update)",
          "result": "یکی از افزایش‌ها گم شد.",
          "explanation": "این مثال به معنای رفتار تعریف‌شدهٔ data race در همهٔ زبان‌ها نیست؛ زبان‌هایی مثل C++ برای data race غیراتمی قواعد متفاوتی دارند.",
          "state": [
            "Done",
            "counter=1",
            "Done"
          ],
          "tone": "error"
        }
      ],
      "edgeCase": "خواندن هم‌زمان مقدار قدیمی باعث از دست رفتن یک افزایش می‌شود."
    },
    {
      "id": "mutex",
      "label": "حفاظت با Mutex",
      "example": "lock → increment → unlock",
      "steps": [
        {
          "name": "گرفتن قفل",
          "short": "قفل",
          "detail": "نخ A قفل بخش بحرانی را می‌گیرد.",
          "route": [
            0,
            1
          ],
          "packet": "LOCK",
          "input": "lock(m)",
          "output": "owner=A",
          "result": "فقط A اجازهٔ ورود دارد.",
          "explanation": "تمام خواندن‌ها و نوشتن‌های مربوط به شمارنده باید از همان قفل پیروی کنند.",
          "state": [
            "Running",
            "counter=0; lock=A",
            "Ready"
          ]
        },
        {
          "name": "انتظار نخ B",
          "short": "انتظار",
          "detail": "B برای همان قفل درخواست می‌دهد و منتظر آزاد شدن آن می‌ماند.",
          "route": [
            2,
            1
          ],
          "packet": "WAIT",
          "input": "lock(m) by B",
          "output": "B waits",
          "result": "B وارد بخش بحرانی نمی‌شود.",
          "explanation": "نخ منتظر ممکن است توسط پیاده‌سازی قفل مسدود یا موقتاً spin شود.",
          "state": [
            "Running",
            "counter=0; lock=A",
            "Waiting"
          ]
        },
        {
          "name": "آزادسازی توسط A",
          "short": "آزادسازی",
          "detail": "A افزایش را ثبت و قفل را آزاد می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "UNLOCK",
          "input": "counter=1; unlock(m)",
          "output": "lock free",
          "result": "B می‌تواند قفل را بگیرد.",
          "explanation": "در کد واقعی آزادسازی را حتی هنگام خطا با الگوی مناسب مثل finally تضمین کنید.",
          "state": [
            "Done",
            "counter=1; free",
            "Ready"
          ]
        },
        {
          "name": "اجرای امن B",
          "short": "نتیجه",
          "detail": "B قفل را گرفته، مقدار ۱ را می‌خواند و ۲ را ثبت می‌کند.",
          "route": [
            2,
            1
          ],
          "packet": "WRITE",
          "input": "lock; read 1; write 2; unlock",
          "output": "counter=2",
          "result": "به‌روزرسانی گم‌شده حذف شد.",
          "explanation": "قفل هزینه و امکان بن‌بست دارد؛ برای شمارنده شاید primitive اتمی مناسب باشد.",
          "state": [
            "Done",
            "counter=2; free",
            "Done"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "قفل برای جلوگیری از تداخل؛ هزینهٔ انتظار و احتمال بن‌بست را هم در نظر بگیرید."
    }
  ],
  "pitfall": "نخ با فرایند یکی نیست؛ یک هسته هم می‌تواند هم‌زمانی داشته باشد. Mutex تنها اگر همهٔ دسترسی‌های لازم هماهنگ باشند حفاظت می‌کند.",
  "takeaway": "فضای آدرس مشترک همکاری را آسان و race را ممکن می‌کند؛ با همگام‌سازی صحیح از invariant محافظت کنید.",
  "quiz": {
    "question": "کدام مورد معمولاً میان نخ‌های یک فرایند مشترک است؟",
    "options": [
      "فضای آدرس",
      "ثبات‌های CPU هر نخ",
      "پشتهٔ اجرای هر نخ"
    ],
    "correct": 0,
    "explanation": "فضای آدرس مشترک است، ولی هر نخ مسیر اجرای مستقل دارد."
  },
  "references": [
    {
      "label": "POSIX — threads",
      "url": "https://pubs.opengroup.org/onlinepubs/9799919799/"
    },
    {
      "label": "Python — threading",
      "url": "https://docs.python.org/3/library/threading.html"
    }
  ],
  "field": {
    "task": "در Python دو نخ با Lock یک شمارنده را زیاد کنند. هر نخ پس از پایان join شود.",
    "observe": "مقدار نهایی ۲۰۰۰ است. حذف قفل لزوماً خطا را در هر اجرا نشان نمی‌دهد؛ GIL و پیاده‌سازی مفسر مهم‌اند.",
    "limit": "فقط روی سیستم خودتان اجرا کنید؛ این تمرین زمان‌بندی خاصی را تضمین نمی‌کند.",
    "command": "import threading\ncount = 0\nlock = threading.Lock()\ndef work():\n    global count\n    for _ in range(1000):\n        with lock:\n            count += 1\nthreads = [threading.Thread(target=work) for _ in range(2)]\nfor t in threads: t.start()\nfor t in threads: t.join()\nprint(count)",
    "next": {
      "slug": "stack-heap",
      "label": "Stack و Heap",
      "category": "software-engineering"
    }
  }
} satisfies BackendLesson;
export default lesson;
