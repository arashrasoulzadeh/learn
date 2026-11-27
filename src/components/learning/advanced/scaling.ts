import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "scaling",
  "order": 43,
  "title": "Horizontal & Vertical Scaling — ظرفیت و گلوگاه",
  "description": "مقیاس عمودی، افقی و محدودیت پایین‌دست.",
  "actors": [
    [
      "Traffic",
      "Incoming load",
      "browser"
    ],
    [
      "App fleet",
      "Compute capacity",
      "cpu"
    ],
    [
      "Database",
      "Shared bottleneck",
      "db"
    ]
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
  "labels": [
    "بار ورودی",
    "ظرفیت برنامه",
    "ظرفیت DB"
  ],
  "context": "مدل throughput پایدار، واحد req/s؛ هر درخواست یک کار DB، صف و latency جدا از ظرفیت.",
  "goal": "ظرفیت end-to-end و هزینه رشد replica را محاسبه کنید.",
  "scenarios": [
    [
      "vertical",
      "افزایش عمودی",
      "CPU سریع‌تر چه مقدار کمک می‌کند؟",
      "100→200 app req/s",
      [
        [
          "بار",
          [
            0,
            1
          ],
          [
            "150 r/s"
          ],
          "arrival=150; app=100",
          "50/s excess",
          [
            "150 r/s",
            "100 r/s",
            "300 r/s"
          ],
          "برنامه گلوگاه است.",
          "صف در حالت پایدار با بار بیشتر از ظرفیت رشد می‌کند.",
          "error"
        ],
        [
          "ارتقای ماشین",
          [
            1
          ],
          [
            "resize"
          ],
          "app capacity=200",
          "200 r/s",
          [
            "150 r/s",
            "200 r/s",
            "300 r/s"
          ],
          "ماشین بزرگ‌تر ظرفیت فرضی را دو برابر می‌کند.",
          "scale-up واقعی همیشه خطی نیست."
        ],
        [
          "پایداری",
          [
            1,
            2
          ],
          [
            "150 r/s"
          ],
          "min(200,300)",
          "150 served/s",
          [
            "150 served",
            "200 cap",
            "300 cap"
          ],
          "بار زیر سقف هر دو است.",
          "headroom و p95 را اندازه بگیرید.",
          "success"
        ]
      ]
    ],
    [
      "horizontal",
      "افزایش افقی",
      "دو replica چه ظرفیتی دارند؟",
      "2×100 req/s",
      [
        [
          "instance اول",
          [
            1
          ],
          [
            "1 replica"
          ],
          "replicas=1",
          "100 cap",
          [
            "180 r/s",
            "1×100",
            "300 cap"
          ],
          "یک instance کافی نیست.",
          "state محلی session مانع توزیع ساده می‌شود."
        ],
        [
          "افزودن replica",
          [
            1
          ],
          [
            "scale out"
          ],
          "replicas=2",
          "200 cap",
          [
            "180 r/s",
            "2×100",
            "300 cap"
          ],
          "در فرض توزیع یکنواخت ظرفیت برنامه جمع می‌شود.",
          "readiness پیش از دریافت بار لازم است."
        ],
        [
          "توزیع",
          [
            0,
            1
          ],
          [
            "90+90"
          ],
          "180 / 2",
          "180 served/s",
          [
            "180 served",
            "90+90",
            "180 used"
          ],
          "بار به دو instance تقسیم شد.",
          "DB pool مجموع replicaها را بودجه‌بندی کنید.",
          "success"
        ]
      ]
    ],
    [
      "bottleneck",
      "گلوگاه مشترک",
      "اگر DB سقف 160 داشته باشد؟",
      "4×100, DB=160",
      [
        [
          "افزایش",
          [
            1
          ],
          [
            "4 replicas"
          ],
          "app capacity=400",
          "400 app cap",
          [
            "250 r/s",
            "400 cap",
            "160 cap"
          ],
          "ظرفیت برنامه بالا رفته است.",
          "scale app نمی‌تواند DB را سریع‌تر کند."
        ],
        [
          "فشار DB",
          [
            1,
            2
          ],
          [
            "250 r/s"
          ],
          "DB accepts 160/s",
          "90/s excess",
          [
            "250 r/s",
            "400 cap",
            "160 served"
          ],
          "۹۰ کار در ثانیه اضافه است.",
          "bounded queue و load shedding لازم است.",
          "error"
        ],
        [
          "تشخیص",
          [
            1
          ],
          [
            "min cap"
          ],
          "min(400,160)",
          "160 served/s",
          [
            "160 served",
            "400 cap",
            "160 cap"
          ],
          "بیشترین throughput مدل ۱۶۰ است.",
          "query/index/cache یا ظرفیت DB را بررسی کنید.",
          "error"
        ]
      ],
      "scale افقی گلوگاه پایین‌دست را حذف نمی‌کند."
    ]
  ],
  "pitfall": "autoscaling واکنش آنی ندارد؛ بدون محدودسازی صف و ظرفیت DB، افزایش replica می‌تواند خرابی را تشدید کند.",
  "takeaway": "ظرفیت کوچک‌ترین گلوگاه و زمان آماده شدن replica را بسنجید.",
  "quiz": [
    "ظرفیت ۴×۱۰۰ برنامه و DB=۱۶۰؟",
    [
      "۴۰۰",
      "۱۶۰",
      "۵۶۰"
    ],
    1,
    "حداقل ظرفیت اجزای سری تعیین‌کننده است."
  ],
  "practice": [
    "DB اشباع ولی CPU برنامه پایین؛ نخست چه کنید؟",
    [
      "افزودن بی‌حد app",
      "اندازه‌گیری DB و کنترل بار",
      "حذف health"
    ],
    1,
    "گلوگاه مشترک را برطرف کنید."
  ],
  "hint": "ظرفیت کمینه مهم است.",
  "terms": [
    [
      "Scale up",
      "افزایش ظرفیت یک گره"
    ],
    [
      "Scale out",
      "افزایش تعداد گره"
    ],
    [
      "Bottleneck",
      "کمترین ظرفیت موثر"
    ]
  ],
  "references": [
    [
      "Azure autoscaling",
      "https://learn.microsoft.com/en-us/azure/architecture/best-practices/auto-scaling"
    ],
    [
      "AWS scaling guidance",
      "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_adapt_to_changes_autoscale.html"
    ]
  ],
  "exercise": [
    "مدل ظرفیت را اجرا کنید.",
    "for n in [1,2,4]: print(n,min(n*100,160))\nassert min(4*100,160)==160",
    "۱۰۰، ۱۶۰، ۱۶۰.",
    "این throughput فرضی است؛ آزمون بار واقعی نیست."
  ],
  "deep": {
    "title": "Backlog هنگام warm-up",
    "question": "در ۱۰ ثانیه تا آماده شدن replica چند درخواست در صف می‌ماند؟",
    "assumptions": "بار 150/s، ظرفیت اولیه 100/s؛ در t=10 ظرفیت 200 یا 300، DB کافی؛ صف نامحدود آموزشی.",
    "lanes": [
      "Traffic",
      "Fleet",
      "Queue"
    ],
    "fields": {
      "cap": "ظرفیت /s",
      "backlog": "صف",
      "served": "سرویس /s",
      "time": "زمان s"
    },
    "code": "backlog = max(0, backlog + (arrival - capacity) * dt)\n# real systems bound queues",
    "cases": [
      [
        "two",
        "دو replica",
        {
          "cap": 100,
          "backlog": 0,
          "served": 100,
          "time": 0
        },
        [
          [
            0,
            0,
            1,
            "جهش بار",
            "150/s",
            "ظرفیت کم است.",
            {
              "served": 100
            }
          ],
          [
            10,
            1,
            2,
            "warm-up",
            "50×10",
            "۵۰۰ درخواست منتظر.",
            {
              "backlog": 500,
              "time": 10,
              "cap": 200
            }
          ],
          [
            15,
            1,
            2,
            "تخلیه",
            "50×5",
            "۲۵۰ باقی.",
            {
              "backlog": 250,
              "time": 15,
              "served": 200
            }
          ],
          [
            20,
            1,
            2,
            "پایان صف",
            "50×5",
            "صف صفر.",
            {
              "backlog": 0,
              "time": 20,
              "served": 150
            },
            "success"
          ]
        ],
        "تخلیه در t=20."
      ],
      [
        "three",
        "سه replica",
        {
          "cap": 100,
          "backlog": 0,
          "served": 100,
          "time": 0
        },
        [
          [
            0,
            0,
            1,
            "جهش",
            "150/s",
            "ابتدا همان ظرفیت.",
            {
              "served": 100
            }
          ],
          [
            10,
            1,
            2,
            "warm-up",
            "500 backlog",
            "ظرفیت تازه ۳۰۰.",
            {
              "backlog": 500,
              "time": 10,
              "cap": 300
            }
          ],
          [
            13,
            1,
            2,
            "تخلیه",
            "150×3",
            "۵۰ باقی.",
            {
              "backlog": 50,
              "time": 13,
              "served": 300
            }
          ],
          [
            14,
            1,
            2,
            "پایان",
            "drain ≤1s",
            "در مدل tick، صف صفر در t=14.",
            {
              "backlog": 0,
              "time": 14,
              "served": 150
            },
            "success"
          ]
        ],
        "صف تا t=14 تخلیه شد، ظرفیت اضافه هزینه دارد."
      ]
    ],
    "diagnose": "arrival rate، ready replicas، queue age و DB saturation را دنبال کنید.",
    "tradeoff": "warm-up، هزینه و محدودیت pool/DB مدل خطی را تغییر می‌دهند."
  }
});
export default lesson;
