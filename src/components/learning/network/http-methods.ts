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
          "result": "API درخواست خواندن را دریافت کرد.",
          "explanation": "کاربر صفحهٔ محصول 42 را باز می‌کند؛ هدف GET دریافت اطلاعات است، نه تغییر قیمت یا ساخت محصول.",
          "state": [
            "GET",
            "42 · Keyboard",
            "Read"
          ]
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
          "roundTrip": true,
          "explanation": "این API فقط نام محصول را از پایگاه داده می‌خواند. استفاده از SELECT یک انتخاب پیاده‌سازی است.",
          "state": [
            "GET",
            "42 · Keyboard",
            "Unchanged"
          ]
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
          "tone": "success",
          "explanation": "بدنهٔ JSON به مرورگر برمی‌گردد؛ کلیک مجدد روی نمایش محصول نباید به‌طور معمول محصول تازه‌ای بسازد.",
          "state": [
            "GET",
            "42 · Keyboard",
            "200 · representation"
          ]
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
          "result": "درخواست ایجاد دریافت شد.",
          "explanation": "فرم ساخت محصول نام Mouse را می‌فرستد. سرور معنای ایجاد را برای این مسیر تعریف کرده است.",
          "state": [
            "POST",
            "42 · Keyboard",
            "Create"
          ]
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
          "roundTrip": true,
          "explanation": "شناسهٔ 43 تولید می‌شود. اگر کلاینت همان POST را دوباره بفرستد، ممکن است شناسهٔ دیگری ایجاد شود.",
          "state": [
            "POST",
            "42 · Keyboard | 43 · Mouse",
            "Inserted"
          ]
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
          "tone": "success",
          "explanation": "201 و Location آدرس محصول ساخته‌شده را معرفی می‌کنند؛ کلاینت می‌تواند بعداً همان آدرس را بخواند.",
          "state": [
            "POST",
            "42 · Keyboard | 43 · Mouse",
            "201 · Location"
          ]
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
          "result": "جایگزینی کامل خواسته شد.",
          "explanation": "کلاینت نام و قیمت را با هم می‌فرستد تا نمایش کامل محصول 42 جایگزین شود.",
          "state": [
            "PUT",
            "42 · Keyboard · $50",
            "Replace"
          ]
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
          "roundTrip": true,
          "explanation": "وضعیت نهایی نام Mouse و قیمت 25 است. درخواست یکسانِ بعدی هم همین وضعیت مورد انتظار را ایجاد می‌کند.",
          "state": [
            "PUT",
            "42 · Mouse · $25",
            "Full replacement"
          ]
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
          "tone": "success",
          "explanation": "204 یعنی عملیات موفق است ولی پاسخ بدنه ندارد. کلاینت نباید منتظر JSON باشد.",
          "state": [
            "PUT",
            "42 · Mouse · $25",
            "204 · no body"
          ]
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
          "result": "فقط تغییر قیمت خواسته شد.",
          "explanation": "اگر فقط قیمت تغییر کرده، کلاینت می‌تواند سند تغییر جزئی بفرستد؛ نوع محتوا مشخص می‌کند چگونه تفسیر شود.",
          "state": [
            "PATCH",
            "42 · Keyboard · $50",
            "Change price"
          ]
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
          "roundTrip": true,
          "explanation": "نام Keyboard دست‌نخورده می‌ماند و فقط قیمت 25 می‌شود. بعضی عملیات PATCH مثل افزایش شمارنده ذاتاً idempotent نیستند.",
          "state": [
            "PATCH",
            "42 · Keyboard · $25",
            "Name unchanged"
          ]
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
          "tone": "success",
          "explanation": "پاسخ نمایش تازه را می‌دهد تا رابط کاربری قیمت درست را نشان دهد.",
          "state": [
            "PATCH",
            "42 · Keyboard · $25",
            "200 · updated"
          ]
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
          "result": "حذف منبع خواسته شد.",
          "explanation": "کاربر حذف محصول 42 را درخواست می‌کند؛ DELETE معنی حذف ارتباط منبع با URI را دارد.",
          "state": [
            "DELETE",
            "42 · Keyboard",
            "Remove"
          ]
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
          "roundTrip": true,
          "explanation": "در این فروشگاه رکورد واقعاً حذف می‌شود. تکرار DELETE منبع را دوباره به وجود نمی‌آورد.",
          "state": [
            "DELETE",
            "42 · absent",
            "Removed"
          ]
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
          "tone": "success",
          "explanation": "204 پاسخ بدون بدنه است. بار دوم ممکن است 404 بگیریم، با وجود اینکه اثر نهایی همان حذف است.",
          "state": [
            "DELETE",
            "42 · absent",
            "204 · no body"
          ]
        }
      ]
    },
    {
      "id": "retry-post",
      "label": "تکرار POST و ایجاد ناخواسته",
      "example": "POST /products · retry",
      "edgeCase": "پاسخ اول گم می‌شود، کلاینت POST را تکرار می‌کند.",
      "steps": [
        {
          "name": "ایجاد محصول",
          "short": "POST",
          "detail": "سرور POST اول را دریافت می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "POST",
          "input": "POST /products {name:Mouse}",
          "output": "Request received",
          "result": "درخواست ایجاد شروع شد.",
          "explanation": "کاربر فقط یک بار روی دکمهٔ ایجاد کلیک کرده است.",
          "state": [
            "POST",
            "No Mouse record yet",
            "First request"
          ]
        },
        {
          "name": "ثبت ولی پاسخ گم می‌شود",
          "short": "افت",
          "detail": "رکورد ایجاد شده ولی پاسخ در مسیر بازگشت نمی‌رسد.",
          "route": [
            1,
            2
          ],
          "packet": "INSERT",
          "input": "Create Mouse",
          "output": "Created id=43; response lost",
          "result": "کلاینت نتیجه را نمی‌داند.",
          "explanation": "ناموفق بودن دریافت پاسخ به معنی ناموفق بودن ذخیره نیست.",
          "roundTrip": true,
          "tone": "error",
          "state": [
            "POST",
            "43 · Mouse",
            "Committed; reply lost"
          ]
        },
        {
          "name": "تلاش مجدد بدون کلید یکتایی",
          "short": "تکرار",
          "detail": "کلاینت همان POST را دوباره می‌فرستد.",
          "route": [
            0,
            1
          ],
          "packet": "POST",
          "input": "POST /products {name:Mouse}",
          "output": "Second create requested",
          "result": "سرور ممکن است دوباره ایجاد کند.",
          "explanation": "POST ذاتاً idempotent نیست؛ کلید idempotency قراردادی در API می‌تواند کمک کند.",
          "state": [
            "POST",
            "43 · Mouse",
            "Retry"
          ]
        },
        {
          "name": "ایجاد رکورد دوم",
          "short": "نتیجه",
          "detail": "در این نمونه سرور درخواست را تکراری تشخیص نمی‌دهد.",
          "route": [
            1,
            2
          ],
          "packet": "INSERT",
          "input": "Create Mouse again",
          "output": "Created id=44; duplicate product",
          "result": "دو محصول ناخواسته ساخته شدند.",
          "explanation": "برای جلوگیری از این وضعیت باید سرور کلید یکتایی و نتیجهٔ قبلی را به‌صورت اتمیک مدیریت کند.",
          "roundTrip": true,
          "tone": "error",
          "state": [
            "POST",
            "43 · Mouse | 44 · Mouse",
            "Duplicate creation"
          ]
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
  ],
  "visual": {
    "title": "وضعیت منبع قبل و بعد از عملیات",
    "labels": [
      "متد",
      "منبع در پایگاه داده",
      "اثر مورد انتظار"
    ],
    "context": "مثال فروشگاه را دنبال کنید: تفاوت GET، POST، PUT، PATCH و DELETE در معنای درخواست است. تغییر دیتابیس صرفاً پیاده‌سازی این API نمونه است."
  }
} satisfies NetworkLesson;
export default lesson;
