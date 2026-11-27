import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "cdn",
  "order": 44,
  "title": "CDN — کش لبه و منبع اصلی",
  "description": "Cache key، TTL، validation و خطر داده شخصی.",
  "actors": [
    [
      "Viewer",
      "Browser",
      "browser"
    ],
    [
      "Edge",
      "CDN cache",
      "cache"
    ],
    [
      "Origin",
      "Application",
      "app"
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
    "کش edge",
    "Origin reads"
  ],
  "context": "یک edge با cache HTTP؛ کلید نمونه شامل path و زبان؛ private/no-store طبق سیاست cache رعایت می‌شود.",
  "goal": "hit/miss، freshness و کلید cache را از جغرافیا جدا کنید.",
  "scenarios": [
    [
      "miss",
      "Miss و پر کردن edge",
      "اولین درخواست عکس از کجا می‌آید؟",
      "GET /logo.v1.png",
      [
        [
          "بررسی",
          [
            0,
            1
          ],
          [
            "GET",
            "MISS"
          ],
          "GET /logo.v1.png",
          "MISS",
          [
            "logo",
            "Empty",
            "0 reads"
          ],
          "edge هنوز نسخه ندارد.",
          "cache key دقیق را بررسی کنید."
        ],
        [
          "Origin",
          [
            1,
            2
          ],
          [
            "GET",
            "200 max-age"
          ],
          "Cache-Control: public, max-age=60",
          "200; stored",
          [
            "logo",
            "Fresh v1",
            "1 read"
          ],
          "edge پاسخ قابل cache را ذخیره می‌کند.",
          "TTL سیاست CDN و header با هم اثر دارند."
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
          "Age: 0",
          "200 from edge",
          [
            "200",
            "Fresh v1",
            "1 read"
          ],
          "پاسخ اول از origin تأمین شد.",
          "X-Cache/Age بسته به CDN متفاوت‌اند.",
          "success"
        ]
      ]
    ],
    [
      "hit",
      "Hit در edge",
      "دومین GET آیا به origin می‌رسد؟",
      "same key, age=20",
      [
        [
          "دریافت",
          [
            0,
            1
          ],
          [
            "GET"
          ],
          "GET /logo.v1.png",
          "Key matched",
          [
            "logo",
            "Fresh age=20",
            "0 reads"
          ],
          "کلید همان است و عمر معتبر.",
          "cache key شامل host/query طبق policy است."
        ],
        [
          "خواندن محلی",
          [
            1
          ],
          [
            "HIT"
          ],
          "age=20 < max-age=60",
          "HIT",
          [
            "Pending",
            "Fresh v1",
            "0 reads"
          ],
          "origin در این request فراخوانی نشد.",
          "hit rate per POP را اندازه بگیرید."
        ],
        [
          "تحویل",
          [
            1,
            0
          ],
          [
            "200 Age=20"
          ],
          "HTTP/1.1 200 OK",
          "200 HIT",
          [
            "200",
            "Fresh v1",
            "0 reads"
          ],
          "در این مدل latency origin حذف شد.",
          "cache hit لزوماً newest version نیست.",
          "success"
        ]
      ]
    ],
    [
      "private",
      "کلید ناقص و داده خصوصی",
      "آیا /profile برای همه کاربران قابل cache است؟",
      "private response",
      [
        [
          "درخواست A",
          [
            0,
            1
          ],
          [
            "GET profile"
          ],
          "Authorization: [redacted]",
          "Personalized",
          [
            "User A",
            "Bypass",
            "0 reads"
          ],
          "پاسخ به هویت وابسته است.",
          "credential در log یا cache key خام ثبت نشود."
        ],
        [
          "پاسخ origin",
          [
            1,
            2
          ],
          [
            "GET",
            "private, no-store"
          ],
          "Cache-Control: private, no-store",
          "Not stored",
          [
            "User A",
            "No store",
            "1 read"
          ],
          "طبق policy نمونه پاسخ شخصی ذخیره نمی‌شود.",
          "حداقل TTL اجباری CDN را بررسی کنید."
        ],
        [
          "درخواست B",
          [
            0,
            1,
            2
          ],
          [
            "GET B",
            "forward"
          ],
          "GET /profile (B)",
          "Origin called for B",
          [
            "User B",
            "Bypass",
            "2 reads"
          ],
          "هیچ داده A به B داده نمی‌شود.",
          "تست دو هویت مجزا برای cache isolation ضروری است.",
          "success"
        ]
      ],
      "کلید ناقص یا override TTL می‌تواند داده خصوصی افشا کند."
    ]
  ],
  "pitfall": "CDN جای authorization نیست؛ key و cache policy را برای محتوای شخصی دقیق طراحی کنید.",
  "takeaway": "محتوای عمومی versioned را cache کنید؛ داده خصوصی را طبق قرارداد محافظت کنید.",
  "quiz": [
    "Age کمتر از max-age معمولاً چیست؟",
    [
      "freshness معتبر با فرض سایر قواعد",
      "نسخه حتماً جدیدترین",
      "TLS خاموش"
    ],
    0,
    "fresh بودن با latest بودن متفاوت است."
  ],
  "practice": [
    "محتوای profile دو کاربر متفاوت؛ policy امن‌تر؟",
    [
      "کش فقط path",
      "عدم ذخیره shared cache و بررسی policy",
      "TTL طولانی"
    ],
    1,
    "داده شخصی نباید میان هویت‌ها reuse شود."
  ],
  "hint": "key مشترک ممکن است پاسخ شخصی را اشتباه reuse کند.",
  "terms": [
    [
      "POP",
      "نقطه حضور CDN"
    ],
    [
      "Cache key",
      "هویت ورودی کش"
    ],
    [
      "Freshness",
      "اعتبار زمانی"
    ]
  ],
  "references": [
    [
      "CloudFront cache key",
      "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/understanding-the-cache-key.html"
    ],
    [
      "RFC 9111",
      "https://www.rfc-editor.org/rfc/rfc9111.html"
    ]
  ],
  "exercise": [
    "کلید زبان را در یک مدل cache محلی آزمایش کنید.",
    "cache={('/home','fa'):'سلام',('/home','en'):'Hello'}\nassert cache[('/home','fa')]!=cache[('/home','en')]\nprint('keys isolated')",
    "زبان‌ها کلید مجزا دارند.",
    "Vary و cache policy واقعی باید جدا تنظیم شوند."
  ],
  "deep": {
    "title": "تنوع زبان و hit rate",
    "question": "اگر زبان از cache key حذف شود، چه می‌شود؟",
    "assumptions": "چهار درخواست fa,en,fa,en به یک edge؛ TTL معتبر؛ پاسخ عمومی اما زبان متفاوت.",
    "lanes": [
      "Viewer",
      "Edge",
      "Origin"
    ],
    "fields": {
      "key": "کلید",
      "reads": "Origin reads",
      "hits": "Hit",
      "wrong": "زبان اشتباه"
    },
    "code": "cache_key = (path, normalized_language)\n# origin emits Vary: Accept-Language when appropriate",
    "cases": [
      [
        "path",
        "فقط path",
        {
          "key": "/home",
          "reads": 0,
          "hits": 0,
          "wrong": 0
        },
        [
          [
            0,
            0,
            2,
            "fa miss",
            "GET fa",
            "فارسی ذخیره شد.",
            {
              "reads": 1
            }
          ],
          [
            1,
            0,
            1,
            "en hit",
            "HIT fa",
            "زبان اشتباه.",
            {
              "hits": 1,
              "wrong": 1
            },
            "error"
          ],
          [
            2,
            0,
            1,
            "fa hit",
            "HIT fa",
            "درست.",
            {
              "hits": 2
            }
          ],
          [
            3,
            0,
            1,
            "en hit",
            "HIT fa",
            "اشتباه دوم.",
            {
              "hits": 3,
              "wrong": 2
            },
            "error"
          ]
        ],
        "hit زیاد اما دو پاسخ اشتباه."
      ],
      [
        "vary",
        "path + language",
        {
          "key": "/home+lang",
          "reads": 0,
          "hits": 0,
          "wrong": 0
        },
        [
          [
            0,
            0,
            2,
            "fa miss",
            "GET fa",
            "کلید fa.",
            {
              "reads": 1
            }
          ],
          [
            1,
            0,
            2,
            "en miss",
            "GET en",
            "کلید en.",
            {
              "reads": 2
            }
          ],
          [
            2,
            0,
            1,
            "fa hit",
            "HIT fa",
            "زبان درست.",
            {
              "hits": 1
            }
          ],
          [
            3,
            0,
            1,
            "en hit",
            "HIT en",
            "زبان درست.",
            {
              "hits": 2,
              "wrong": 0
            },
            "success"
          ]
        ],
        "دو origin read، هیچ پاسخ اشتباه."
      ]
    ],
    "diagnose": "hit ratio، cache key، Vary، Age و origin requests را مقایسه کنید.",
    "tradeoff": "key با cardinality زیاد hit rate را کم می‌کند؛ صحت محتوا اولویت دارد."
  }
});
export default lesson;
