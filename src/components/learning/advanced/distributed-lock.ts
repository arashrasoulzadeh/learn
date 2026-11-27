import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "distributed-lock",
  "order": 48,
  "title": "Distributed Lock — lease و fencing",
  "description": "انقضای lease، توقف طولانی فرایند و توکن fencing.",
  "actors": [
    [
      "Worker A",
      "Old owner",
      "app"
    ],
    [
      "Coordinator",
      "Lease authority",
      "shield"
    ],
    [
      "Resource",
      "Protected store",
      "db"
    ],
    [
      "Worker B",
      "New owner",
      "app"
    ]
  ],
  "edges": [
    [
      0,
      1
    ],
    [
      3,
      1
    ],
    [
      0,
      2
    ],
    [
      3,
      2
    ]
  ],
  "labels": [
    "مالک A",
    "Lease / token",
    "وضعیت منبع"
  ],
  "context": "coordinator خطی‌پذیر و token صعودی فرض می‌شود؛ resource باید token را اتمیک بررسی و ثبت کند.",
  "goal": "نشان دهید lease به تنهایی از نوشتن مالک قدیمی جلوگیری نمی‌کند.",
  "scenarios": [
    [
      "acquire",
      "گرفتن و آزاد کردن lease",
      "آیا هر worker می‌تواند lock دیگری را آزاد کند؟",
      "lease A token=1",
      [
        [
          "گرفتن",
          [
            0,
            1
          ],
          [
            "acquire",
            "lease=1"
          ],
          "acquire(resource)",
          "A owner",
          [
            "A active",
            "A token=1",
            "v0"
          ],
          "coordinator مالک را برای زمان محدود ثبت می‌کند.",
          "مالکیت و expiry را با عملیات اتمیک مدیریت کنید."
        ],
        [
          "نوشتن",
          [
            0,
            2
          ],
          [
            "write token1",
            "OK"
          ],
          "write(v1,token=1)",
          "v1",
          [
            "A",
            "Lease valid",
            "v1 token=1"
          ],
          "منبع درخواست مالک معتبر را می‌پذیرد.",
          "resource-side enforcement مستقل است."
        ],
        [
          "آزادسازی",
          [
            0,
            1
          ],
          [
            "release if owner"
          ],
          "compare owner then delete",
          "Free",
          [
            "A done",
            "Free",
            "v1 token=1"
          ],
          "آزادسازی باید با شناسه مالک تطبیق داشته باشد.",
          "DEL کور ممکن است lock مالک جدید را حذف کند.",
          "success"
        ]
      ]
    ],
    [
      "stale",
      "مالک قدیمی پس از توقف",
      "اگر A پس از expiry دوباره بیدار شود؟",
      "A paused",
      [
        [
          "توقف A",
          [
            0
          ],
          [
            "pause"
          ],
          "lease A expires",
          "A paused",
          [
            "Paused",
            "Expired token1",
            "v0"
          ],
          "GC pause یا network delay ممکن است از lease بیشتر باشد.",
          "local clock تضمین مالکیت زنده نیست.",
          "error"
        ],
        [
          "گرفتن B",
          [
            3,
            1
          ],
          [
            "acquire",
            "token=2"
          ],
          "B acquires token2",
          "B owner",
          [
            "Paused",
            "B token=2",
            "v0"
          ],
          "coordinator به B lease تازه می‌دهد.",
          "token باید صعودی باشد."
        ],
        [
          "دو نوشتن",
          [
            3,
            2
          ],
          [
            "write v2"
          ],
          "B writes v2; A wakes and writes v1 (unfenced)",
          "Stale overwrite risk",
          [
            "A resumed",
            "B token=2",
            "v1 overwritten"
          ],
          "اگر منبع fencing ندارد، نوشتن دیررس A ممکن است v2 را بازنویسی کند.",
          "lease فقط مالکیت coordinator است، نه جلوگیری فیزیکی از I/O.",
          "error"
        ]
      ],
      "مالک قبلی ممکن است پس از expiry همچنان اجرا شود."
    ],
    [
      "fenced",
      "رد نوشتن دیررس",
      "منبع چگونه مالک قدیمی را رد می‌کند؟",
      "lastToken=2",
      [
        [
          "ثبت B",
          [
            3,
            2
          ],
          [
            "write token2",
            "OK"
          ],
          "atomic write(v2,2)",
          "v2 stored",
          [
            "Paused",
            "B token=2",
            "v2 token=2"
          ],
          "منبع token 2 را همراه اثر ثبت می‌کند.",
          "بررسی و نوشتن باید اتمیک باشند."
        ],
        [
          "A دیررس",
          [
            0,
            2
          ],
          [
            "write token1",
            "reject"
          ],
          "1 < lastToken=2",
          "Rejected stale token",
          [
            "Resumed",
            "B token=2",
            "v2 token=2"
          ],
          "token قدیمی‌تر رد می‌شود.",
          "fencing به resource همکاری‌کننده نیاز دارد.",
          "error"
        ],
        [
          "نتیجه",
          [
            2
          ],
          [
            "preserve v2"
          ],
          "read latest",
          "v2 preserved",
          [
            "Rejected",
            "B owner",
            "v2 token=2"
          ],
          "نسخه جدید محفوظ است.",
          "عملیات چندمرحله‌ای باید همه writeها را fence کند.",
          "success"
        ]
      ],
      "fencing مانع stale write در منبع سازگار می‌شود."
    ]
  ],
  "pitfall": "قفل Redis ساده یا lease به تنهایی safety همه عملیات خارجی را ثابت نمی‌کند.",
  "takeaway": "برای correctness از fencing اتمیک، coordinator مناسب و idempotency استفاده کنید.",
  "quiz": [
    "چرا lease کافی نیست؟",
    [
      "همه CPUها متوقف می‌شوند",
      "مالک منقضی‌شده ممکن است دوباره اجرا شود",
      "token همیشه صفر است"
    ],
    1,
    "lease مالک قبلی را فیزیکی متوقف نمی‌کند."
  ],
  "practice": [
    "resource آخرین token=8 دارد؛ write با token=7 چه شود؟",
    [
      "رد شود",
      "پذیرفته شود",
      "token صفر شود"
    ],
    0,
    "token قدیمی‌تر باید اتمیک رد شود."
  ],
  "hint": "توکن صعودی ترتیب مالکیت را مشخص می‌کند.",
  "terms": [
    [
      "Lease",
      "مالکیت زمان‌دار"
    ],
    [
      "Fencing token",
      "شماره صعودی مالکیت"
    ],
    [
      "Stale owner",
      "مالک منقضی‌شده"
    ]
  ],
  "references": [
    [
      "Redis distributed locks",
      "https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/"
    ],
    [
      "Martin Kleppmann — distributed locking",
      "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html"
    ]
  ],
  "exercise": [
    "fencing را در مدل تک‌نخی آزمایش کنید.",
    "last=2; value='v2'\ntoken=1\nif token>=last: last=token; value='v1'\nassert value=='v2'\nprint(value)",
    "v2 حفظ شد.",
    "در واقعیت compare و write باید atomic باشند."
  ],
  "deep": {
    "title": "مالک قدیمی و write دیررس",
    "question": "بعد از pause طولانی، مقدار نهایی منبع چیست؟",
    "assumptions": "A token1، B token2؛ B پیش از بازگشت A می‌نویسد؛ منبع تک‌نوشتن اتمیک دارد.",
    "lanes": [
      "A",
      "Coordinator",
      "Resource",
      "B"
    ],
    "fields": {
      "owner": "مالک",
      "last": "token ثبت شده",
      "value": "داده",
      "rejected": "رد قدیمی"
    },
    "code": "UPDATE resource SET value=?, fence=?\nWHERE id=? AND fence <= ?;\n-- enforce token at every protected write",
    "cases": [
      [
        "unfenced",
        "بدون fencing",
        {
          "owner": "None",
          "last": 0,
          "value": "v0",
          "rejected": 0
        },
        [
          [
            0,
            0,
            1,
            "مالک A",
            "token1",
            "lease اول.",
            {
              "owner": "A"
            }
          ],
          [
            10,
            0,
            null,
            "pause",
            "lease expired",
            "A متوقف شد.",
            {
              "owner": "None"
            }
          ],
          [
            11,
            3,
            1,
            "مالک B",
            "token2",
            "lease تازه.",
            {
              "owner": "B"
            }
          ],
          [
            12,
            3,
            2,
            "نوشتن B",
            "v2, token2",
            "نسخه تازه.",
            {
              "value": "v2",
              "last": 0
            }
          ],
          [
            20,
            0,
            2,
            "نوشتن دیررس A",
            "v1, token1",
            "resource هیچ fencing ندارد.",
            {
              "value": "v1",
              "rejected": 0,
              "last": 0
            },
            "error"
          ]
        ],
        "v1 روی v2 نوشته شد."
      ],
      [
        "fenced",
        "با fencing",
        {
          "owner": "None",
          "last": 0,
          "value": "v0",
          "rejected": 0
        },
        [
          [
            0,
            0,
            1,
            "مالک A",
            "token1",
            "lease اول.",
            {
              "owner": "A"
            }
          ],
          [
            10,
            0,
            null,
            "pause",
            "lease expired",
            "A متوقف شد.",
            {
              "owner": "None"
            }
          ],
          [
            11,
            3,
            1,
            "مالک B",
            "token2",
            "lease تازه.",
            {
              "owner": "B"
            }
          ],
          [
            12,
            3,
            2,
            "نوشتن B",
            "v2, token2",
            "نسخه تازه.",
            {
              "value": "v2",
              "last": 2
            }
          ],
          [
            20,
            0,
            2,
            "نوشتن دیررس A",
            "v1, token1",
            "resource توکن قدیمی را رد کرد.",
            {
              "value": "v2",
              "rejected": 1,
              "last": 2
            },
            "success"
          ]
        ],
        "v2 محفوظ است."
      ]
    ],
    "diagnose": "lease ID، token، rejected stale writes و clock/GC pause را ثبت کنید.",
    "tradeoff": "fencing فقط برای منبعی مفید است که شرط token را به‌صورت اتمیک enforce کند."
  }
});
export default lesson;
