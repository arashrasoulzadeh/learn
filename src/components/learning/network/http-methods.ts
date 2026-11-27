import type {NetworkLesson} from './types';
const lesson = {
  "slug": "http-methods",
  "title": "HTTP Methods — متدهای درخواست",
  "description": "متد درخواست هدف عملیات روی منبع را بیان می‌کند. خواندن، ایجاد، جایگزینی، تغییر جزئی و حذف را مقایسه کنید.",
  "order": 7,
  "actors": [
    {
      "label": "کلاینت",
      "sub": "HTTP client",
      "icon": "browser"
    },
    {
      "label": "رابط API",
      "sub": "Resource handler",
      "icon": "app"
    },
    {
      "label": "پایگاه داده",
      "sub": "Product store",
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
      "id": "get",
      "label": "GET · خواندن محصول",
      "example": "GET /products/42",
      "steps": [
        {
          "name": "درخواست خواندن",
          "short": "GET",
          "detail": "GET برای دریافت نمایش منبع است و از نظر معنای HTTP متد امن (safe) است.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /products/42 HTTP/1.1",
          "output": "Read operation",
          "result": "API درخواست خواندن را دریافت کرد."
        },
        {
          "name": "خواندن رکورد",
          "short": "خواندن",
          "detail": "سرور در این مثال فقط دادهٔ محصول را می‌خواند؛ تغییر مورد درخواست کاربر نیست.",
          "route": [
            1,
            2
          ],
          "packet": "SELECT",
          "input": "SELECT name FROM products WHERE id=42",
          "output": "Keyboard",
          "result": "رکورد موجود است.",
          "roundTrip": true
        },
        {
          "name": "بازگشت نمایش منبع",
          "short": "پاسخ",
          "detail": "پاسخ ۲۰۰ همراه نمایش JSON محصول برمی‌گردد.",
          "route": [
            1,
            0
          ],
          "packet": "200",
          "input": "HTTP/1.1 200 OK",
          "output": "{\"id\":42,\"name\":\"Keyboard\"}",
          "result": "خواندن موفق بود.",
          "tone": "success"
        }
      ]
    },
    {
      "id": "post",
      "label": "POST · ایجاد محصول",
      "example": "POST /products",
      "steps": [
        {
          "name": "درخواست ایجاد",
          "short": "POST",
          "detail": "POST از منبع مقصد می‌خواهد نمایش ارسالی را طبق معنای خودش پردازش کند؛ این API برای ایجاد محصول طراحی شده است.",
          "route": [
            0,
            1
          ],
          "packet": "POST",
          "input": "POST /products\n{\"name\":\"Mouse\"}",
          "output": "Create requested",
          "result": "درخواست ایجاد دریافت شد."
        },
        {
          "name": "ساخت رکورد جدید",
          "short": "ایجاد",
          "detail": "سرور شناسهٔ جدید تولید می‌کند. تکرار همین POST ممکن است محصول دیگری بسازد.",
          "route": [
            1,
            2
          ],
          "packet": "INSERT",
          "input": "INSERT name=Mouse",
          "output": "Created id=43",
          "result": "رکورد جدید ایجاد شد.",
          "roundTrip": true
        },
        {
          "name": "اعلام ایجاد",
          "short": "پاسخ",
          "detail": "پاسخ ۲۰۱ و Location محل منبع جدید را اعلام می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "201",
          "input": "HTTP/1.1 201 Created\nLocation: /products/43",
          "output": "{\"id\":43,\"name\":\"Mouse\"}",
          "result": "محصول ایجاد شد.",
          "tone": "success"
        }
      ]
    },
    {
      "id": "put",
      "label": "PUT · جایگزینی کامل",
      "example": "PUT /products/42",
      "steps": [
        {
          "name": "ارسال نمایش کامل",
          "short": "PUT",
          "detail": "PUT از سرور می‌خواهد وضعیت منبع هدف با نمایش داده‌شده ایجاد یا جایگزین شود.",
          "route": [
            0,
            1
          ],
          "packet": "PUT",
          "input": "PUT /products/42\n{\"name\":\"Mouse\",\"price\":25}",
          "output": "Replace requested",
          "result": "جایگزینی کامل خواسته شد."
        },
        {
          "name": "جایگزینی رکورد",
          "short": "ذخیره",
          "detail": "در این نمونه تکرار درخواست یکسان همان وضعیت نهایی را ایجاد می‌کند؛ PUT ذاتاً idempotent است.",
          "route": [
            1,
            2
          ],
          "packet": "UPDATE",
          "input": "old={name:Keyboard,price:50}",
          "output": "new={name:Mouse,price:25}",
          "result": "وضعیت جدید ذخیره شد.",
          "roundTrip": true
        },
        {
          "name": "پاسخ موفق",
          "short": "پاسخ",
          "detail": "در این API پاسخ ۲۰۴ بدون بدنه برمی‌گردد.",
          "route": [
            1,
            0
          ],
          "packet": "204",
          "input": "HTTP/1.1 204 No Content",
          "output": "204 No Content",
          "result": "جایگزینی انجام شد.",
          "tone": "success"
        }
      ]
    },
    {
      "id": "patch",
      "label": "PATCH · تغییر جزئی",
      "example": "PATCH /products/42",
      "steps": [
        {
          "name": "ارسال تغییر",
          "short": "PATCH",
          "detail": "PATCH مجموعهٔ تغییرات را برای منبع هدف می‌فرستد؛ در این نمونه از JSON Merge Patch استفاده می‌کنیم.",
          "route": [
            0,
            1
          ],
          "packet": "PATCH",
          "input": "PATCH /products/42\nContent-Type: application/merge-patch+json\n{\"price\":25}",
          "output": "Patch requested",
          "result": "فقط تغییر قیمت خواسته شد."
        },
        {
          "name": "اعمال تغییر",
          "short": "به‌روزرسانی",
          "detail": "نام محصول باقی می‌ماند. PATCH به طور کلی تضمین idempotency ندارد؛ به نوع تغییر بستگی دارد.",
          "route": [
            1,
            2
          ],
          "packet": "MERGE",
          "input": "old={name:Keyboard,price:50}",
          "output": "new={name:Keyboard,price:25}",
          "result": "فقط قیمت تغییر کرد.",
          "roundTrip": true
        },
        {
          "name": "بازگشت نتیجه",
          "short": "پاسخ",
          "detail": "در این نمونه پاسخ ۲۰۰ نمایش منبع تغییر‌یافته را دارد.",
          "route": [
            1,
            0
          ],
          "packet": "200",
          "input": "HTTP/1.1 200 OK",
          "output": "{\"name\":\"Keyboard\",\"price\":25}",
          "result": "تغییر جزئی انجام شد.",
          "tone": "success"
        }
      ]
    },
    {
      "id": "delete",
      "label": "DELETE · حذف منبع",
      "example": "DELETE /products/42",
      "steps": [
        {
          "name": "درخواست حذف",
          "short": "DELETE",
          "detail": "DELETE درخواست حذف ارتباط URI با کارکرد فعلی منبع است؛ لزوماً حذف فیزیکی داده نیست.",
          "route": [
            0,
            1
          ],
          "packet": "DEL",
          "input": "DELETE /products/42",
          "output": "Delete requested",
          "result": "حذف منبع خواسته شد."
        },
        {
          "name": "حذف در API نمونه",
          "short": "حذف",
          "detail": "این API رکورد را حذف می‌کند. تکرار DELETE همان اثر مورد نظر را دارد، حتی اگر پاسخ بار دوم متفاوت باشد.",
          "route": [
            1,
            2
          ],
          "packet": "DELETE",
          "input": "DELETE WHERE id=42",
          "output": "Resource removed",
          "result": "منبع حذف شد.",
          "roundTrip": true
        },
        {
          "name": "پاسخ بدون بدنه",
          "short": "پاسخ",
          "detail": "پاسخ ۲۰۴ نشان می‌دهد حذف انجام شده و محتوایی برای بازگشت وجود ندارد.",
          "route": [
            1,
            0
          ],
          "packet": "204",
          "input": "HTTP/1.1 204 No Content",
          "output": "204 No Content",
          "result": "حذف موفق بود.",
          "tone": "success"
        }
      ]
    }
  ],
  "pitfall": "متد HTTP پیاده‌سازی پایگاه داده را تعیین نمی‌کند. idempotent بودن یعنی اثر مورد انتظار درخواست تکراری یکسان است، نه الزاماً پاسخ یکسان.",
  "takeaway": "متد را بر اساس معنای عملیات انتخاب کنید؛ GET امن است و PUT و DELETE idempotent هستند.",
  "quiz": {
    "question": "کدام متد معمولاً برای جایگزینی نمایش کامل منبع مناسب است؟",
    "options": [
      "GET",
      "PUT",
      "PATCH"
    ],
    "correct": 1,
    "explanation": "PUT برای ایجاد یا جایگزینی نمایش منبع هدف تعریف شده است."
  },
  "references": [
    {
      "label": "RFC 9110 — HTTP Methods",
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
    },
    {
      "label": "RFC 5789 — PATCH",
      "url": "https://www.rfc-editor.org/rfc/rfc5789.html"
    },
    {
      "label": "RFC 7396 — JSON Merge Patch",
      "url": "https://www.rfc-editor.org/rfc/rfc7396.html"
    }
  ]
} satisfies NetworkLesson;
export default lesson;
