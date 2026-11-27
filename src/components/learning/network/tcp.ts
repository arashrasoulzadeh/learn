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
          "result": "مرحلهٔ اول دست‌دهی."
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
          "result": "مرحلهٔ دوم دست‌دهی."
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
          "result": "اتصال برقرار شد."
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
          "result": "داده به گیرنده رسید."
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
          "tone": "success"
        }
      ]
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
          "result": "اتصال آماده است."
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
          "tone": "error"
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
          "result": "ارسال مجدد لازم است."
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
          "result": "گیرنده داده را دریافت کرد."
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
          "tone": "success"
        }
      ]
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
  ]
} satisfies NetworkLesson;
export default lesson;
