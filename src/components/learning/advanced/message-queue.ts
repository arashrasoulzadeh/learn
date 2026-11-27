import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "message-queue",
  "order": 45,
  "title": "Message Queue — تحویل، ACK و صف",
  "description": "Visibility timeout، retry و DLQ.",
  "actors": [
    [
      "Producer",
      "Sender",
      "app"
    ],
    [
      "Broker",
      "Queue",
      "queue"
    ],
    [
      "Worker",
      "Consumer",
      "cpu"
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
    "پیام تولیدی",
    "صف / delivery",
    "اثر worker"
  ],
  "context": "مدل صف شبیه SQS با at-least-once و visibility timeout؛ ACK به معنی حذف پیام در قرارداد نمونه.",
  "goal": "دریافت پیام را از commit اثر و حذف پیام جدا کنید.",
  "scenarios": [
    [
      "normal",
      "مصرف موفق",
      "آیا دریافت پیام یعنی حذف آن؟",
      "job-42",
      [
        [
          "ارسال",
          [
            0,
            1
          ],
          [
            "send job42",
            "ACK"
          ],
          "send(job42)",
          "Queued",
          [
            "job42",
            "Visible",
            "0 effects"
          ],
          "broker پیام را طبق قرارداد پذیرفته.",
          "durability و producer ACK را مشخص کنید."
        ],
        [
          "دریافت",
          [
            1,
            2
          ],
          [
            "receive"
          ],
          "visibility timeout=30s",
          "In flight",
          [
            "job42",
            "Invisible",
            "Processing"
          ],
          "پیام تا پایان visibility مخفی می‌شود، نه حذف.",
          "مدت پردازش و visibility را هماهنگ کنید."
        ],
        [
          "ثبت و ACK",
          [
            2,
            1
          ],
          [
            "delete/ACK"
          ],
          "commit effect; delete message",
          "Done",
          [
            "job42",
            "Deleted",
            "1 effect"
          ],
          "اثر پایدار پیش از حذف پیام ثبت شد.",
          "crash بین commit و ACK باعث تکرار می‌شود.",
          "success"
        ]
      ]
    ],
    [
      "retry",
      "خرابی و تحویل دوباره",
      "اگر worker پیش از ACK crash کند؟",
      "job42 visibility expiry",
      [
        [
          "دریافت",
          [
            1,
            2
          ],
          [
            "receive"
          ],
          "worker receives",
          "In flight",
          [
            "job42",
            "Invisible",
            "Pending"
          ],
          "پیام در حال پردازش است.",
          "receipt handle به delivery وابسته است."
        ],
        [
          "خرابی",
          [
            2
          ],
          [
            "crash"
          ],
          "worker exits",
          "No ACK",
          [
            "job42",
            "Invisible until expiry",
            "Unknown"
          ],
          "کارگر حذف پیام را انجام نداده است.",
          "اثر ممکن است ثبت شده باشد؛ نتیجه نامعلوم است.",
          "error"
        ],
        [
          "تحویل تازه",
          [
            1,
            2
          ],
          [
            "redelivery"
          ],
          "visibility expired",
          "Retry job42",
          [
            "job42",
            "Receive count=2",
            "Retry-safe required"
          ],
          "پیام دوباره قابل دریافت شد.",
          "idempotency اثر کسب‌وکار ضروری است.",
          "success"
        ]
      ],
      "at-least-once تکرار را ممکن می‌کند."
    ],
    [
      "dlq",
      "Poison message",
      "آیا باید پیام نامعتبر تا ابد retry شود؟",
      "max receives=3",
      [
        [
          "شکست اول",
          [
            1,
            2
          ],
          [
            "job invalid"
          ],
          "decode fails",
          "Receive 1 failed",
          [
            "job42",
            "Retry scheduled",
            "Failed"
          ],
          "داده نامعتبر با خطای گذرا فرق دارد.",
          "نوع خطا و schema را ثبت کنید.",
          "error"
        ],
        [
          "تلاش محدود",
          [
            1,
            2
          ],
          [
            "retry"
          ],
          "receive 2,3 fail",
          "Retry exhausted",
          [
            "job42",
            "Count=3",
            "Failed"
          ],
          "پس از تعداد دریافت تعیین‌شده دیگر retry نامحدود نمی‌شود.",
          "backoff و سیاست redrive را مشخص کنید.",
          "error"
        ],
        [
          "انتقال",
          [
            1
          ],
          [
            "DLQ"
          ],
          "redrive policy",
          "Moved to DLQ",
          [
            "job42",
            "Dead-letter queue",
            "Alert"
          ],
          "پیام برای بررسی جدا می‌شود.",
          "DLQ نیازمند alert، retention و replay کنترل‌شده است.",
          "success"
        ]
      ],
      "پیام poison نباید throughput کل را متوقف کند."
    ]
  ],
  "pitfall": "ACK زودهنگام می‌تواند کار را از دست بدهد؛ retry پس از اثر ثبت‌شده می‌تواند آن را تکرار کند.",
  "takeaway": "ACK بعد از commit، idempotency، retry محدود و DLQ.",
  "quiz": [
    "Visibility timeout چیست؟",
    [
      "حذف قطعی پیام",
      "مهلت مخفی بودن پیام دریافت‌شده",
      "TTL همه صف"
    ],
    1,
    "پس از مهلت پیام ممکن است دوباره visible شود."
  ],
  "practice": [
    "اثر commit شده ولی ACK گم شد؛ چه کنید؟",
    [
      "ثبت اتمیک شناسه و اثر",
      "تکرار بدون کنترل",
      "ACK قبل از پردازش"
    ],
    0,
    "تکرار قابل انتظار است؛ اثر باید idempotent باشد."
  ],
  "hint": "broker وضعیت DB را نمی‌داند.",
  "terms": [
    [
      "Visibility timeout",
      "مهلت پنهان بودن"
    ],
    [
      "ACK",
      "تأیید مصرف"
    ],
    [
      "DLQ",
      "صف خطای نهایی"
    ]
  ],
  "references": [
    [
      "SQS visibility timeout",
      "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html"
    ],
    [
      "SQS dead-letter queues",
      "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html"
    ]
  ],
  "exercise": [
    "دو delivery یک job را در مدل حافظه dedup کنید.",
    "seen=set(); effects=0\nfor job in ['42','42']:\n    if job not in seen: seen.add(job); effects+=1\nassert effects==1\nprint(effects)",
    "یک اثر.",
    "پایداری و تراکنش واقعی نیاز به DB دارد."
  ],
  "deep": {
    "title": "ظرفیت مصرف و سن صف",
    "question": "در بار ۱۲ job/s و مصرف ۸ یا ۱۶، صف چه می‌شود؟",
    "assumptions": "چهار tick یک‌ثانیه‌ای، صف اولیه صفر، jobهای هم‌هزینه و ACK موفق.",
    "lanes": [
      "Producer",
      "Queue",
      "Workers"
    ],
    "fields": {
      "arrived": "کل ورودی",
      "done": "کل مصرف",
      "queued": "صف",
      "cap": "ظرفیت /s"
    },
    "code": "queued += arrivals\nprocessed = min(queued, workers * rate)\nqueued -= processed",
    "cases": [
      [
        "8",
        "یک گروه worker",
        {
          "arrived": 0,
          "done": 0,
          "queued": 0,
          "cap": 8
        },
        [
          [
            1,
            1,
            2,
            "tick 1",
            "8 ACK",
            "۱۲ job وارد شد؛ 8 job مصرف شد.",
            {
              "arrived": 12,
              "done": 8,
              "queued": 4
            },
            "error"
          ],
          [
            2,
            1,
            2,
            "tick 2",
            "8 ACK",
            "۱۲ job وارد شد؛ 8 job مصرف شد.",
            {
              "arrived": 24,
              "done": 16,
              "queued": 8
            },
            "error"
          ],
          [
            3,
            1,
            2,
            "tick 3",
            "8 ACK",
            "۱۲ job وارد شد؛ 8 job مصرف شد.",
            {
              "arrived": 36,
              "done": 24,
              "queued": 12
            },
            "error"
          ],
          [
            4,
            1,
            2,
            "tick 4",
            "8 ACK",
            "۱۲ job وارد شد؛ 8 job مصرف شد.",
            {
              "arrived": 48,
              "done": 32,
              "queued": 16
            },
            "error"
          ]
        ],
        "پس از ۴ ثانیه ۱۶ job منتظرند."
      ],
      [
        "16",
        "دو گروه worker",
        {
          "arrived": 0,
          "done": 0,
          "queued": 0,
          "cap": 16
        },
        [
          [
            1,
            1,
            2,
            "tick 1",
            "12 ACK",
            "۱۲ job وارد شد؛ 12 job مصرف شد.",
            {
              "arrived": 12,
              "done": 12,
              "queued": 0
            },
            "success"
          ],
          [
            2,
            1,
            2,
            "tick 2",
            "12 ACK",
            "۱۲ job وارد شد؛ 12 job مصرف شد.",
            {
              "arrived": 24,
              "done": 24,
              "queued": 0
            },
            "success"
          ],
          [
            3,
            1,
            2,
            "tick 3",
            "12 ACK",
            "۱۲ job وارد شد؛ 12 job مصرف شد.",
            {
              "arrived": 36,
              "done": 36,
              "queued": 0
            },
            "success"
          ],
          [
            4,
            1,
            2,
            "tick 4",
            "12 ACK",
            "۱۲ job وارد شد؛ 12 job مصرف شد.",
            {
              "arrived": 48,
              "done": 48,
              "queued": 0
            },
            "success"
          ]
        ],
        "صف در پایان هر tick صفر است."
      ]
    ],
    "diagnose": "queue depth، oldest message age، processing rate، retries و DLQ.",
    "tradeoff": "صف بار را هموار می‌کند ولی ظرفیت پایدار ایجاد نمی‌کند؛ worker بیشتر ممکن است DB را اشباع کند."
  }
});
export default lesson;
