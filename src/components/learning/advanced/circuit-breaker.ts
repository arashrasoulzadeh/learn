import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "circuit-breaker",
  "order": 47,
  "title": "Circuit Breaker — مهار خرابی وابستگی",
  "description": "Closed/Open/Half-open، probe و محدودیت retry.",
  "actors": [
    [
      "Caller",
      "Request",
      "app"
    ],
    [
      "Breaker",
      "State machine",
      "shield"
    ],
    [
      "Dependency",
      "Remote service",
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
    "درخواست",
    "حالت breaker",
    "وابستگی"
  ],
  "context": "آستانه 2 شکست متوالی، cooldown فرضی 5s، یک probe در Half-open؛ سیاست نمونه نه استاندارد واحد.",
  "goal": "چرخه breaker و تفاوت آن با retry و timeout را بفهمید.",
  "scenarios": [
    [
      "closed",
      "حالت Closed",
      "در حالت عادی تماس عبور می‌کند؟",
      "Closed",
      [
        [
          "ورود",
          [
            0,
            1
          ],
          [
            "request"
          ],
          "state=CLOSED",
          "Admitted",
          [
            "R1",
            "CLOSED failures=0",
            "Ready"
          ],
          "Closed تماس را مجاز می‌کند.",
          "Closed به معنی اتصال TCP بسته نیست."
        ],
        [
          "تماس",
          [
            1,
            2
          ],
          [
            "call",
            "200"
          ],
          "dependency call",
          "Success",
          [
            "R1",
            "CLOSED failures=0",
            "200"
          ],
          "موفقیت شکست متوالی را reset می‌کند.",
          "timeout همچنان لازم است."
        ],
        [
          "پاسخ",
          [
            1,
            0
          ],
          [
            "200"
          ],
          "return response",
          "200",
          [
            "200",
            "CLOSED",
            "Healthy"
          ],
          "breaker مانع تماس سالم نشده.",
          "metrics latency و success را ثبت کنید.",
          "success"
        ]
      ]
    ],
    [
      "open",
      "باز شدن پس از شکست",
      "پس از دو timeout چه می‌شود؟",
      "threshold=2",
      [
        [
          "شکست اول",
          [
            1,
            2
          ],
          [
            "call",
            "timeout"
          ],
          "failures=1",
          "Timeout 1",
          [
            "R1",
            "CLOSED failures=1",
            "Timeout"
          ],
          "یک شکست ثبت شده.",
          "خطاهای تجاری 4xx لزوماً failure breaker نیستند.",
          "error"
        ],
        [
          "شکست دوم",
          [
            1,
            2
          ],
          [
            "call",
            "timeout"
          ],
          "failures=2",
          "OPEN",
          [
            "R2",
            "OPEN until t+5",
            "Timeout"
          ],
          "آستانه نمونه breaker را باز کرد.",
          "atomic state transition و concurrency مهم‌اند.",
          "error"
        ],
        [
          "رد سریع",
          [
            0,
            1
          ],
          [
            "call",
            "fallback / reject"
          ],
          "state=OPEN",
          "No dependency call",
          [
            "R3",
            "OPEN",
            "Not called"
          ],
          "بدون تماس تازه سریع رد یا fallback می‌شود.",
          "fallback نباید نتیجه موفق جعلی ارائه کند.",
          "success"
        ]
      ],
      "Open وابستگی خراب را از بار بیشتر محافظت می‌کند."
    ],
    [
      "half-open",
      "Probe و بازیابی",
      "پس از cooldown آیا همه تماس‌ها آزادند؟",
      "one probe",
      [
        [
          "پایان cooldown",
          [
            1
          ],
          [
            "HALF_OPEN"
          ],
          "now>=retryAt",
          "Probe allowed",
          [
            "Pending",
            "HALF_OPEN",
            "Unknown"
          ],
          "فقط یک probe در سیاست نمونه مجاز است.",
          "اجازه probe را اتمیک کنید."
        ],
        [
          "probe",
          [
            1,
            2
          ],
          [
            "probe",
            "200"
          ],
          "test call",
          "Healthy probe",
          [
            "Probe",
            "HALF_OPEN success",
            "200"
          ],
          "وابستگی در نمونه پاسخ داد.",
          "probe موفق سلامت قطعی همه endpointها را اثبات نمی‌کند."
        ],
        [
          "بستن breaker",
          [
            1
          ],
          [
            "CLOSED"
          ],
          "reset failures",
          "Recovered",
          [
            "Next allowed",
            "CLOSED failures=0",
            "Ready"
          ],
          "در سیاست نمونه یک موفقیت کافی است.",
          "شکست probe دوباره Open می‌کند.",
          "success"
        ]
      ],
      "Half-open جلوگیری از هجوم هم‌زمان است."
    ]
  ],
  "pitfall": "Breaker جای timeout، bulkhead یا idempotency نیست؛ آستانه و خطاهای شمارش‌شده باید مشخص باشند.",
  "takeaway": "خطا را اندازه بگیرید، سریع رد کنید، بازیابی را با probe محدود بسنجید.",
  "quiz": [
    "در OPEN چه می‌شود؟",
    [
      "همه تماس‌ها retry می‌شوند",
      "تماس وابستگی رد سریع می‌شود",
      "DB reset می‌شود"
    ],
    1,
    "Open از بار روی dependency کم می‌کند."
  ],
  "practice": [
    "اگر probe در Half-open شکست بخورد؟",
    [
      "همه تماس‌ها آزاد",
      "بازگشت به Open و cooldown",
      "حذف deadline"
    ],
    1,
    "بازیابی تأیید نشده است."
  ],
  "hint": "probe فقط برای آزمودن بازیابی است.",
  "terms": [
    [
      "Closed",
      "عبور تماس"
    ],
    [
      "Open",
      "رد سریع"
    ],
    [
      "Half-open",
      "probe محدود"
    ]
  ],
  "references": [
    [
      "AWS Circuit breaker",
      "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/circuit-breaker.html"
    ],
    [
      "Azure Circuit Breaker",
      "https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker"
    ]
  ],
  "exercise": [
    "آستانه شکست متوالی را مدل کنید.",
    "failures=0; state='CLOSED'\nfor ok in [False,False]:\n    failures=0 if ok else failures+1\n    if failures>=2: state='OPEN'\nassert state=='OPEN'\nprint(state)",
    "پس از دو failure باز.",
    "cooldown و concurrency واقعی پیاده نشده‌اند."
  ],
  "deep": {
    "title": "هزینه تماس به dependency خراب",
    "question": "پنج درخواست با timeout 100ms چه مقدار زمان جمعی مصرف می‌کنند؟",
    "assumptions": "درخواست‌های نوبتی؛ dependency همیشه timeout می‌دهد؛ breaker بعد از ۲ شکست open؛ رد سریع 1ms؛ cooldown در طول trace تمام نمی‌شود.",
    "lanes": [
      "Caller",
      "Breaker",
      "Dependency"
    ],
    "fields": {
      "calls": "تماس واقعی",
      "elapsed": "زمان جمعی ms",
      "state": "حالت",
      "rejected": "رد سریع"
    },
    "code": "if breaker.open: fail_fast()\ntry: call_with_timeout(100)\nexcept Timeout: breaker.record_failure()",
    "cases": [
      [
        "direct",
        "بدون breaker",
        {
          "calls": 0,
          "elapsed": 0,
          "state": "CLOSED",
          "rejected": 0
        },
        [
          [
            1,
            1,
            2,
            "تماس 1",
            "timeout 100ms",
            "تماس به timeout رسید.",
            {
              "calls": 1,
              "elapsed": 100,
              "state": "CLOSED",
              "rejected": 0
            },
            "error"
          ],
          [
            2,
            1,
            2,
            "تماس 2",
            "timeout 100ms",
            "تماس به timeout رسید.",
            {
              "calls": 2,
              "elapsed": 200,
              "state": "CLOSED",
              "rejected": 0
            },
            "error"
          ],
          [
            3,
            1,
            2,
            "تماس 3",
            "timeout 100ms",
            "تماس به timeout رسید.",
            {
              "calls": 3,
              "elapsed": 300,
              "state": "CLOSED",
              "rejected": 0
            },
            "error"
          ],
          [
            4,
            1,
            2,
            "تماس 4",
            "timeout 100ms",
            "تماس به timeout رسید.",
            {
              "calls": 4,
              "elapsed": 400,
              "state": "CLOSED",
              "rejected": 0
            },
            "error"
          ],
          [
            5,
            1,
            2,
            "تماس 5",
            "timeout 100ms",
            "تماس به timeout رسید.",
            {
              "calls": 5,
              "elapsed": 500,
              "state": "CLOSED",
              "rejected": 0
            },
            "error"
          ]
        ],
        "۵ تماس و ۵۰۰ms زمان جمعی."
      ],
      [
        "breaker",
        "با breaker",
        {
          "calls": 0,
          "elapsed": 0,
          "state": "CLOSED",
          "rejected": 0
        },
        [
          [
            1,
            1,
            2,
            "تماس 1",
            "timeout 100ms",
            "تماس به timeout رسید.",
            {
              "calls": 1,
              "elapsed": 100,
              "state": "CLOSED",
              "rejected": 0
            },
            "error"
          ],
          [
            2,
            1,
            2,
            "تماس 2",
            "timeout 100ms",
            "تماس به timeout رسید.",
            {
              "calls": 2,
              "elapsed": 200,
              "state": "OPEN",
              "rejected": 0
            },
            "error"
          ],
          [
            3,
            1,
            0,
            "رد سریع",
            "fast fail",
            "Open تماس تازه نمی‌فرستد.",
            {
              "calls": 2,
              "elapsed": 201,
              "state": "OPEN",
              "rejected": 1
            },
            "error"
          ],
          [
            4,
            1,
            0,
            "رد سریع",
            "fast fail",
            "Open تماس تازه نمی‌فرستد.",
            {
              "calls": 2,
              "elapsed": 202,
              "state": "OPEN",
              "rejected": 2
            },
            "error"
          ],
          [
            5,
            1,
            0,
            "رد سریع",
            "fast fail",
            "Open تماس تازه نمی‌فرستد.",
            {
              "calls": 2,
              "elapsed": 203,
              "state": "OPEN",
              "rejected": 3
            },
            "error"
          ]
        ],
        "۲ تماس و ۲۰۳ms زمان جمعی."
      ]
    ],
    "diagnose": "breaker state، transition، dependency latency، fast-fail rate و probe success.",
    "tradeoff": "آستانه بسیار حساس می‌تواند failure موقت را به عدم سرویس تبدیل کند؛ latency جمعی با wall clock موازی یکی نیست."
  }
});
export default lesson;
