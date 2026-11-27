import type {DeepLesson} from './types';
export const networkB = [
  {
    "slug": "udp",
    "title": "Jitter buffer و مهلت پخش",
    "question": "آیا منتظر فریم دیررس بمانیم یا آن را کنار بگذاریم؟",
    "assumptions": "فریم‌ها هر 20ms تولید می‌شوند؛ زمان پخش با بافر 40ms یا 80ms پس از تولید. فریم 2 در t=85 می‌رسد؛ برنامه تصمیم می‌گیرد.",
    "lanes": [
      "Sender",
      "Network",
      "Player"
    ],
    "fields": {
      "time": "زمان ms",
      "buffer": "بافر",
      "played": "پخش",
      "late": "فریم دیررس",
      "delay": "تأخیر پخش"
    },
    "code": "deadline(seq) = producedAt(seq) + jitterBufferMs\nif arrival > deadline: drop late frame\n# UDP has no built-in retransmission",
    "cases": [
      {
        "id": "short",
        "label": "بافر 40ms",
        "initial": {
          "time": 0,
          "buffer": "Empty",
          "played": "—",
          "late": 0,
          "delay": 40
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ارسال فریم ۱",
            "wire": "frame 1",
            "why": "فریم ۱ در صفر تولید می‌شود.",
            "patch": {
              "time": 0
            }
          },
          {
            "at": 20,
            "lane": 1,
            "to": 2,
            "name": "ورود فریم ۱",
            "wire": "frame 1",
            "why": "فریم ۱ به‌موقع رسید؛ فریم ۲ نیز در t=20 ارسال و کند شده.",
            "patch": {
              "time": 20,
              "buffer": "1"
            }
          },
          {
            "at": 40,
            "lane": 2,
            "name": "پخش فریم ۱",
            "wire": "play 1",
            "why": "موعد پخش اول رسیده است؛ فریم ۳ در t=40 تولید می‌شود.",
            "patch": {
              "time": 40,
              "buffer": "Empty",
              "played": "1"
            }
          },
          {
            "at": 45,
            "lane": 1,
            "to": 2,
            "name": "رسیدن ۳ پیش از ۲",
            "wire": "frame 3",
            "why": "برنامه فریم ۳ را تا موعدش نگه می‌دارد.",
            "patch": {
              "time": 45,
              "buffer": "3"
            }
          },
          {
            "at": 60,
            "lane": 2,
            "name": "مهلت فریم ۲",
            "wire": "conceal gap",
            "why": "فریم ۲ تا deadline نرسیده است.",
            "patch": {
              "time": 60,
              "played": "1,gap2",
              "late": 1
            },
            "tone": "error"
          },
          {
            "at": 80,
            "lane": 2,
            "name": "پخش ۳",
            "wire": "play 3",
            "why": "فریم سوم آماده است.",
            "patch": {
              "time": 80,
              "buffer": "Empty",
              "played": "1,gap2,3"
            }
          },
          {
            "at": 85,
            "lane": 1,
            "to": 2,
            "name": "داده دیررس",
            "wire": "drop 2",
            "why": "فریم ۲ دیگر در پخش زنده کاربرد ندارد.",
            "patch": {
              "time": 85,
              "late": 1
            },
            "tone": "error"
          }
        ],
        "verdict": "بافر کوچک latency کمتر اما یک gap دارد."
      },
      {
        "id": "long",
        "label": "بافر 80ms",
        "initial": {
          "time": 0,
          "buffer": "Empty",
          "played": "—",
          "late": 0,
          "delay": 80
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ارسال فریم ۱",
            "wire": "frame 1",
            "why": "فریم‌های بعدی در t=20 و 40 تولید می‌شوند.",
            "patch": {
              "time": 0
            }
          },
          {
            "at": 20,
            "lane": 1,
            "to": 2,
            "name": "ورود ۱",
            "wire": "frame 1",
            "why": "فریم قبل از موعد رسیده.",
            "patch": {
              "time": 20,
              "buffer": "1"
            }
          },
          {
            "at": 45,
            "lane": 1,
            "to": 2,
            "name": "ورود ۳",
            "wire": "frame 3",
            "why": "فریم ۲ هنوز در راه است.",
            "patch": {
              "time": 45,
              "buffer": "1,3"
            }
          },
          {
            "at": 80,
            "lane": 2,
            "name": "پخش ۱",
            "wire": "play 1",
            "why": "بافر بزرگ‌تر latency را بیشتر می‌کند.",
            "patch": {
              "time": 80,
              "buffer": "3",
              "played": "1"
            }
          },
          {
            "at": 85,
            "lane": 1,
            "to": 2,
            "name": "ورود ۲",
            "wire": "frame 2",
            "why": "deadline فریم ۲ برابر 100ms است.",
            "patch": {
              "time": 85,
              "buffer": "2,3"
            }
          },
          {
            "at": 100,
            "lane": 2,
            "name": "پخش ۲",
            "wire": "play 2",
            "why": "فریم دیرتر ولی به‌موقع است.",
            "patch": {
              "time": 100,
              "buffer": "3",
              "played": "1,2"
            }
          },
          {
            "at": 120,
            "lane": 2,
            "name": "پخش ۳",
            "wire": "play 3",
            "why": "هر سه فریم پخش شدند.",
            "patch": {
              "time": 120,
              "buffer": "Empty",
              "played": "1,2,3"
            },
            "tone": "success"
          }
        ],
        "verdict": "بافر بزرگ افت پخش این trace را حذف کرد ولی ۴۰ms تأخیر افزود."
      }
    ],
    "diagnose": "jitter، late loss، playout delay و queue را اندازه بگیرید؛ فقط loss شبکه کافی نیست.",
    "tradeoff": "تأخیرها فرضی‌اند. UDP فاقد congestion control داخلی است؛ پروتکل بالاتر باید بار را کنترل کند.",
    "sources": [
      {
        "label": "RFC 768",
        "url": "https://www.rfc-editor.org/rfc/rfc768.html"
      },
      {
        "label": "RFC 8085",
        "url": "https://www.rfc-editor.org/rfc/rfc8085.html"
      }
    ]
  },
  {
    "slug": "tls-https",
    "title": "0-RTT و خطر replay",
    "question": "کدام عملیات باید تا دست‌دهی کامل منتظر بماند؟",
    "assumptions": "نشست قبلی و PSK معتبر فرض شده؛ هیچ رمزنگاری یا حمله‌ای اجرا نمی‌شود. replay تنها مدل تکرار داده است.",
    "lanes": [
      "Client",
      "TLS edge",
      "Application"
    ],
    "fields": {
      "handshake": "وضعیت TLS",
      "early": "دادهٔ زودهنگام",
      "orders": "تعداد سفارش",
      "decision": "سیاست"
    },
    "code": "if earlyData && operationIsReplayUnsafe:\n    return 425  # or defer until handshake\n# handle idempotency independently",
    "cases": [
      {
        "id": "unsafe",
        "label": "پذیرش نوشتن زودهنگام",
        "initial": {
          "handshake": "Pending",
          "early": "—",
          "orders": 0,
          "decision": "Accept all"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ارسال داده زودهنگام",
            "wire": "PSK + early data",
            "why": "0-RTT پیش از کامل شدن handshake داده می‌فرستد.",
            "patch": {
              "early": "POST /orders"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 2,
            "name": "پذیرش عملیات",
            "wire": "POST",
            "why": "فرض نبود حفاظت replay کاربردی.",
            "patch": {
              "orders": 1,
              "decision": "Accepted"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 1,
            "name": "تکرار داده",
            "wire": "Replay (model)",
            "why": "0-RTT تضمین ضد replay ذاتی مانند 1-RTT ندارد.",
            "patch": {
              "early": "Duplicate early data"
            },
            "tone": "error"
          },
          {
            "at": 3,
            "lane": 1,
            "to": 2,
            "name": "اثر دوم",
            "wire": "POST repeated",
            "why": "اثر کسب‌وکار تکرار می‌شود.",
            "patch": {
              "orders": 2
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 1,
            "to": 0,
            "name": "پایان handshake",
            "wire": "Finished",
            "why": "رمزنگاری موفق اثر تکراری را برنمی‌گرداند.",
            "patch": {
              "handshake": "Complete"
            }
          }
        ],
        "verdict": "رمزنگاری به‌تنهایی replay-safe بودن عملیات را ثابت نمی‌کند."
      },
      {
        "id": "defer",
        "label": "رد early write",
        "initial": {
          "handshake": "Pending",
          "early": "—",
          "orders": 0,
          "decision": "Reject early write"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "دادهٔ زودهنگام",
            "wire": "POST /orders",
            "why": "سرور عملیات غیرایمن برای replay را شناسایی می‌کند.",
            "patch": {
              "early": "POST"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 0,
            "name": "رد زودهنگام",
            "wire": "425 Too Early",
            "why": "اثر زودهنگام رخ نمی‌دهد.",
            "patch": {
              "decision": "Retry after handshake",
              "orders": 0
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 0,
            "name": "دست‌دهی کامل",
            "wire": "Finished",
            "why": "اتصال 1-RTT آماده است.",
            "patch": {
              "handshake": "Complete"
            }
          },
          {
            "at": 3,
            "lane": 0,
            "to": 1,
            "name": "درخواست عادی",
            "wire": "POST after handshake",
            "why": "کلاینت پس از handshake می‌فرستد.",
            "patch": {
              "early": "Not early"
            }
          },
          {
            "at": 4,
            "lane": 1,
            "to": 2,
            "name": "ثبت عملیات",
            "wire": "Create order",
            "why": "در این trace یک سفارش ساخته می‌شود.",
            "patch": {
              "orders": 1,
              "decision": "Accepted"
            },
            "tone": "success"
          }
        ],
        "verdict": "۰-RTT فقط برای عملیات replay-safe و با سیاست مناسب؛ retry عادی هم idempotency می‌خواهد."
      }
    ],
    "diagnose": "TLS version، ALPN و policy early data را در محیط کنترل‌شده بررسی کنید.",
    "tradeoff": "0-RTT ممکن است رد شود؛ policy سمت کلاینت و سرور متفاوت است.",
    "sources": [
      {
        "label": "RFC 9846",
        "url": "https://www.rfc-editor.org/rfc/rfc9846.html"
      },
      {
        "label": "RFC 8470",
        "url": "https://www.rfc-editor.org/rfc/rfc8470.html"
      }
    ]
  },
  {
    "slug": "http-methods",
    "title": "Idempotency key و POST نامعلوم",
    "question": "اگر commit موفق ولی پاسخ گم شود، retry چند اثر ایجاد می‌کند؟",
    "assumptions": "کلید idempotency در قرارداد API سفارشی با unique constraint و ثبت اتمیک نتیجه؛ پاسخ اول گم می‌شود.",
    "lanes": [
      "Client",
      "API",
      "DB"
    ],
    "fields": {
      "attempt": "تلاش",
      "orders": "تعداد سفارش",
      "key": "ثبت کلید",
      "result": "نتیجهٔ کلاینت"
    },
    "code": "POST /orders\nIdempotency-Key: demo-42\n\nBEGIN;\n-- reserve unique key, create order, save response atomically\nCOMMIT;",
    "cases": [
      {
        "id": "no-key",
        "label": "بدون کلید یکتایی",
        "initial": {
          "attempt": 0,
          "orders": 0,
          "key": "—",
          "result": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ارسال اول",
            "wire": "POST",
            "why": "کلاینت هنوز نتیجه ندارد.",
            "patch": {
              "attempt": 1,
              "result": "Pending"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 2,
            "name": "ثبت اتمیک",
            "wire": "COMMIT order43",
            "why": "درخواست اول موفق شد.",
            "patch": {
              "orders": 1,
              "key": "None"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 0,
            "name": "گم شدن پاسخ",
            "wire": "201 lost",
            "why": "کلاینت از commit خبر ندارد.",
            "patch": {
              "result": "Timeout"
            },
            "tone": "error"
          },
          {
            "at": 3,
            "lane": 0,
            "to": 1,
            "name": "تلاش مجدد",
            "wire": "POST again",
            "why": "همان قصد کسب‌وکار دوباره فرستاده می‌شود.",
            "patch": {
              "attempt": 2,
              "result": "Pending"
            }
          },
          {
            "at": 4,
            "lane": 1,
            "to": 2,
            "name": "ثبت سفارش دوم",
            "wire": "INSERT order44",
            "why": "بدون قرارداد تشخیص تکرار، POST اثر تازه دارد.",
            "patch": {
              "orders": 2,
              "key": "None"
            }
          },
          {
            "at": 5,
            "lane": 1,
            "to": 0,
            "name": "پاسخ نهایی",
            "wire": "201 order44",
            "why": "کلاینت نتیجهٔ retry را دریافت می‌کند.",
            "patch": {
              "result": "order44"
            },
            "tone": "error"
          }
        ],
        "verdict": "دو سفارش ایجاد شد؛ timeout شکست عملیات را ثابت نمی‌کند."
      },
      {
        "id": "key",
        "label": "با کلید یکتایی",
        "initial": {
          "attempt": 0,
          "orders": 0,
          "key": "—",
          "result": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ارسال اول",
            "wire": "POST key=42",
            "why": "کلاینت هنوز نتیجه ندارد.",
            "patch": {
              "attempt": 1,
              "result": "Pending"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 2,
            "name": "ثبت اتمیک",
            "wire": "COMMIT order43",
            "why": "درخواست اول موفق شد.",
            "patch": {
              "orders": 1,
              "key": "42→order43"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 0,
            "name": "گم شدن پاسخ",
            "wire": "201 lost",
            "why": "کلاینت از commit خبر ندارد.",
            "patch": {
              "result": "Timeout"
            },
            "tone": "error"
          },
          {
            "at": 3,
            "lane": 0,
            "to": 1,
            "name": "تلاش مجدد",
            "wire": "POST same key",
            "why": "همان قصد کسب‌وکار دوباره فرستاده می‌شود.",
            "patch": {
              "attempt": 2,
              "result": "Pending"
            }
          },
          {
            "at": 4,
            "lane": 1,
            "to": 2,
            "name": "بازیابی نتیجه قبلی",
            "wire": "unique key hit",
            "why": "با تطابق payload و کلید، نتیجه قبلی بازمی‌گردد؛ عملیات دوم اجرا نمی‌شود.",
            "patch": {
              "orders": 1,
              "key": "42→order43"
            }
          },
          {
            "at": 5,
            "lane": 1,
            "to": 0,
            "name": "پاسخ نهایی",
            "wire": "201 order43",
            "why": "کلاینت نتیجهٔ retry را دریافت می‌کند.",
            "patch": {
              "result": "order43"
            },
            "tone": "success"
          }
        ],
        "verdict": "یک سفارش؛ ثبت اتمیک کلید/اثر و اعتبار payload ضروری است."
      }
    ],
    "diagnose": "request ID، شناسهٔ idempotency و تعداد commit را در لاگ کنترل‌شده ردیابی کنید.",
    "tradeoff": "معنای idempotent در HTTP با قرارداد کلید برای POST یکسان نیست؛ عمر کلید، scope و هم‌زمانی را طراحی کنید.",
    "sources": [
      {
        "label": "RFC 9110",
        "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
      }
    ]
  },
  {
    "slug": "http-status-codes",
    "title": "303 یا 307 پس از POST",
    "question": "آیا درخواست دوم GET است یا POST با همان بدنه؟",
    "assumptions": "کلاینت نمونه redirect را خودکار دنبال می‌کند؛ دو endpoint هم‌مبدأ.",
    "lanes": [
      "Client",
      "Old URL",
      "New URL"
    ],
    "fields": {
      "method": "متد جاری",
      "body": "بدنه",
      "status": "پاسخ",
      "writes": "نوشتن‌ها"
    },
    "code": "POST /checkout HTTP/1.1\n...\nHTTP/1.1 303 See Other\nLocation: /orders/43\n# 307 preserves method and content",
    "cases": [
      {
        "id": "see-other",
        "label": "303 پس از ثبت",
        "initial": {
          "method": "POST",
          "body": "Order data",
          "status": "—",
          "writes": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ارسال POST",
            "wire": "POST /checkout",
            "why": "برنامه سفارش را ثبت می‌کند.",
            "patch": {
              "writes": 1
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 0,
            "name": "محل نتیجه",
            "wire": "303 Location",
            "why": "کلاینت نمایش منبع دیگر را می‌خواند.",
            "patch": {
              "status": "303"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "name": "تغییر متد",
            "wire": "GET",
            "why": "در follow این POST با GET و بدون بدنه جایگزین می‌شود.",
            "patch": {
              "method": "GET",
              "body": "None"
            }
          },
          {
            "at": 3,
            "lane": 0,
            "to": 2,
            "name": "خواندن سفارش",
            "wire": "GET /orders/43",
            "why": "فقط مشاهده نتیجه انجام می‌شود.",
            "patch": {
              "status": "Pending"
            }
          },
          {
            "at": 4,
            "lane": 2,
            "to": 0,
            "name": "پاسخ نمایش",
            "wire": "200 OK",
            "why": "اثر ثبت تنها یک بار رخ داد.",
            "patch": {
              "status": "200"
            },
            "tone": "success"
          }
        ],
        "verdict": "303 الگوی Post/Redirect/Get را ممکن می‌کند."
      },
      {
        "id": "temporary",
        "label": "307 پیش از اجرا",
        "initial": {
          "method": "POST",
          "body": "Order data",
          "status": "—",
          "writes": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ارسال POST",
            "wire": "POST /checkout",
            "why": "مسیر قدیمی هنوز اثر ایجاد نکرده است.",
            "patch": {
              "status": "Pending"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 0,
            "name": "تغییر مسیر",
            "wire": "307 Location",
            "why": "متد و محتوا باید حفظ شوند.",
            "patch": {
              "status": "307"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "name": "آماده‌سازی دوباره",
            "wire": "POST",
            "why": "کلاینت نمونه بدنه را دوباره می‌فرستد.",
            "patch": {
              "method": "POST",
              "body": "Order data"
            }
          },
          {
            "at": 3,
            "lane": 0,
            "to": 2,
            "name": "مقصد تازه",
            "wire": "POST /new-checkout",
            "why": "عملیات در مقصد انجام می‌شود.",
            "patch": {
              "writes": 1
            }
          },
          {
            "at": 4,
            "lane": 2,
            "to": 0,
            "name": "نتیجه ثبت",
            "wire": "201 Created",
            "why": "متد POST حفظ شد.",
            "patch": {
              "status": "201"
            },
            "tone": "success"
          }
        ],
        "verdict": "307 انتقال درخواست است نه نمایش نتیجه؛ اگر مقصد اول اثر ایجاد کند خطر تکرار دارید."
      }
    ],
    "diagnose": "Network Preserve log، method، Location و request body هر hop را مشاهده کنید.",
    "tradeoff": "301/302 ممکن است POST را به GET تبدیل کنند؛ 307/308 متد را حفظ می‌کنند. امنیت مقصد مهم است.",
    "sources": [
      {
        "label": "RFC 9110",
        "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
      },
      {
        "label": "RFC 9700",
        "url": "https://www.rfc-editor.org/rfc/rfc9700.html"
      }
    ]
  },
  {
    "slug": "cookies-sessions",
    "title": "CSRF و کنترل سمت سرور",
    "question": "آیا وجود session cookie برای پذیرش تغییر وضعیت کافی است؟",
    "assumptions": "درخواست POST میان‌سایتی به برنامه آزمایشی؛ Cookie Secure; HttpOnly; SameSite=None و HTTPS؛ فرض اجازهٔ cookie ثالث. فقط مدل دفاعی.",
    "lanes": [
      "Browser",
      "API",
      "Session store"
    ],
    "fields": {
      "cookie": "ارسال Cookie",
      "session": "اعتبار نشست",
      "csrf": "کنترل CSRF",
      "changed": "تغییر وضعیت"
    },
    "code": "session = requireSession(request)\nrequireCsrfToken(request, session)\nrequirePermission(session.user, resource)\napplyMutation()",
    "cases": [
      {
        "id": "session-only",
        "label": "فقط بررسی نشست",
        "initial": {
          "cookie": "Present",
          "session": "Unknown",
          "csrf": "—",
          "changed": "No"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "درخواست میان‌سایتی",
            "wire": "POST (cookie attached)",
            "why": "HttpOnly مانع ارسال خودکار cookie نیست؛ فرض SameSite=None.",
            "patch": {
              "cookie": "Sent"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 2,
            "name": "خواندن نشست",
            "wire": "lookup sid",
            "why": "هویت نشست معتبر است.",
            "patch": {
              "session": "Valid"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "name": "بررسی قصد درخواست",
            "wire": "No CSRF check",
            "why": "وجود نشست به معنی قصد کاربر نیست.",
            "patch": {
              "csrf": "Not checked"
            }
          },
          {
            "at": 3,
            "lane": 1,
            "name": "اجرای عملیات",
            "wire": "Mutation",
            "why": "سیاست ناقص عملیات را پذیرفت.",
            "patch": {
              "changed": "Yes"
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 1,
            "to": 0,
            "name": "پاسخ",
            "wire": "200",
            "why": "CORS خواندن پاسخ و امکان ارسال بعضی درخواست‌ها را باید جدا تحلیل کرد.",
            "patch": {
              "csrf": "Bypassed"
            }
          }
        ],
        "verdict": "اعتبار session به تنهایی از CSRF جلوگیری نمی‌کند."
      },
      {
        "id": "validated",
        "label": "اعتبارسنجی CSRF",
        "initial": {
          "cookie": "Present",
          "session": "Unknown",
          "csrf": "—",
          "changed": "No"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "درخواست میان‌سایتی",
            "wire": "POST (cookie attached)",
            "why": "HttpOnly مانع ارسال خودکار cookie نیست؛ فرض SameSite=None.",
            "patch": {
              "cookie": "Sent"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 2,
            "name": "خواندن نشست",
            "wire": "lookup sid",
            "why": "هویت نشست معتبر است.",
            "patch": {
              "session": "Valid"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "name": "بررسی قصد درخواست",
            "wire": "Missing CSRF token",
            "why": "توکن دفاعی معتبر وجود ندارد.",
            "patch": {
              "csrf": "Missing → reject"
            },
            "tone": "error"
          },
          {
            "at": 3,
            "lane": 1,
            "name": "رد عملیات",
            "wire": "403",
            "why": "هیچ تغییری رخ نمی‌دهد.",
            "patch": {
              "changed": "No"
            },
            "tone": "success"
          },
          {
            "at": 4,
            "lane": 1,
            "to": 0,
            "name": "پاسخ",
            "wire": "403",
            "why": "CORS خواندن پاسخ و امکان ارسال بعضی درخواست‌ها را باید جدا تحلیل کرد.",
            "patch": {
              "csrf": "Rejected"
            }
          }
        ],
        "verdict": "هویت، CSRF و مجوز سه بررسی مستقل‌اند."
      }
    ],
    "diagnose": "در سایت آزمایشی Cookie attributes، Origin و CSRF validation را بررسی کنید؛ توکن واقعی را ثبت نکنید.",
    "tradeoff": "SameSite دفاع تکمیلی است؛ نوع navigation و تفاوت سایت و origin مهم است.",
    "sources": [
      {
        "label": "OWASP — CSRF prevention",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html"
      },
      {
        "label": "RFC 6265",
        "url": "https://www.rfc-editor.org/rfc/rfc6265.html"
      }
    ]
  },
  {
    "slug": "websocket",
    "title": "Backpressure و صف ارسال",
    "question": "اگر برنامه سریع‌تر از شبکه send کند، bufferedAmount چه می‌شود؟",
    "assumptions": "هر tick تولید ۴ KiB، تخلیه شبکه ۲ KiB. حد برنامه ۶ KiB؛ پیام جدید در حالت کنترل‌شده defer می‌شود.",
    "lanes": [
      "Producer",
      "WS buffer",
      "Network"
    ],
    "fields": {
      "queued": "صف ارسال KiB",
      "generated": "تولید KiB",
      "sent": "ارسال KiB",
      "deferred": "تعویق KiB"
    },
    "code": "if (ws.readyState === WebSocket.OPEN &&\n    ws.bufferedAmount + messageBytes <= limit) {\n  ws.send(message);\n} else { /* bounded defer / drop policy */ }",
    "cases": [
      {
        "id": "unbounded",
        "label": "ارسال بدون محدودیت",
        "initial": {
          "queued": 0,
          "generated": 0,
          "sent": 0,
          "deferred": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ورود پیام",
            "wire": "+4 KiB",
            "why": "داده در صف ارسال قرار می‌گیرد؛ send به معنی تحویل نیست.",
            "patch": {
              "queued": 4,
              "generated": 4,
              "deferred": 0
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 2,
            "name": "تخلیه شبکه",
            "wire": "-2 KiB",
            "why": "شبکه تنها ظرفیت دو KiB در tick دارد.",
            "patch": {
              "queued": 2,
              "sent": 2
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 1,
            "name": "ورود پیام",
            "wire": "+4 KiB",
            "why": "داده در صف ارسال قرار می‌گیرد؛ send به معنی تحویل نیست.",
            "patch": {
              "queued": 6,
              "generated": 8,
              "deferred": 0
            }
          },
          {
            "at": 3,
            "lane": 1,
            "to": 2,
            "name": "تخلیه شبکه",
            "wire": "-2 KiB",
            "why": "شبکه تنها ظرفیت دو KiB در tick دارد.",
            "patch": {
              "queued": 4,
              "sent": 4
            }
          },
          {
            "at": 4,
            "lane": 0,
            "to": 1,
            "name": "ورود پیام",
            "wire": "+4 KiB",
            "why": "داده در صف ارسال قرار می‌گیرد؛ send به معنی تحویل نیست.",
            "patch": {
              "queued": 8,
              "generated": 12,
              "deferred": 0
            }
          },
          {
            "at": 5,
            "lane": 1,
            "to": 2,
            "name": "تخلیه شبکه",
            "wire": "-2 KiB",
            "why": "شبکه تنها ظرفیت دو KiB در tick دارد.",
            "patch": {
              "queued": 6,
              "sent": 6
            }
          },
          {
            "at": 6,
            "lane": 0,
            "to": 1,
            "name": "ورود پیام",
            "wire": "+4 KiB",
            "why": "داده در صف ارسال قرار می‌گیرد؛ send به معنی تحویل نیست.",
            "patch": {
              "queued": 10,
              "generated": 16,
              "deferred": 0
            }
          },
          {
            "at": 7,
            "lane": 1,
            "to": 2,
            "name": "تخلیه شبکه",
            "wire": "-2 KiB",
            "why": "شبکه تنها ظرفیت دو KiB در tick دارد.",
            "patch": {
              "queued": 8,
              "sent": 8
            }
          },
          {
            "at": 8,
            "lane": 0,
            "to": 1,
            "name": "ورود پیام",
            "wire": "+4 KiB",
            "why": "داده در صف ارسال قرار می‌گیرد؛ send به معنی تحویل نیست.",
            "patch": {
              "queued": 12,
              "generated": 20,
              "deferred": 0
            }
          },
          {
            "at": 9,
            "lane": 1,
            "to": 2,
            "name": "تخلیه شبکه",
            "wire": "-2 KiB",
            "why": "شبکه تنها ظرفیت دو KiB در tick دارد.",
            "patch": {
              "queued": 10,
              "sent": 10
            }
          }
        ],
        "verdict": "صف رشد می‌کند چون نرخ ورود از خروج بیشتر است."
      },
      {
        "id": "bounded",
        "label": "صف محدود",
        "initial": {
          "queued": 0,
          "generated": 0,
          "sent": 0,
          "deferred": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ورود پیام",
            "wire": "+4 KiB",
            "why": "داده در صف ارسال قرار می‌گیرد؛ send به معنی تحویل نیست.",
            "patch": {
              "queued": 4,
              "generated": 4,
              "deferred": 0
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 2,
            "name": "تخلیه شبکه",
            "wire": "-2 KiB",
            "why": "شبکه تنها ظرفیت دو KiB در tick دارد.",
            "patch": {
              "queued": 2,
              "sent": 2
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 1,
            "name": "ورود پیام",
            "wire": "+4 KiB",
            "why": "داده در صف ارسال قرار می‌گیرد؛ send به معنی تحویل نیست.",
            "patch": {
              "queued": 6,
              "generated": 8,
              "deferred": 0
            }
          },
          {
            "at": 3,
            "lane": 1,
            "to": 2,
            "name": "تخلیه شبکه",
            "wire": "-2 KiB",
            "why": "شبکه تنها ظرفیت دو KiB در tick دارد.",
            "patch": {
              "queued": 4,
              "sent": 4
            }
          },
          {
            "at": 4,
            "lane": 0,
            "to": 1,
            "name": "کنترل ظرفیت",
            "wire": "defer 4 KiB",
            "why": "برنامه از رشد بیش از حد صف جلوگیری می‌کند.",
            "patch": {
              "queued": 4,
              "generated": 12,
              "deferred": 4
            },
            "tone": "error"
          },
          {
            "at": 5,
            "lane": 1,
            "to": 2,
            "name": "تخلیه شبکه",
            "wire": "-2 KiB",
            "why": "شبکه تنها ظرفیت دو KiB در tick دارد.",
            "patch": {
              "queued": 2,
              "sent": 6
            }
          },
          {
            "at": 6,
            "lane": 0,
            "to": 1,
            "name": "ورود پیام",
            "wire": "+4 KiB",
            "why": "داده در صف ارسال قرار می‌گیرد؛ send به معنی تحویل نیست.",
            "patch": {
              "queued": 6,
              "generated": 16,
              "deferred": 4
            }
          },
          {
            "at": 7,
            "lane": 1,
            "to": 2,
            "name": "تخلیه شبکه",
            "wire": "-2 KiB",
            "why": "شبکه تنها ظرفیت دو KiB در tick دارد.",
            "patch": {
              "queued": 4,
              "sent": 8
            }
          },
          {
            "at": 8,
            "lane": 0,
            "to": 1,
            "name": "کنترل ظرفیت",
            "wire": "defer 4 KiB",
            "why": "برنامه از رشد بیش از حد صف جلوگیری می‌کند.",
            "patch": {
              "queued": 4,
              "generated": 20,
              "deferred": 8
            },
            "tone": "error"
          },
          {
            "at": 9,
            "lane": 1,
            "to": 2,
            "name": "تخلیه شبکه",
            "wire": "-2 KiB",
            "why": "شبکه تنها ظرفیت دو KiB در tick دارد.",
            "patch": {
              "queued": 2,
              "sent": 10
            }
          }
        ],
        "verdict": "صف محدود می‌ماند؛ پیام‌های deferشده باید طبق نیاز تحویل، حذف یا تجمیع شوند."
      }
    ],
    "diagnose": "bufferedAmount را همراه نرخ تولید، latency و reconnect اندازه بگیرید.",
    "tradeoff": "bufferedAmount صف ارسال محلی است، نه تأیید تحویل. WebSocket معمول backpressure دریافت را خودکار فراهم نمی‌کند.",
    "sources": [
      {
        "label": "MDN — bufferedAmount",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/bufferedAmount"
      },
      {
        "label": "MDN — WebSocket",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket"
      },
      {
        "label": "RFC 6455",
        "url": "https://www.rfc-editor.org/rfc/rfc6455.html"
      }
    ]
  }
] satisfies DeepLesson[];
