import type {BackendLesson} from './types';
const lesson = {
  "slug": "jwt",
  "title": "JWT — توکن امضاشده و اعتبارسنجی",
  "description": "ساختار JWT امضاشده، بررسی امضا و claims، انقضا و تفاوت رمزنگاری با امضا.",
  "order": 20,
  "model": "identity",
  "actors": [
    {
      "label": "کلاینت",
      "sub": "Bearer token",
      "icon": "browser"
    },
    {
      "label": "سرویس API",
      "sub": "Verifier",
      "icon": "shield"
    },
    {
      "label": "کلید و سیاست",
      "sub": "Trusted configuration",
      "icon": "key"
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
    "title": "مراحل اعتبارسنجی توکن",
    "labels": [
      "Header / Payload",
      "امضا و claims",
      "تصمیم API"
    ],
    "context": "این درس JWT امضاشده در قالب JWS را مدل می‌کند. داده‌های نمونه ساختگی‌اند؛ هیچ امضای واقعی یا توکن قابل استفاده تولید نمی‌شود. JWT می‌تواند در قالب رمزنگاری‌شده نیز باشد."
  },
  "teaching": {
    "goal": "decode را از verify جدا کنید و تشخیص دهید چرا امضای معتبر بدون بررسی exp، iss، aud و مجوز کافی نیست.",
    "terms": [
      [
        "JWT",
        "قالب انتقال مجموعه‌ای از claims."
      ],
      [
        "JWS",
        "قالب داده با امضا یا MAC برای حفاظت از یکپارچگی و اصالت."
      ],
      [
        "Claims",
        "ادعاهای توکن مانند sub، exp، iss و aud."
      ],
      [
        "Bearer token",
        "دارندهٔ توکن می‌تواند آن را استفاده کند؛ باید محرمانه بماند."
      ],
      [
        "Base64url",
        "کدگذاری بایت‌ها برای URL، نه رمزنگاری."
      ],
      [
        "JWE",
        "قالب رمزنگاری‌شده؛ با JWS امضاشده متفاوت است."
      ]
    ],
    "practice": {
      "question": "توکن امضای معتبر دارد اما aud آن برای سرویس پرداخت است؛ به API سفارش ارسال شده. API سفارش چه کند؟",
      "options": [
        "پذیرش چون امضا درست است",
        "رد چون مخاطب مورد انتظار تطابق ندارد",
        "تغییر aud در payload و پذیرش"
      ],
      "correct": 1,
      "explanation": "امضا فقط یکپارچگی و اصالت را نسبت به کلید بررسی می‌کند. سرویس باید مخاطب، صادرکننده، زمان و سیاست توکن را نیز اعتبارسنجی کند.",
      "hint": "توکن معتبر برای یک سرویس لزوماً برای سرویس دیگر معتبر نیست."
    }
  },
  "scenarios": [
    {
      "id": "valid",
      "label": "توکن معتبر برای API سفارش",
      "example": "Bearer · signed JWT",
      "steps": [
        {
          "name": "دریافت توکن",
          "short": "دریافت توکن",
          "detail": "کلاینت یک JWT امضاشده در قالب compact JWS را در Authorization ارسال می‌کند. این قالب سه قسمت جداشده با نقطه دارد: header، payload و signature/MAC.",
          "route": [
            0,
            1
          ],
          "packet": "JWT",
          "input": "Authorization: Bearer [redacted]\nCompact JWS: header.payload.signature\nDecoded header: {\"alg\":\"RS256\",\"typ\":\"JWT\"}\nDecoded payload: {\"sub\":\"42\",\"aud\":\"orders\"}\nIllustrative signature: [not a real signature]",
          "output": "Token received",
          "result": "هنوز اعتبار توکن ثابت نشده.",
          "explanation": "header الگوریتم ادعایی، payload مجموعهٔ claims و قسمت سوم امضا یا MAC است. دو قسمت اول با Base64url کدگذاری می‌شوند و خواندنشان آسان است؛ بخش سوم یکپارچگی و اصالت را نسبت به کلید بررسی‌شده ممکن می‌کند. داده‌های این درس ساختگی هستند.",
          "state": [
            "header | payload | signature",
            "Unchecked",
            "Pending"
          ],
          "flightLabels": [
            "Bearer token"
          ],
          "diagnostic": "JWT امضاشده در قالب JWS سه بخش دارد؛ Base64url محرمانگی ایجاد نمی‌کند و claims پیش از verify غیرقابل اعتمادند."
        },
        {
          "name": "بررسی امضا",
          "short": "بررسی امضا",
          "detail": "API الگوریتم را با سیاست ثابت کنترل می‌کند و کلید معتبر را از پیکربندی قابل اعتماد می‌گیرد؛ سپس خود verifier امضای توکن را بررسی می‌کند. مسیر رفت‌وبرگشت در نمودار دریافت کلید و نتیجهٔ بررسی را خلاصه می‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "SIG",
          "input": "alg=RS256 (allowed); trusted key",
          "output": "Signature valid",
          "result": "یکپارچگی داده تأیید شد.",
          "explanation": "به alg و کلید دلخواه ارائه‌شده در توکن اعتماد نکنید؛ کتابخانه باید سیاست الگوریتم را اعمال کند.",
          "state": [
            "sub=42; aud=orders",
            "Signature valid",
            "Pending"
          ],
          "roundTrip": true,
          "flightLabels": [
            "verify",
            "valid sig"
          ],
          "diagnostic": "Verifier از issuer/JWKS و الگوریتم مورد اعتماد استفاده می‌کند؛ امضا را با کلید دلخواه header نپذیرید."
        },
        {
          "name": "بررسی ادعاها",
          "short": "بررسی ادعاها",
          "detail": "API زمان، issuer و audience مورد انتظار را بررسی می‌کند.",
          "route": [
            1
          ],
          "packet": "CHECK",
          "input": "iss=auth.example; aud=orders; exp>now",
          "output": "Claims valid",
          "result": "توکن برای این API و زمان معتبر است.",
          "explanation": "sub به تنهایی مجوز دسترسی نیست؛ scope و سیاست شیء باید بررسی شوند.",
          "state": [
            "sub=42; aud=orders",
            "iss/aud/exp valid",
            "Identity verified"
          ],
          "flightLabels": [
            "validate claims"
          ],
          "diagnostic": "exp، iss، aud و nbf در صورت وجود را بررسی کنید؛ NumericDate و clock skew را درست اعمال کنید."
        },
        {
          "name": "تصمیم مجوز و پاسخ",
          "short": "کنترل مجوز",
          "detail": "درخواست نمونه scope و مالکیت لازم را دارد، بنابراین API پاسخ مجاز می‌دهد.",
          "route": [
            1,
            0
          ],
          "packet": "200",
          "input": "scope=orders:read; owner=42",
          "output": "200 OK",
          "result": "احراز و مجوز هر دو موفق بودند.",
          "explanation": "این پاسخ نتیجهٔ هر دو مرحله است، نه صرفاً داشتن JWT.",
          "state": [
            "sub=42",
            "Claims + policy valid",
            "200 Allow"
          ],
          "tone": "success",
          "flightLabels": [
            "200 allowed"
          ],
          "diagnostic": "توکن معتبر برای هویت است؛ scope و policy شیء باید جدا بررسی شوند."
        }
      ],
      "prediction": "بعد از بررسی موفق امضا، آیا API می‌تواند بدون بررسی claims پاسخ بدهد؟"
    },
    {
      "id": "expired",
      "label": "توکن با امضای معتبر اما منقضی",
      "example": "exp <= now",
      "steps": [
        {
          "name": "دریافت و بررسی امضا",
          "short": "بررسی امضا",
          "detail": "توکن قدیمی به API می‌رسد و در این نمونه امضایش معتبر است.",
          "route": [
            0,
            1
          ],
          "packet": "JWT",
          "input": "Authorization: Bearer [expired-demo]",
          "output": "Signature valid",
          "result": "اعتبار زمانی هنوز بررسی نشده.",
          "explanation": "توکن ممکن است اصالت داشته باشد ولی دیگر قابل استفاده نباشد.",
          "state": [
            "sub=42",
            "Signature valid",
            "Pending"
          ],
          "flightLabels": [
            "verify signature"
          ],
          "diagnostic": "امضای معتبر به معنای مجاز بودن زمان استفاده نیست."
        },
        {
          "name": "رد بر اساس exp",
          "short": "بررسی زمان",
          "detail": "زمان فعلی پس از exp است و از مهلت ارفاقی نمونه گذشته.",
          "route": [
            1
          ],
          "packet": "EXP",
          "input": "exp=1000; now=1100",
          "output": "Token expired",
          "result": "claims معتبر نیستند.",
          "explanation": "exp زمان NumericDate است؛ خطای ساعت فقط با leeway محدود مدیریت می‌شود.",
          "state": [
            "exp=1000",
            "now=1100; expired",
            "Deny"
          ],
          "tone": "error",
          "flightLabels": [
            "check exp"
          ],
          "diagnostic": "در مدل now بعد از exp و leeway است؛ نوسازی توکن قرارداد جدا دارد."
        },
        {
          "name": "پاسخ نامعتبر بودن توکن",
          "short": "رد توکن",
          "detail": "API پاسخ 401 همراه چالش Bearer می‌فرستد.",
          "route": [
            1,
            0
          ],
          "packet": "401",
          "input": "HTTP/1.1 401 Unauthorized\nWWW-Authenticate: Bearer error=\"invalid_token\"",
          "output": "401 invalid_token",
          "result": "توکن قدیمی پذیرفته نشد.",
          "explanation": "کلاینت مطابق سیاست احراز هویت می‌تواند دوباره وارد شود یا توکن را نوسازی کند.",
          "state": [
            "Expired token",
            "Rejected",
            "401 Deny"
          ],
          "tone": "error",
          "flightLabels": [
            "401 invalid_token"
          ],
          "diagnostic": "WWW-Authenticate Bearer نتیجه شکست توکن را اعلام می‌کند؛ توکن خام را log نکنید."
        }
      ],
      "edgeCase": "امضا معتبر است اما زمان استفاده گذشته است.",
      "prediction": "اگر امضا درست ولی exp گذشته باشد، آیا توکن پذیرفته می‌شود؟"
    },
    {
      "id": "tampered",
      "label": "تغییر payload بدون امضای معتبر",
      "example": "Payload changed · invalid signature",
      "steps": [
        {
          "name": "دریافت ادعای تغییر یافته",
          "short": "خواندن ادعا",
          "detail": "API توکن نمونه با payload تغییر یافته را دریافت می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "JWT",
          "input": "decoded sub=42; role=admin (untrusted)",
          "output": "Decoded; not trusted",
          "result": "خواندن payload اثبات اعتبار نیست.",
          "explanation": "Base64url قابل خواندن است؛ JWT امضاشده محل ذخیرهٔ راز نیست.",
          "state": [
            "role=admin (untrusted)",
            "Unchecked",
            "Pending"
          ],
          "flightLabels": [
            "decode untrusted"
          ],
          "diagnostic": "payload خوانده شده ولی هیچ تصمیم مجوز نباید هنوز بر اساس آن گرفته شود."
        },
        {
          "name": "بررسی امضای ناموفق",
          "short": "بررسی امضا",
          "detail": "تغییر payload باعث عدم تطابق امضا با ورودی امضاشده می‌شود.",
          "route": [
            1,
            2
          ],
          "packet": "SIG",
          "input": "verify with trusted key",
          "output": "Signature invalid",
          "result": "توکن نامعتبر است.",
          "explanation": "اعتبارسنجی باید پیش از استفاده از claims برای تصمیم امنیتی انجام شود.",
          "state": [
            "Payload changed",
            "Signature invalid",
            "Deny"
          ],
          "roundTrip": true,
          "tone": "error",
          "flightLabels": [
            "verify",
            "bad sig"
          ],
          "diagnostic": "تغییر payload بدون امضای درست اعتبار JWS را خراب می‌کند؛ parser جای verifier نیست."
        },
        {
          "name": "رد درخواست",
          "short": "رد توکن",
          "detail": "سرور بدون اعتماد به role ادعاشده درخواست را رد می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "401",
          "input": "HTTP/1.1 401 Unauthorized\nWWW-Authenticate: Bearer error=\"invalid_token\"",
          "output": "401 invalid_token",
          "result": "نقش ساختگی پذیرفته نشد.",
          "explanation": "توکن امضاشده را با کتابخانهٔ استاندارد بررسی کنید؛ parser به تنهایی کافی نیست.",
          "state": [
            "Untrusted claims",
            "Rejected",
            "401 Deny"
          ],
          "tone": "error",
          "flightLabels": [
            "401 invalid_token"
          ],
          "diagnostic": "نقش ادعایی رد شد؛ هیچ عملیات یا داده خصوصی نباید منتشر شود."
        }
      ],
      "edgeCase": "کدگشایی موفق payload به معنی صحت امضا نیست.",
      "prediction": "آیا decode کردن payload تغییر یافته، اعتبار توکن را ثابت می‌کند؟"
    },
    {
      "id": "audience",
      "label": "توکن برای سرویس دیگر",
      "example": "aud=payments; expected=orders",
      "steps": [
        {
          "name": "دریافت توکن اصیل",
          "short": "بررسی امضا",
          "detail": "توکن نمونه امضای معتبر و زمان معتبر دارد.",
          "route": [
            0,
            1
          ],
          "packet": "JWT",
          "input": "aud=payments; exp>now",
          "output": "Signature valid",
          "result": "مخاطب باید بررسی شود.",
          "explanation": "کلید مشترک بین سرویس‌ها به معنی مجاز بودن همهٔ توکن‌ها برای همهٔ سرویس‌ها نیست.",
          "state": [
            "aud=payments",
            "Signature valid",
            "Pending"
          ],
          "flightLabels": [
            "verify signature"
          ],
          "diagnostic": "اصالت و انقضا ممکن است درست باشند اما مخاطب هنوز کنترل نشده."
        },
        {
          "name": "عدم تطابق مخاطب",
          "short": "کنترل مخاطب",
          "detail": "API سفارش انتظار aud=orders دارد.",
          "route": [
            1
          ],
          "packet": "AUD",
          "input": "expected=orders; actual=payments",
          "output": "Audience mismatch",
          "result": "توکن برای این سرویس معتبر نیست.",
          "explanation": "issuer و audience را با سیاست ثابت و معتبر بررسی کنید.",
          "state": [
            "aud=payments",
            "Expected orders",
            "Deny"
          ],
          "tone": "error",
          "flightLabels": [
            "check aud"
          ],
          "diagnostic": "توکن payments برای orders معتبر نیست؛ aud و issuer را با سیاست ثابت مقایسه کنید."
        },
        {
          "name": "رد توکن",
          "short": "رد توکن",
          "detail": "API چالش مناسب و عدم پذیرش توکن را اعلام می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "401",
          "input": "HTTP/1.1 401 Unauthorized\nWWW-Authenticate: Bearer error=\"invalid_token\"",
          "output": "401 invalid_token",
          "result": "توکن سرویس دیگر رد شد.",
          "explanation": "انقضای کوتاه و اعتبارسنجی کامل به کاهش ریسک کمک می‌کنند؛ لغو دسترسی طراحی جدا دارد.",
          "state": [
            "Wrong audience",
            "Rejected",
            "401 Deny"
          ],
          "tone": "error",
          "flightLabels": [
            "401 invalid_token"
          ],
          "diagnostic": "اعتماد به کلید مشترک بین سرویس‌ها مجوز cross-service ایجاد نمی‌کند."
        }
      ],
      "edgeCase": "توکن اصیل ولی با مخاطب نامعتبر.",
      "prediction": "آیا توکن معتبر سرویس پرداخت برای سرویس سفارش هم قابل قبول است؟"
    }
  ],
  "pitfall": "JWT امضاشده محرمانه نیست؛ decode با verify فرق دارد. امضا، issuer، audience، exp، nbf در صورت وجود و سیاست الگوریتم و کلید را بررسی کنید. لغو فوری توکن ممکن است نیاز به state سمت سرور داشته باشد.",
  "takeaway": "توکن یک حامل ادعاست؛ اعتبار امضا، claims و مجوز مستقل بررسی می‌شوند.",
  "quiz": {
    "question": "Base64url کردن payload در JWT امضاشده چه تضمینی ایجاد می‌کند؟",
    "options": [
      "محرمانگی",
      "جلوگیری از خواندن با ابزار",
      "فقط کدگذاری؛ نه محرمانگی"
    ],
    "correct": 2,
    "explanation": "Base64url روش نمایش بایت‌هاست و به راحتی قابل decode است."
  },
  "references": [
    {
      "label": "RFC 7519 — JWT",
      "url": "https://www.rfc-editor.org/rfc/rfc7519.html"
    },
    {
      "label": "RFC 8725 — JWT Best Current Practices",
      "url": "https://www.rfc-editor.org/rfc/rfc8725.html"
    },
    {
      "label": "RFC 6750 — Bearer Token Usage",
      "url": "https://www.rfc-editor.org/rfc/rfc6750.html"
    },
    {
      "label": "RFC 7515 — JWS compact serialization",
      "url": "https://www.rfc-editor.org/rfc/rfc7515.html"
    }
  ],
  "field": {
    "task": "در Node.js یک payload ساختگی را به Base64url تبدیل و سپس decode کنید. این نمونه JWT کامل نیست.",
    "observe": "JSON اولیه دوباره قابل خواندن است؛ کدگذاری هیچ راز یا امضایی ایجاد نکرده است.",
    "limit": "توکن واقعی را در ابزار آنلاین یا log وارد نکنید. برای اعتبارسنجی واقعی از کتابخانهٔ استاندارد و کلید آزمایشی خودتان استفاده کنید.",
    "command": "const payload = {sub: 'demo', aud: 'orders'};\nconst encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');\nconsole.log(encoded);\nconsole.log(Buffer.from(encoded,'base64url').toString());",
    "next": {
      "slug": "sql-nosql",
      "label": "سطح سوم · SQL و NoSQL",
      "category": "databases"
    }
  }
} satisfies BackendLesson;
export default lesson;
