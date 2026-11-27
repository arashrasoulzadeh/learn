import type {DeepLesson} from './types';
export const networkA: DeepLesson[] = [
  {
    "slug": "http-request",
    "title": "تحلیل TTFB و اتصال گرم",
    "question": "چه بخشی از زمان پاسخ با reuse حذف می‌شود؟",
    "assumptions": "مدل بدون صف و packet loss؛ RTT=40ms، DNS=20ms، TLS 1.3 کامل=یک RTT، زمان برنامه=30ms. زمان‌ها آموزشی‌اند.",
    "lanes": [
      "Browser",
      "DNS",
      "Edge",
      "App"
    ],
    "fields": {
      "conn": "اتصال",
      "setup": "آماده‌سازی ms",
      "ttfb": "زمان تا نخستین بایت ms",
      "cache": "کش HTTP"
    },
    "code": "GET /api/products/42 HTTP/1.1\nHost: shop.example\n\nHTTP/1.1 200 OK\nCache-Control: no-store\nContent-Length: 2\n\n{}",
    "cases": [
      {
        "id": "cold",
        "label": "اتصال تازه",
        "initial": {
          "conn": "Closed",
          "setup": 0,
          "ttfb": "—",
          "cache": "Empty"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "پرسش DNS",
            "wire": "DNS query",
            "why": "نام میزبان جدا از path حل می‌شود.",
            "patch": {
              "conn": "Resolving"
            }
          },
          {
            "at": 20,
            "lane": 1,
            "to": 0,
            "name": "پاسخ DNS",
            "wire": "A .10",
            "why": "۲۰ms صرف حل نام شد.",
            "patch": {
              "setup": 20
            }
          },
          {
            "at": 60,
            "lane": 0,
            "to": 2,
            "name": "آماده شدن TCP",
            "wire": "SYN / SYN-ACK / ACK",
            "why": "مدل یک RTT برای اتصال منظور می‌کند.",
            "patch": {
              "conn": "TCP established",
              "setup": 60
            }
          },
          {
            "at": 100,
            "lane": 2,
            "to": 0,
            "name": "پایان TLS",
            "wire": "Finished",
            "why": "یک RTT دیگر برای TLS کامل مدل.",
            "patch": {
              "conn": "TLS ready",
              "setup": 100
            }
          },
          {
            "at": 120,
            "lane": 0,
            "to": 2,
            "name": "رسیدن درخواست",
            "wire": "GET",
            "why": "یک‌طرفه تا edge بیست میلی‌ثانیه.",
            "patch": {
              "cache": "Request sent"
            }
          },
          {
            "at": 150,
            "lane": 2,
            "to": 3,
            "name": "پایان پردازش",
            "wire": "30 ms",
            "why": "پردازش و انتقال داخلی در بودجهٔ app لحاظ شده‌اند.",
            "patch": {
              "cache": "Response ready"
            }
          },
          {
            "at": 170,
            "lane": 2,
            "to": 0,
            "name": "نخستین بایت",
            "wire": "200 OK",
            "why": "TTFB=20+40+40+40+30=170. no-store مانع ذخیرهٔ این پاسخ در cache است.",
            "patch": {
              "ttfb": 170,
              "cache": "Not stored"
            },
            "tone": "success"
          }
        ],
        "verdict": "۱۰۰ms از ۱۷۰ms مربوط به آماده‌سازی اتصال است."
      },
      {
        "id": "warm",
        "label": "اتصال قابل استفاده مجدد",
        "initial": {
          "conn": "TLS ready",
          "setup": 0,
          "ttfb": "—",
          "cache": "Empty"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "name": "انتخاب اتصال",
            "wire": "Reuse",
            "why": "اتصال آماده است؛ DNS/TCP/TLS تازه لازم نیست.",
            "patch": {
              "conn": "Reused"
            }
          },
          {
            "at": 20,
            "lane": 0,
            "to": 2,
            "name": "رسیدن درخواست",
            "wire": "GET",
            "why": "یک طرف RTT سپری شده.",
            "patch": {
              "cache": "Request sent"
            }
          },
          {
            "at": 50,
            "lane": 2,
            "to": 3,
            "name": "پایان برنامه",
            "wire": "30 ms",
            "why": "کار سمت برنامه همچنان لازم است.",
            "patch": {
              "cache": "Response ready"
            }
          },
          {
            "at": 70,
            "lane": 2,
            "to": 0,
            "name": "نخستین بایت",
            "wire": "200 OK",
            "why": "TTFB=40+30=70. no-store مانع reuse اتصال نیست.",
            "patch": {
              "ttfb": 70,
              "cache": "Not stored"
            },
            "tone": "success"
          }
        ],
        "verdict": "۱۰۰ms کاهش به دلیل اتصال گرم است، نه کش شدن محتوا."
      }
    ],
    "diagnose": "DevTools Timing و curl -w: lookup/connect/appconnect/starttransfer را مقایسه کنید؛ زمان‌ها تجمعی‌اند.",
    "tradeoff": "HTTP/2/3، multiplexing، RTT نامتقارن و کش نتیجه را تغییر می‌دهند.",
    "sources": [
      {
        "label": "RFC 9110",
        "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
      },
      {
        "label": "RFC 9111",
        "url": "https://www.rfc-editor.org/rfc/rfc9111.html"
      },
      {
        "label": "RFC 9112",
        "url": "https://www.rfc-editor.org/rfc/rfc9112.html"
      }
    ]
  },
  {
    "slug": "dns",
    "title": "کش مثبت و منفی DNS",
    "question": "چرا ایجاد نام تازه فوراً NXDOMAIN قبلی را حذف نمی‌کند؟",
    "assumptions": "DNS فرضی؛ TTL مثبت 60s، TTL منفی مؤثر همراه SOA برابر 30s. t زمان نمونه به ثانیه.",
    "lanes": [
      "Client",
      "Resolver",
      "Authority"
    ],
    "fields": {
      "clock": "زمان (s)",
      "authority": "رکورد مرجع",
      "cached": "کش",
      "expires": "انقضا",
      "result": "پاسخ"
    },
    "code": "name.example. 60 IN A 192.0.2.10\n# NXDOMAIN: SOA in authority section\n# negative TTL = min(SOA TTL, SOA.MINIMUM)",
    "cases": [
      {
        "id": "positive",
        "label": "تغییر IP",
        "initial": {
          "clock": 0,
          "authority": "192.0.2.10",
          "cached": "—",
          "expires": "—",
          "result": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "پرسش A",
            "wire": "A?",
            "why": "Resolver کش را بررسی می‌کند.",
            "patch": {
              "result": "Pending"
            }
          },
          {
            "at": 0,
            "lane": 2,
            "to": 1,
            "name": "پاسخ مرجع",
            "wire": "A .10 TTL=60",
            "why": "رکورد تا t=60 معتبر است.",
            "patch": {
              "cached": "192.0.2.10",
              "expires": 60,
              "result": "192.0.2.10"
            }
          },
          {
            "at": 10,
            "lane": 2,
            "name": "تغییر IP",
            "wire": "A .11",
            "why": "تغییر مرجع به کش push نمی‌شود.",
            "patch": {
              "clock": 10,
              "authority": "192.0.2.11"
            }
          },
          {
            "at": 20,
            "lane": 1,
            "to": 0,
            "name": "پاسخ کش",
            "wire": "A .10 TTL=40",
            "why": "۴۰ ثانیه اعتبار باقی است.",
            "patch": {
              "clock": 20,
              "result": "192.0.2.10"
            }
          },
          {
            "at": 60,
            "lane": 1,
            "to": 2,
            "name": "انقضا و پرسش تازه",
            "wire": "A .11",
            "why": "در مدل پاسخ منقضی استفاده نمی‌شود.",
            "patch": {
              "clock": 60,
              "cached": "192.0.2.11",
              "expires": 120,
              "result": "192.0.2.11"
            },
            "tone": "success"
          }
        ],
        "verdict": "کلاینت تا انقضا IP قبلی را می‌بیند."
      },
      {
        "id": "negative",
        "label": "ایجاد نام پس از NXDOMAIN",
        "initial": {
          "clock": 0,
          "authority": "Absent",
          "cached": "—",
          "expires": "—",
          "result": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "پرسش نام",
            "wire": "A?",
            "why": "نام هنوز وجود ندارد.",
            "patch": {
              "result": "Pending"
            }
          },
          {
            "at": 0,
            "lane": 2,
            "to": 1,
            "name": "پاسخ منفی",
            "wire": "NXDOMAIN + SOA",
            "why": "TTL منفی نمونه ۳۰ است.",
            "patch": {
              "cached": "NXDOMAIN",
              "expires": 30,
              "result": "NXDOMAIN"
            }
          },
          {
            "at": 5,
            "lane": 2,
            "name": "ایجاد رکورد",
            "wire": "A .11",
            "why": "اکنون مرجع رکورد دارد.",
            "patch": {
              "clock": 5,
              "authority": "192.0.2.11"
            }
          },
          {
            "at": 20,
            "lane": 1,
            "to": 0,
            "name": "کش منفی",
            "wire": "NXDOMAIN TTL=10",
            "why": "Resolver هنوز پاسخ منفی می‌دهد.",
            "patch": {
              "clock": 20,
              "result": "NXDOMAIN"
            },
            "tone": "error"
          },
          {
            "at": 30,
            "lane": 1,
            "to": 2,
            "name": "انقضا و حل نام",
            "wire": "A .11",
            "why": "پرسش تازه موفق می‌شود.",
            "patch": {
              "clock": 30,
              "cached": "192.0.2.11",
              "expires": 90,
              "result": "192.0.2.11"
            },
            "tone": "success"
          }
        ],
        "verdict": "کش منفی انتشار مشاهدهٔ نام جدید را عقب می‌اندازد؛ NXDOMAIN با SERVFAIL یا NODATA یکی نیست."
      }
    ],
    "diagnose": "dig نوع رکورد، ANSWER/AUTHORITY و TTL را در resolver و مرجع دامنهٔ خودتان بررسی کنید.",
    "tradeoff": "serve-stale و کش‌های چندلایه متفاوت‌اند؛ .example تنها مدل فرضی است.",
    "sources": [
      {
        "label": "RFC 2308",
        "url": "https://www.rfc-editor.org/rfc/rfc2308.html"
      },
      {
        "label": "RFC 9520",
        "url": "https://www.rfc-editor.org/rfc/rfc9520.html"
      },
      {
        "label": "RFC 1034",
        "url": "https://www.rfc-editor.org/rfc/rfc1034.html"
      }
    ]
  },
  {
    "slug": "ip-port",
    "title": "NAT و پنج‌تایی اتصال",
    "question": "دو کلاینت با پورت محلی یکسان چگونه پاسخ جدا دریافت می‌کنند؟",
    "assumptions": "NAPT فرضی با آدرس عمومی مستنداتی؛ دو اتصال TCP به یک مقصد.",
    "lanes": [
      "Client A",
      "NAT",
      "Server",
      "Client B"
    ],
    "fields": {
      "a": "جریان A",
      "b": "جریان B",
      "nat": "جدول NAT",
      "reply": "مقصد پاسخ"
    },
    "code": "TCP tuple=(srcIP, srcPort, dstIP, dstPort, protocol)\nA: 10.0.0.2:50000 → 198.51.100.10:443\nB: 10.0.0.3:50000 → 198.51.100.10:443",
    "cases": [
      {
        "id": "mapped",
        "label": "نگاشت مستقل",
        "initial": {
          "a": "Idle",
          "b": "Idle",
          "nat": "Empty",
          "reply": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "درخواست A",
            "wire": "SYN :50000",
            "why": "NAT پورت عمومی 62001 اختصاص می‌دهد.",
            "patch": {
              "a": "SYN sent",
              "nat": "62001→A:50000"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 2,
            "name": "ترجمه A",
            "wire": "203.0.113.8:62001",
            "why": "سرور آدرس ترجمه‌شده را می‌بیند.",
            "patch": {
              "a": "Mapped"
            }
          },
          {
            "at": 2,
            "lane": 3,
            "to": 1,
            "name": "درخواست B",
            "wire": "SYN :50000",
            "why": "نگاشت مجزا لازم است.",
            "patch": {
              "b": "SYN sent",
              "nat": "62001→A | 62002→B"
            }
          },
          {
            "at": 3,
            "lane": 1,
            "to": 2,
            "name": "ترجمه B",
            "wire": "203.0.113.8:62002",
            "why": "پنج‌تایی متفاوت است.",
            "patch": {
              "b": "Mapped"
            }
          },
          {
            "at": 4,
            "lane": 2,
            "to": 1,
            "name": "پاسخ B",
            "wire": "SYN-ACK :62002",
            "why": "جدول NAT مقصد داخلی را تعیین می‌کند.",
            "patch": {
              "reply": "10.0.0.3:50000"
            }
          },
          {
            "at": 5,
            "lane": 1,
            "to": 3,
            "name": "تحویل پاسخ",
            "wire": "SYN-ACK",
            "why": "B پاسخ خودش را می‌گیرد.",
            "patch": {
              "b": "Reply received"
            },
            "tone": "success"
          }
        ],
        "verdict": "آدرس و پورت و پروتکل جریان‌ها را متمایز می‌کنند."
      },
      {
        "id": "expired",
        "label": "پاسخ پس از حذف state",
        "initial": {
          "a": "Mapped",
          "b": "Idle",
          "nat": "62001→A",
          "reply": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "جریان قبلی",
            "wire": "TCP flow",
            "why": "نگاشت وجود دارد.",
            "patch": {
              "a": "Established"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "name": "از دست رفتن state",
            "wire": "Expired",
            "why": "در این نمونه نگاشت حذف می‌شود.",
            "patch": {
              "nat": "Empty"
            }
          },
          {
            "at": 2,
            "lane": 2,
            "to": 1,
            "name": "پاسخ دیررس",
            "wire": "dst :62001",
            "why": "مقصد داخلی دیگر شناخته نمی‌شود.",
            "patch": {
              "reply": "No mapping"
            },
            "tone": "error"
          },
          {
            "at": 3,
            "lane": 1,
            "name": "حذف بسته",
            "wire": "DROP",
            "why": "سیاست مدل حذف است.",
            "patch": {
              "reply": "Dropped",
              "a": "No reply"
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 0,
            "name": "پایان مهلت",
            "wire": "Timeout",
            "why": "timeout به تنهایی علت را اثبات نمی‌کند.",
            "patch": {
              "a": "Timed out"
            },
            "tone": "error"
          }
        ],
        "verdict": "Timeout می‌تواند از middlebox باشد، نه فقط پورت بسته."
      }
    ],
    "diagnose": "ss -tn و capture روی دو سوی NAT در محیط خودتان را مقایسه کنید.",
    "tradeoff": "قواعد تخصیص و انقضا به NAT وابسته‌اند؛ UDP و TCP state جدا دارند.",
    "sources": [
      {
        "label": "RFC 3022",
        "url": "https://www.rfc-editor.org/rfc/rfc3022.html"
      },
      {
        "label": "RFC 9293",
        "url": "https://www.rfc-editor.org/rfc/rfc9293.html"
      }
    ]
  },
  {
    "slug": "tcp",
    "title": "ACK تجمعی و بافر خارج از ترتیب",
    "question": "اگر قطعهٔ میانی گم شود، ACK با رسیدن قطعه بعدی چقدر جلو می‌رود؟",
    "assumptions": "سه segment صدبایتی از seq=1000، اتصال برقرار، گیرنده بافر out-of-order دارد. recovery یک RTO فرضی، نه مدل کامل congestion control.",
    "lanes": [
      "Sender",
      "Network",
      "Receiver"
    ],
    "fields": {
      "sent": "بازه ارسال",
      "ack": "ACK تجمعی",
      "buffer": "بافر",
      "app": "بایت تحویل برنامه",
      "retry": "بازفرستادن"
    },
    "code": "seq=1000 len=100\nseq=1100 len=100\nseq=1200 len=100\nACK = next expected byte\nSACK optional: [1200,1300)",
    "cases": [
      {
        "id": "ordered",
        "label": "بدون افت",
        "initial": {
          "sent": "—",
          "ack": 1000,
          "buffer": "Empty",
          "app": 0,
          "retry": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 2,
            "name": "قطعه اول",
            "wire": "SEQ 1000",
            "why": "صد بایت پیوسته دریافت شدند.",
            "patch": {
              "sent": "1000–1099",
              "ack": 1100,
              "app": 100
            }
          },
          {
            "at": 1,
            "lane": 2,
            "to": 0,
            "name": "تأیید",
            "wire": "ACK 1100",
            "why": "ACK بایت بعدی است.",
            "patch": {
              "ack": 1100
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 2,
            "name": "قطعه دوم",
            "wire": "SEQ 1100",
            "why": "بازه دوم پیوسته است.",
            "patch": {
              "sent": "1000–1199",
              "ack": 1200,
              "app": 200
            }
          },
          {
            "at": 3,
            "lane": 0,
            "to": 2,
            "name": "قطعه سوم",
            "wire": "SEQ 1200",
            "why": "۳۰۰ بایت پیوسته قابل تحویل است.",
            "patch": {
              "sent": "1000–1299",
              "ack": 1300,
              "app": 300
            }
          },
          {
            "at": 4,
            "lane": 2,
            "to": 0,
            "name": "تأیید نهایی",
            "wire": "ACK 1300",
            "why": "تأیید تجمعی به فرستنده می‌رسد.",
            "patch": {
              "buffer": "Empty"
            },
            "tone": "success"
          }
        ],
        "verdict": "ACK=1300، ۳۰۰ بایت، بدون بازفرستادن."
      },
      {
        "id": "gap",
        "label": "افت قطعه میانی",
        "initial": {
          "sent": "—",
          "ack": 1000,
          "buffer": "Empty",
          "app": 0,
          "retry": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 2,
            "name": "قطعه اول",
            "wire": "SEQ 1000",
            "why": "تا 1099 تحویل می‌شود.",
            "patch": {
              "sent": "1000–1099",
              "ack": 1100,
              "app": 100
            }
          },
          {
            "at": 1,
            "lane": 0,
            "to": 1,
            "name": "افت قطعه دوم",
            "wire": "SEQ 1100 lost",
            "why": "قطعه گم شد.",
            "patch": {
              "sent": "1000–1199"
            },
            "tone": "error"
          },
          {
            "at": 2,
            "lane": 0,
            "to": 2,
            "name": "رسیدن قطعه سوم",
            "wire": "SEQ 1200",
            "why": "شکاف مانع تحویل مرتب است.",
            "patch": {
              "sent": "1000–1299",
              "buffer": "1200–1299"
            }
          },
          {
            "at": 3,
            "lane": 2,
            "to": 0,
            "name": "ACK تکراری",
            "wire": "ACK 1100",
            "why": "SACK در صورت مذاکره بازهٔ دریافت‌شده را گزارش می‌کند؛ ACK همچنان 1100.",
            "patch": {
              "ack": 1100
            }
          },
          {
            "at": 4,
            "lane": 0,
            "to": 1,
            "name": "مهلت بازفرستادن",
            "wire": "RTO",
            "why": "یک duplicate ACK برای fast retransmit کلاسیک کافی نیست؛ RTO فرض شده.",
            "patch": {
              "retry": 1
            },
            "tone": "error"
          },
          {
            "at": 5,
            "lane": 0,
            "to": 2,
            "name": "پر کردن شکاف",
            "wire": "SEQ 1100 retry",
            "why": "اکنون بازه کامل پیوسته است.",
            "patch": {
              "ack": 1300,
              "app": 300,
              "buffer": "Empty"
            }
          },
          {
            "at": 6,
            "lane": 2,
            "to": 0,
            "name": "تأیید تجمعی",
            "wire": "ACK 1300",
            "why": "قطعه سوم دوباره لازم نبود ارسال شود.",
            "patch": {
              "retry": 1
            },
            "tone": "success"
          }
        ],
        "verdict": "TCP داده مرتب تحویل می‌دهد؛ SACK با ACK تجمعی فرق دارد."
      }
    ],
    "diagnose": "در capture آزمایشی seq/ack، retransmission، advertised window و RTT را بخوانید.",
    "tradeoff": "rwnd محدودیت گیرنده و cwnd محدودیت ازدحام‌اند؛ پنجره مؤثر به هر دو وابسته است. RTO زمان واقعی مدل نیست.",
    "sources": [
      {
        "label": "RFC 9293",
        "url": "https://www.rfc-editor.org/rfc/rfc9293.html"
      },
      {
        "label": "RFC 6298",
        "url": "https://www.rfc-editor.org/rfc/rfc6298.html"
      },
      {
        "label": "RFC 2018",
        "url": "https://www.rfc-editor.org/rfc/rfc2018.html"
      },
      {
        "label": "RFC 5681",
        "url": "https://www.rfc-editor.org/rfc/rfc5681.html"
      }
    ]
  }
];
