import type {NetworkLesson} from './types';
const lesson = {
  "slug": "websocket",
  "title": "WebSocket — ارتباط دوطرفهٔ لحظه‌ای",
  "description": "برقراری WebSocket روی HTTP/1.1 و تبادل پیام دوطرفه بدون درخواست HTTP جداگانه برای هر پیام را ببینید.",
  "order": 10,
  "actors": [
    {
      "label": "مرورگر",
      "sub": "Chat client",
      "icon": "browser"
    },
    {
      "label": "شبکه",
      "sub": "TCP / TLS",
      "icon": "router"
    },
    {
      "label": "سرور WebSocket",
      "sub": "Chat service",
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
  "scenarios": [
    {
      "id": "chat",
      "label": "گفت‌وگوی زنده و پیام سرور",
      "example": "wss://chat.example/socket",
      "steps": [
        {
          "name": "درخواست ارتقای پروتکل",
          "short": "Upgrade",
          "detail": "در نمونه HTTP/1.1، مرورگر دست‌دهی WebSocket را روی اتصال امن آغاز می‌کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "UPG",
          "input": "GET /socket HTTP/1.1\nHost: chat.example\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Version: 13\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==",
          "output": "Upgrade requested",
          "result": "درخواست دست‌دهی ارسال شد."
        },
        {
          "name": "پذیرش سرور",
          "short": "۱۰۱",
          "detail": "سرور در صورت پذیرش ۱۰۱ می‌دهد و Sec-WebSocket-Accept را از کلید کلاینت و GUID استاندارد مشتق می‌کند.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "101",
          "input": "HTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=",
          "output": "WebSocket OPEN",
          "result": "اتصال به پروتکل WebSocket ارتقا یافت."
        },
        {
          "name": "پیام کلاینت",
          "short": "ارسال",
          "detail": "کلاینت یک فریم متنی می‌فرستد. در WebSocket، فریم‌های کلاینت باید mask شوند؛ masking رمزنگاری نیست.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "TEXT",
          "input": "FIN=1 opcode=0x1 MASK=1\n{\"text\":\"Hello\"}",
          "output": "Message received",
          "result": "سرور پیام را دریافت کرد."
        },
        {
          "name": "پیام مستقل سرور",
          "short": "دریافت",
          "detail": "سرور بدون درخواست HTTP تازه، فریم متنی خودش را می‌فرستد. ارتباط دوطرفه است.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "TEXT",
          "input": "FIN=1 opcode=0x1 MASK=0\n{\"text\":\"Welcome\"}",
          "output": "Server push received",
          "result": "مرورگر پیام مستقل را دریافت کرد."
        },
        {
          "name": "بستن ارتباط",
          "short": "پایان",
          "detail": "یکی از طرفین فریم Close می‌فرستد و طرف دیگر پاسخ Close می‌دهد؛ سپس اتصال بسته می‌شود.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "CLOSE",
          "input": "opcode=0x8 code=1000",
          "output": "CLOSED 1000",
          "result": "ارتباط عادی بسته شد.",
          "roundTrip": true,
          "tone": "success"
        }
      ]
    },
    {
      "id": "disconnect",
      "label": "قطع شبکه و اتصال مجدد",
      "example": "wss://chat.example/socket",
      "steps": [
        {
          "name": "ارتباط باز",
          "short": "اتصال",
          "detail": "در این نمونه دست‌دهی پیش‌تر انجام شده و WebSocket باز است.",
          "route": [
            0
          ],
          "packet": "OPEN",
          "input": "readyState=OPEN",
          "output": "Connected",
          "result": "ارتباط آمادهٔ تبادل پیام است."
        },
        {
          "name": "قطع ناگهانی شبکه",
          "short": "قطع",
          "detail": "از دست رفتن مسیر ممکن است ارتباط را بدون فریم Close پایان دهد. برنامه پس از تشخیص قطع باید واکنش نشان دهد.",
          "route": [
            0,
            1
          ],
          "packet": "LOSS",
          "input": "Transport disconnected",
          "output": "Abnormal closure (1006 locally)",
          "result": "اتصال از دست رفت.",
          "tone": "error"
        },
        {
          "name": "تلاش مجدد با فاصله",
          "short": "اتصال مجدد",
          "detail": "WebSocket به‌تنهایی سیاست اتصال مجدد یا بازپخش پیام را تضمین نمی‌کند. برنامه با backoff دوباره دست‌دهی می‌کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "UPG",
          "input": "Reconnect: new handshake",
          "output": "101 Switching Protocols",
          "result": "اتصال جدید برقرار شد.",
          "roundTrip": true
        },
        {
          "name": "همگام‌سازی پیام‌ها",
          "short": "بازیابی",
          "detail": "در این مثال برنامه شناسهٔ آخرین پیام را می‌فرستد و پیام‌های از دست رفته را از سرور درخواست می‌کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "SYNC",
          "input": "{\"lastSeenId\":42}",
          "output": "Resynced from id=43",
          "result": "بازیابی پیام با منطق برنامه انجام شد.",
          "roundTrip": true,
          "tone": "success"
        }
      ]
    },
    {
      "id": "rejected",
      "label": "رد درخواست ارتقا",
      "example": "wss://chat.example/socket",
      "steps": [
        {
          "name": "ارسال درخواست ارتقا",
          "short": "درخواست",
          "detail": "مرورگر درخواست ارتقا را همراه Origin ارسال می‌کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "UPG",
          "input": "Upgrade: websocket\nOrigin: https://untrusted.example",
          "output": "Origin check",
          "result": "سرور سیاست دسترسی را بررسی می‌کند."
        },
        {
          "name": "رد درخواست",
          "short": "۴۰۳",
          "detail": "در این نمونه سرور Origin را نمی‌پذیرد و به‌جای ۱۰۱ پاسخ HTTP ۴۰۳ می‌دهد.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "403",
          "input": "HTTP/1.1 403 Forbidden",
          "output": "WebSocket not established",
          "result": "ارتقا انجام نشد.",
          "tone": "error"
        }
      ]
    }
  ],
  "pitfall": "WebSocket برای هر پیام یک درخواست HTTP جدید نمی‌فرستد، اما همچنان نیاز به احراز هویت، کنترل Origin، مدیریت قطع ارتباط و محدودسازی منابع دارد. این نمونه دست‌دهی HTTP/1.1 را نشان می‌دهد.",
  "takeaway": "یک اتصال باز برای تبادل مستقل و دوطرفهٔ پیام فراهم می‌شود؛ بازیابی و تضمین‌های کاربردی با برنامه‌اند.",
  "quiz": {
    "question": "بعد از دست‌دهی موفق WebSocket، آیا سرور برای ارسال پیام باید منتظر GET جدید باشد؟",
    "options": [
      "بله",
      "خیر، می‌تواند مستقل پیام بفرستد",
      "فقط اگر DNS دوباره اجرا شود"
    ],
    "correct": 1,
    "explanation": "WebSocket ارتباط دوطرفه را روی اتصال برقرارشده فراهم می‌کند."
  },
  "references": [
    {
      "label": "RFC 6455 — WebSocket",
      "url": "https://www.rfc-editor.org/rfc/rfc6455.html"
    },
    {
      "label": "RFC 8441 — WebSocket over HTTP/2",
      "url": "https://www.rfc-editor.org/rfc/rfc8441.html"
    },
    {
      "label": "OWASP — امنیت WebSocket",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html"
    }
  ]
} satisfies NetworkLesson;
export default lesson;
