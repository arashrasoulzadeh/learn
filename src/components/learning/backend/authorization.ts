import type {BackendLesson} from './types';
const lesson = {
  "slug": "authorization",
  "title": "Authorization — کنترل مجوز دسترسی",
  "description": "تفاوت هویت و اختیار، نقش و مالکیت منبع و کنترل سمت سرور را با سفارش نمونه تمرین کنید.",
  "order": 19,
  "model": "identity",
  "actors": [
    {
      "label": "کاربر",
      "sub": "Authenticated client",
      "icon": "browser"
    },
    {
      "label": "کنترل سیاست",
      "sub": "Policy check",
      "icon": "shield"
    },
    {
      "label": "مخزن سفارش",
      "sub": "Order store",
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
    "title": "تصمیم دسترسی به منبع",
    "labels": [
      "هویت معتبر",
      "سیاست / مالکیت",
      "تصمیم"
    ],
    "context": "سیاست فرضی: کاربر عادی فقط سفارش متعلق به خودش را می‌خواند؛ نقش پشتیبان فقط در محدودهٔ واگذارشده مجاز است. تصمیم پیش از ارسال داده گرفته می‌شود."
  },
  "teaching": {
    "goal": "مجوز را در سطح عملیات و شیء بررسی کنید و تشخیص دهید چرا پنهان کردن دکمه در UI امنیت نیست.",
    "terms": [
      [
        "Authorization",
        "تصمیم دربارهٔ اجازهٔ عملیات برای هویت مشخص."
      ],
      [
        "RBAC",
        "کنترل مبتنی بر نقش."
      ],
      [
        "Object-level authorization",
        "بررسی مجوز دسترسی به نمونهٔ مشخص منبع."
      ],
      [
        "Deny by default",
        "پیش‌فرض رد دسترسی مگر مجوز معتبر وجود داشته باشد."
      ]
    ],
    "practice": {
      "question": "کاربر 42 با نشست معتبر GET /orders/99 را می‌فرستد؛ سفارش 99 متعلق به کاربر 17 است. در سیاست این درس چه باید شود؟",
      "options": [
        "سرور چون نشست معتبر است سفارش را بدهد",
        "فقط در مرورگر دکمه را پنهان کند",
        "سرور دسترسی را رد کند و دادهٔ سفارش را برنگرداند"
      ],
      "correct": 2,
      "explanation": "اعتبار نشست فقط هویت 42 را تأیید می‌کند؛ سیاست مالکیت اجازهٔ خواندن سفارش 17 را نمی‌دهد.",
      "hint": "شناسهٔ داخل URL مجوز ایجاد نمی‌کند."
    }
  },
  "scenarios": [
    {
      "id": "owner",
      "label": "خواندن سفارش خود",
      "example": "GET /orders/42 · user=42",
      "steps": [
        {
          "name": "دریافت هویت معتبر",
          "short": "بررسی هویت",
          "detail": "سرور نشست معتبر را به هویت 42 مرتبط می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /orders/42\nprincipal.userId=42",
          "output": "Identity verified",
          "result": "هویت مشخص است.",
          "explanation": "هویت از اعتبار بررسی‌شدهٔ سمت سرور می‌آید، نه userId دلخواه در بدنه.",
          "state": [
            "user=42",
            "Pending",
            "Undecided"
          ],
          "flightLabels": [
            "principal"
          ],
          "diagnostic": "هویت باید از credential تأییدشده سمت سرور بیاید نه userId بدنه."
        },
        {
          "name": "بررسی مالکیت",
          "short": "کنترل مالکیت",
          "detail": "مخزن اطلاعات لازم برای بررسی مالکیت سفارش را فراهم می‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "CHECK",
          "input": "order.id=42; owner=42",
          "output": "owner matches",
          "result": "سیاست اجازه می‌دهد.",
          "explanation": "پیاده‌سازی می‌تواند query را از ابتدا به مالک محدود کند. مجوز باید برای هر درخواست و هر منبع مرتبط بررسی شود؛ نتیجهٔ یک درخواست قبلی مجوز همیشگی نیست.",
          "state": [
            "user=42",
            "owner=42",
            "Allow"
          ],
          "roundTrip": true,
          "flightLabels": [
            "scope check",
            "allow"
          ],
          "diagnostic": "قید مالک/tenant و مجوز عملیات را در query یا policy اعمال کنید؛ داده پیش از تصمیم افشا نشود."
        },
        {
          "name": "ارسال پاسخ مجاز",
          "short": "ارسال داده",
          "detail": "فقط پس از تصمیم مجاز، نمایش سفارش به کاربر ارسال می‌شود.",
          "route": [
            1,
            0
          ],
          "packet": "200",
          "input": "HTTP/1.1 200 OK",
          "output": "200 OK; own order",
          "result": "دسترسی مجاز است.",
          "explanation": "دادهٔ خروجی نیز باید فقط فیلدهای مجاز را شامل شود.",
          "state": [
            "user=42",
            "Ownership matched",
            "200 Allow"
          ],
          "tone": "success",
          "flightLabels": [
            "200 own order"
          ],
          "diagnostic": "پاسخ فقط فیلدهای مجاز همین منبع را بدهد؛ نتیجهٔ تصمیم را بدون داده حساس لاگ کنید."
        }
      ],
      "prediction": "برای خواندن سفارش، علاوه بر هویت معتبر کدام شرط باید بررسی شود؟"
    },
    {
      "id": "other-owner",
      "label": "درخواست سفارش شخص دیگر",
      "example": "GET /orders/99 · user=42",
      "steps": [
        {
          "name": "درخواست شناسهٔ دیگر",
          "short": "دریافت درخواست",
          "detail": "کلاینت با نشست معتبر شناسهٔ سفارش 99 را درخواست می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /orders/99",
          "output": "Identity=42",
          "result": "درخواست نیاز به بررسی شیء دارد.",
          "explanation": "وجود نشست معتبر دسترسی همهٔ اشیا را مجاز نمی‌کند.",
          "state": [
            "user=42",
            "Pending",
            "Undecided"
          ],
          "flightLabels": [
            "GET order99"
          ],
          "diagnostic": "وجود نشست، اجازه خواندن شناسه دلخواه را ایجاد نمی‌کند."
        },
        {
          "name": "عدم تطابق مالکیت",
          "short": "کنترل مالکیت",
          "detail": "مالک سفارش 99 در این سناریو کاربر 17 است.",
          "route": [
            1,
            2
          ],
          "packet": "CHECK",
          "input": "owner=17; principal=42",
          "output": "Ownership mismatch",
          "result": "سیاست درخواست را رد می‌کند.",
          "explanation": "کنترل را در سمت سرور و برای هر شیء انجام دهید؛ دادهٔ حساس نباید تا قبل از تصمیم ارسال شود.",
          "state": [
            "user=42",
            "owner=17",
            "Deny"
          ],
          "roundTrip": true,
          "tone": "error",
          "flightLabels": [
            "owner check",
            "deny"
          ],
          "diagnostic": "مالک 17 و principal 42 متفاوت‌اند؛ authorization سطح شیء لازم است."
        },
        {
          "name": "بازگرداندن پاسخ رد",
          "short": "رد دسترسی",
          "detail": "این API نمونه پاسخ 403 بدون اطلاعات سفارش می‌دهد.",
          "route": [
            1,
            0
          ],
          "packet": "403",
          "input": "HTTP/1.1 403 Forbidden",
          "output": "403 Forbidden; no order data",
          "result": "منبع خصوصی افشا نشد.",
          "explanation": "بعضی قراردادها برای پنهان کردن وجود منبع 404 می‌دهند؛ انتخاب باید سازگار با سیاست باشد.",
          "state": [
            "user=42",
            "Ownership mismatch",
            "403 Deny"
          ],
          "tone": "error",
          "flightLabels": [
            "403"
          ],
          "diagnostic": "403 یا 404 پنهان‌کننده وجود منبع طبق قرارداد؛ داده سفارش نباید برگردد."
        }
      ],
      "edgeCase": "کنترل مالکیت شیء با وجود احراز هویت معتبر ضروری است.",
      "prediction": "آیا کاربر واردشده حق خواندن سفارش کاربر دیگری را دارد؟"
    },
    {
      "id": "role",
      "label": "نقش فاقد مجوز عملیات",
      "example": "DELETE /orders/42 · role=viewer",
      "steps": [
        {
          "name": "دریافت عملیات حذف",
          "short": "درخواست حذف",
          "detail": "کاربر با نقش viewer درخواست حذف می‌دهد.",
          "route": [
            0,
            1
          ],
          "packet": "DEL",
          "input": "DELETE /orders/42\nrole=viewer",
          "output": "Delete requested",
          "result": "سیاست عملیات بررسی می‌شود.",
          "explanation": "نقش viewer در این مثال فقط خواندن مجاز دارد.",
          "state": [
            "viewer",
            "DELETE required",
            "Undecided"
          ],
          "flightLabels": [
            "DELETE request"
          ],
          "diagnostic": "بررسی مجوز عملیات مستقل از تطابق مالکیت است."
        },
        {
          "name": "بررسی مجوز عملیات",
          "short": "بررسی نقش",
          "detail": "سیاست حذف را برای نقش viewer مجاز نمی‌داند.",
          "route": [
            1
          ],
          "packet": "DENY",
          "input": "can(viewer,'delete',order)=false",
          "output": "Permission denied",
          "result": "عملیات مخرب اجرا نمی‌شود.",
          "explanation": "حتی اگر سفارش متعلق به کاربر باشد، مجوز عملیات جدا از مالکیت است.",
          "state": [
            "viewer",
            "Missing delete permission",
            "Deny"
          ],
          "tone": "error",
          "flightLabels": [
            "policy deny"
          ],
          "diagnostic": "viewer در مدل فقط read دارد؛ کنترل UI کافی نیست."
        },
        {
          "name": "رد بدون تغییر داده",
          "short": "رد حذف",
          "detail": "سرور پاسخ 403 می‌دهد و سفارش حذف نمی‌شود.",
          "route": [
            1,
            0
          ],
          "packet": "403",
          "input": "HTTP/1.1 403 Forbidden",
          "output": "403; order unchanged",
          "result": "حفاظت سمت سرور انجام شد.",
          "explanation": "غیرفعال کردن دکمه در UI صرفاً تجربهٔ کاربری است، نه کنترل امنیتی.",
          "state": [
            "viewer",
            "Permission denied",
            "403; unchanged"
          ],
          "tone": "error",
          "flightLabels": [
            "403"
          ],
          "diagnostic": "هیچ اثر DELETE ثبت نمی‌شود؛ تست side effect هم به‌اندازه status مهم است."
        }
      ],
      "edgeCase": "نقش خواندنی نباید عملیات حذف انجام دهد.",
      "prediction": "آیا مالک بودن برای حذف منبع کافی است وقتی نقش فقط خواندنی است؟"
    }
  ],
  "pitfall": "کنترل نقش کلی کافی نیست؛ مالکیت، عملیات، tenant و محدودهٔ منابع نیز مهم‌اند. مجوزهای UI قابل اعتماد نیستند.",
  "takeaway": "احراز هویت معتبر را به سیاست دقیق عملیات و شیء وصل کنید و در صورت نبود مجوز، پیش‌فرض رد باشد.",
  "quiz": {
    "question": "کنترل اصلی دسترسی به سفارش خصوصی کجا باید باشد؟",
    "options": [
      "فقط CSS",
      "سمت سرور برای همان عملیات و شیء",
      "فقط در نام URL"
    ],
    "correct": 1,
    "explanation": "سرور باید تصمیم مجوز را اعمال کند؛ کلاینت قابل تغییر است."
  },
  "references": [
    {
      "label": "OWASP — Authorization Cheat Sheet",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
    },
    {
      "label": "OWASP API Security — Broken Object Level Authorization",
      "url": "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/"
    }
  ],
  "field": {
    "task": "یک جدول سیاست محلی با دو کاربر ساختگی و دو سفارش بسازید. تابع اجازه را برای چهار ترکیب آزمایش کنید.",
    "observe": "فقط دو ترکیب مالک صحیح true می‌دهند؛ درخواست کاربر دیگر false است.",
    "limit": "این تابع یک سیاست سادهٔ نمونه است، نه سامانهٔ کامل تولیدی. از دادهٔ واقعی دیگران استفاده نکنید.",
    "command": "function canRead(userId, order) {\n  return userId === order.ownerId;\n}\nconst orders = [{ownerId:42},{ownerId:17}];\nfor (const user of [42,17])\n  console.log(user, orders.map(o=>canRead(user,o)));",
    "next": {
      "slug": "jwt",
      "label": "JWT",
      "category": "software-engineering"
    }
  }
} satisfies BackendLesson;
export default lesson;
