import type {NetworkLesson} from './types';
const lesson = {
  "slug": "tls-https",
  "title": "TLS و HTTPS — ارتباط امن",
  "description": "در یک اتصال TLS 1.3، توافق کلید، اعتبارسنجی هویت سرور و رمزنگاری پیام HTTP را مشاهده کنید.",
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
          "result": "مذاکرهٔ TLS آغاز شد."
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
          "result": "کلیدهای دست‌دهی محاسبه شدند."
        },
        {
          "name": "اعتبارسنجی هویت سرور",
          "short": "گواهی",
          "detail": "در TLS 1.3 پیام‌های Certificate و CertificateVerify و Finished سرور تحت کلید دست‌دهی محافظت می‌شوند. مرورگر زنجیره، نام دامنه و اعتبار گواهی را بررسی می‌کند.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "CERT",
          "input": "Certificate: shop.example\nCertificateVerify\nFinished",
          "output": "Certificate verified",
          "result": "هویت سرور معتبر است."
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
          "result": "کانال امن آماده است."
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
          "tone": "success"
        }
      ]
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
          "result": "درخواست اتصال ارسال شد."
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
          "input": "Expected: shop.example\nCertificate: other.example",
          "output": "Hostname mismatch",
          "result": "هویت مقصد تأیید نشد.",
          "tone": "error"
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
          "tone": "error"
        }
      ]
    }
  ],
  "pitfall": "HTTPS امنیت کامل برنامه را تضمین نمی‌کند. TLS از داده در مسیر و اعتبارسنجی هویت طرف مقابل محافظت می‌کند؛ آسیب‌پذیری سمت سرور همچنان ممکن است.",
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
      "label": "RFC 8446 — TLS 1.3",
      "url": "https://www.rfc-editor.org/rfc/rfc8446.html"
    },
    {
      "label": "RFC 9110 — HTTP semantics",
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
    },
    {
      "label": "RFC 9525 — هویت سرویس TLS",
      "url": "https://www.rfc-editor.org/rfc/rfc9525.html"
    }
  ]
} satisfies NetworkLesson;
export default lesson;
