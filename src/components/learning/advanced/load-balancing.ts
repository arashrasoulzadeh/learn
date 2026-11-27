import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "load-balancing",
  "order": 42,
  "title": "Load Balancing — توزیع درخواست",
  "description": "Round Robin، Least Connections و گره ناسالم.",
  "actors": [
    [
      "Balancer",
      "Routing policy",
      "proxy"
    ],
    [
      "App A",
      "Backend A",
      "app"
    ],
    [
      "App B",
      "Backend B",
      "app"
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
    "سیاست / درخواست",
    "A",
    "B"
  ],
  "context": "مدل دو instance هم‌ظرفیت؛ اتصال فعال proxy با کار واقعی CPU یکسان نیست.",
  "goal": "توزیع درخواست را با بار فعال و health مقایسه کنید.",
  "scenarios": [
    [
      "round-robin",
      "Round Robin",
      "سه درخواست به کدام گره‌ها می‌روند؟",
      "R1,R2,R3",
      [
        [
          "درخواست اول",
          [
            0,
            1
          ],
          [
            "R1"
          ],
          "next=A",
          "A=1",
          [
            "RR",
            "1 request",
            "0 requests"
          ],
          "اولین گره A انتخاب شد.",
          "round robin وزن‌ها و eligibility را رعایت می‌کند."
        ],
        [
          "درخواست دوم",
          [
            0,
            2
          ],
          [
            "R2"
          ],
          "next=B",
          "B=1",
          [
            "RR",
            "1 request",
            "1 request"
          ],
          "درخواست بعدی به B می‌رود.",
          "درخواست‌ها ممکن است هزینه متفاوت داشته باشند."
        ],
        [
          "درخواست سوم",
          [
            0,
            1
          ],
          [
            "R3"
          ],
          "next=A",
          "A=2; B=1",
          [
            "RR",
            "2 requests",
            "1 request"
          ],
          "تعداد درخواست تقریباً برابر می‌شود.",
          "برابری تعداد لزوماً برابری latency نیست.",
          "success"
        ]
      ]
    ],
    [
      "least",
      "Least Connections",
      "A سه کار فعال دارد و B یک کار؛ انتخاب؟",
      "A=3; B=1",
      [
        [
          "اندازه‌گیری",
          [
            0
          ],
          [
            "active counts"
          ],
          "A=3; B=1",
          "B less busy",
          [
            "Least conn",
            "3 active",
            "1 active"
          ],
          "تعداد اتصال فعال در تصمیم لحاظ می‌شود.",
          "keepalive و multiplexing می‌توانند metric را تغییر دهند."
        ],
        [
          "هدایت",
          [
            0,
            2
          ],
          [
            "R4"
          ],
          "choose B",
          "B=2",
          [
            "R4→B",
            "3 active",
            "2 active"
          ],
          "B اتصال فعال کمتر داشت.",
          "وزن و ظرفیت backend را لحاظ کنید."
        ],
        [
          "اتمام",
          [
            1,
            0
          ],
          [
            "R1 done"
          ],
          "A complete",
          "A=2; B=2",
          [
            "Next tie",
            "2 active",
            "2 active"
          ],
          "پس از اتمام کار تعداد فعال تغییر می‌کند.",
          "سیاست tie-breaker پیاده‌سازی‌محور است.",
          "success"
        ]
      ]
    ],
    [
      "unhealthy",
      "حذف گره ناسالم",
      "اگر A آماده سرویس نباشد؟",
      "A readiness failed",
      [
        [
          "بررسی",
          [
            0,
            1
          ],
          [
            "GET /ready",
            "503"
          ],
          "health probe",
          "A unavailable",
          [
            "Probe failed",
            "DOWN",
            "Ready"
          ],
          "مدل health check فعال و threshold=1 است.",
          "همه نسخه‌های NGINX probe فعال ندارند؛ policy را مشخص کنید.",
          "error"
        ],
        [
          "انتخاب",
          [
            0
          ],
          [
            "eligible=B"
          ],
          "exclude A",
          "B eligible",
          [
            "B only",
            "DOWN",
            "Ready"
          ],
          "A از انتخاب حذف می‌شود.",
          "health check دروغین باعث overload گره سالم می‌شود."
        ],
        [
          "درخواست",
          [
            0,
            2
          ],
          [
            "GET",
            "200"
          ],
          "send to B",
          "200 from B",
          [
            "200",
            "DOWN",
            "1 request"
          ],
          "مسیر سالم باقی مانده استفاده شد.",
          "اگر B هم down باشد پاسخ کنترل‌شده لازم است.",
          "success"
        ]
      ],
      "حذف گره ظرفیت کل را کاهش می‌دهد."
    ]
  ],
  "pitfall": "sticky sessions ممکن است uneven load ایجاد کنند؛ health check هم تضمین سلامت همه عملیات نیست.",
  "takeaway": "الگوریتم، ظرفیت، readiness و metrics را کنار هم بسنجید.",
  "quiz": [
    "Least Connections بر اساس چیست؟",
    [
      "اندازه فایل",
      "اتصال‌های فعال و وزن",
      "ترتیب DNS"
    ],
    1,
    "اتصال فعال معیار مدل است."
  ],
  "practice": [
    "درخواست‌های طولانی و کوتاه مخلوط‌اند؛ کدام معیار از شمار درخواست بهتر است؟",
    [
      "تعداد فایل",
      "active work/latency و ظرفیت",
      "فقط IP"
    ],
    1,
    "توزیع تعداد با توزیع زمان کار فرق دارد."
  ],
  "hint": "هزینه هر request یکسان نیست.",
  "terms": [
    [
      "Round Robin",
      "نوبتی"
    ],
    [
      "Least Connections",
      "کمترین اتصال فعال"
    ],
    [
      "Readiness",
      "آمادگی پذیرش بار"
    ]
  ],
  "references": [
    [
      "NGINX load balancing",
      "https://nginx.org/en/docs/http/load_balancing.html"
    ],
    [
      "NGINX upstream",
      "https://nginx.org/en/docs/http/ngx_http_upstream_module.html"
    ]
  ],
  "exercise": [
    "توزیع سه درخواست نوبتی را آزمایش کنید.",
    "targets=['A','B']\nassert [targets[i%2] for i in range(3)]==['A','B','A']\nprint('A,B,A')",
    "۲ درخواست A و یک B.",
    "این الگوریتم health یا concurrency واقعی ندارد."
  ],
  "deep": {
    "title": "کار طولانی و توزیع بار فعال",
    "question": "درخواست‌های جدید وقتی A شلوغ است چگونه پخش می‌شوند؟",
    "assumptions": "A=4 و B=0 کار فعال اولیه؛ سه درخواست جدید، هیچ کار پایان نمی‌یابد؛ RR از A شروع می‌شود.",
    "lanes": [
      "Balancer",
      "A",
      "B"
    ],
    "fields": {
      "a": "کار فعال A",
      "b": "کار فعال B",
      "max": "بیشینه فعال",
      "routes": "مسیرها"
    },
    "code": "choose = min(healthy, key=lambda node: node.active)\n# atomic update on dispatch",
    "cases": [
      [
        "rr",
        "Round Robin",
        {
          "a": 4,
          "b": 0,
          "max": 4,
          "routes": "—"
        },
        [
          [
            0,
            0,
            null,
            "شروع",
            "RR A first",
            "بار قدیمی در انتخاب دیده نمی‌شود.",
            {
              "routes": "Ready"
            }
          ],
          [
            1,
            0,
            1,
            "R1",
            "A",
            "A پنج کار دارد.",
            {
              "a": 5,
              "max": 5,
              "routes": "A"
            }
          ],
          [
            2,
            0,
            2,
            "R2",
            "B",
            "B یک کار.",
            {
              "b": 1,
              "routes": "A,B"
            }
          ],
          [
            3,
            0,
            1,
            "R3",
            "A",
            "A شش کار.",
            {
              "a": 6,
              "max": 6,
              "routes": "A,B,A"
            },
            "error"
          ]
        ],
        "بیشینه ۶."
      ],
      [
        "least",
        "Least active",
        {
          "a": 4,
          "b": 0,
          "max": 4,
          "routes": "—"
        },
        [
          [
            0,
            0,
            null,
            "شروع",
            "active counts",
            "B کمتر دارد.",
            {
              "routes": "Ready"
            }
          ],
          [
            1,
            0,
            2,
            "R1",
            "B",
            "B یک کار.",
            {
              "b": 1,
              "routes": "B"
            }
          ],
          [
            2,
            0,
            2,
            "R2",
            "B",
            "B دو کار.",
            {
              "b": 2,
              "routes": "B,B"
            }
          ],
          [
            3,
            0,
            2,
            "R3",
            "B",
            "B سه کار؛ A چهار.",
            {
              "b": 3,
              "routes": "B,B,B",
              "max": 4
            },
            "success"
          ]
        ],
        "بیشینه ۴ در مدل."
      ]
    ],
    "diagnose": "per-backend active requests، latency percentile، error rate و health state.",
    "tradeoff": "least active نیز هزینه واقعی هر درخواست را نمی‌داند و state توزیع‌شده ممکن است کهنه باشد."
  }
});
export default lesson;
