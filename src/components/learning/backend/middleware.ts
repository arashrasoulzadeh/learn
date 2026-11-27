import type {BackendLesson} from './types';
const lesson = {
  "slug": "middleware",
  "title": "Middleware — زنجیرهٔ پردازش درخواست",
  "description": "ترتیب اجرای middleware، فراخوانی next، توقف زنجیره و بازگشت پاسخ در یک pipeline نمونه.",
  "order": 16,
  "model": "pipeline",
  "actors": [
    {
      "label": "ورودی",
      "sub": "Client",
      "icon": "browser"
    },
    {
      "label": "ثبت رویداد",
      "sub": "Logger",
      "icon": "app"
    },
    {
      "label": "کنترل ورود",
      "sub": "Auth",
      "icon": "shield"
    },
    {
      "label": "تابع مقصد",
      "sub": "Handler",
      "icon": "app"
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
    ],
    [
      2,
      3
    ]
  ],
  "visual": {
    "title": "رد اجرای زنجیره",
    "labels": [
      "ثبت رویداد",
      "احراز هویت",
      "Handler / پاسخ"
    ],
    "context": "الگوی ترکیب لایه‌های async در این درس شبیه onion middleware است؛ Express و چارچوب‌های دیگر قراردادهای متفاوت دارند."
  },
  "teaching": {
    "goal": "ترتیب قبل و بعد next را پیش‌بینی کنید و بفهمید توقف در یک لایه چگونه از اجرای handler جلوگیری می‌کند.",
    "terms": [
      [
        "Middleware",
        "لایهٔ پردازش بین ورودی و منطق مقصد."
      ],
      [
        "next",
        "انتقال کنترل به لایهٔ بعدی در قرارداد این pipeline."
      ],
      [
        "Short circuit",
        "بازگرداندن پاسخ بدون ادامهٔ زنجیره."
      ],
      [
        "Error boundary",
        "لایهٔ بیرونی که خطای لایهٔ داخلی را می‌گیرد."
      ]
    ],
    "practice": {
      "question": "Middleware بیرونی log می‌کند و await next() دارد، سپس دوباره log می‌کند. اگر middleware احراز هویت درخواست را رد کند، چه اتفاقی می‌افتد؟",
      "options": [
        "handler حتماً اجرا می‌شود",
        "کد بعد از await next در logger در صورت بازگشت عادی اجرا می‌شود، اما handler اجرا نمی‌شود",
        "logger همیشه حذف می‌شود"
      ],
      "correct": 1,
      "explanation": "رد درخواست با یک پاسخ عادی، زنجیرهٔ داخلی را متوقف می‌کند اما کنترل به logger بیرونی برمی‌گردد.",
      "hint": "توقف زنجیرهٔ داخلی را با پرتاب استثنا اشتباه نگیرید."
    }
  },
  "scenarios": [
    {
      "id": "allowed",
      "label": "عبور درخواست معتبر",
      "example": "logger → auth → handler",
      "steps": [
        {
          "name": "ورود و ثبت آغاز",
          "short": "ثبت شروع",
          "detail": "logger آغاز درخواست را ثبت می‌کند و next را await می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "REQ",
          "input": "log('start'); await next()",
          "output": "start",
          "result": "logger منتظر بازگشت است.",
          "explanation": "این لایه می‌تواند زمان سپری‌شده را پس از next محاسبه کند.",
          "state": [
            "start",
            "—",
            "Not called"
          ],
          "flightLabels": [
            "request"
          ],
          "diagnostic": "request ID را در logger آغاز کنید و دادهٔ حساس را لاگ نکنید."
        },
        {
          "name": "عبور از کنترل ورود",
          "short": "کنترل هویت",
          "detail": "در این نمونه اعتبار نشست تأیید می‌شود و next فراخوانی می‌شود.",
          "route": [
            1,
            2
          ],
          "packet": "NEXT",
          "input": "if (valid) await next()",
          "output": "Session valid",
          "result": "درخواست مجاز به ادامهٔ زنجیره است.",
          "explanation": "احراز هویت با مجوز انجام عملیات متفاوت است.",
          "state": [
            "start",
            "Passed",
            "Not called"
          ],
          "flightLabels": [
            "next()"
          ],
          "diagnostic": "در onion pipeline await next یعنی انتظار پایان لایه‌های داخلی، نه پایان فوری این لایه."
        },
        {
          "name": "اجرای منطق برنامه",
          "short": "اجرای تابع",
          "detail": "handler دادهٔ نمونه را می‌سازد.",
          "route": [
            2,
            3
          ],
          "packet": "CALL",
          "input": "ctx.status=200; ctx.body={ok:true}",
          "output": "200 OK",
          "result": "پاسخ در context تنظیم شد.",
          "explanation": "در این مدل middlewareها پس از await next به ترتیب معکوس بازمی‌گردند.",
          "state": [
            "start",
            "Passed",
            "200 OK"
          ],
          "flightLabels": [
            "handler result"
          ],
          "diagnostic": "context پاسخ در handler تنظیم می‌شود؛ هنوز لایه‌های بیرونی فرصت تکمیل دارند."
        },
        {
          "name": "بازگشت و ثبت پایان",
          "short": "ثبت پایان",
          "detail": "کنترل به لایه‌های بیرونی می‌رسد و logger پایان را ثبت می‌کند.",
          "route": [
            3,
            2,
            1,
            0
          ],
          "packet": "200",
          "input": "log('end')",
          "output": "start → handler → end",
          "result": "پاسخ نهایی ارسال شد.",
          "explanation": "کد پس از next می‌تواند log یا اندازه‌گیری زمان انجام دهد.",
          "state": [
            "start; end",
            "Passed",
            "200 OK"
          ],
          "tone": "success",
          "flightLabels": [
            "return handler",
            "unwind auth",
            "log end"
          ],
          "diagnostic": "ترتیب بازگشت معکوس ورود است؛ زمان logger بعد از await کل downstream را پوشش می‌دهد."
        }
      ],
      "prediction": "در مدل onion، ثبت پایان logger قبل از handler است یا پس از آن؟"
    },
    {
      "id": "denied",
      "label": "درخواست بدون اعتبار",
      "example": "auth stops chain",
      "steps": [
        {
          "name": "شروع زنجیره",
          "short": "ثبت شروع",
          "detail": "logger درخواست را ثبت می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "REQ",
          "input": "log('start')",
          "output": "start",
          "result": "پردازش آغاز شد.",
          "explanation": "هنوز هیچ handler اجرا نشده است.",
          "state": [
            "start",
            "—",
            "Not called"
          ],
          "flightLabels": [
            "request"
          ],
          "diagnostic": "لایه بیرونی می‌تواند ورود درخواست را حتی برای پاسخ رد ثبت کند."
        },
        {
          "name": "رد پیش از handler",
          "short": "توقف زنجیره",
          "detail": "اعتبار نشست موجود نیست؛ auth پاسخ را تنظیم می‌کند و next را صدا نمی‌زند.",
          "route": [
            1,
            2
          ],
          "packet": "DENY",
          "input": "ctx.status=401; return",
          "output": "401; handler skipped",
          "result": "زنجیره در auth متوقف شد.",
          "explanation": "در نمونهٔ کامل 401، چالش مناسب WWW-Authenticate لازم است.",
          "state": [
            "start",
            "Denied",
            "Not called"
          ],
          "tone": "error",
          "flightLabels": [
            "auth deny"
          ],
          "diagnostic": "بدون next، handler نباید اجرا شود؛ در پاسخ واقعی 401 challenge متناسب لازم است."
        },
        {
          "name": "بازگشت پاسخ",
          "short": "بازگشت خطا",
          "detail": "logger پس از بازگشت عادی next پایان را ثبت می‌کند.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "401",
          "input": "log('end')",
          "output": "401 Unauthorized",
          "result": "handler اجرا نشد.",
          "explanation": "برای لاگ خطاها هم نباید توکن یا رمز عبور ثبت شود.",
          "state": [
            "start; end",
            "Denied",
            "401; skipped"
          ],
          "tone": "error",
          "flightLabels": [
            "return 401",
            "log end"
          ],
          "diagnostic": "بازگشت عادی پاسخ رد، کد بعد await next را اجرا می‌کند؛ exception با return عادی فرق دارد."
        }
      ],
      "edgeCase": "درخواست فاقد اعتبار پیش از منطق کسب‌وکار رد می‌شود.",
      "prediction": "اگر auth، next را فراخوانی نکند، آیا handler و کد بعد از next در logger هر دو اجرا می‌شوند؟"
    },
    {
      "id": "exception",
      "label": "استثنا در Handler",
      "example": "try / catch / finally",
      "steps": [
        {
          "name": "ورود به لایهٔ بیرونی",
          "short": "مرز خطا",
          "detail": "logger با مرز مدیریت خطا next را صدا می‌زند.",
          "route": [
            0,
            1
          ],
          "packet": "TRY",
          "input": "try { await next() }",
          "output": "Error boundary active",
          "result": "خطاهای پایین‌دست قابل مدیریت‌اند.",
          "explanation": "در نمونهٔ واقعی مدیریت خطا می‌تواند middleware مستقل باشد.",
          "state": [
            "try",
            "—",
            "Not called"
          ],
          "flightLabels": [
            "try / await next"
          ],
          "diagnostic": "مرز خطا باید Promise زنجیره را await کند تا rejection قابل گرفتن باشد."
        },
        {
          "name": "عبور از احراز هویت",
          "short": "عبور هویت",
          "detail": "اعتبار ورودی صحیح است.",
          "route": [
            1,
            2
          ],
          "packet": "NEXT",
          "input": "await next()",
          "output": "Auth passed",
          "result": "handler اجرا خواهد شد.",
          "explanation": "پذیرش هویت تضمین نبود خطای برنامه نیست.",
          "state": [
            "try",
            "Passed",
            "Pending"
          ],
          "flightLabels": [
            "next()"
          ],
          "diagnostic": "عبور از کنترل هویت موفقیت عملیات داخلی را تضمین نمی‌کند."
        },
        {
          "name": "پرتاب خطا",
          "short": "پرتاب خطا",
          "detail": "handler خطای غیرمنتظره می‌دهد.",
          "route": [
            2,
            3
          ],
          "packet": "ERR",
          "input": "throw new Error('db unavailable')",
          "output": "Exception propagated",
          "result": "نتیجهٔ موفق تولید نشد.",
          "explanation": "جزئیات خطا نباید بدون پالایش به کلاینت فرستاده شوند.",
          "state": [
            "try",
            "Passed",
            "Exception"
          ],
          "tone": "error",
          "flightLabels": [
            "handler throws"
          ],
          "diagnostic": "خطای handler در Promise پایین‌دست propagate می‌شود؛ stack trace خصوصی بماند."
        },
        {
          "name": "گرفتن خطا و پاسخ عمومی",
          "short": "پاسخ عمومی",
          "detail": "لایهٔ بیرونی خطا را می‌گیرد و در finally پایان را ثبت می‌کند.",
          "route": [
            3,
            2,
            1,
            0
          ],
          "packet": "500",
          "input": "catch { status=500 } finally { logEnd() }",
          "output": "500 Internal Server Error",
          "result": "خطا به پاسخ مناسب تبدیل شد.",
          "explanation": "اگر پاسخ قبلاً ارسال شده باشد تغییر status ممکن نیست؛ این نمونه پیش از ارسال پاسخ است.",
          "state": [
            "catch; finally",
            "Passed",
            "500"
          ],
          "tone": "error",
          "flightLabels": [
            "throw",
            "catch",
            "HTTP 500"
          ],
          "diagnostic": "خطا پیش از ارسال پاسخ در مرز بیرونی به 500 تبدیل می‌شود؛ finally برای cleanup و log مناسب است."
        }
      ],
      "edgeCase": "خطای پایین‌دست باید در مرز مناسب مدیریت شود.",
      "prediction": "اگر handler پیش از ارسال پاسخ استثنا بدهد، چه لایه‌ای می‌تواند آن را به ۵۰۰ تبدیل کند؟"
    }
  ],
  "pitfall": "next را در چارچوب‌های مختلف یکسان فرض نکنید. دوبار فراخواندن next یا فراموش کردن await در onion pipeline می‌تواند ترتیب را خراب کند.",
  "takeaway": "ترتیب لایه‌ها، قرارداد next و مسیر خطا را صریح طراحی کنید.",
  "quiz": {
    "question": "اگر لایهٔ auth بدون فراخواندن next پاسخ دهد، handler چه می‌شود؟",
    "options": [
      "اجرا نمی‌شود",
      "دو بار اجرا می‌شود",
      "فقط در TCP اجرا می‌شود"
    ],
    "correct": 0,
    "explanation": "کنترل به لایهٔ بعدی منتقل نشده است."
  },
  "references": [
    {
      "label": "Koa — cascading middleware",
      "url": "https://koajs.com/"
    },
    {
      "label": "Express — using middleware",
      "url": "https://expressjs.com/en/guide/using-middleware.html"
    }
  ],
  "field": {
    "task": "در Node.js این pipeline ساده را اجرا کنید. قبل و بعد next را مقایسه کنید.",
    "observe": "start سپس handler سپس end چاپ می‌شود.",
    "limit": "این مثال الگوی onion را نشان می‌دهد، نه قرارداد کامل Express یا Koa.",
    "command": "async function logger(next) {\n  console.log('start');\n  await next();\n  console.log('end');\n}\nlogger(async () => console.log('handler'));",
    "next": {
      "slug": "rest-api",
      "label": "REST API",
      "category": "software-engineering"
    }
  }
} satisfies BackendLesson;
export default lesson;
