import type {NetworkLesson} from './types';
const lesson = {
  "slug": "tcp",
  "title": "TCP — انتقال قابل‌اعتماد",
  "description": "دست‌دهی سه‌مرحله‌ای، شمارهٔ توالی، تأیید دریافت و ارسال مجدد را در عمل ببینید.",
  "order": 4,
  "actors": [
    {
      "label": "کلاینت",
      "sub": "Sender",
      "icon": "browser"
    },
    {
      "label": "شبکه",
      "sub": "مسیر انتقال",
      "icon": "router"
    },
    {
      "label": "سرور",
      "sub": "Receiver",
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
      "id": "normal",
      "label": "اتصال و تحویل عادی",
      "example": "TCP · seq / ack",
      "steps": [
        {
          "name": "درخواست اتصال",
          "short": "SYN",
          "detail": "کلاینت شمارهٔ توالی آغازین خود را می‌فرستد.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "SYN",
          "input": "SYN seq=100",
          "output": "Server receives SYN",
          "result": "مرحلهٔ اول دست‌دهی.",
          "explanation": "کلاینت با SYN و seq=100 می‌گوید می‌خواهد اتصال بسازد. هنوز دادهٔ کاربردی ارسال نشده است.",
          "state": [
            "SYN seq=100",
            "101",
            "SYN-SENT · awaiting SYN-ACK"
          ],
          "flightLabels": [
            "SYN seq=100",
            "SYN seq=100"
          ],
          "diagnostic": "SYN یک شمارهٔ توالی مصرف می‌کند؛ شماره بعدی 101 است. هنوز payload برنامه نداریم."
        },
        {
          "name": "تأیید و همگام‌سازی",
          "short": "SYN-ACK",
          "detail": "سرور SYN کلاینت را تأیید و شمارهٔ توالی آغازین خودش را اعلام می‌کند.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "SYN-ACK",
          "input": "SYN, ACK seq=500 ack=101",
          "output": "Client receives SYN-ACK",
          "result": "مرحلهٔ دوم دست‌دهی.",
          "explanation": "سرور با ack=101 اعلام می‌کند SYN کلاینت را گرفته و با seq=500 شمارهٔ شروع خودش را معرفی می‌کند.",
          "state": [
            "SYN-ACK seq=500 ack=101",
            "101",
            "SYN-ACK received · ACK pending"
          ],
          "flightLabels": [
            "SYN-ACK",
            "SYN-ACK"
          ],
          "diagnostic": "سرور ISN=500 را معرفی و SYN کلاینت را با ack=101 تأیید می‌کند."
        },
        {
          "name": "تأیید نهایی",
          "short": "ACK",
          "detail": "کلاینت SYN سرور را تأیید می‌کند. SYN یک شمارهٔ توالی مصرف می‌کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "ACK",
          "input": "ACK seq=101 ack=501",
          "output": "ESTABLISHED",
          "result": "اتصال برقرار شد.",
          "explanation": "ACK با ack=501 به سرور خبر می‌دهد SYN آن هم دریافت شده است. SYN از هر طرف یک شمارهٔ توالی مصرف می‌کند؛ با تکمیل دست‌دهی، شمارهٔ نخستین بایت کلاینت 101 است.",
          "state": [
            "ACK seq=101 ack=501",
            "101",
            "ESTABLISHED"
          ],
          "flightLabels": [
            "ACK ack=501",
            "ACK ack=501"
          ],
          "diagnostic": "ACK بدون داده شمارهٔ توالی تازه مصرف نمی‌کند؛ بعد از رسیدن این ACK هر دو طرف established هستند."
        },
        {
          "name": "ارسال داده",
          "short": "داده",
          "detail": "چهار بایت داده با شمارهٔ توالی ۱۰۱ ارسال می‌شود.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "DATA",
          "input": "seq=101 len=4\nPING",
          "output": "Bytes 101–104 received",
          "result": "داده به گیرنده رسید.",
          "explanation": "PING چهار بایت است؛ از 101 شروع می‌شود و آخرین بایت شمارهٔ 104 را دارد.",
          "state": [
            "DATA seq=101 len=4",
            "105",
            "Awaiting ACK"
          ],
          "flightLabels": [
            "DATA 4B",
            "DATA 4B"
          ],
          "diagnostic": "بازه [101,105) را در Seq/Len ببینید؛ TCP مرز پیام‌های برنامه را حفظ نمی‌کند."
        },
        {
          "name": "تأیید دریافت",
          "short": "تأیید",
          "detail": "ACK تجمعی شمارهٔ بایت بعدی مورد انتظار را نشان می‌دهد.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "ACK",
          "input": "ACK ack=105",
          "output": "ACK 105",
          "result": "ارسال‌کننده از دریافت چهار بایت آگاه شد.",
          "tone": "success",
          "explanation": "ACK=105 یعنی سرور تا 104 را به ترتیب دریافت کرده و منتظر 105 است؛ نه اینکه برنامه حتماً PING را پردازش کرده باشد.",
          "state": [
            "ACK=105",
            "105",
            "4 bytes acknowledged"
          ],
          "flightLabels": [
            "ACK 105",
            "ACK 105"
          ],
          "diagnostic": "ACK تجمعی یعنی دریافت همهٔ بایت‌های تا 104؛ به معنی اجرای منطق کاربردی یا commit نیست."
        }
      ],
      "prediction": "SYN و ACK شمارهٔ توالی را چگونه تغییر می‌دهند؟"
    },
    {
      "id": "loss",
      "label": "از دست رفتن بسته و ارسال مجدد",
      "example": "TCP · retransmission",
      "steps": [
        {
          "name": "اتصال از قبل برقرار است",
          "short": "اتصال",
          "detail": "در این سناریو دست‌دهی کامل شده و ارسال‌کننده چهار بایت جدید دارد.",
          "route": [
            0
          ],
          "packet": "TCP",
          "input": "ESTABLISHED\nseq=101",
          "output": "Ready to send",
          "result": "اتصال آماده است.",
          "explanation": "برای تمرکز بر ارسال مجدد، فرض می‌کنیم دست‌دهی قبلاً انجام شده و شمارهٔ بعدی 101 است.",
          "state": [
            "ESTABLISHED",
            "101",
            "Ready"
          ],
          "flightLabels": [
            "ready"
          ],
          "diagnostic": "این سناریو اتصال برقرار را مفروض می‌گیرد؛ handshake دوباره لازم نیست."
        },
        {
          "name": "بسته در شبکه گم می‌شود",
          "short": "افت",
          "detail": "TCP نمی‌تواند مانع از دست رفتن بسته در IP شود. در این مثال داده پیش از رسیدن به سرور گم می‌شود.",
          "route": [
            0,
            1
          ],
          "packet": "LOSS",
          "input": "seq=101 len=4",
          "output": "Packet lost",
          "result": "تأیید دریافت نمی‌رسد.",
          "tone": "error",
          "explanation": "چهار بایت در شبکه گم می‌شود؛ فرستنده ACK مورد انتظار را نمی‌گیرد و نمی‌تواند فرض کند تحویل انجام شده.",
          "state": [
            "DATA seq=101 len=4 · lost",
            "101",
            "Awaiting ACK"
          ],
          "flightLabels": [
            "DATA lost"
          ],
          "diagnostic": "افت در شبکه قبل از گیرنده است، پس ACK مورد انتظار و بافر گیرنده جلو نمی‌روند.",
          "drop": true
        },
        {
          "name": "پایان مهلت ارسال مجدد",
          "short": "انتظار",
          "detail": "ارسال‌کننده پس از مهلت RTO دوباره تلاش می‌کند؛ الگوریتم‌های واقعی زمان را تنظیم می‌کنند.",
          "route": [
            0
          ],
          "packet": "RTO",
          "input": "No ACK for seq=101",
          "output": "Retransmission timeout",
          "result": "ارسال مجدد لازم است.",
          "explanation": "زمان‌سنج RTO منقضی می‌شود. در عمل TCP زمان‌سنج را بر اساس RTT و الگوریتم کنترل ازدحام تنظیم می‌کند.",
          "state": [
            "RTO",
            "101",
            "Retransmit"
          ],
          "flightLabels": [
            "RTO"
          ],
          "diagnostic": "RTO از تخمین RTT و تغییرات آن می‌آید؛ زمان انیمیشن معادل RTO واقعی نیست."
        },
        {
          "name": "ارسال دوبارهٔ داده",
          "short": "ارسال",
          "detail": "TCP همان محدودهٔ شمارهٔ توالی را دوباره می‌فرستد تا داده دوبار به برنامه تحویل نشود.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "DATA",
          "input": "seq=101 len=4 (retry)",
          "output": "Bytes received",
          "result": "گیرنده داده را دریافت کرد.",
          "explanation": "همان داده با همان seq=101 دوباره ارسال می‌شود. گیرنده با شماره‌ها می‌تواند نسخهٔ تکراری را تشخیص دهد.",
          "state": [
            "DATA seq=101 len=4 · retry",
            "105",
            "Awaiting ACK"
          ],
          "flightLabels": [
            "DATA retry",
            "DATA retry"
          ],
          "diagnostic": "بازفرستادن همان بازهٔ بایت است؛ دادهٔ جدید با sequence تازه محسوب نمی‌شود."
        },
        {
          "name": "تأیید موفق",
          "short": "تأیید",
          "detail": "گیرنده ACK 105 را می‌فرستد. TCP جریان مرتب بایت را به برنامه تحویل می‌دهد.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "ACK",
          "input": "ACK ack=105",
          "output": "ACK 105 after retry",
          "result": "داده پس از تلاش مجدد تحویل شد.",
          "tone": "success",
          "explanation": "ACK=105 تأیید می‌کند چهار بایت تحویل لایهٔ TCP شده‌اند. ارسال دوبارهٔ یک بسته به معنای اجرای دوبارهٔ عملیات برنامه نیست.",
          "state": [
            "ACK=105",
            "105",
            "Acknowledged"
          ],
          "flightLabels": [
            "ACK 105",
            "ACK 105"
          ],
          "diagnostic": "گیرنده بایت‌های پیوسته را تأیید می‌کند؛ فرستنده می‌تواند آن بازه را از صف retransmission حذف کند."
        }
      ],
      "edgeCase": "گم شدن داده و ارسال مجدد پس از timeout.",
      "prediction": "در صورت افت، چرا Seq ارسال مجدد همان مقدار قبلی است؟"
    },
    {
      "id": "duplicate",
      "label": "ACK گم‌شده و دادهٔ تکراری",
      "example": "seq=101 · ACK lost",
      "edgeCase": "داده تحویل شده اما ACK گم می‌شود؛ گیرنده تکرار را تشخیص می‌دهد.",
      "steps": [
        {
          "name": "داده تحویل می‌شود",
          "short": "داده",
          "detail": "چهار بایت به گیرنده می‌رسد.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "DATA",
          "input": "seq=101 len=4",
          "output": "Bytes 101–104 received",
          "result": "گیرنده داده را دارد.",
          "explanation": "فرستنده هنوز ACK را ندیده، اما گیرنده قبلاً داده را تحویل TCP داده است.",
          "state": [
            "DATA seq=101 len=4",
            "105",
            "Awaiting ACK"
          ],
          "flightLabels": [
            "DATA 4B",
            "DATA 4B"
          ],
          "diagnostic": "گیرنده داده را تحویل می‌دهد؛ هنوز تأیید به فرستنده نرسیده."
        },
        {
          "name": "ACK در مسیر گم می‌شود",
          "short": "افت",
          "detail": "تأیید دریافت پیش از رسیدن به کلاینت گم می‌شود.",
          "route": [
            2,
            1
          ],
          "packet": "ACK",
          "input": "ACK ack=105",
          "output": "ACK lost",
          "result": "فرستنده از تحویل خبر ندارد.",
          "explanation": "گم شدن ACK با گم شدن خود داده یکی نیست.",
          "tone": "error",
          "state": [
            "ACK=105 · lost",
            "105",
            "No ACK received"
          ],
          "flightLabels": [
            "ACK lost"
          ],
          "diagnostic": "ACK از گیرنده خارج شده اما در مسیر حذف می‌شود؛ وضعیت دو endpoint یکسان نیست.",
          "drop": true
        },
        {
          "name": "ارسال دوباره",
          "short": "تکرار",
          "detail": "پس از timeout فرستنده همان محدوده را می‌فرستد.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "DATA",
          "input": "seq=101 len=4 (retry)",
          "output": "Duplicate bytes discarded",
          "result": "گیرنده بایت‌ها را دوباره تحویل برنامه نمی‌دهد.",
          "explanation": "شمارهٔ توالی مشخص می‌کند این چهار بایت قبلاً دریافت شده‌اند.",
          "state": [
            "DATA seq=101 len=4 · retry",
            "105",
            "Duplicate discarded"
          ],
          "flightLabels": [
            "DATA retry",
            "DATA retry"
          ],
          "diagnostic": "گیرنده از شماره‌های توالی تشخیص می‌دهد بازه قبلاً دریافت شده؛ تحویل تکراری برنامه لازم نیست."
        },
        {
          "name": "تأیید مجدد",
          "short": "تأیید",
          "detail": "گیرنده دوباره شمارهٔ بعدی مورد انتظار را اعلام می‌کند.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "ACK",
          "input": "ACK ack=105",
          "output": "ACK 105; no duplicate delivery",
          "result": "تحویل تکراری به برنامه رخ نداد.",
          "explanation": "TCP تکرار بایت را مدیریت می‌کند؛ تکرار درخواست HTTP در سطح برنامه موضوع جداگانه‌ای است.",
          "tone": "success",
          "state": [
            "ACK=105",
            "105",
            "Acknowledged"
          ],
          "flightLabels": [
            "ACK 105",
            "ACK 105"
          ],
          "diagnostic": "ACK دوباره همان next expected byte را اعلام می‌کند؛ TCP از duplicate delivery جریان جلوگیری می‌کند."
        }
      ],
      "prediction": "اگر فقط ACK گم شود، آیا برنامه داده را دوباره می‌گیرد؟"
    }
  ],
  "pitfall": "TCP مرز پیام‌های برنامه را حفظ نمی‌کند؛ جریان بایت است. ACK دریافت TCP را نشان می‌دهد، نه موفقیت عملیات کسب‌وکار.",
  "takeaway": "شماره‌های توالی، ACK و ارسال مجدد قابلیت اطمینان TCP را فراهم می‌کنند.",
  "quiz": {
    "question": "ACK=105 پس از ارسال چهار بایت از seq=101 به چه معناست؟",
    "options": [
      "گیرنده بایت ۱۰۵ را هم دریافت کرده",
      "بایت بعدی مورد انتظار ۱۰۵ است",
      "کلاینت باید پورت ۱۰۵ را باز کند"
    ],
    "correct": 1,
    "explanation": "ACK تجمعی TCP شمارهٔ بعدی مورد انتظار را اعلام می‌کند."
  },
  "references": [
    {
      "label": "RFC 9293 — TCP",
      "url": "https://www.rfc-editor.org/rfc/rfc9293.html"
    },
    {
      "label": "RFC 6298 — زمان ارسال مجدد",
      "url": "https://www.rfc-editor.org/rfc/rfc6298.html"
    }
  ],
  "visual": {
    "title": "دفتر شمارهٔ توالی و تأیید",
    "labels": [
      "پیام روی مسیر",
      "بایت بعدی مورد انتظار سرور",
      "وضعیت فرستنده"
    ],
    "context": "TCP بایت‌ها را شماره‌گذاری می‌کند تا بداند چه چیزی به مقصد رسیده و چه چیزی باید دوباره فرستاده شود. ACK دریافت لایهٔ انتقال است، نه موفقیت منطق برنامه."
  },
  "teaching": {
    "goal": "از شمارهٔ توالی و ACK نتیجه بگیرید کدام بایت‌ها رسیده‌اند و ارسال مجدد چه زمانی لازم است.",
    "practice": {
      "question": "فرستنده شش بایت از seq=200 می‌فرستد. گیرنده همه را به ترتیب می‌گیرد. ACK تجمعی بعدی چه عددی است؟",
      "options": [
        "200",
        "205",
        "206"
      ],
      "correct": 2,
      "explanation": "بایت‌ها شمارهٔ ۲۰۰ تا ۲۰۵ دارند. ACK شمارهٔ بایت بعدی مورد انتظار یعنی ۲۰۶ را اعلام می‌کند.",
      "hint": "ACK شمارهٔ آخرین بایت دریافت‌شده نیست."
    },
    "terms": [
      [
        "Sequence number",
        "شمارهٔ موقعیت بایت در جریان TCP."
      ],
      [
        "ACK",
        "تأیید تجمعی شمارهٔ بایت بعدی مورد انتظار."
      ],
      [
        "RTO",
        "مهلت ارسال مجدد در صورت نرسیدن تأیید."
      ],
      [
        "Byte stream",
        "جریان مرتب بایت‌ها؛ TCP مرز پیام‌های برنامه را حفظ نمی‌کند."
      ]
    ]
  }
} satisfies NetworkLesson;
export default lesson;
