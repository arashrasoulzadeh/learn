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
      "label": "سرور چت",
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
          "result": "درخواست دست‌دهی ارسال شد.",
          "explanation": "برنامهٔ چت با GET و Upgrade می‌خواهد ارتباط HTTP/1.1 را به WebSocket تبدیل کند؛ کلید نمونهٔ استاندارد در سرآیند است.",
          "state": [
            "CONNECTING",
            "Upgrade",
            "HTTP handshake"
          ],
          "flightLabels": [
            "HTTP Upgrade",
            "HTTP Upgrade"
          ],
          "diagnostic": "در مدل HTTP/1.1 سرآیند Upgrade و Key برای دست‌دهی هستند؛ Key secret احراز هویت نیست."
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
          "result": "اتصال به پروتکل WebSocket ارتقا یافت.",
          "explanation": "101 و Sec-WebSocket-Accept دست‌دهی را تکمیل می‌کنند. دیگر برای هر پیام چت GET جداگانه نداریم.",
          "state": [
            "OPEN",
            "101",
            "Upgrade accepted"
          ],
          "flightLabels": [
            "101 Switching",
            "101 Switching"
          ],
          "diagnostic": "Sec-WebSocket-Accept از Key و GUID ساخته می‌شود؛ بعد از پاسخ موفق فریم‌های WebSocket مبادله می‌شوند."
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
          "result": "سرور پیام را دریافت کرد.",
          "explanation": "مرورگر فریم Hello را روی اتصال باز می‌فرستد. mask بودن فریم کلاینت جای TLS را نمی‌گیرد.",
          "state": [
            "OPEN",
            "Hello",
            "Client → server"
          ],
          "flightLabels": [
            "TEXT masked",
            "TEXT masked"
          ],
          "diagnostic": "کلاینت فریم را mask می‌کند؛ masking رمزنگاری نیست و WSS همچنان TLS لازم دارد."
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
          "result": "مرورگر پیام مستقل را دریافت کرد.",
          "explanation": "سرور Welcome را روی همان اتصال می‌فرستد، حتی اگر کلاینت درخواست تازه‌ای نداده باشد.",
          "state": [
            "OPEN",
            "Welcome",
            "Server → client"
          ],
          "flightLabels": [
            "TEXT unmasked",
            "TEXT unmasked"
          ],
          "diagnostic": "سرور می‌تواند مستقل push کند؛ فریم سرور mask نمی‌شود."
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
          "tone": "success",
          "explanation": "فریم Close با کد 1000 پایان عادی را اعلام می‌کند؛ طرف مقابل در صورت نفرستادن Close، پاسخ Close می‌دهد و اتصال انتقال بسته می‌شود. 1006 وضعیت محلی قطع غیرعادی است و نباید در فریم Close فرستاده شود.",
          "state": [
            "CLOSED",
            "1000",
            "Close handshake"
          ],
          "flightLabels": [
            "CLOSE",
            "CLOSE",
            "CLOSE",
            "CLOSE"
          ],
          "diagnostic": "دو طرف close frame ردوبدل می‌کنند؛ پایان TCP جداست و 1000 کد پایان عادی است."
        }
      ],
      "prediction": "بعد از 101 آیا برای هر پیام باید HTTP GET بفرستیم؟"
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
          "result": "ارتباط آمادهٔ تبادل پیام است.",
          "explanation": "برنامهٔ چت پیش‌تر اتصال باز دارد و پیام‌ها ردوبدل می‌شوند.",
          "state": [
            "OPEN",
            "—",
            "Ready"
          ],
          "flightLabels": [
            "OPEN"
          ],
          "diagnostic": "readyState فقط وضعیت محلی سوکت است و تحویل پیام را تأیید نمی‌کند."
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
          "tone": "error",
          "explanation": "در قطع ناگهانی شبکه فریم Close ممکن است اصلاً نرسد. 1006 وضعیت محلی است و روی سیم ارسال نمی‌شود.",
          "state": [
            "CLOSED",
            "1006 (local)",
            "Transport lost"
          ],
          "flightLabels": [
            "transport loss"
          ],
          "diagnostic": "1006 وضعیت محلی abnormal closure است؛ روی wire به عنوان close code ارسال نمی‌شود.",
          "drop": true
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
          "roundTrip": true,
          "explanation": "برنامه با فاصلهٔ زمانی افزایشی اتصال تازه می‌سازد تا هنگام خرابی سرور فشار بیهوده وارد نکند.",
          "state": [
            "OPEN",
            "101",
            "New handshake"
          ],
          "flightLabels": [
            "Upgrade",
            "Upgrade",
            "101",
            "101"
          ],
          "diagnostic": "اتصال تازه دست‌دهی تازه دارد؛ backoff و jitter از هجوم reconnect جلوگیری می‌کنند."
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
          "tone": "success",
          "explanation": "با آخرین شناسهٔ پیام 42، برنامه پیام‌های بعدی را بازیابی می‌کند؛ این قابلیت را خود WebSocket تضمین نمی‌کند.",
          "state": [
            "OPEN",
            "lastSeenId=42",
            "App sync"
          ],
          "flightLabels": [
            "SYNC request",
            "SYNC request",
            "replay",
            "replay"
          ],
          "diagnostic": "شناسهٔ آخرین پیام و قرارداد resync لازم است؛ سرور ممکن است تاریخچه کافی نداشته باشد."
        }
      ],
      "edgeCase": "قطع ناگهانی و بازیابی ارتباط با منطق برنامه.",
      "prediction": "آیا reconnect خودبه‌خود پیام‌های گم‌شده را بازیابی می‌کند؟"
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
          "result": "سرور سیاست دسترسی را بررسی می‌کند.",
          "explanation": "سرور Origin را بررسی می‌کند تا اتصال از صفحهٔ نامجاز را رد کند.",
          "state": [
            "CONNECTING",
            "Upgrade",
            "Origin check"
          ],
          "flightLabels": [
            "Upgrade",
            "Upgrade"
          ],
          "diagnostic": "Origin برای کاهش درخواست cross-site در مرورگر مهم است؛ authentication و authorization مستقل‌اند."
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
          "tone": "error",
          "explanation": "403 پاسخ HTTP است؛ چون 101 دریافت نشده، هیچ اتصال WebSocket باز نشده است.",
          "state": [
            "CLOSED",
            "403",
            "No upgrade"
          ],
          "flightLabels": [
            "403",
            "403"
          ],
          "diagnostic": "چون دست‌دهی موفق نشد، هیچ WebSocket frame قابل تبادل نیست."
        }
      ],
      "edgeCase": "درخواست ارتقا با 403 رد می‌شود.",
      "prediction": "Origin check چه ارتباطی با احراز هویت WebSocket دارد؟"
    },
    {
      "id": "heartbeat",
      "label": "ارتباط ظاهراً باز ولی بی‌پاسخ",
      "example": "WebSocket · heartbeat timeout",
      "edgeCase": "مسیر نیمه‌قطع شده و برنامه پاسخ heartbeat دریافت نمی‌کند.",
      "steps": [
        {
          "name": "ارسال heartbeat",
          "short": "Ping",
          "detail": "سرور فریم Ping روی اتصال موجود می‌فرستد.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "PING",
          "input": "opcode=0x9",
          "output": "Pong expected",
          "result": "سرور منتظر پاسخ است.",
          "explanation": "فریم Ping/Pong استاندارد است؛ API مرورگر معمولاً فریم کنترل را خودش مدیریت می‌کند.",
          "state": [
            "OPEN",
            "Ping",
            "Await Pong"
          ],
          "flightLabels": [
            "PING",
            "PING"
          ],
          "diagnostic": "در پروتکل WebSocket ping/pong فریم کنترلی‌اند؛ API مرورگر raw ping را به JS نمی‌دهد."
        },
        {
          "name": "پاسخ نمی‌رسد",
          "short": "انتظار",
          "detail": "در این مدل مرورگر به Ping با Pong پاسخ داده اما پیام در مسیر شبکه گم می‌شود؛ سرور پس از مهلت نمونه timeout را تشخیص می‌دهد.",
          "route": [
            0,
            1
          ],
          "packet": "LOSS",
          "input": "Pong frame lost in transit\nNo Pong received",
          "output": "Heartbeat timeout",
          "result": "ارتباط سالم فرض نمی‌شود.",
          "explanation": "حتی اگر سوکت ظاهراً باز باشد، timeout heartbeat می‌تواند مشکل را آشکار کند.",
          "tone": "error",
          "state": [
            "Unresponsive",
            "No Pong",
            "Timeout"
          ],
          "flightLabels": [
            "Pong lost"
          ],
          "diagnostic": "فرض این trace افت پاسخ در شبکه است؛ timeout می‌تواند از تأخیر هم ناشی شود.",
          "drop": true
        },
        {
          "name": "اتصال تازه",
          "short": "بازیابی",
          "detail": "پس از تشخیص قطع، برنامه اتصال تازه را برقرار می‌کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "UPG",
          "input": "Reconnect with backoff",
          "output": "101 Switching Protocols",
          "result": "ارتباط تازه باز شد.",
          "explanation": "در صورت نیاز پیام‌های از دست‌رفته با شناسه و ذخیرهٔ کاربردی بازیابی می‌شوند.",
          "roundTrip": true,
          "tone": "success",
          "state": [
            "OPEN",
            "101",
            "Reconnect"
          ],
          "flightLabels": [
            "Upgrade",
            "Upgrade",
            "101",
            "101"
          ],
          "diagnostic": "reconnect را محدود و با backoff انجام دهید؛ state و subscriptionها را دوباره برقرار کنید."
        }
      ],
      "prediction": "اگر Pong نرسد، آیا قطع قطعی اتصال ثابت می‌شود؟"
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
  ],
  "visual": {
    "title": "حالت اتصال و پیام‌های رفت‌وبرگشت",
    "labels": [
      "وضعیت سوکت",
      "آخرین پیام",
      "نوع تبادل"
    ],
    "context": "در یک چت زنده، بعد از دست‌دهی، سرور و مرورگر مستقل پیام می‌فرستند. قطع شبکه و اتصال مجدد نیاز به منطق برنامه دارند."
  },
  "teaching": {
    "goal": "تفاوت دست‌دهی، پیام دوطرفه و بازیابی پس از قطع ارتباط را توضیح دهید.",
    "practice": {
      "question": "پس از قطع WebSocket، اتصال تازه برقرار شده است. پیام‌های زمان قطعی چه می‌شوند؟",
      "options": [
        "همه حتماً توسط WebSocket بازیابی می‌شوند",
        "TCP خودکار پیام‌های اتصال قبلی را بازپخش می‌کند",
        "بازیابی به شناسهٔ پیام و منطق ذخیره و همگام‌سازی برنامه بستگی دارد"
      ],
      "correct": 2,
      "explanation": "اتصال جدید ادامهٔ خودکار پیام‌های اتصال قبلی نیست. برنامه باید بازیابی پیام و جلوگیری از تکرار را طراحی کند.",
      "hint": "اتصال مجدد را از تحویل پیام در سطح برنامه جدا کنید."
    },
    "terms": [
      [
        "Upgrade",
        "درخواست تغییر پروتکل در دست‌دهی HTTP/1.1."
      ],
      [
        "Frame",
        "واحد انتقال WebSocket؛ یک پیام ممکن است چند فریم داشته باشد."
      ],
      [
        "Heartbeat",
        "پیام یا سازوکار بررسی زنده بودن ارتباط."
      ],
      [
        "Backoff",
        "افزایش فاصلهٔ زمانی تلاش‌های اتصال مجدد برای جلوگیری از فشار هم‌زمان کلاینت‌ها."
      ]
    ]
  }
} satisfies NetworkLesson;
export default lesson;
