import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "observer",
  "title": "Observer Pattern — اشتراک و اعلان",
  "order": 35,
  "description": "چرخه عمر subscription، انتشار همگام و اثر شکست subscriber.",
  "actors": [
    [
      "Subject",
      "Publisher",
      "app"
    ],
    [
      "Observer A",
      "Subscriber",
      "queue"
    ],
    [
      "Observer B",
      "Subscriber",
      "queue"
    ]
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
  "labels": [
    "Publisher",
    "Subscriber A",
    "Subscriber B"
  ],
  "context": "مدل publisher همگام در یک process؛ delivery پایدار و broker وجود ندارد.",
  "goal": "اشتراک، notify، unsubscribe و failure isolation را جدا کنید.",
  "scenarios": [
    [
      "notify",
      "اعلان چند مصرف‌کننده",
      "آیا publisher باید نوع همه subscriberها را بشناسد؟",
      "OrderChanged",
      [
        [
          "ثبت اشتراک",
          [
            1,
            0
          ],
          [
            "subscribe A"
          ],
          "subscribe(A); subscribe(B)",
          "2 subscribers",
          [
            "2 subscribers",
            "Active",
            "Active"
          ],
          "publisher callbackها را نگه می‌دارد.",
          "مالک unsubscribe را مشخص کنید."
        ],
        [
          "اعلان A",
          [
            0,
            1
          ],
          [
            "notify v2"
          ],
          "A.update(v2)",
          "A updated",
          [
            "v2",
            "v2",
            "v1"
          ],
          "اعلان همگام ابتدا A را فرا می‌خواند.",
          "ترتیب فقط قرارداد این publisher است."
        ],
        [
          "اعلان B",
          [
            0,
            2
          ],
          [
            "notify v2"
          ],
          "B.update(v2)",
          "Both updated",
          [
            "v2",
            "v2",
            "v2"
          ],
          "B نیز تغییر را می‌گیرد.",
          "عدم نیاز publisher به concrete subscriber coupling را کم می‌کند.",
          "success"
        ]
      ]
    ],
    [
      "unsubscribe",
      "پایان عمر observer",
      "پس از خروج صفحه چه اتفاقی می‌افتد؟",
      "unsubscribe(A)",
      [
        [
          "اشتراک",
          [
            1,
            0
          ],
          [
            "subscribe"
          ],
          "subscribe(A)",
          "A active",
          [
            "2 subscribers",
            "Active",
            "Active"
          ],
          "ثبت callback می‌تواند reference را زنده نگه دارد.",
          "با heap snapshot مسیر retention را ببینید."
        ],
        [
          "حذف",
          [
            1,
            0
          ],
          [
            "unsubscribe"
          ],
          "unsubscribe(A)",
          "1 subscriber",
          [
            "1 subscriber",
            "Removed",
            "Active"
          ],
          "A از collection حذف می‌شود.",
          "unsubscribe باید idempotent باشد اگر قرارداد اجازه می‌دهد."
        ],
        [
          "اعلان",
          [
            0,
            2
          ],
          [
            "notify B"
          ],
          "publish(v3)",
          "Only B notified",
          [
            "v3",
            "Not called",
            "v3"
          ],
          "A دیگر callback نمی‌گیرد.",
          "race با callback در حال اجرا را در async publisher جدا مدیریت کنید.",
          "success"
        ]
      ]
    ],
    [
      "failure",
      "شکست subscriber",
      "اگر A exception بدهد آیا B اجرا می‌شود؟",
      "for listener in listeners: listener()",
      [
        [
          "شروع",
          [
            0
          ],
          [
            "publish"
          ],
          "publish(v4)",
          "Dispatching",
          [
            "v4",
            "Pending",
            "Pending"
          ],
          "در حلقه ساده ترتیب ثابت فرض شده است.",
          "رفتار exception باید مستند شود."
        ],
        [
          "شکست A",
          [
            0,
            1
          ],
          [
            "notify"
          ],
          "A throws Error",
          "Exception",
          [
            "Failed",
            "Error",
            "Pending"
          ],
          "exception از callback بیرون می‌آید.",
          "نباید failure را بدون policy نادیده گرفت.",
          "error"
        ],
        [
          "توقف B",
          [
            0
          ],
          [
            "abort loop"
          ],
          "uncaught exception",
          "B skipped",
          [
            "Aborted",
            "Error",
            "Not called"
          ],
          "حلقه ساده ادامه پیدا نمی‌کند.",
          "try/catch per subscriber یا async isolation را آگاهانه طراحی کنید.",
          "error"
        ]
      ],
      "Observer معمولی تضمین تحویل ندارد."
    ]
  ],
  "pitfall": "Observer در حافظه با event bus پایدار و delivery تضمین‌شده یکی نیست.",
  "takeaway": "عمر اشتراک و سیاست خطا بخش اصلی قرارداد است.",
  "quiz": [
    "unsubscribe برای چیست؟",
    [
      "تغییر TCP",
      "قطع اشتراک آینده و مسیر retention",
      "ذخیره DB"
    ],
    1,
    "حذف callback اعلان بعدی را متوقف می‌کند."
  ],
  "practice": [
    "یک observer خراب نباید مانع دیگری شود؛ چه کنید؟",
    [
      "همه exceptionها را swallow کنید",
      "همه را singleton کنید",
      "سیاست isolation و ثبت شکست هر callback"
    ],
    2,
    "جداسازی خطا همراه observability لازم است."
  ],
  "hint": "هم تحویل به B و هم آگاهی از شکست A مهم است.",
  "terms": [
    [
      "Subject",
      "ناشر"
    ],
    [
      "Subscriber",
      "مصرف‌کننده اعلان"
    ],
    [
      "Unsubscribe",
      "پایان اشتراک"
    ]
  ],
  "references": [
    [
      "Observer",
      "https://refactoring.guru/design-patterns/observer"
    ],
    [
      "MDN EventTarget",
      "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget"
    ]
  ],
  "exercise": [
    "اشتراک و حذف را با list محلی بررسی کنید.",
    "seen=[]\na=lambda v:seen.append(('A',v))\nb=lambda v:seen.append(('B',v))\nlisteners=[a,b]; listeners.remove(a)\nfor f in listeners: f(2)\nassert seen==[('B',2)]\nprint(seen)",
    "تنها B اعلان می‌گیرد.",
    "مدل همگام؛ thread safety ندارد."
  ],
  "deep": {
    "title": "Failure isolation در انتشار همگام",
    "question": "با شکست A، آیا B به‌روز می‌شود؟",
    "assumptions": "دو callback مرتب، A همیشه خطا می‌دهد؛ B موفق است.",
    "lanes": [
      "Publisher",
      "A",
      "B"
    ],
    "fields": {
      "a": "وضعیت A",
      "b": "وضعیت B",
      "errors": "خطاهای ثبت‌شده",
      "delivered": "تحویل موفق"
    },
    "code": "for subscriber in subscribers:\n    try: subscriber(event)\n    except Exception as e: record_failure(e)",
    "cases": [
      [
        "abort",
        "حلقه بدون حفاظت",
        {
          "a": "Pending",
          "b": "Pending",
          "errors": 0,
          "delivered": 0
        },
        [
          [
            0,
            0,
            null,
            "شروع",
            "event v2",
            "ناشر حلقه را شروع می‌کند.",
            {
              "a": "Pending"
            }
          ],
          [
            1,
            0,
            1,
            "فراخوانی A",
            "notify",
            "A اجرا می‌شود.",
            {
              "a": "Running"
            }
          ],
          [
            2,
            1,
            0,
            "خطا",
            "throw",
            "خطا به publisher می‌رسد.",
            {
              "a": "Failed",
              "errors": 1
            },
            "error"
          ],
          [
            3,
            0,
            null,
            "توقف",
            "abort",
            "B اجرا نشده.",
            {
              "b": "Skipped"
            },
            "error"
          ]
        ],
        "هیچ تحویل موفقی رخ نداد."
      ],
      [
        "isolate",
        "محافظت هر subscriber",
        {
          "a": "Pending",
          "b": "Pending",
          "errors": 0,
          "delivered": 0
        },
        [
          [
            0,
            0,
            null,
            "شروع",
            "event v2",
            "حلقه جداگانه محافظت شده.",
            {
              "a": "Pending"
            }
          ],
          [
            1,
            0,
            1,
            "فراخوانی A",
            "notify",
            "A اجرا شد.",
            {
              "a": "Running"
            }
          ],
          [
            2,
            1,
            0,
            "ثبت خطا",
            "catch",
            "شکست ثبت می‌شود.",
            {
              "a": "Failed",
              "errors": 1
            },
            "error"
          ],
          [
            3,
            0,
            2,
            "ادامه B",
            "notify",
            "B نتیجه را می‌گیرد.",
            {
              "b": "Updated",
              "delivered": 1
            },
            "success"
          ]
        ],
        "B موفق شد؛ شکست A پنهان نشده است."
      ]
    ],
    "diagnose": "تعداد callback، مدت هر callback و خطای جداگانه را ثبت کنید.",
    "tradeoff": "isolation همگام جلوی callback طولانی را نمی‌گیرد؛ timeout/async قرارداد دیگری دارد."
  }
});
export default lesson;
