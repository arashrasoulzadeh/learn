import type {NetworkLesson} from './types';
const lesson = {
  "slug": "cookies-sessions",
  "title": "Cookie و Session — حفظ نشست کاربر",
  "description": "HTTP ذاتاً نشست کاربردی ندارد؛ Cookie شناسه را همراه درخواست می‌برد و سرور می‌تواند وضعیت نشست را جداگانه نگه دارد.",
  "order": 9,
  "actors": [
    {
      "label": "مرورگر",
      "sub": "Cookie jar",
      "icon": "browser"
    },
    {
      "label": "برنامهٔ وب",
      "sub": "Session handler",
      "icon": "app"
    },
    {
      "label": "مخزن نشست",
      "sub": "Session store",
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
      "id": "login",
      "label": "ورود و درخواست احراز هویت‌شده",
      "example": "Cookie: sid=opaque-demo",
      "steps": [
        {
          "name": "ارسال اطلاعات ورود",
          "short": "ورود",
          "detail": "کاربر به endpoint ورود درخواست می‌فرستد. اطلاعات نمونه صرفاً آموزشی است.",
          "route": [
            0,
            1
          ],
          "packet": "POST",
          "input": "POST /login\n{credentials: demo}",
          "output": "Credentials verified",
          "result": "سرور هویت را تأیید کرد.",
          "explanation": "کاربر وارد حساب می‌شود. سرور اعتبار اطلاعات را بررسی می‌کند؛ کوکی نشست هنوز وجود ندارد.",
          "state": [
            "—",
            "No session",
            "Credentials checked"
          ],
          "flightLabels": [
            "POST /login"
          ],
          "diagnostic": "اعتبارسنجی password verifier روی سرور است؛ نمونه اطلاعات واقعی ندارد."
        },
        {
          "name": "ساخت نشست",
          "short": "نشست",
          "detail": "برنامه یک شناسهٔ تصادفی و غیرقابل حدس تولید می‌کند و دادهٔ نشست را در مخزن سرور ذخیره می‌کند؛ مقدار اینجا نمایشی است.",
          "route": [
            1,
            2
          ],
          "packet": "SAVE",
          "input": "sid=opaque-demo",
          "output": "Session user=42 stored",
          "result": "نشست سمت سرور ساخته شد.",
          "roundTrip": true,
          "explanation": "سرور شناسهٔ تصادفی می‌سازد و user=42 را در مخزن نشست کنار آن نگه می‌دارد. این داده لازم نیست در مرورگر باشد.",
          "state": [
            "—",
            "opaque-demo → user=42",
            "Session created"
          ],
          "flightLabels": [
            "SAVE",
            "session id"
          ],
          "diagnostic": "شناسه opaque و غیرقابل‌حدس باید بعد از ورود چرخانده شود؛ state سمت سرور نگه داشته می‌شود."
        },
        {
          "name": "تنظیم Cookie",
          "short": "Set-Cookie",
          "detail": "سرور Set-Cookie را برمی‌گرداند. مرورگر در صورت پذیرش آن را نگه می‌دارد.",
          "route": [
            1,
            0
          ],
          "packet": "COOKIE",
          "input": "Set-Cookie: sid=opaque-demo; Path=/; Secure; HttpOnly; SameSite=Lax",
          "output": "Cookie stored",
          "result": "شناسه در مرورگر ذخیره شد.",
          "explanation": "Set-Cookie شناسه را به مرورگر می‌دهد. Secure ارسال روی کانال امن را محدود می‌کند، HttpOnly خواندن توسط اسکریپت را محدود می‌کند و SameSite قواعد ارسال میان‌سایتی را تغییر می‌دهد؛ هیچ‌کدام به تنهایی جلوی همهٔ CSRF یا XSS را نمی‌گیرد.",
          "state": [
            "sid=opaque-demo",
            "user=42 · valid",
            "Cookie stored"
          ],
          "flightLabels": [
            "Set-Cookie"
          ],
          "diagnostic": "Secure و HttpOnly به ترتیب انتقال امن و محدودیت خواندن JS دارند؛ SameSite روی ارسال میان‌سایتی اثر دارد."
        },
        {
          "name": "درخواست بعدی",
          "short": "Cookie",
          "detail": "مرورگر طبق محدودیت دامنه، مسیر و ویژگی‌های Cookie شناسه را همراه درخواست مناسب می‌فرستد.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /profile\nCookie: sid=opaque-demo",
          "output": "Session lookup requested",
          "result": "مرورگر دوباره گذرواژه نمی‌فرستد.",
          "explanation": "در درخواست /profile مرورگر شناسه را طبق قواعد کوکی می‌فرستد. گذرواژه دوباره فرستاده نمی‌شود.",
          "state": [
            "sid=opaque-demo",
            "user=42 · valid",
            "Lookup"
          ],
          "flightLabels": [
            "Cookie: sid"
          ],
          "diagnostic": "مرورگر فقط برای scope مجاز cookie را ارسال می‌کند؛ cookie با localStorage یکی نیست."
        },
        {
          "name": "بازیابی نشست معتبر",
          "short": "پاسخ",
          "detail": "برنامه نشست معتبر را با شناسه پیدا می‌کند و در صورت مجاز بودن پاسخ پروفایل می‌دهد.",
          "route": [
            1,
            2
          ],
          "packet": "LOOKUP",
          "input": "sid=opaque-demo",
          "output": "Session user=42; valid",
          "result": "سرور نشست معتبر را پیدا کرد.",
          "roundTrip": true,
          "tone": "success",
          "explanation": "سرور شناسه را در مخزن پیدا می‌کند و کاربر 42 را تشخیص می‌دهد؛ دسترسی همچنان باید جداگانه بررسی شود.",
          "state": [
            "sid=opaque-demo",
            "user=42 · valid",
            "Session validated"
          ],
          "flightLabels": [
            "LOOKUP",
            "valid"
          ],
          "diagnostic": "سرور انقضا، ابطال و هویت را بررسی می‌کند؛ مجوز منبع جداست."
        },
        {
          "name": "بازگشت اطلاعات پروفایل",
          "short": "پاسخ",
          "detail": "برنامه پس از احراز هویت و بررسی مجوز، پاسخ پروفایل را به مرورگر می‌فرستد.",
          "route": [
            1,
            0
          ],
          "packet": "200",
          "input": "HTTP/1.1 200 OK",
          "output": "200 OK · user=42",
          "result": "مرورگر اطلاعات مجاز حساب را دریافت کرد.",
          "explanation": "شناسه فقط برای یافتن نشست استفاده شد؛ دادهٔ پروفایل از پاسخ HTTP به مرورگر رسید، نه از Cookie.",
          "state": [
            "sid=opaque-demo",
            "user=42 · valid",
            "200 · allowed"
          ],
          "tone": "success",
          "flightLabels": [
            "200 profile"
          ],
          "diagnostic": "پاسخ دارای داده حساس را با سیاست cache مناسب محافظت کنید؛ اطلاعات نشست خام را لاگ نکنید."
        }
      ],
      "prediction": "Cookie دقیقاً چه چیزی را نگه می‌دارد؛ هویت یا شناسه؟"
    },
    {
      "id": "expired",
      "label": "نشست منقضی یا حذف‌شده",
      "example": "Cookie: sid=expired-demo",
      "steps": [
        {
          "name": "ارسال شناسهٔ قدیمی",
          "short": "درخواست",
          "detail": "مرورگر هنوز Cookie دارد، اما وجود Cookie تضمین نمی‌کند نشست سمت سرور معتبر است.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /profile\nCookie: sid=expired-demo",
          "output": "Lookup requested",
          "result": "شناسه به سرور رسید.",
          "explanation": "مرورگر یک شناسهٔ قدیمی دارد؛ داشتن آن به معنای معتبر بودن نیست.",
          "state": [
            "sid=expired-demo",
            "Expired",
            "Lookup"
          ],
          "flightLabels": [
            "Cookie: sid"
          ],
          "diagnostic": "عمر cookie مرورگر و عمر server session مستقل‌اند."
        },
        {
          "name": "نبود نشست معتبر",
          "short": "بررسی",
          "detail": "مخزن نشست داده‌ای برای این شناسه ندارد یا زمان اعتبارش گذشته است.",
          "route": [
            1,
            2
          ],
          "packet": "LOOKUP",
          "input": "sid=expired-demo",
          "output": "Session expired",
          "result": "نشست معتبر پیدا نشد.",
          "roundTrip": true,
          "tone": "error",
          "explanation": "زمان انقضا در مخزن گذشته یا شناسه حذف شده است؛ برنامه نمی‌تواند کاربر را احراز هویت کند.",
          "state": [
            "sid=expired-demo",
            "Expired",
            "Rejected"
          ],
          "flightLabels": [
            "LOOKUP",
            "expired"
          ],
          "diagnostic": "سرور باید انقضا را اعمال کند؛ صرف داشتن id کافی نیست."
        },
        {
          "name": "نیاز به ورود مجدد",
          "short": "پاسخ",
          "detail": "این API پاسخ ۴۰۱ می‌دهد و Cookie نامعتبر را پاک می‌کند؛ ورود دوباره لازم است.",
          "route": [
            1,
            0
          ],
          "packet": "401",
          "input": "HTTP/1.1 401 Unauthorized\nSet-Cookie: sid=; Max-Age=0; Path=/",
          "output": "401 Unauthorized",
          "result": "کاربر باید دوباره وارد شود.",
          "tone": "error",
          "explanation": "401 در این API یعنی اعتبار لازم موجود نیست؛ کوکی پاک می‌شود و ورود مجدد لازم است.",
          "state": [
            "—",
            "Expired",
            "401 · login"
          ],
          "flightLabels": [
            "401 + clear cookie"
          ],
          "diagnostic": "پاک‌کردن cookie سمت کلاینت مکمل رد سمت سرور است؛ پاسخ 401 واقعی باید challenge مناسب داشته باشد."
        }
      ],
      "edgeCase": "شناسه در مرورگر وجود دارد اما نشست منقضی شده.",
      "prediction": "داشتن cookie قدیمی چرا به معنی نشست معتبر نیست؟"
    },
    {
      "id": "logout",
      "label": "خروج و ابطال نشست",
      "example": "POST /logout",
      "steps": [
        {
          "name": "درخواست خروج",
          "short": "خروج",
          "detail": "کاربر با نشست معتبر درخواست خروج می‌دهد؛ در سامانهٔ واقعی حفاظت CSRF نیز لازم است.",
          "route": [
            0,
            1
          ],
          "packet": "POST",
          "input": "POST /logout\nCookie: sid=opaque-demo",
          "output": "Logout requested",
          "result": "سرور درخواست خروج را گرفت.",
          "explanation": "کاربر خروج را انتخاب می‌کند؛ سرور باید درخواست خروج را به نشست معتبر مرتبط کند.",
          "state": [
            "sid=opaque-demo",
            "Valid",
            "Logout requested"
          ],
          "flightLabels": [
            "POST /logout"
          ],
          "diagnostic": "Logout تغییر وضعیت است؛ کنترل CSRF متناسب با قرارداد لازم است."
        },
        {
          "name": "ابطال سمت سرور",
          "short": "ابطال",
          "detail": "برنامه شناسه را از مخزن نشست حذف می‌کند تا حتی نسخهٔ قدیمی Cookie قابل استفاده نباشد.",
          "route": [
            1,
            2
          ],
          "packet": "DEL",
          "input": "DELETE session opaque-demo",
          "output": "Session revoked",
          "result": "نشست دیگر معتبر نیست.",
          "roundTrip": true,
          "explanation": "حذف سمت سرور جلوی استفادهٔ مجدد از نسخهٔ کپی‌شدهٔ شناسه را می‌گیرد.",
          "state": [
            "sid=opaque-demo",
            "Revoked",
            "Rejected"
          ],
          "flightLabels": [
            "DEL",
            "revoked"
          ],
          "diagnostic": "ابطال سمت سرور باعث رد استفاده بعدی همان شناسه می‌شود."
        },
        {
          "name": "پاک کردن Cookie",
          "short": "پاسخ",
          "detail": "سرور Cookie با همان محدوده را منقضی می‌کند.",
          "route": [
            1,
            0
          ],
          "packet": "COOKIE",
          "input": "Set-Cookie: sid=; Max-Age=0; Path=/",
          "output": "Session revoked; cookie cleared",
          "result": "خروج انجام شد.",
          "tone": "success",
          "explanation": "مرورگر با Max-Age=0 کوکی را حذف می‌کند. فقط پاک کردن کوکی بدون ابطال نشست کافی نیست.",
          "state": [
            "—",
            "Revoked",
            "Logged out"
          ],
          "flightLabels": [
            "Set-Cookie Max-Age=0"
          ],
          "diagnostic": "پاک‌کردن باید domain/path همان cookie را هدف بگیرد؛ state سمت سرور نیز قبلاً ابطال شده."
        }
      ],
      "edgeCase": "ابطال نشست و پاک شدن کوکی.",
      "prediction": "اگر فقط cookie را حذف کنیم، نسخهٔ کپی‌شدهٔ شناسه چه می‌شود؟"
    },
    {
      "id": "stolen-revoked",
      "label": "استفاده از شناسه پس از ابطال",
      "example": "Cookie: sid=revoked-demo",
      "edgeCase": "نسخهٔ دیگری از کوکی پس از خروج هنوز وجود دارد.",
      "steps": [
        {
          "name": "ارسال شناسهٔ قدیمی",
          "short": "درخواست",
          "detail": "یک کلاینت نمونه نسخه‌ای از شناسهٔ قبلی را می‌فرستد.",
          "route": [
            0,
            1
          ],
          "packet": "GET",
          "input": "GET /profile\nCookie: sid=revoked-demo",
          "output": "Session lookup",
          "result": "شناسه به سرور رسید.",
          "explanation": "صرف وجود مقدار کوکی به معنی مجوز دسترسی نیست.",
          "state": [
            "sid=revoked-demo",
            "Revoked",
            "Lookup"
          ],
          "flightLabels": [
            "Cookie: revoked"
          ],
          "diagnostic": "کلاینت قابل اعتماد نیست؛ مقدار cookie صرفاً credential ارائه‌شده است."
        },
        {
          "name": "بررسی ابطال",
          "short": "نشست",
          "detail": "مخزن سرور شناسهٔ ابطال‌شده را معتبر نمی‌داند.",
          "route": [
            1,
            2
          ],
          "packet": "CHECK",
          "input": "sid=revoked-demo",
          "output": "Session revoked",
          "result": "نشست رد می‌شود.",
          "explanation": "ابطال سمت سرور جلوی استفادهٔ مجدد از شناسه را می‌گیرد.",
          "roundTrip": true,
          "tone": "error",
          "state": [
            "sid=revoked-demo",
            "Revoked",
            "Rejected"
          ],
          "flightLabels": [
            "CHECK",
            "revoked"
          ],
          "diagnostic": "سیاست ابطال باید در lookup سمت سرور اجرا شود؛ نسخه‌های cache نشست هم باید هماهنگ باشند."
        },
        {
          "name": "رد دسترسی",
          "short": "پاسخ",
          "detail": "API پاسخ 401 می‌دهد.",
          "route": [
            1,
            0
          ],
          "packet": "401",
          "input": "HTTP/1.1 401 Unauthorized",
          "output": "401 Unauthorized",
          "result": "دادهٔ خصوصی ارسال نشد.",
          "explanation": "کوکی‌های نشست باید محرمانه بمانند؛ ابطال و انقضای سمت سرور هم ضروری‌اند.",
          "tone": "error",
          "state": [
            "sid=revoked-demo",
            "Revoked",
            "401 · denied"
          ],
          "flightLabels": [
            "401"
          ],
          "diagnostic": "هیچ داده خصوصی یا مجوز تازه صادر نمی‌شود؛ نمونه پاسخ خلاصه است و challenge مناسب لازم است."
        }
      ],
      "prediction": "اگر شناسهٔ ابطال‌شده دوباره ارسال شود، چرا درخواست باید رد شود؟"
    }
  ],
  "pitfall": "Cookie همان Session نیست. HttpOnly دسترسی اسکریپت به Cookie را محدود می‌کند، Secure ارسال را به ارتباط امن محدود می‌کند و SameSite بخشی از حفاظت CSRF است؛ هیچ‌کدام جایگزین کنترل امنیت سمت سرور نیست. نمونه‌های 401 در این آزمایش خلاصهٔ پیام‌اند؛ پاسخ HTTP کامل 401 باید چالش WWW-Authenticate مناسب داشته باشد. برنامه‌های مبتنی بر فرم می‌توانند راهکار ورود دیگری انتخاب کنند.",
  "takeaway": "شناسهٔ نشست را محرمانه و تصادفی نگه دارید و اعتبار و ابطال را سمت سرور بررسی کنید.",
  "quiz": {
    "question": "اگر Cookie وجود داشته باشد ولی نشست سرور منقضی شده باشد، چه می‌شود؟",
    "options": [
      "کاربر همیشه وارد شده است",
      "سرور باید اعتبار نشست را بررسی و در صورت نامعتبر بودن رد کند",
      "مرورگر خودکار گذرواژه را می‌فرستد"
    ],
    "correct": 1,
    "explanation": "Cookie حامل شناسه است؛ اعتبار نشست به وضعیت سرور وابسته است."
  },
  "references": [
    {
      "label": "RFC 6265 — HTTP State Management",
      "url": "https://www.rfc-editor.org/rfc/rfc6265.html"
    },
    {
      "label": "OWASP — مدیریت نشست",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html"
    },
    {
      "label": "RFC 9110 — 401 و WWW-Authenticate",
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
    }
  ],
  "visual": {
    "title": "مرورگر در برابر مخزن نشست سرور",
    "labels": [
      "Cookie مرورگر",
      "مخزن Session",
      "دسترسی"
    ],
    "context": "فقط شناسهٔ نشست در مرورگر نگهداری می‌شود؛ وضعیت کاربر در این مثال سمت سرور است. دو محل را جداگانه دنبال کنید."
  },
  "teaching": {
    "goal": "محل ذخیرهٔ کوکی و نشست را مشخص کنید و اثر انقضا و ابطال را پیش‌بینی کنید.",
    "practice": {
      "question": "کاربر از دستگاه اول خارج شده و نشست سمت سرور باطل شده است. دستگاه دوم هنوز همان Cookie را دارد. سرور چه کند؟",
      "options": [
        "فقط وجود Cookie را کافی بداند",
        "شناسهٔ باطل‌شده را رد کند",
        "یک نشست جدید بدون احراز هویت بسازد"
      ],
      "correct": 1,
      "explanation": "ابطال در سرور باید استفادهٔ دوباره از همان شناسه را نامعتبر کند. وجود کوکی به تنهایی اثبات اعتبار نشست نیست.",
      "hint": "شناسهٔ مرورگر را از وضعیت معتبر سرور جدا کنید."
    },
    "terms": [
      [
        "Cookie",
        "داده‌ای که مرورگر طبق قواعد دامنه، مسیر و ویژگی‌ها نگهداری و ارسال می‌کند."
      ],
      [
        "Session",
        "وضعیت مرتبط با نشست کاربر که در این نمونه سمت سرور است."
      ],
      [
        "HttpOnly",
        "ویژگی محدودکنندهٔ خواندن کوکی از طریق APIهای اسکریپتی."
      ]
    ]
  }
} satisfies NetworkLesson;
export default lesson;
