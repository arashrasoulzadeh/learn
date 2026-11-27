import type {BackendLesson} from './types';
const lesson = {
  "slug": "authentication",
  "title": "Authentication — احراز هویت",
  "description": "بررسی اعتبار ورود، ذخیرهٔ امن گذرواژه، نشست و پاسخ به تلاش ناموفق.",
  "order": 18,
  "model": "identity",
  "actors": [
    {
      "label": "کاربر",
      "sub": "Client",
      "icon": "browser"
    },
    {
      "label": "سرویس ورود",
      "sub": "Auth service",
      "icon": "shield"
    },
    {
      "label": "مخزن حساب",
      "sub": "Password verifier",
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
    "title": "هویت و وضعیت احراز",
    "labels": [
      "درخواست ورود",
      "بررسی اعتبار",
      "نتیجهٔ هویت"
    ],
    "context": "مدل ورود با گذرواژه و نشست: گذرواژه از مسیر TLS ارسال می‌شود و سرور verifier ذخیره‌شده را بررسی می‌کند. این مثال سامانهٔ احراز هویت تولیدی نیست."
  },
  "teaching": {
    "goal": "فرایند احراز هویت را از مجوز جدا کنید و بفهمید چرا گذرواژهٔ خام نباید در پایگاه داده ذخیره شود.",
    "terms": [
      [
        "Authentication",
        "اثبات یا بررسی هویت ادعاشده."
      ],
      [
        "Password hashing",
        "مشتق‌سازی مقاوم در برابر حدس گذرواژه، با salt و هزینهٔ مناسب."
      ],
      [
        "MFA",
        "احراز هویت با چند عامل از دسته‌های مستقل."
      ],
      [
        "Rate limiting",
        "محدود کردن تلاش‌ها برای کاهش سوءاستفاده."
      ]
    ],
    "practice": {
      "question": "کاربر با گذرواژهٔ درست وارد شده، اما می‌خواهد سفارش شخص دیگری را بخواند. آیا ورود موفق به تنهایی کافی است؟",
      "options": [
        "بله؛ هر کاربر واردشده همهٔ منابع را می‌بیند",
        "خیر؛ مجوز دسترسی همان سفارش نیز باید بررسی شود",
        "بله، اگر مرورگر HTTPS داشته باشد"
      ],
      "correct": 1,
      "explanation": "احراز هویت مشخص می‌کند درخواست از طرف چه هویتی است؛ Authorization تعیین می‌کند آن هویت چه کاری مجاز است انجام دهد.",
      "hint": "هویت و اختیار دو سؤال مستقل هستند."
    }
  },
  "scenarios": [
    {
      "id": "valid",
      "label": "ورود موفق با گذرواژه",
      "example": "POST /login · TLS",
      "steps": [
        {
          "name": "ارسال اطلاعات ورود",
          "short": "ارسال اعتبار",
          "detail": "کاربر شناسه و گذرواژهٔ آزمایشی را از کانال امن می‌فرستد.",
          "route": [
            0,
            1
          ],
          "packet": "LOGIN",
          "input": "POST /login\n{username: demo, password: [redacted]}",
          "output": "Credentials received over TLS",
          "result": "سرور می‌تواند اعتبار را بررسی کند.",
          "explanation": "HTTPS از داده در مسیر محافظت می‌کند؛ سرور باید از ثبت گذرواژه در log جلوگیری کند.",
          "state": [
            "Credentials submitted",
            "Pending",
            "Anonymous"
          ]
        },
        {
          "name": "بررسی verifier ذخیره‌شده",
          "short": "بررسی گذرواژه",
          "detail": "سرویس حساب و اطلاعات hash نمک‌دار را پیدا می‌کند و با تابع اعتبارسنجی مناسب گذرواژه را بررسی می‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "VERIFY",
          "input": "verify(password, storedHash)",
          "output": "Password matches",
          "result": "اعتبار عامل ورود تأیید شد.",
          "explanation": "برای گذرواژه از الگوریتم‌های مخصوص مانند Argon2id با تنظیمات مناسب استفاده می‌شود، نه hash سریع ساده یا رمزنگاری برگشت‌پذیر. تابع verify با salt و پارامترهای ذخیره‌شده نتیجهٔ مطابقت را می‌دهد؛ salt محرمانه نیست و باید برای هر گذرواژه یکتا باشد.",
          "state": [
            "demo",
            "Password matches",
            "Identity verified"
          ],
          "roundTrip": true
        },
        {
          "name": "ایجاد نشست تازه",
          "short": "ساخت نشست",
          "detail": "سرور پس از تأیید هویت شناسهٔ نشست جدید و غیرقابل‌حدس ایجاد می‌کند.",
          "route": [
            1
          ],
          "packet": "SESSION",
          "input": "rotate/create session id",
          "output": "Session associated with user=42",
          "result": "نشست به هویت معتبر متصل شد.",
          "explanation": "چرخاندن شناسه پس از ورود به جلوگیری از session fixation کمک می‌کند.",
          "state": [
            "demo",
            "Verified",
            "Session user=42"
          ]
        },
        {
          "name": "بازگشت پاسخ ورود",
          "short": "پاسخ ورود",
          "detail": "سرور شناسهٔ نشست را با Cookie دارای ویژگی‌های مناسب به مرورگر می‌دهد.",
          "route": [
            1,
            0
          ],
          "packet": "200",
          "input": "Set-Cookie: sid=[opaque]; Secure; HttpOnly; SameSite=Lax",
          "output": "200 OK; signed in",
          "result": "مرورگر می‌تواند نشست را در درخواست مناسب استفاده کند.",
          "explanation": "مجوز منابع باید در هر درخواست مربوط بررسی شود.",
          "state": [
            "Session cookie",
            "Verified",
            "Authenticated"
          ],
          "tone": "success"
        }
      ],
      "prediction": "آیا دریافت گذرواژه به تنهایی برای ساخت نشست کافی است؟"
    },
    {
      "id": "invalid",
      "label": "گذرواژهٔ نادرست",
      "example": "POST /login · invalid credential",
      "steps": [
        {
          "name": "دریافت تلاش ورود",
          "short": "دریافت تلاش",
          "detail": "درخواست ورود با دادهٔ آزمایشی نامعتبر می‌رسد.",
          "route": [
            0,
            1
          ],
          "packet": "LOGIN",
          "input": "username=demo; password=[redacted]",
          "output": "Check requested",
          "result": "هنوز هویتی تأیید نشده.",
          "explanation": "درخواست ورود فقط ادعای هویت است؛ تا اعتبارسنجی موفق، کاربر ناشناس باقی می‌ماند.",
          "state": [
            "Credentials submitted",
            "Pending",
            "Anonymous"
          ]
        },
        {
          "name": "عدم تطابق اعتبار",
          "short": "عدم تطابق",
          "detail": "تابع بررسی گذرواژه نتیجهٔ ناموفق برمی‌گرداند.",
          "route": [
            1,
            2
          ],
          "packet": "CHECK",
          "input": "verify(password, storedHash)",
          "output": "No match",
          "result": "نشست ایجاد نمی‌شود.",
          "explanation": "پاسخ عمومی یکسان برای حساب ناموجود و گذرواژهٔ اشتباه می‌تواند افشای وجود حساب را کاهش دهد.",
          "state": [
            "demo",
            "Mismatch",
            "Anonymous"
          ],
          "roundTrip": true,
          "tone": "error"
        },
        {
          "name": "اعلام خطای عمومی",
          "short": "رد ورود",
          "detail": "این endpoint نمونه پاسخ عمومی خطای ورود برمی‌گرداند.",
          "route": [
            1,
            0
          ],
          "packet": "400",
          "input": "HTTP/1.1 400 Bad Request\n{\"error\":\"Invalid credentials\"}",
          "output": "Invalid credentials",
          "result": "هویت تأیید نشده است.",
          "explanation": "کد دقیق شکست ورود به قرارداد API بستگی دارد؛ 401 طبق HTTP نیاز به چالش مناسب دارد.",
          "state": [
            "No new cookie",
            "Rejected",
            "Anonymous"
          ],
          "tone": "error"
        }
      ],
      "edgeCase": "اطلاعات ورود نامعتبر؛ هیچ نشست جدیدی ساخته نمی‌شود.",
      "prediction": "اگر گذرواژه نامعتبر باشد، آیا باید نشست تازه ساخته شود؟"
    },
    {
      "id": "limited",
      "label": "تلاش‌های متعدد ورود",
      "example": "login rate limit",
      "steps": [
        {
          "name": "بررسی سهمیهٔ تلاش",
          "short": "بررسی سهمیه",
          "detail": "سرور پیش از محاسبهٔ پرهزینهٔ verifier سیاست محدودیت تلاش را بررسی می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "LOGIN",
          "input": "attempt count=5; window active",
          "output": "Limit reached",
          "result": "درخواست جدید موقتاً پذیرفته نمی‌شود.",
          "explanation": "محدودیت می‌تواند بر اساس حساب، IP و سیگنال‌های ریسک ترکیب شود؛ یک کلید به تنهایی کافی نیست.",
          "state": [
            "Login request",
            "Rate limit reached",
            "Anonymous"
          ]
        },
        {
          "name": "پاسخ محدودیت",
          "short": "اعلام انتظار",
          "detail": "سرویس با کد 429 و زمان انتظار نمونه پاسخ می‌دهد.",
          "route": [
            1,
            0
          ],
          "packet": "429",
          "input": "HTTP/1.1 429 Too Many Requests\nRetry-After: 30",
          "output": "429; retry later",
          "result": "بررسی گذرواژه اجرا نشد.",
          "explanation": "این سیاست نمونه است؛ قفل دائمی حساب می‌تواند خودش به ابزار محروم‌سازی از سرویس تبدیل شود.",
          "state": [
            "Throttled",
            "Wait 30 s",
            "Anonymous"
          ],
          "tone": "error"
        },
        {
          "name": "تلاش بعد از انتظار",
          "short": "تلاش دوباره",
          "detail": "پس از مهلت نمونه، درخواست تازه می‌تواند دوباره وارد مرحلهٔ بررسی اعتبار شود.",
          "route": [
            0,
            1
          ],
          "packet": "RETRY",
          "input": "new attempt after wait",
          "output": "Eligible for verification",
          "result": "هنوز احراز هویت نشده است.",
          "explanation": "گذشت زمان محدودیت، دلیل اعتبار هویت نیست؛ گذرواژه همچنان باید بررسی شود.",
          "state": [
            "New attempt",
            "Verification pending",
            "Anonymous"
          ]
        }
      ],
      "edgeCase": "تلاش‌های مکرر باید بدون افشای اعتبار حساب کنترل شوند.",
      "prediction": "آیا گذشت مهلت محدودیت نرخ، هویت کاربر را خودکار تأیید می‌کند؟"
    }
  ],
  "pitfall": "احراز هویت جایگزین مجوز نیست. hash سریع بدون salt برای ذخیرهٔ گذرواژه مناسب نیست؛ از کتابخانهٔ آزموده و سیاست MFA و مدیریت نشست استفاده کنید.",
  "takeaway": "عامل ورود را بررسی کنید، نشست امن بسازید، خطا را عمومی مدیریت کنید و مجوز را جداگانه اعمال کنید.",
  "quiz": {
    "question": "برای ذخیرهٔ گذرواژه کدام رویکرد مناسب‌تر است؟",
    "options": [
      "متن خام",
      "hash سریع ساده برای همهٔ کاربران",
      "تابع مخصوص password hashing با salt و هزینهٔ مناسب"
    ],
    "correct": 2,
    "explanation": "توابع مخصوص گذرواژه هزینهٔ حدس آفلاین را افزایش می‌دهند؛ salt یکتا از برابری مستقیم hashها جلوگیری می‌کند."
  },
  "references": [
    {
      "label": "OWASP — Authentication Cheat Sheet",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html"
    },
    {
      "label": "OWASP — Password Storage",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
    },
    {
      "label": "OWASP — Session Management",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html"
    }
  ],
  "field": {
    "task": "روی برنامهٔ آزمایشی خودتان، ورود درست و یک ورود نادرست را با حساب ساختگی امتحان کنید. در DevTools فقط status و ویژگی‌های Cookie را مشاهده کنید.",
    "observe": "ورود ناموفق نباید نشست تازه بسازد؛ ورود موفق می‌تواند شناسهٔ نشست تازه ایجاد کند.",
    "limit": "از رمز واقعی، انتشار Cookie و تلاش انبوه خودداری کنید. هیچ سرویس شخص ثالث را برای شکست ورود آزمایش نکنید.",
    "next": {
      "slug": "authorization",
      "label": "Authorization",
      "category": "software-engineering"
    }
  }
} satisfies BackendLesson;
export default lesson;
