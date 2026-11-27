import type {NetworkLesson} from './types';
const lesson = {
  "slug": "udp",
  "title": "UDP — انتقال سبک و بدون اتصال",
  "description": "دیتاگرام UDP مستقل است؛ پروتکل تحویل، ترتیب یا ارسال مجدد را تضمین نمی‌کند. کاربرد در صدا و بازی را مقایسه کنید.",
  "order": 5,
  "actors": [
    {
      "label": "فرستنده",
      "sub": "Live audio",
      "icon": "browser"
    },
    {
      "label": "شبکه",
      "sub": "IP network",
      "icon": "router"
    },
    {
      "label": "گیرنده",
      "sub": "Audio player",
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
      "label": "انتقال عادی صدای زنده",
      "example": "UDP · 3 datagrams",
      "steps": [
        {
          "name": "ساخت دیتاگرام",
          "short": "آماده‌سازی",
          "detail": "برنامه یک قطعهٔ صدا را با شمارهٔ کاربردی ۱ به UDP می‌دهد. UDP خودش شمارهٔ توالی کاربردی ندارد.",
          "route": [
            0
          ],
          "packet": "UDP",
          "input": "src=50000 dst=5004\nframe=1",
          "output": "Datagram ready",
          "result": "بدون دست‌دهی انتقال آماده است.",
          "explanation": "برنامه برای هر قطعهٔ صدا یک شماره می‌گذارد؛ UDP خودش چنین شماره‌ای ندارد و بدون SYN شروع می‌کند.",
          "state": [
            "frame 1",
            "—",
            "Ready"
          ],
          "flightLabels": [
            "datagram 1"
          ],
          "diagnostic": "UDP header شامل source port، destination port، length و checksum است؛ frame id در payload برنامه است."
        },
        {
          "name": "ارسال دیتاگرام اول",
          "short": "بسته ۱",
          "detail": "دیتاگرام شامل سرآیند UDP و داده است. مرز هر دیتاگرام برای گیرنده حفظ می‌شود.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "#1",
          "input": "frame=1",
          "output": "Received: 1",
          "result": "قطعهٔ اول تحویل شد.",
          "explanation": "فریم 1 کامل به گیرنده تحویل می‌شود؛ مرز دیتاگرام برخلاف جریان TCP حفظ می‌شود.",
          "state": [
            "frame 1",
            "1",
            "Play 1"
          ],
          "flightLabels": [
            "frame 1",
            "frame 1"
          ],
          "diagnostic": "هر recvfrom یک دیتاگرام می‌خواند (با توجه به اندازه بافر)؛ مرز پیام بر خلاف TCP حفظ می‌شود."
        },
        {
          "name": "ارسال دیتاگرام دوم",
          "short": "بسته ۲",
          "detail": "بستهٔ دوم مستقل از اولی از شبکه عبور می‌کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "#2",
          "input": "frame=2",
          "output": "Received: 1, 2",
          "result": "قطعهٔ دوم تحویل شد.",
          "explanation": "قطعهٔ دوم مستقل است، نه بخش اجباری یک جریان قابل اعتماد.",
          "state": [
            "frame 2",
            "1, 2",
            "Play 2"
          ],
          "flightLabels": [
            "frame 2",
            "frame 2"
          ],
          "diagnostic": "بدون ACK داخلی، رسیدن قبلی تضمین رسیدن بعدی نیست."
        },
        {
          "name": "ارسال دیتاگرام سوم",
          "short": "بسته ۳",
          "detail": "در این نمونه همهٔ بسته‌ها به ترتیب رسیده‌اند؛ این ترتیب تضمین UDP نیست.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "#3",
          "input": "frame=3",
          "output": "Received: 1, 2, 3",
          "result": "پخش صدا در این نمونه کامل است.",
          "tone": "success",
          "explanation": "هر سه قطعه رسیده‌اند؛ این فقط نتیجهٔ این نمونه است و UDP قول نمی‌دهد همیشه همین اتفاق بیفتد.",
          "state": [
            "frame 3",
            "1, 2, 3",
            "Play 3"
          ],
          "flightLabels": [
            "frame 3",
            "frame 3"
          ],
          "diagnostic": "ترتیب ۱،۲،۳ صرفاً اجرای نمونه است؛ برنامه نباید روی تضمین ترتیب UDP تکیه کند."
        }
      ],
      "prediction": "آیا دریافت سه دیتاگرام مرتب تضمین UDP است؟"
    },
    {
      "id": "loss",
      "label": "از دست رفتن دیتاگرام",
      "example": "UDP · frame 2 lost",
      "steps": [
        {
          "name": "دریافت قطعهٔ اول",
          "short": "بسته ۱",
          "detail": "گیرنده قطعهٔ اول را دریافت می‌کند.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "#1",
          "input": "frame=1",
          "output": "Received: 1",
          "result": "پخش آغاز شد.",
          "explanation": "پخش‌کننده اولین فریم را دارد و می‌تواند کارش را شروع کند.",
          "state": [
            "frame 1",
            "1",
            "Play 1"
          ],
          "flightLabels": [
            "frame 1",
            "frame 1"
          ],
          "diagnostic": "شماره فریم در این مثال قرارداد برنامه است، نه فیلد استاندارد UDP."
        },
        {
          "name": "گم شدن قطعهٔ دوم",
          "short": "افت",
          "detail": "در این مثال بستهٔ دوم در شبکه از بین می‌رود. UDP به صورت خودکار آن را دوباره نمی‌فرستد.",
          "route": [
            0,
            1
          ],
          "packet": "#2",
          "input": "frame=2",
          "output": "Dropped",
          "result": "قطعهٔ دوم به گیرنده نرسید.",
          "tone": "error",
          "explanation": "فریم 2 در میانهٔ راه حذف می‌شود. UDP برای آن ACK یا ارسال مجدد خودکار ندارد.",
          "state": [
            "frame 2 · lost",
            "1",
            "Gap"
          ],
          "flightLabels": [
            "frame 2 lost"
          ],
          "diagnostic": "افت بدون ACK یا retransmit داخلی UDP رخ می‌دهد؛ روی گیرنده فقط gap دیده می‌شود.",
          "drop": true
        },
        {
          "name": "دریافت قطعهٔ سوم",
          "short": "بسته ۳",
          "detail": "UDP برای دریافت بستهٔ دوم منتظر نمی‌ماند؛ قطعهٔ سوم به برنامه تحویل می‌شود.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "#3",
          "input": "frame=3",
          "output": "Received: 1, 3",
          "result": "پخش می‌تواند ادامه یابد.",
          "explanation": "فریم 3 بدون انتظار برای فریم 2 می‌رسد، پس برنامه می‌تواند جلو برود.",
          "state": [
            "frame 3",
            "1, 3",
            "Play 3"
          ],
          "flightLabels": [
            "frame 3",
            "frame 3"
          ],
          "diagnostic": "دریافت بعدی به نبود قبلی وابسته نیست؛ برنامه ممکن است آن را پخش کند."
        },
        {
          "name": "تصمیم برنامه",
          "short": "نتیجه",
          "detail": "برنامهٔ صوتی می‌تواند شکاف را با سکوت یا روش جبران خطا پر کند. این رفتار را برنامه تعیین می‌کند.",
          "route": [
            2
          ],
          "packet": "APP",
          "input": "Missing application frame 2",
          "output": "No UDP retransmission",
          "result": "بدون تضمین تحویل، تأخیر اضافی ارسال مجدد نداریم.",
          "tone": "error",
          "explanation": "برای صوت زنده، برنامه ممکن است شکاف فریم 2 را با سکوت پر کند؛ دانلود فایل به راهکار قابلیت اطمینان نیاز دارد.",
          "state": [
            "frame 2 · missing",
            "1, 3",
            "Conceal gap"
          ],
          "flightLabels": [
            "conceal gap"
          ],
          "diagnostic": "اگر دادهٔ صوتی دیررس ارزش ندارد، concealment مفید است؛ دادهٔ قابل اعتماد سیاست دیگری می‌خواهد."
        }
      ],
      "edgeCase": "دیتاگرام گم می‌شود و UDP خودش تکرار نمی‌کند.",
      "prediction": "وقتی فریم ۲ گم شود، چه کسی تصمیم بازیابی را می‌گیرد؟"
    },
    {
      "id": "reorder",
      "label": "رسیدن بسته‌ها خارج از ترتیب",
      "example": "UDP · out of order",
      "steps": [
        {
          "name": "ارسال دو قطعه",
          "short": "ارسال",
          "detail": "قطعات ۱ و ۲ ارسال می‌شوند و شبکه ممکن است مسیر یا زمان متفاوتی برایشان داشته باشد.",
          "route": [
            0,
            1
          ],
          "packet": "1,2",
          "input": "frame=1\nframe=2",
          "output": "In flight",
          "result": "ترتیب ارسال مشخص است.",
          "explanation": "فرض کنید دو نامه هم‌زمان در دو مسیر متفاوت حرکت کنند؛ اولی الزاماً زودتر نمی‌رسد.",
          "state": [
            "frames 1, 2",
            "—",
            "In flight"
          ],
          "flightLabels": [
            "frames 1,2"
          ],
          "diagnostic": "دو پیام مستقل در راه‌اند؛ شبکه می‌تواند مسیر/صف متفاوت داشته باشد."
        },
        {
          "name": "رسیدن قطعهٔ دوم پیش از اول",
          "short": "بسته ۲",
          "detail": "بستهٔ دوم زودتر می‌رسد و UDP آن را نگه نمی‌دارد تا اولی برسد.",
          "route": [
            1,
            2
          ],
          "packet": "#2",
          "input": "frame=2",
          "output": "Received: 2",
          "result": "ترتیب دریافت متفاوت است.",
          "explanation": "فریم 2 اول تحویل می‌شود؛ گیرندهٔ UDP آن را به برنامه می‌دهد.",
          "state": [
            "frame 2",
            "2",
            "Arrived early"
          ],
          "flightLabels": [
            "frame 2"
          ],
          "diagnostic": "برنامه با id متوجه زود رسیدن فریم ۲ می‌شود؛ UDP خودش منتظر ۱ نمی‌ماند."
        },
        {
          "name": "رسیدن قطعهٔ اول",
          "short": "بسته ۱",
          "detail": "برنامه بستهٔ اول را بعد از دوم می‌گیرد؛ شماره‌های کاربردی برای تشخیص ترتیب مفیدند.",
          "route": [
            1,
            2
          ],
          "packet": "#1",
          "input": "frame=1",
          "output": "Received: 2, 1",
          "result": "بازچینی در صورت نیاز بر عهدهٔ برنامه است.",
          "tone": "success",
          "explanation": "برنامه با شماره‌های کاربردی 2 و 1 می‌تواند ترتیب اصلی را تشخیص دهد یا بستهٔ دیررس را نادیده بگیرد.",
          "state": [
            "frame 1",
            "2, 1",
            "Reorder or drop late"
          ],
          "flightLabels": [
            "frame 1"
          ],
          "diagnostic": "jitter buffer می‌تواند مرتب‌سازی کند یا فریم دیررس را حذف کند؛ latency را با نیاز کاربرد بسنجید."
        }
      ],
      "edgeCase": "بستهٔ دوم پیش از اول تحویل می‌شود.",
      "prediction": "اگر ۲ قبل از ۱ برسد، ترتیب تحویل چه خواهد بود؟"
    },
    {
      "id": "duplicate",
      "label": "دیتاگرام تکراری",
      "example": "UDP · frame 7 twice",
      "edgeCase": "شبکه یا ارسال برنامه دو نسخه از یک پیام می‌رساند.",
      "steps": [
        {
          "name": "ارسال فریم",
          "short": "ارسال",
          "detail": "فرستنده یک فریم با شناسهٔ کاربردی 7 می‌فرستد.",
          "route": [
            0,
            1,
            2
          ],
          "packet": "#7",
          "input": "frame=7",
          "output": "Received: 7",
          "result": "فریم تحویل شد.",
          "explanation": "شناسهٔ 7 متعلق به برنامه است، نه سرآیند UDP.",
          "state": [
            "frame 7",
            "7",
            "Play once"
          ],
          "flightLabels": [
            "frame 7",
            "frame 7"
          ],
          "diagnostic": "گیرنده یک فریم با شناسه ۷ دارد."
        },
        {
          "name": "رسیدن نسخهٔ دیگر",
          "short": "تکرار",
          "detail": "نسخهٔ دیگری از همان دیتاگرام می‌رسد.",
          "route": [
            1,
            2
          ],
          "packet": "#7",
          "input": "frame=7",
          "output": "Received: 7, 7",
          "result": "UDP تکرار را حذف نکرد.",
          "explanation": "برنامه دو دیتاگرام می‌بیند و نمی‌تواند از UDP انتظار حذف تکراری‌ها را داشته باشد.",
          "state": [
            "frame 7 · duplicate",
            "7, 7",
            "Duplicate detected"
          ],
          "flightLabels": [
            "frame 7 again"
          ],
          "diagnostic": "دیتاگرام تکراری ممکن است دوباره به برنامه برسد؛ checksum برای dedup نیست."
        },
        {
          "name": "حذف تکرار در برنامه",
          "short": "نتیجه",
          "detail": "برنامه با شناسهٔ فریم نسخهٔ اضافی را کنار می‌گذارد.",
          "route": [
            2
          ],
          "packet": "APP",
          "input": "Seen frame IDs: 7",
          "output": "Duplicate ignored by app",
          "result": "رفتار کاربردی تعیین‌کننده است.",
          "explanation": "حذف تکرار در این مثال با شناسهٔ فریم در برنامه انجام می‌شود. UDP خودش هیچ جدول شناسهٔ پیام یا تضمین دقیقاً یک‌بار تحویل ندارد.",
          "tone": "success",
          "state": [
            "frame 7",
            "7, 7",
            "App ignores repeat"
          ],
          "flightLabels": [
            "deduplicate"
          ],
          "diagnostic": "برنامه می‌تواند با شناسه و پنجرهٔ محدود پیام تکراری را حذف کند؛ حافظهٔ تاریخچه باید محدود باشد."
        }
      ],
      "prediction": "آیا UDP کپی تکراری را خودش حذف می‌کند؟"
    }
  ],
  "pitfall": "UDP همیشه سریع‌تر از TCP نیست؛ ازدحام، طراحی برنامه و شبکه تعیین‌کننده‌اند. QUIC با استفاده از UDP در لایهٔ بالاتر قابلیت اطمینان می‌سازد.",
  "takeaway": "UDP انتقال دیتاگرام با سربار کم فراهم می‌کند، نه تحویل تضمین‌شده.",
  "quiz": {
    "question": "اگر یک دیتاگرام UDP گم شود، UDP چه می‌کند؟",
    "options": [
      "همیشه آن را دوباره ارسال می‌کند",
      "کل اتصال را می‌بندد",
      "خودکار ارسال مجدد نمی‌کند"
    ],
    "correct": 2,
    "explanation": "قابلیت اطمینان در صورت نیاز باید توسط پروتکل بالاتر یا برنامه فراهم شود."
  },
  "references": [
    {
      "label": "RFC 768 — UDP",
      "url": "https://www.rfc-editor.org/rfc/rfc768.html"
    },
    {
      "label": "RFC 8085 — راهنمای استفاده از UDP",
      "url": "https://www.rfc-editor.org/rfc/rfc8085.html"
    }
  ],
  "visual": {
    "title": "ردیف فریم‌های صوتی دریافتی",
    "labels": [
      "بستهٔ جاری",
      "ترتیب دریافت",
      "رفتار برنامه"
    ],
    "context": "برای صدا و بازی زنده ممکن است دادهٔ تازه از دادهٔ دیررس ارزش بیشتری داشته باشد. UDP تضمین تحویل و ترتیب نمی‌دهد؛ انتخاب رفتار با برنامه یا پروتکل بالاتر است."
  },
  "teaching": {
    "goal": "توضیح دهید چرا ترتیب، تحویل و حذف پیام تکراری در UDP بر عهدهٔ برنامه یا لایهٔ بالاتر است.",
    "practice": {
      "question": "سه فریم صوتی ۱۰، ۱۱، ۱۲ ارسال شده‌اند. فقط ۱۰ و ۱۲ رسیده‌اند. کدام رفتار با ویژگی‌های UDP سازگار است؟",
      "options": [
        "بستهٔ ۱۲ می‌تواند مستقل تحویل شود؛ بازیابی ۱۱ وظیفهٔ UDP نیست",
        "UDP حتماً ۱۱ را دوباره می‌فرستد",
        "گیرنده باید تا رسیدن ۱۱ منتظر بماند"
      ],
      "correct": 0,
      "explanation": "UDP سرویس دیتاگرام دارد و تحویل، ترتیب یا حذف تکرار را تضمین نمی‌کند. رسیدن فریم ۱۲ به رسیدن فریم ۱۱ وابسته نیست؛ برنامه می‌تواند فریم دیررس را مدیریت کند.",
      "hint": "رفتار UDP را با TCP اشتباه نگیرید."
    },
    "terms": [
      [
        "Datagram",
        "واحد مستقل پیام در UDP."
      ],
      [
        "Packet loss",
        "از دست رفتن بسته قبل از تحویل."
      ],
      [
        "Reordering",
        "رسیدن بسته‌ها با ترتیبی متفاوت از ارسال."
      ]
    ]
  }
} satisfies NetworkLesson;
export default lesson;
