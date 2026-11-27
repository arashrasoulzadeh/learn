import type {BackendLesson} from './types';
const lesson = {
  "slug": "api-routing",
  "title": "API Routing — انتخاب مسیر و Handler",
  "description": "متد، مسیر، پارامتر و انتخاب handler را در یک API فروشگاه دنبال کنید.",
  "order": 15,
  "model": "pipeline",
  "actors": [
    {
      "label": "کلاینت",
      "sub": "HTTP client",
      "icon": "browser"
    },
    {
      "label": "مسیریاب",
      "sub": "Router",
      "icon": "router"
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
    ]
  ],
  "visual": {
    "title": "جدول مسیریابی و انتخاب تابع",
    "labels": [
      "درخواست ورودی",
      "تطابق مسیر",
      "تابع یا پاسخ"
    ],
    "context": "در این API فرضی اولویت مسیر ثابت بر مسیر پارامتری تعریف شده است. قواعد تطابق، ترتیب و پاسخ پیش‌فرض به چارچوب و پیکربندی بستگی دارند."
  },
  "teaching": {
    "goal": "از روی متد و مسیر، handler مناسب و تفاوت 404 و 405 را تشخیص دهید.",
    "terms": [
      [
        "Route",
        "قاعدهٔ تطابق درخواست با تابع مقصد."
      ],
      [
        "Handler",
        "تابعی که درخواست تطبیق‌یافته را پردازش می‌کند."
      ],
      [
        "Path parameter",
        "بخش متغیر مسیر مانند id در /products/:id."
      ],
      [
        "Query string",
        "پارامترهای بعد از ? که بخشی از path نیستند."
      ]
    ],
    "practice": {
      "question": "مسیر /products/:id از GET و HEAD پشتیبانی می‌کند. درخواست DELETE /products/42 به همین منبع در API نمونه چه پاسخی می‌گیرد؟",
      "options": [
        "405 همراه Allow",
        "200 همیشه",
        "404 فقط به دلیل متد متفاوت"
      ],
      "correct": 0,
      "explanation": "در این API منبع شناخته می‌شود اما متد پشتیبانی نمی‌شود. پاسخ 405 باید Allow داشته باشد.",
      "hint": "وجود مسیر را از پشتیبانی متد جدا کنید."
    }
  },
  "scenarios": [
    {
      "id": "match",
      "label": "خواندن محصول با پارامتر",
      "example": "GET /products/42?lang=fa",
      "steps": [
        {
          "name": "جداسازی اجزای درخواست",
          "short": "تجزیه URL",
          "detail": "مسیریاب متد و path را از query جدا می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /products/42?lang=fa",
          "output": "method=GET; path=/products/42",
          "result": "آمادهٔ تطابق با جدول مسیر است.",
          "explanation": "lang=fa یک query parameter است؛ شناسهٔ 42 بخشی از مسیر است.",
          "state": [
            "GET /products/42",
            "Searching",
            "—"
          ],
          "flightLabels": [
            "GET path"
          ],
          "diagnostic": "در لاگ route template را جدا از URL خام ثبت کنید تا cardinality بالا ایجاد نشود."
        },
        {
          "name": "تطابق مسیر پارامتری",
          "short": "تطابق مسیر",
          "detail": "قاعدهٔ GET /products/:id پیدا می‌شود و id استخراج می‌شود.",
          "route": [
            1
          ],
          "packet": "MATCH",
          "input": "GET /products/:id",
          "output": "params.id = '42'",
          "result": "تابع مقصد مشخص است.",
          "explanation": "شناسهٔ ورودی هنوز باید از نظر قالب و دسترسی اعتبارسنجی شود.",
          "state": [
            "GET /products/42",
            "GET /products/:id",
            "getProduct"
          ],
          "flightLabels": [
            "match :id"
          ],
          "diagnostic": "params.id رشته است؛ query جداست و id هنوز اعتبارسنجی نشده."
        },
        {
          "name": "اجرای Handler",
          "short": "اجرای تابع",
          "detail": "تابع دادهٔ محصول نمونه را می‌خواند و پاسخ را می‌سازد.",
          "route": [
            1,
            2
          ],
          "packet": "CALL",
          "input": "getProduct({id:'42'})",
          "output": "{\"id\":42,\"name\":\"Keyboard\"}",
          "result": "handler نتیجه را تولید کرد.",
          "explanation": "مسیریاب تابع را انتخاب کرد؛ منطق دریافت داده کار handler است.",
          "state": [
            "GET /products/42",
            "id=42",
            "getProduct: OK"
          ],
          "flightLabels": [
            "call handler"
          ],
          "diagnostic": "handler باید validation، authentication/authorization و query پارامتری مناسب انجام دهد."
        },
        {
          "name": "تحویل پاسخ",
          "short": "ارسال پاسخ",
          "detail": "پاسخ 200 به کلاینت برمی‌گردد.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "200",
          "input": "HTTP/1.1 200 OK",
          "output": "200 OK; product 42",
          "result": "درخواست موفق است.",
          "explanation": "انتخاب موفق مسیر، موفقیت منطق برنامه را تضمین نمی‌کند؛ ممکن است خود محصول وجود نداشته باشد.",
          "state": [
            "GET /products/42",
            "Matched",
            "200 OK"
          ],
          "tone": "success",
          "flightLabels": [
            "result",
            "HTTP 200"
          ],
          "diagnostic": "پاسخ موفق از handler برمی‌گردد؛ middleware ممکن است قبل از خروج آن را پردازش کند."
        }
      ],
      "prediction": "در /products/42?lang=fa کدام بخش برای تطابق مسیر و استخراج id استفاده می‌شود؟"
    },
    {
      "id": "not-found",
      "label": "مسیر ناموجود",
      "example": "GET /unknown",
      "steps": [
        {
          "name": "جست‌وجوی مسیر",
          "short": "جست‌وجوی مسیر",
          "detail": "مسیر /unknown در جدول این API جست‌وجو می‌شود.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /unknown",
          "output": "No route matched",
          "result": "مسیر شناخته نشد.",
          "explanation": "این نمونه با محصول ناموجود در یک handler معتبر فرق دارد.",
          "state": [
            "GET /unknown",
            "No match",
            "—"
          ],
          "flightLabels": [
            "GET /unknown"
          ],
          "diagnostic": "مسیر تعریف نشده با رکورد ناموجود در مسیر معتبر فرق دارد."
        },
        {
          "name": "پاسخ پیش‌فرض",
          "short": "رد مسیر",
          "detail": "مسیریاب بدون فراخوانی handler محصول پاسخ 404 می‌دهد.",
          "route": [
            1,
            0
          ],
          "packet": "404",
          "input": "HTTP/1.1 404 Not Found",
          "output": "404 Not Found",
          "result": "کلاینت باید مسیر را بررسی کند.",
          "explanation": "404 می‌تواند از مسیریاب یا منطق خود برنامه بیاید؛ کد به‌تنهایی محل خطا را اثبات نمی‌کند.",
          "state": [
            "GET /unknown",
            "No match",
            "404"
          ],
          "tone": "error",
          "flightLabels": [
            "404"
          ],
          "diagnostic": "404 فقط outcome است؛ route name و لاگ handler برای تشخیص علت مهم‌اند."
        }
      ],
      "edgeCase": "هیچ مسیر متناظری تعریف نشده است.",
      "prediction": "اگر هیچ مسیر تطبیق پیدا نکند، آیا handler محصول اجرا می‌شود؟"
    },
    {
      "id": "wrong-method",
      "label": "مسیر معتبر، متد نامجاز",
      "example": "DELETE /products/42",
      "steps": [
        {
          "name": "تطابق path",
          "short": "تطابق مسیر",
          "detail": "مسیر پارامتری شناخته می‌شود.",
          "route": [
            0,
            1
          ],
          "packet": "DEL",
          "input": "DELETE /products/42",
          "output": "Path exists",
          "result": "مسیریاب متدها را بررسی می‌کند.",
          "explanation": "در این مثال جدول برای مسیر محصول GET و HEAD دارد؛ DELETE ثبت نشده است.",
          "state": [
            "DELETE /products/42",
            "/products/:id",
            "—"
          ],
          "flightLabels": [
            "DELETE path"
          ],
          "diagnostic": "مسیریاب path را می‌شناسد ولی هنوز method را بررسی نکرده است."
        },
        {
          "name": "بررسی متد",
          "short": "بررسی متد",
          "detail": "DELETE برای این مسیر ثبت نشده است.",
          "route": [
            1
          ],
          "packet": "CHECK",
          "input": "Allowed: GET, HEAD",
          "output": "Method not allowed",
          "result": "handler اجرا نمی‌شود.",
          "explanation": "HEAD در این API فرضی جداگانه پشتیبانی شده است؛ همهٔ فریم‌ورک‌ها چنین رفتار یکسانی ندارند.",
          "state": [
            "DELETE /products/42",
            "Path matched",
            "Method mismatch"
          ],
          "flightLabels": [
            "method check"
          ],
          "diagnostic": "در API نمونه GET و HEAD مجازند؛ رفتار چارچوب‌ها یکسان نیست."
        },
        {
          "name": "ارسال 405",
          "short": "ارسال ۴۰۵",
          "detail": "سرور متدهای مجاز را همراه پاسخ اعلام می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "405",
          "input": "HTTP/1.1 405 Method Not Allowed\nAllow: GET, HEAD",
          "output": "405 Method Not Allowed",
          "result": "مسیر وجود دارد اما متد پشتیبانی نمی‌شود.",
          "explanation": "در HTTP پاسخ 405 باید سرآیند Allow داشته باشد.",
          "state": [
            "DELETE /products/42",
            "Path matched",
            "405; Allow"
          ],
          "tone": "error",
          "flightLabels": [
            "405 + Allow"
          ],
          "diagnostic": "پاسخ 405 باید Allow داشته باشد؛ با 404 یا 403 اشتباه نشود."
        }
      ],
      "edgeCase": "تطابق مسیر بدون تطابق متد.",
      "prediction": "اگر path وجود داشته ولی DELETE ثبت نشده باشد، کد پاسخ چیست؟"
    }
  ],
  "pitfall": "Routing احراز هویت یا اعتبارسنجی نیست. ترتیب routeها و نحوهٔ normalize کردن path به پیاده‌سازی وابسته است.",
  "takeaway": "ابتدا متد و مسیر را تطبیق دهید، سپس handler ورودی و مجوز را بررسی کند.",
  "quiz": {
    "question": "در /products/42?lang=fa کدام بخش query است؟",
    "options": [
      "/products",
      "42",
      "lang=fa"
    ],
    "correct": 2,
    "explanation": "پارامترهای بعد از ? بخش query هستند."
  },
  "references": [
    {
      "label": "RFC 9110 — HTTP semantics",
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
    },
    {
      "label": "RFC 3986 — URI syntax",
      "url": "https://www.rfc-editor.org/rfc/rfc3986.html"
    }
  ],
  "field": {
    "task": "در Node.js یک تابع کوچک برای تطابق متد و مسیر بنویسید و سه درخواست را با آن آزمایش کنید.",
    "observe": "GET مسیر محصول 200، DELETE همان مسیر 405 و مسیر ناموجود 404 می‌دهد.",
    "limit": "این تابع آموزشی سرور کامل نیست؛ URL decoding و امنیت routing واقعی را پیاده نمی‌کند.",
    "command": "function route(method, path) {\n  if (!/^\\/products\\/\\d+$/.test(path)) return 404;\n  return method === 'GET' ? 200 : 405;\n}\nconsole.log(route('GET','/products/42'));\nconsole.log(route('DELETE','/products/42'));\nconsole.log(route('GET','/unknown'));",
    "next": {
      "slug": "middleware",
      "label": "Middleware",
      "category": "software-engineering"
    }
  }
} satisfies BackendLesson;
export default lesson;
