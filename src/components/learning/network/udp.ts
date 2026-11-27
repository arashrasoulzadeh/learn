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
          "result": "بدون دست‌دهی انتقال آماده است."
        },
        {
          "name": "ارسال قطعهٔ اول",
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
          "result": "قطعهٔ اول تحویل شد."
        },
        {
          "name": "ارسال قطعهٔ دوم",
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
          "result": "قطعهٔ دوم تحویل شد."
        },
        {
          "name": "ارسال قطعهٔ سوم",
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
          "tone": "success"
        }
      ]
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
          "result": "پخش آغاز شد."
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
          "tone": "error"
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
          "result": "پخش می‌تواند ادامه یابد."
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
          "tone": "error"
        }
      ]
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
          "result": "ترتیب ارسال مشخص است."
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
          "result": "ترتیب دریافت متفاوت است."
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
          "tone": "success"
        }
      ]
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
  ]
} satisfies NetworkLesson;
export default lesson;
