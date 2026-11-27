import type {NetworkLesson} from './types';
const lesson = {
  "slug": "tls-https",
  "title": "TLS و HTTPS — ارتباط امن",
  "description": "دست‌دهی کامل TLS 1.3 بدون ازسرگیری نشست و 0-RTT؛ توافق کلید، اعتبارسنجی سرور و رمزنگاری پیام HTTP.",
  "order": 6,
  "actors": [
    {
      "label": "مرورگر",
      "sub": "TLS client",
      "icon": "browser"
    },
    {
      "label": "شبکه",
      "sub": "مسیر عمومی",
      "icon": "router"
    },
    {
      "label": "سرور HTTPS",
      "sub": "TLS server",
      "icon": "shield"
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
      "id": "valid",
      "label": "گواهی معتبر و اتصال امن",
      "example": "TLS 1.3 · shop.example",
      "steps": [
        {
          "name": "آغاز دست‌دهی",
          "short": "ClientHello",
          "detail": "کلاینت نسخه‌ها و الگوریتم‌های پشتیبانی‌شده و سهم کلید را اعلام می‌کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "CH",
          "input": "ClientHello\nsupported_versions=TLS 1.3\nkey_share=client_ephemeral",
          "output": "ClientHello received",
          "result": "مذاکرهٔ TLS آغاز شد.",
          "explanation": "کلاینت نسخه‌ها و سهم کلید موقتی را معرفی می‌کند. این مرحله هنوز حاوی درخواست GET نیست.",
          "state": [
            "ClientHello",
            "Not checked",
            "Not sent"
          ],
          "flightLabels": [
            "ClientHello",
            "ClientHello"
          ],
          "diagnostic": "ClientHello پیشنهاد نسخه‌ها، cipher suites و key_share دارد؛ هنوز هویت سرور احراز نشده است."
        },
        {
          "name": "پاسخ سرور و توافق کلید",
          "short": "ServerHello",
          "detail": "سرور نسخه و مجموعهٔ رمز را انتخاب می‌کند و سهم کلید خود را می‌فرستد؛ طرفین راز مشترک را مشتق می‌کنند.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "SH",
          "input": "ServerHello\nkey_share=server_ephemeral",
          "output": "Handshake keys derived",
          "result": "کلیدهای دست‌دهی محاسبه شدند.",
          "explanation": "در دست‌دهی نمونه، دو طرف با تبادل سهم عمومی کلید موقتی و محاسبهٔ راز مشترک، کلیدهای دست‌دهی را مشتق می‌کنند؛ خود کلید خصوصی یا راز مشترک در شبکه ارسال نمی‌شود.",
          "state": [
            "Handshake keys",
            "Not checked",
            "Not sent"
          ],
          "flightLabels": [
            "ServerHello",
            "ServerHello"
          ],
          "diagnostic": "ECDHE در مدل secret مشترک می‌سازد؛ TLS 1.3 کلید handshake را مشتق می‌کند و private key در مسیر فرستاده نمی‌شود."
        },
        {
          "name": "اعتبارسنجی هویت سرور",
          "short": "گواهی",
          "detail": "پس از ServerHello، بخش احراز هویت سرور در پیام‌های رمزنگاری‌شدهٔ دست‌دهی می‌آید. مرورگر زنجیرهٔ اعتماد، نام سرویس، اعتبار زمانی و اثبات مالکیت کلید را بررسی می‌کند.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "CERT",
          "input": "Certificate: shop.example\nCertificateVerify\nFinished",
          "output": "Certificate verified",
          "result": "هویت سرور معتبر است.",
          "explanation": "مرورگر بررسی می‌کند گواهی برای shop.example صادر شده، معتبر است و سرور مالک کلید مربوط است.",
          "state": [
            "Certificate + Finished",
            "Verified",
            "Not sent"
          ],
          "flightLabels": [
            "Cert + Finished",
            "Cert + Finished"
          ],
          "diagnostic": "Certificate chain، نام میزبان، اعتبار زمانی و اثبات CertificateVerify را بررسی کنید؛ Finished transcript را احراز می‌کند."
        },
        {
          "name": "تأیید دست‌دهی",
          "short": "Finished",
          "detail": "کلاینت صحت دست‌دهی را بررسی کرده و Finished خود را می‌فرستد. کلیدهای ترافیک کاربردی مشتق می‌شوند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "FIN",
          "input": "Client Finished",
          "output": "TLS established",
          "result": "کانال امن آماده است.",
          "explanation": "در دست‌دهی کامل نمونه، Client Finished صحت دست‌دهی را تأیید می‌کند؛ کلاینت پس از این مرحله می‌تواند دادهٔ کاربردی محافظت‌شده بفرستد.",
          "state": [
            "Client Finished",
            "Verified",
            "Keys ready"
          ],
          "flightLabels": [
            "Client Finished",
            "Client Finished"
          ],
          "diagnostic": "Client Finished صحت transcript و کلید را تأیید می‌کند؛ قبل از این مرحله دادهٔ کاربردی عادی ارسال نمی‌شود."
        },
        {
          "name": "ارسال HTTP رمزنگاری‌شده",
          "short": "HTTPS",
          "detail": "دادهٔ HTTP در داخل TLS رمز می‌شود. در این مثال ناظر شبکه متن درخواست را نمی‌خواند؛ IP و اندازهٔ ترافیک ممکن است قابل مشاهده باشند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "DATA",
          "input": "GET /api/products HTTP/1.1",
          "output": "TLS application_data: ciphertext",
          "result": "HTTP داخل TLS منتقل می‌شود.",
          "tone": "success",
          "explanation": "ناظر شبکه ممکن است IP و اندازهٔ بسته را ببیند، اما متن GET داخل TLS در این نمونه قابل خواندن نیست.",
          "state": [
            "Application data",
            "Verified",
            "Encrypted HTTP"
          ],
          "flightLabels": [
            "TLS ciphertext",
            "TLS ciphertext"
          ],
          "diagnostic": "برنامه متن HTTP را در endpoint می‌بیند؛ روی شبکه TLS record رمزنگاری‌شده است. TLS جای کنترل مجوز برنامه نیست."
        }
      ],
      "prediction": "چه زمانی مجازیم HTTP را روی کانال امن بفرستیم؟"
    },
    {
      "id": "invalid",
      "label": "گواهی با نام نامعتبر",
      "example": "TLS · hostname mismatch",
      "steps": [
        {
          "name": "درخواست اتصال امن",
          "short": "ClientHello",
          "detail": "مرورگر برای shop.example دست‌دهی TLS را آغاز می‌کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "CH",
          "input": "ClientHello",
          "output": "Server receives hello",
          "result": "درخواست اتصال ارسال شد.",
          "explanation": "مرورگر قصد اتصال به shop.example را دارد، پس همین نام باید در اعتبارسنجی بررسی شود.",
          "state": [
            "ClientHello",
            "Not checked",
            "Not sent"
          ],
          "flightLabels": [
            "ClientHello",
            "ClientHello"
          ],
          "diagnostic": "ClientHello آغاز مذاکره است؛ هنوز اعتبار گواهی ثابت نشده."
        },
        {
          "name": "دریافت گواهی سرور",
          "short": "گواهی",
          "detail": "سرور گواهی‌ای ارائه می‌دهد که برای نام دیگری صادر شده است.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "CERT",
          "input": "ServerHello\nExpected: shop.example\nCertificate: other.example",
          "output": "Hostname mismatch",
          "result": "هویت مقصد تأیید نشد.",
          "tone": "error",
          "explanation": "گواهی other.example برای مقصد مورد نظر معتبر نیست. حتی اگر رمزنگاری ممکن باشد، هویت مقصد قابل اعتماد نیست. در این سناریو ServerHello و پیام‌های احراز هویت سرور در یک گام ترکیب شده‌اند.",
          "state": [
            "Certificate check",
            "Wrong hostname",
            "Blocked"
          ],
          "flightLabels": [
            "Server flight",
            "Server flight"
          ],
          "diagnostic": "ServerHello و پیام‌های احراز سرور در این گام جمع شده‌اند؛ SAN نام مورد انتظار را پوشش نمی‌دهد."
        },
        {
          "name": "متوقف کردن اتصال",
          "short": "خطا",
          "detail": "در این نمونه مرورگر اعتبارسنجی را رد می‌کند؛ نباید درخواست حساس را از این اتصال ارسال کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "ALERT",
          "input": "TLS alert / abort",
          "output": "HTTPS request blocked",
          "result": "اتصال امن برقرار نشد.",
          "tone": "error",
          "explanation": "مرورگر قبل از ارسال GET دست‌دهی را متوقف می‌کند؛ کاربر نباید هشدار اعتبار گواهی را بی‌دلیل نادیده بگیرد.",
          "state": [
            "TLS alert",
            "Rejected",
            "No HTTP"
          ],
          "flightLabels": [
            "TLS alert",
            "TLS alert"
          ],
          "diagnostic": "کلاینت باید اتصال را fail کند و دادهٔ حساس HTTP نفرستد؛ bypass بررسی hostname راه‌حل نیست."
        }
      ],
      "edgeCase": "گواهی برای نام دامنهٔ دیگری صادر شده است.",
      "prediction": "آیا رمزنگاری بدون تطابق نام سرور کافی است؟"
    },
    {
      "id": "expired",
      "label": "گواهی منقضی‌شده",
      "example": "TLS · certificate expired",
      "edgeCase": "نام دامنه درست است اما تاریخ اعتبار گواهی گذشته.",
      "steps": [
        {
          "name": "آغاز اتصال",
          "short": "Hello",
          "detail": "مرورگر دست‌دهی را شروع می‌کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "CH",
          "input": "ClientHello",
          "output": "Handshake started",
          "result": "مرورگر منتظر گواهی است.",
          "explanation": "نام درست دامنه فقط یکی از شرط‌های اعتبارسنجی است.",
          "state": [
            "ClientHello",
            "Not checked",
            "Not sent"
          ],
          "flightLabels": [
            "ClientHello",
            "ClientHello"
          ],
          "diagnostic": "دست‌دهی شروع شده ولی هنوز کانال قابل اعتماد آماده نیست."
        },
        {
          "name": "اعتبار زمانی نامعتبر",
          "short": "گواهی",
          "detail": "گواهی متعلق به نام صحیح است ولی تاریخ انقضا گذشته است.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "CERT",
          "input": "ServerHello\nCertificate: shop.example\nnotAfter: past date",
          "output": "Certificate expired",
          "result": "اعتبار گواهی رد شد.",
          "explanation": "مرورگر باید بازهٔ زمانی اعتبار را هم بررسی کند. در این سناریو ServerHello و پیام‌های احراز هویت سرور در یک گام ترکیب شده‌اند.",
          "tone": "error",
          "state": [
            "Certificate check",
            "Expired",
            "Blocked"
          ],
          "flightLabels": [
            "Server flight",
            "Server flight"
          ],
          "diagnostic": "در گام ترکیبی پاسخ سرور، notBefore/notAfter و ساعت محلی در اعتبارسنجی زنجیره مهم‌اند."
        },
        {
          "name": "توقف پیش از HTTP",
          "short": "خطا",
          "detail": "دست‌دهی پذیرفته نمی‌شود و پیام HTTP حساس ارسال نمی‌شود.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "ALERT",
          "input": "TLS alert / abort",
          "output": "HTTPS request blocked",
          "result": "کانال امن آماده نشد.",
          "explanation": "راه درست برای مدیر سرور تمدید گواهی است، نه غیرفعال کردن اعتبارسنجی.",
          "tone": "error",
          "state": [
            "TLS alert",
            "Rejected",
            "No HTTP"
          ],
          "flightLabels": [
            "TLS alert",
            "TLS alert"
          ],
          "diagnostic": "در صورت گواهی نامعتبر خطا پیش از HTTP رخ می‌دهد؛ تمدید صحیح گواهی و ساعت را بررسی کنید."
        }
      ],
      "prediction": "اگر نام درست ولی گواهی منقضی باشد چه می‌شود؟"
    }
  ],
  "pitfall": "HTTPS امنیت کامل برنامه را تضمین نمی‌کند. TLS از داده در مسیر و اعتبارسنجی هویت طرف مقابل محافظت می‌کند؛ آسیب‌پذیری سمت سرور همچنان ممکن است. این درس دست‌دهی کامل را نشان می‌دهد؛ TLS 1.3 امکان ازسرگیری و در شرایط خاص دادهٔ زودهنگام 0-RTT نیز دارد.",
  "takeaway": "HTTPS یعنی HTTP روی اتصال امن TLS؛ صرف رمز شدن بدون بررسی هویت کافی نیست.",
  "quiz": {
    "question": "چرا مرورگر نام دامنه را با گواهی مقایسه می‌کند؟",
    "options": [
      "برای انتخاب پورت UDP",
      "برای جلوگیری از پذیرش هویت سرور اشتباه",
      "برای افزایش اندازهٔ بسته"
    ],
    "correct": 1,
    "explanation": "رمزنگاری باید همراه با اعتبارسنجی هویت سرور باشد."
  },
  "references": [
    {
      "label": "RFC 9846 — استاندارد TLS 1.3 (۲۰۲۶)",
      "url": "https://www.rfc-editor.org/rfc/rfc9846.html"
    },
    {
      "label": "RFC 9110 — HTTP semantics",
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
    },
    {
      "label": "RFC 9525 — هویت سرویس TLS",
      "url": "https://www.rfc-editor.org/rfc/rfc9525.html"
    }
  ],
  "visual": {
    "title": "وضعیت هویت و کانال رمزنگاری",
    "labels": [
      "مرحلهٔ TLS",
      "اعتبار گواهی",
      "دادهٔ کاربردی"
    ],
    "context": "قفل HTTPS زمانی معنا دارد که علاوه بر رمزنگاری، هویت سرور نیز معتبر باشد. دست‌دهی را از ارسال درخواست HTTP جدا ببینید."
  },
  "teaching": {
    "goal": "توافق کلید، اعتبارسنجی گواهی و رمزنگاری پیام HTTP را از هم متمایز کنید.",
    "practice": {
      "question": "سرور اتصال رمزنگاری‌شده را پشتیبانی می‌کند، ولی گواهی نام دامنهٔ دیگری دارد. آیا باید اطلاعات ورود را ارسال کرد؟",
      "options": [
        "بله؛ رمزنگاری به‌تنهایی کافی است",
        "خیر؛ هویت مقصد تأیید نشده است",
        "بله؛ فقط پورت ۴۴۳ مهم است"
      ],
      "correct": 1,
      "explanation": "رمزنگاری بدون اعتبارسنجی هویت مقصد کافی نیست. نام سرویس و زنجیرهٔ اعتماد باید مطابق سیاست کلاینت بررسی شوند.",
      "hint": "قفل ارتباط و هویت طرف مقابل دو مفهوم متفاوت‌اند."
    },
    "terms": [
      [
        "Handshake",
        "تبادل پیام برای توافق پارامترها، کلیدها و احراز هویت."
      ],
      [
        "Certificate",
        "سند هویت و کلید عمومی سرویس."
      ],
      [
        "Ciphertext",
        "دادهٔ رمزنگاری‌شده در مسیر."
      ],
      [
        "Forward secrecy",
        "با تبادل کلید موقتی مناسب، افشای بعدی کلید بلندمدت سرور به‌تنهایی نباید ارتباط‌های گذشته را آشکار کند."
      ]
    ]
  }
} satisfies NetworkLesson;
export default lesson;
