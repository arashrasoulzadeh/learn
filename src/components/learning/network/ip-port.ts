import type {NetworkLesson} from './types';
const lesson = {
  "slug": "ip-port",
  "title": "IP و Port — آدرس‌دهی شبکه",
  "description": "IP دستگاه یا مقصد شبکه را مشخص می‌کند و پورت TCP/UDP ارتباط را به سرویس مربوط می‌رساند.",
  "order": 3,
  "actors": [
    {
      "label": "کلاینت",
      "sub": "192.0.2.20",
      "icon": "browser"
    },
    {
      "label": "مسیریاب",
      "sub": "Router",
      "icon": "router"
    },
    {
      "label": "میزبان مقصد",
      "sub": "198.51.100.10",
      "icon": "app"
    },
    {
      "label": "سرویس",
      "sub": "Application",
      "icon": "proxy"
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
    ],
    [
      2,
      3
    ]
  ],
  "scenarios": [
    {
      "id": "https",
      "label": "اتصال به سرویس HTTPS",
      "example": "192.0.2.20:51514 → 198.51.100.10:443",
      "steps": [
        {
          "name": "انتخاب مقصد",
          "short": "آدرس",
          "detail": "کلاینت IP مقصد و پورت TCP سرویس را انتخاب می‌کند؛ پورت مبدأ نمونه به‌صورت موقت تعیین شده است.",
          "route": [
            0
          ],
          "packet": "TCP",
          "input": "src=192.0.2.20:51514\ndst=198.51.100.10:443",
          "output": "Destination selected",
          "result": "آدرس مقصد مشخص شد."
        },
        {
          "name": "عبور از مسیریاب",
          "short": "مسیریابی",
          "detail": "مسیریاب با IP مقصد و جدول مسیریابی گام بعد را انتخاب می‌کند. IP به‌تنهایی برنامهٔ مقصد را تعیین نمی‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "IP",
          "input": "dst IP=198.51.100.10",
          "output": "Next hop selected",
          "result": "بسته به مسیر مناسب می‌رود."
        },
        {
          "name": "رسیدن به میزبان",
          "short": "میزبان",
          "detail": "میزبان بستهٔ IP را به لایهٔ انتقال TCP تحویل می‌دهد.",
          "route": [
            1,
            2
          ],
          "packet": "TCP",
          "input": "protocol=TCP\ndst port=443",
          "output": "TCP demultiplexing",
          "result": "TCP مقصد پورت را بررسی می‌کند."
        },
        {
          "name": "تحویل به سرویس",
          "short": "سرویس",
          "detail": "اتصال TCP به سرویس گوش‌دهندهٔ ۴۴۳ هدایت می‌شود. در این سناریو سرویس آماده است.",
          "route": [
            2,
            3
          ],
          "packet": "443",
          "input": "TCP dst=443",
          "output": "LISTEN :443",
          "result": "سرویس HTTPS در دسترس است.",
          "tone": "success"
        }
      ]
    },
    {
      "id": "closed",
      "label": "پورت بسته",
      "example": "192.0.2.20:51515 → 198.51.100.10:8080",
      "steps": [
        {
          "name": "انتخاب پورت دیگر",
          "short": "آدرس",
          "detail": "IP مقصد همان است اما این بار کلاینت به پورت TCP دیگری اتصال می‌خواهد.",
          "route": [
            0,
            1
          ],
          "packet": "8080",
          "input": "TCP SYN dst=8080",
          "output": "Packet forwarded",
          "result": "مسیریاب IP را بررسی کرد."
        },
        {
          "name": "بررسی پورت مقصد",
          "short": "میزبان",
          "detail": "میزبان مقصد قابل دسترسی است، اما سرویس گوش‌دهنده روی پورت ۸۰۸۰ وجود ندارد.",
          "route": [
            1,
            2
          ],
          "packet": "SYN",
          "input": "dst port=8080",
          "output": "No TCP listener",
          "result": "پورت باز نیست."
        },
        {
          "name": "رد اتصال TCP",
          "short": "خطا",
          "detail": "در این مثال میزبان به SYN پورت بسته با RST پاسخ می‌دهد. فایروال ممکن است به جای آن بسته را رها کند.",
          "route": [
            2,
            1,
            0
          ],
          "packet": "RST",
          "input": "TCP RST, ACK",
          "output": "Connection refused",
          "result": "دسترسی به IP با دسترسی به سرویس یکی نیست.",
          "tone": "error"
        }
      ]
    }
  ],
  "pitfall": "پورت یک شمارهٔ منطقی در پروتکل انتقال است، نه مسیر URL یا پورت فیزیکی. TCP و UDP فضای پورت جدا دارند.",
  "takeaway": "مقصد یک ارتباط با پروتکل انتقال، IP و پورت شناخته می‌شود.",
  "quiz": {
    "question": "میزبان با IP درست پاسخ می‌دهد اما پورت TCP بسته است؛ چه نتیجه‌ای ممکن است بگیریم؟",
    "options": [
      "حتماً DNS خراب است",
      "سرویس مقصد ممکن است گوش ندهد",
      "IP مقصد تغییر کرده است"
    ],
    "correct": 1,
    "explanation": "قابل دسترس بودن میزبان تضمین نمی‌کند سرویس روی پورت مورد نظر فعال باشد."
  },
  "references": [
    {
      "label": "RFC 791 — IPv4",
      "url": "https://www.rfc-editor.org/rfc/rfc791.html"
    },
    {
      "label": "RFC 9293 — TCP",
      "url": "https://www.rfc-editor.org/rfc/rfc9293.html"
    },
    {
      "label": "IANA — شمارهٔ پورت‌ها",
      "url": "https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml"
    }
  ]
} satisfies NetworkLesson;
export default lesson;
