import type {NetworkLesson} from './types';
const lesson = {
  "slug": "http-status-codes",
  "title": "HTTP Status Codes — کدهای وضعیت",
  "description": "کد وضعیت نتیجهٔ درخواست را نشان می‌دهد. تفاوت پاسخ اطلاعاتی، موفق، تغییر مسیر، خطای درخواست و خطای سرور را تمرین کنید.",
  "order": 8,
  "actors": [
    {
      "label": "کلاینت",
      "sub": "HTTP client",
      "icon": "browser"
    },
    {
      "label": "سرور وب",
      "sub": "API",
      "icon": "app"
    },
    {
      "label": "سرویس داخلی",
      "sub": "Backend",
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
  "scenarios": [
    {
      "id": "continue",
      "label": "۱۰۰ · ادامهٔ ارسال",
      "example": "100 Continue",
      "steps": [
        {
          "name": "ارسال سرآیندها",
          "short": "درخواست",
          "detail": "کلاینت با Expect: 100-continue اعلام می‌کند پیش از ارسال بدنهٔ بزرگ، منتظر پاسخ اولیه است.",
          "route": [
            0,
            1
          ],
          "packet": "POST",
          "input": "POST /upload HTTP/1.1\nExpect: 100-continue",
          "output": "Headers received",
          "result": "سرور می‌تواند پذیرش اولیه را اعلام کند.",
          "explanation": "برای یک فایل بزرگ، کلاینت اول سرآیندها را می‌فرستد تا در صورت رد شدن درخواست، حجم زیادی بی‌جهت ارسال نکند.",
          "state": [
            "—",
            "Pending",
            "Wait for 100"
          ],
          "flightLabels": [
            "headers + Expect"
          ],
          "diagnostic": "کلاینت می‌تواند پیش از ارسال بدنه بزرگ دربارهٔ ادامه ارسال تصمیم بگیرد."
        },
        {
          "name": "پاسخ اطلاعاتی",
          "short": "۱۰۰",
          "detail": "پاسخ ۱۰۰ نهایی نیست؛ فقط اعلام می‌کند ارسال بدنه می‌تواند ادامه یابد.",
          "route": [
            1,
            0
          ],
          "packet": "100",
          "input": "HTTP/1.1 100 Continue",
          "output": "Send request body",
          "result": "کلاینت هنوز منتظر پاسخ نهایی است.",
          "explanation": "100 یعنی فعلاً می‌توان بدنه را فرستاد؛ هنوز نتیجهٔ نهایی آپلود مشخص نیست.",
          "state": [
            "100 Continue",
            "1xx · informational",
            "Send body"
          ],
          "flightLabels": [
            "100 Continue"
          ],
          "diagnostic": "۱۰۰ informational است؛ پاسخ نهایی بعداً می‌آید."
        },
        {
          "name": "ارسال بدنه و پاسخ نهایی",
          "short": "۲۰۰",
          "detail": "کلاینت بدنه را ارسال می‌کند و سرور پس از پردازش پاسخ نهایی ۲۰۰ می‌دهد.",
          "route": [
            0,
            1
          ],
          "packet": "DATA",
          "input": "Request body",
          "output": "200 OK",
          "result": "پاسخ نهایی از پاسخ اطلاعاتی جداست.",
          "roundTrip": true,
          "tone": "success",
          "explanation": "پس از ارسال بدنه و پردازش، 200 نتیجهٔ نهایی است. این دو پاسخ معنای متفاوتی دارند.",
          "state": [
            "200 OK",
            "2xx · final",
            "Finish upload"
          ],
          "flightLabels": [
            "body",
            "200 OK"
          ],
          "diagnostic": "پس از ارسال بدنه نتیجهٔ نهایی جداگانه دریافت می‌شود."
        }
      ],
      "edgeCase": "پاسخ میانی 100 پیش از پاسخ نهایی.",
      "prediction": "آیا 100 Continue پایان درخواست HTTP است؟"
    },
    {
      "id": "ok",
      "label": "۲۰۰ · درخواست موفق",
      "example": "200 OK",
      "steps": [
        {
          "name": "درخواست منبع",
          "short": "درخواست",
          "detail": "کلاینت محصول موجود را درخواست می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /products/42",
          "output": "Request accepted",
          "result": "درخواست به سرور رسید.",
          "explanation": "درخواست خواندن محصول 42 نمونه‌ای از عملیات عادی است.",
          "state": [
            "—",
            "Pending",
            "Wait"
          ],
          "flightLabels": [
            "GET"
          ],
          "diagnostic": "درخواست پذیرفته شده اما هنوز status نهایی مشخص نیست."
        },
        {
          "name": "پردازش موفق",
          "short": "پردازش",
          "detail": "سرور محصول را از سرویس داخلی دریافت می‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "READ",
          "input": "id=42",
          "output": "Product found",
          "result": "منبع موجود است.",
          "roundTrip": true,
          "explanation": "سرور داخلی رکورد محصول را پیدا می‌کند؛ حالا سرور وب می‌تواند پاسخ مناسب بسازد.",
          "state": [
            "—",
            "Processing",
            "Wait"
          ],
          "flightLabels": [
            "READ",
            "found"
          ],
          "diagnostic": "وجود محصول در سرویس داخلی با موفقیت ارسال پاسخ به کلاینت فرق دارد."
        },
        {
          "name": "پاسخ ۲۰۰",
          "short": "موفق",
          "detail": "کد ۲۰۰ به معنای موفقیت درخواست با توجه به متد است.",
          "route": [
            1,
            0
          ],
          "packet": "200",
          "input": "HTTP/1.1 200 OK",
          "output": "200 OK",
          "result": "درخواست موفق است.",
          "tone": "success",
          "explanation": "200 یعنی عملیات طبق معنای GET موفق بوده است؛ محتوا می‌تواند JSON محصول باشد.",
          "state": [
            "200 OK",
            "2xx · success",
            "Render"
          ],
          "flightLabels": [
            "200 OK"
          ],
          "diagnostic": "معنای موفقیت با متد و قرارداد API تفسیر می‌شود؛ body نیز باید معتبر باشد."
        }
      ],
      "prediction": "کد ۲۰۰ چه چیزی را تضمین می‌کند و چه چیزی را نه؟"
    },
    {
      "id": "redirect",
      "label": "۳۰۱ · انتقال دائمی",
      "example": "301 Moved Permanently",
      "steps": [
        {
          "name": "درخواست URL قدیمی",
          "short": "درخواست",
          "detail": "کلاینت آدرس قدیمی منبع را فراخوانی می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /old",
          "output": "Old resource URL",
          "result": "سرور آدرس جدید را می‌شناسد.",
          "explanation": "فرض کنید مسیر /old بعد از تغییر سایت دیگر آدرس اصلی نباشد.",
          "state": [
            "—",
            "Pending",
            "Wait"
          ],
          "flightLabels": [
            "GET /old"
          ],
          "diagnostic": "URI قدیمی درخواست شده؛ redirect هنوز پاسخ بعدی نیست."
        },
        {
          "name": "بازگشت Location",
          "short": "۳۰۱",
          "detail": "سرور ۳۰۱ و Location آدرس جدید را اعلام می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "301",
          "input": "HTTP/1.1 301 Moved Permanently\nLocation: /new",
          "output": "Redirect to /new",
          "result": "این پاسخ مسیر جدید را معرفی می‌کند.",
          "explanation": "سرور با Location: /new نشانی جدید را معرفی می‌کند. 301 یعنی انتقال دائمی.",
          "state": [
            "301",
            "3xx · redirect",
            "GET /new"
          ],
          "flightLabels": [
            "301 + Location"
          ],
          "diagnostic": "کلاینت مقصد جدید را از Location می‌گیرد؛ cache و policy redirect می‌توانند دخیل باشند."
        },
        {
          "name": "دنبال کردن تغییر مسیر",
          "short": "درخواست دوم",
          "detail": "کلاینت در این مثال یک GET جدید به /new می‌فرستد و پاسخ موفق می‌گیرد.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /new",
          "output": "200 OK after redirect",
          "result": "درخواست دوم به مقصد جدید رسید.",
          "roundTrip": true,
          "tone": "success",
          "explanation": "مرورگر درخواست تازه‌ای به /new می‌فرستد؛ 200 حاصل درخواست دوم است، نه تغییر وضعیت پاسخ 301.",
          "state": [
            "200 OK",
            "2xx · success",
            "Render new URL"
          ],
          "flightLabels": [
            "GET /new",
            "200 OK"
          ],
          "diagnostic": "این redirect GET را دنبال می‌کند؛ برای POST، 303/307/308 رفتار متفاوت دارند."
        }
      ],
      "edgeCase": "دریافت 301 و ایجاد درخواست تازه.",
      "prediction": "در ۳۰۱، Location چه تغییری در درخواست بعدی ایجاد می‌کند؟"
    },
    {
      "id": "missing",
      "label": "۴۰۴ · منبع پیدا نشد",
      "example": "404 Not Found",
      "steps": [
        {
          "name": "درخواست محصول ناموجود",
          "short": "درخواست",
          "detail": "کلاینت URL محصولی را درخواست می‌کند که در این API موجود نیست.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /products/999",
          "output": "Request received",
          "result": "درخواست از نظر قالب معتبر است.",
          "explanation": "URL محصول 999 قالب درستی دارد اما چنین محصولی در فروشگاه وجود ندارد.",
          "state": [
            "—",
            "Pending",
            "Wait"
          ],
          "flightLabels": [
            "GET"
          ],
          "diagnostic": "درخواست به سرور رسیده؛ هنوز علت پاسخ معلوم نیست."
        },
        {
          "name": "بررسی وجود منبع",
          "short": "پردازش",
          "detail": "سرور رکورد را جست‌وجو می‌کند و نتیجه‌ای پیدا نمی‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "READ",
          "input": "id=999",
          "output": "No matching resource",
          "result": "منبع پیدا نشد.",
          "roundTrip": true,
          "explanation": "جست‌وجو در سرویس داخلی نتیجه ندارد. این با قطع شبکه یا خرابی سرور فرق می‌کند.",
          "state": [
            "—",
            "Resource absent",
            "Wait"
          ],
          "flightLabels": [
            "READ",
            "absent"
          ],
          "diagnostic": "در این نمونه مسیر درست ولی رکورد ناموجود است؛ router هم ممکن است 404 بدهد."
        },
        {
          "name": "پاسخ خطای درخواست",
          "short": "۴۰۴",
          "detail": "سرور با ۴۰۴ اعلام می‌کند نمایش فعلی منبع را پیدا نکرده یا نمی‌خواهد وجود آن را آشکار کند.",
          "route": [
            1,
            0
          ],
          "packet": "404",
          "input": "HTTP/1.1 404 Not Found",
          "output": "404 Not Found",
          "result": "کلاینت باید وضعیت را مدیریت کند.",
          "tone": "error",
          "explanation": "404 یک پاسخ واقعی HTTP است؛ رابط کاربری می‌تواند پیام «محصول پیدا نشد» بدهد.",
          "state": [
            "404",
            "4xx · client error",
            "Show not found"
          ],
          "flightLabels": [
            "404"
          ],
          "diagnostic": "از خود کد نمی‌توان محل دقیق خطا را فهمید؛ route template و شناسه منبع را در لاگ بررسی کنید."
        }
      ],
      "edgeCase": "منبع ناموجود.",
      "prediction": "آیا 404 یعنی اتصال یا کل سرور از کار افتاده؟"
    },
    {
      "id": "server-error",
      "label": "۵۰۰ · خطای داخلی",
      "example": "500 Internal Server Error",
      "steps": [
        {
          "name": "درخواست معتبر",
          "short": "درخواست",
          "detail": "کلاینت درخواست معمولی می‌فرستد.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /products/42",
          "output": "Request accepted",
          "result": "درخواست به سرور رسید.",
          "explanation": "درخواست محصول 42 معتبر است؛ خطا هنوز معلوم نیست.",
          "state": [
            "—",
            "Pending",
            "Wait"
          ],
          "flightLabels": [
            "GET"
          ],
          "diagnostic": "درخواست معتبر هم می‌تواند به خطای داخلی برسد."
        },
        {
          "name": "خرابی پیش‌بینی‌نشده",
          "short": "خطا",
          "detail": "در این نمونه سرویس داخلی هنگام پردازش دچار خطای غیرمنتظره می‌شود.",
          "route": [
            1,
            2
          ],
          "packet": "ERR",
          "input": "Read product",
          "output": "Unexpected exception",
          "result": "سرور نتوانست عملیات را انجام دهد.",
          "roundTrip": true,
          "tone": "error",
          "explanation": "مثلاً پایگاه داده هنگام خواندن رکورد exception می‌دهد. کلاینت علت داخلی را نباید مستقیماً دریافت کند.",
          "state": [
            "—",
            "Backend exception",
            "Wait"
          ],
          "flightLabels": [
            "READ",
            "exception"
          ],
          "diagnostic": "exception داخلی را ثبت کنید؛ stack trace و اطلاعات حساس نباید به کلاینت برود."
        },
        {
          "name": "پاسخ خطای سرور",
          "short": "۵۰۰",
          "detail": "سرور پاسخ عمومی ۵۰۰ می‌دهد و جزئیات حساس خطا را در پاسخ افشا نمی‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "500",
          "input": "HTTP/1.1 500 Internal Server Error",
          "output": "500 Internal Server Error",
          "result": "درخواست ناموفق است.",
          "tone": "error",
          "explanation": "500 خطای داخلی نامنتظره را نشان می‌دهد؛ جزئیات فنی در لاگ سرور ثبت می‌شوند، نه پاسخ عمومی.",
          "state": [
            "500",
            "5xx · server error",
            "Show error"
          ],
          "flightLabels": [
            "500"
          ],
          "diagnostic": "پاسخ عمومی خطا معتبر است؛ retry به ایمنی عملیات و سیاست backoff وابسته است."
        }
      ],
      "edgeCase": "خرابی داخلی هنگام پردازش.",
      "prediction": "در صورت ۵۰۰ چه داده‌ای باید در لاگ بماند نه پاسخ؟"
    },
    {
      "id": "limited",
      "label": "۴۲۹ · محدودیت نرخ",
      "example": "429 Too Many Requests",
      "edgeCase": "تعداد درخواست‌ها بیش از ظرفیت مجاز کاربر است.",
      "steps": [
        {
          "name": "درخواست‌های پیاپی",
          "short": "درخواست",
          "detail": "کلاینت چند بار پشت سر هم endpoint را فراخوانی می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /products",
          "output": "Rate limit reached",
          "result": "سهمیهٔ درخواست تمام شده.",
          "explanation": "سرور ممکن است به ازای کاربر یا کلید API محدودیت تعیین کند.",
          "state": [
            "—",
            "Rate limit reached",
            "Wait"
          ],
          "flightLabels": [
            "GET"
          ],
          "diagnostic": "سرور شمارنده نرخ را طبق سیاست کلید و بازه بررسی می‌کند."
        },
        {
          "name": "پاسخ محدودیت",
          "short": "۴۲۹",
          "detail": "سرور کد 429 و در این نمونه Retry-After را می‌فرستد.",
          "route": [
            1,
            0
          ],
          "packet": "429",
          "input": "HTTP/1.1 429 Too Many Requests\nRetry-After: 30",
          "output": "Retry after 30 seconds",
          "result": "درخواست موقتاً رد شده.",
          "explanation": "کلاینت نباید حلقهٔ retry سریع بسازد؛ باید زمان انتظار را رعایت کند.",
          "tone": "error",
          "state": [
            "429",
            "4xx · rate limit",
            "Wait 30 s"
          ],
          "flightLabels": [
            "429 + Retry-After"
          ],
          "diagnostic": "Retry-After می‌تواند عدد ثانیه یا تاریخ HTTP باشد؛ محدودسازی با 503 یکی نیست."
        },
        {
          "name": "انتظار و تلاش بعدی",
          "short": "نتیجه",
          "detail": "پس از ۳۰ ثانیه در این نمونه سهمیه دوباره در دسترس است.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "Retry after wait",
          "output": "200 OK after wait",
          "result": "تلاش مجدد با فاصله موفق شد.",
          "explanation": "Retry-After راهنماست؛ موفقیت بعدی تضمین‌شده نیست.",
          "roundTrip": true,
          "tone": "success",
          "state": [
            "200 OK",
            "2xx · success",
            "Resume"
          ],
          "flightLabels": [
            "GET retry",
            "200 OK"
          ],
          "diagnostic": "بعد از صبر مجاز بودن تلاش تازه را دوباره بررسی کنید؛ موفقیت این trace تضمین عمومی نیست."
        }
      ],
      "prediction": "Retry-After چه زمانی به معنی ادامه قطعی موفقیت است؟"
    }
  ],
  "pitfall": "همهٔ پاسخ‌های HTTP خطای شبکه نیستند. ۴۰۱ برای نبود اعتبار احراز هویت معتبر است و ۴۰۳ یعنی سرور از انجام درخواست خودداری می‌کند. ۵۰۳ برای عدم دسترسی موقت مناسب است. کدهای وضعیت به تنهایی علت ریشه‌ای خرابی را اثبات نمی‌کنند. 401 طبق HTTP نیاز به چالش WWW-Authenticate مناسب دارد؛ 403 یعنی سرور درخواست را فهمیده اما از انجام آن خودداری می‌کند.",
  "takeaway": "رقم اول خانوادهٔ کد را مشخص می‌کند: ۱xx اطلاعاتی، ۲xx موفق، ۳xx تغییر مسیر، ۴xx خطای سمت درخواست و ۵xx خطای سمت سرور.",
  "quiz": {
    "question": "کدام پاسخ اطلاعاتی است و پایان درخواست نیست؟",
    "options": [
      "۱۰۰ Continue",
      "۲۰۰ OK",
      "۴۰۴ Not Found"
    ],
    "correct": 0,
    "explanation": "کد ۱۰۰ پاسخ میانی است؛ یک پاسخ نهایی بعد از آن لازم است."
  },
  "references": [
    {
      "label": "RFC 9110 — Status Codes",
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
    },
    {
      "label": "IANA — فهرست کدهای HTTP",
      "url": "https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml"
    },
    {
      "label": "RFC 6585 — 429 Too Many Requests",
      "url": "https://www.rfc-editor.org/rfc/rfc6585.html"
    }
  ],
  "visual": {
    "title": "پاسخ HTTP و تصمیم کلاینت",
    "labels": [
      "کد دریافتی",
      "خانوادهٔ پاسخ",
      "اقدام کلاینت"
    ],
    "context": "کد وضعیت با متن پاسخ و سرآیندها به کلاینت می‌گوید چه تصمیمی بگیرد: ادامهٔ ارسال، نمایش، دنبال کردن مسیر یا مدیریت خطا."
  },
  "teaching": {
    "goal": "خانوادهٔ کد وضعیت را تفسیر کنید و تصمیم مناسب کلاینت را با توجه به سرآیندها بگیرید.",
    "practice": {
      "question": "API پاسخ 429 همراه Retry-After: 30 می‌دهد. کلاینت چه کاری انجام دهد؟",
      "options": [
        "۳۰ ثانیه صبر و سپس با سیاست محدود تلاش مجدد کند",
        "بی‌درنگ صد درخواست دیگر ارسال کند",
        "درخواست را موفق و داده را موجود فرض کند"
      ],
      "correct": 0,
      "explanation": "429 محدودیت نرخ را نشان می‌دهد. رعایت Retry-After و محدود کردن تعداد تلاش‌ها از تشدید بار جلوگیری می‌کند؛ موفقیت بعدی تضمین نیست.",
      "hint": "سرآیند Retry-After را همراه کد وضعیت تفسیر کنید."
    },
    "terms": [
      [
        "1xx",
        "پاسخ اطلاعاتی؛ معمولاً هنوز پاسخ نهایی نرسیده است."
      ],
      [
        "Location",
        "نشانی مرتبط با ایجاد یا تغییر مسیر، بسته به پاسخ."
      ],
      [
        "Retry-After",
        "زمان پیشنهادی انتظار قبل از تلاش بعدی."
      ]
    ]
  }
} satisfies NetworkLesson;
export default lesson;
