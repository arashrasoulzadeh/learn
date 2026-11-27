import type {BackendLesson} from './types';
const lesson = {
  "slug": "rest-api",
  "title": "REST API — طراحی منبع و قرارداد",
  "description": "منبع، نمایش، متد، وضعیت و شرط به‌روزرسانی را در API نمونهٔ فروشگاه مقایسه کنید.",
  "order": 17,
  "model": "resource",
  "actors": [
    {
      "label": "کلاینت",
      "sub": "API consumer",
      "icon": "browser"
    },
    {
      "label": "رابط منبع",
      "sub": "Resource API",
      "icon": "app"
    },
    {
      "label": "مخزن داده",
      "sub": "Resource store",
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
  "visual": {
    "title": "نمایش منبع و نسخهٔ آن",
    "labels": [
      "درخواست",
      "وضعیت منبع",
      "پاسخ / ETag"
    ],
    "context": "REST یک سبک معماری با محدودیت‌های مشخص از جمله رابط یکنواخت و stateless است. صرف استفاده از JSON یا CRUD به معنی رعایت همهٔ REST نیست."
  },
  "teaching": {
    "goal": "URI و متد مناسب را انتخاب کنید و با ETag و If-Match از بازنویسی ناخواسته در API نمونه جلوگیری کنید.",
    "terms": [
      [
        "Resource",
        "مفهوم دارای شناسه در رابط سرویس."
      ],
      [
        "Representation",
        "نمایش قابل انتقال وضعیت منبع."
      ],
      [
        "Stateless",
        "هر درخواست اطلاعات لازم برای پردازش خود را دارد؛ سرور نیاز به context مکالمهٔ قبلی ندارد."
      ],
      [
        "ETag",
        "اعتبارسنج نمایش منبع که می‌توان در درخواست شرطی به کار برد."
      ]
    ],
    "practice": {
      "question": "دو کاربر نسخهٔ v1 محصول را خوانده‌اند. کاربر اول آن را به v2 تغییر می‌دهد. کاربر دوم PUT با If-Match: \"v1\" می‌فرستد. پاسخ مناسب چیست؟",
      "options": [
        "200 و بازنویسی اجباری",
        "412 Precondition Failed",
        "301"
      ],
      "correct": 1,
      "explanation": "شرط If-Match با ETag فعلی تطبیق ندارد؛ سرور نباید تغییر را اعمال کند.",
      "hint": "نسخهٔ فعلی v2 است، نه v1."
    }
  },
  "scenarios": [
    {
      "id": "create",
      "label": "ایجاد منبع",
      "example": "POST /products",
      "steps": [
        {
          "name": "درخواست ایجاد",
          "short": "POST",
          "detail": "کلاینت نمایش محصول جدید را به collection می‌فرستد.",
          "route": [
            0,
            1
          ],
          "packet": "POST",
          "input": "POST /products\n{\"name\":\"Mouse\"}",
          "output": "Create requested",
          "result": "درخواست ایجاد دریافت شد.",
          "explanation": "مسیر collection نمایندهٔ مجموعهٔ محصولات است.",
          "state": [
            "POST /products",
            "No product 43",
            "Pending"
          ]
        },
        {
          "name": "ثبت منبع",
          "short": "Store",
          "detail": "API پس از اعتبارسنجی، محصول جدید را ثبت و شناسه تعیین می‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "SAVE",
          "input": "insert Mouse",
          "output": "43; version v1",
          "result": "منبع جدید ایجاد شد.",
          "explanation": "شناسه و نحوهٔ ذخیره را قرارداد و پیاده‌سازی تعیین می‌کند.",
          "state": [
            "POST /products",
            "43 · Mouse · v1",
            "Pending"
          ],
          "roundTrip": true
        },
        {
          "name": "اعلام نشانی منبع",
          "short": "201",
          "detail": "سرور Location و پاسخ ایجاد را برمی‌گرداند.",
          "route": [
            1,
            0
          ],
          "packet": "201",
          "input": "HTTP/1.1 201 Created\nLocation: /products/43",
          "output": "201 Created",
          "result": "کلاینت URI منبع جدید را دارد.",
          "explanation": "کلاینت می‌تواند بر اساس Location منبع را در آینده بخواند.",
          "state": [
            "POST /products",
            "43 · Mouse · v1",
            "201; /products/43"
          ],
          "tone": "success"
        }
      ]
    },
    {
      "id": "conditional",
      "label": "ویرایش شرطی موفق",
      "example": "PUT /products/42 · If-Match",
      "steps": [
        {
          "name": "خواندن نمایش و نسخه",
          "short": "GET",
          "detail": "کلاینت محصول را می‌خواند و ETag فعلی را می‌گیرد.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /products/42",
          "output": "200 OK; ETag: \"v1\"",
          "result": "نسخهٔ خوانده‌شده مشخص شد.",
          "explanation": "در این نمونه API از ETag قوی برای کنترل هم‌زمانی استفاده می‌کند.",
          "state": [
            "GET /products/42",
            "42 · price=50 · v1",
            "ETag: v1"
          ],
          "roundTrip": true
        },
        {
          "name": "ارسال ویرایش شرطی",
          "short": "PUT",
          "detail": "کلاینت If-Match را همراه نمایش کامل می‌فرستد.",
          "route": [
            0,
            1
          ],
          "packet": "PUT",
          "input": "If-Match: \"v1\"\n{\"name\":\"Keyboard\",\"price\":45}",
          "output": "Precondition matches",
          "result": "نسخهٔ فعلی همان نسخهٔ خوانده‌شده است.",
          "explanation": "بررسی شرط و تغییر باید هماهنگ یا اتمیک انجام شوند.",
          "state": [
            "PUT; If-Match v1",
            "42 · price=50 · v1",
            "Matched"
          ]
        },
        {
          "name": "ذخیرهٔ نسخهٔ تازه",
          "short": "Update",
          "detail": "مخزن تغییر را ثبت می‌کند و نسخهٔ تازه می‌سازد.",
          "route": [
            1,
            2
          ],
          "packet": "SAVE",
          "input": "update if version=v1",
          "output": "price=45; v2",
          "result": "تغییر ثبت شد.",
          "explanation": "فقط در صورت تطابق نسخهٔ مورد انتظار، نوشتن انجام می‌شود.",
          "state": [
            "PUT; If-Match v1",
            "42 · price=45 · v2",
            "Saved"
          ],
          "roundTrip": true
        },
        {
          "name": "پاسخ ویرایش",
          "short": "200",
          "detail": "API نمایش تازه را در پاسخ می‌دهد.",
          "route": [
            1,
            0
          ],
          "packet": "200",
          "input": "HTTP/1.1 200 OK",
          "output": "200 OK; version v2",
          "result": "کلاینت وضعیت تازه را دریافت کرد.",
          "explanation": "ETag مناسب باید بر اساس قواعد HTTP تولید شود؛ اینجا v2 یک نسخهٔ آموزشی است.",
          "state": [
            "PUT /products/42",
            "42 · price=45 · v2",
            "200 OK"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "از درخواست شرطی برای کنترل هم‌زمانی استفاده می‌شود."
    },
    {
      "id": "stale",
      "label": "ویرایش با نسخهٔ قدیمی",
      "example": "If-Match: \"v1\" vs \"v2\"",
      "steps": [
        {
          "name": "تغییر توسط کاربر دیگر",
          "short": "Concurrent",
          "detail": "در این نمونه کلاینت دیگری پیش‌تر محصول را تغییر داده است.",
          "route": [
            1,
            2
          ],
          "packet": "UPDATE",
          "input": "other client updated v1",
          "output": "price=45; v2",
          "result": "نسخهٔ فعلی تغییر کرده است.",
          "explanation": "کلاینت اصلی هنوز نسخهٔ v1 را در رابط کاربری دارد.",
          "state": [
            "Local version v1",
            "42 · price=45 · v2",
            "Stale view"
          ]
        },
        {
          "name": "دریافت درخواست قدیمی",
          "short": "Check",
          "detail": "درخواست اصلی با If-Match v1 به سرور می‌رسد.",
          "route": [
            0,
            1
          ],
          "packet": "PUT",
          "input": "If-Match: \"v1\"",
          "output": "Current ETag: \"v2\"",
          "result": "شرط نامعتبر است.",
          "explanation": "سرور نباید تغییر را بدون بررسی شرط اعمال کند.",
          "state": [
            "PUT; If-Match v1",
            "42 · price=45 · v2",
            "Mismatch"
          ]
        },
        {
          "name": "رد به‌روزرسانی",
          "short": "412",
          "detail": "پاسخ 412 برمی‌گردد و داده بدون تغییر می‌ماند.",
          "route": [
            1,
            0
          ],
          "packet": "412",
          "input": "HTTP/1.1 412 Precondition Failed",
          "output": "412 Precondition Failed",
          "result": "بازنویسی ناخواسته جلوگیری شد.",
          "explanation": "کلاینت باید نسخهٔ تازه را بخواند و تعارض را حل کند؛ تکرار کورکورانه مناسب نیست.",
          "state": [
            "PUT; If-Match v1",
            "42 · price=45 · v2",
            "412; unchanged"
          ],
          "tone": "error"
        }
      ],
      "edgeCase": "رقابت دو کلاینت برای نوشتن؛ نسخهٔ قدیمی رد می‌شود."
    }
  ],
  "pitfall": "REST به معنی نبود پایگاه داده یا نبود احراز هویت نیست. سرور می‌تواند وضعیت منبع را ذخیره کند؛ stateless بودن دربارهٔ context تعامل درخواست‌هاست.",
  "takeaway": "قرارداد منابع را با معنای HTTP طراحی کنید؛ برای جلوگیری از lost update شرط نسخه را در نظر بگیرید.",
  "quiz": {
    "question": "کدام سرآیند برای اجرای درخواست تنها در صورت تطابق ETag استفاده می‌شود؟",
    "options": [
      "If-Match",
      "Accept-Language",
      "Content-Length"
    ],
    "correct": 0,
    "explanation": "If-Match شرط تطابق validator نمایش را بیان می‌کند."
  },
  "references": [
    {
      "label": "Fielding — REST architectural style",
      "url": "https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm"
    },
    {
      "label": "RFC 9110 — conditional requests",
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
    }
  ],
  "field": {
    "task": "در یک API محلی خودتان، GET محصول را اجرا و ETag را ثبت کنید. اگر API شرطی پشتیبانی می‌کند، با نسخهٔ قدیمی درخواست نوشتن بفرستید.",
    "observe": "پاسخ 412 و باقی ماندن نسخهٔ فعلی را بررسی کنید. اگر API چنین قراردادی ندارد، آن را در سناریوی درس دنبال کنید.",
    "limit": "فقط روی دادهٔ آزمایشی خودتان بنویسید؛ همهٔ APIها If-Match را پیاده نمی‌کنند.",
    "next": {
      "slug": "authentication",
      "label": "Authentication",
      "category": "software-engineering"
    }
  }
} satisfies BackendLesson;
export default lesson;
