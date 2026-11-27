import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "reverse-proxy",
  "order": 41,
  "title": "Reverse Proxy — مرز ورودی سرویس",
  "description": "خاتمه TLS، forwarding و پاسخ‌های upstream.",
  "actors": [
    [
      "Client",
      "HTTPS",
      "browser"
    ],
    [
      "Edge",
      "Reverse proxy",
      "proxy"
    ],
    [
      "App",
      "Upstream",
      "app"
    ]
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
  "labels": [
    "درخواست کلاینت",
    "پراکسی",
    "Upstream"
  ],
  "context": "پراکسی خاتمه TLS می‌دهد و در مدل شبکه داخلی کنترل‌شده از HTTP استفاده می‌کند؛ در تولید ممکن است TLS داخلی لازم باشد.",
  "goal": "جدا بودن اتصال client و upstream و trust boundary را توضیح دهید.",
  "scenarios": [
    [
      "forward",
      "Forwarding عادی",
      "آیا آدرس عمومی همان آدرس برنامه است؟",
      "GET /api/orders",
      [
        [
          "ورود HTTPS",
          [
            0,
            1
          ],
          [
            "TLS request"
          ],
          "GET https://shop.example/api/orders",
          "Edge received",
          [
            "HTTPS",
            "TLS terminated",
            "Pending"
          ],
          "اتصال client به edge است؛ برنامه از IP خصوصی استفاده می‌کند.",
          "TLS termination هویت upstream را خودکار تأیید نمی‌کند."
        ],
        [
          "ارسال upstream",
          [
            1,
            2
          ],
          [
            "GET /api/orders",
            "200"
          ],
          "proxy_pass http://app;",
          "200 OK",
          [
            "Pending",
            "Upstream connected",
            "200"
          ],
          "پراکسی درخواست مستقل به upstream می‌سازد.",
          "Host و forwarded headers را طبق trust policy تنظیم کنید."
        ],
        [
          "بازگشت",
          [
            1,
            0
          ],
          [
            "HTTPS 200"
          ],
          "HTTP/1.1 200 OK",
          "200 OK",
          [
            "200",
            "Completed",
            "200"
          ],
          "پاسخ برنامه روی اتصال TLS کلاینت برمی‌گردد.",
          "زمان اتصال upstream و response time را جدا ثبت کنید.",
          "success"
        ]
      ]
    ],
    [
      "bad-gateway",
      "پاسخ نامعتبر upstream",
      "اگر برنامه اتصال را رد کند؟",
      "connect refused",
      [
        [
          "دریافت",
          [
            0,
            1
          ],
          [
            "GET"
          ],
          "GET /api/orders",
          "Request accepted",
          [
            "Pending",
            "Connecting",
            "Down"
          ],
          "edge قابل دسترس است ولی upstream سالم نیست.",
          "health و route را جدا بررسی کنید."
        ],
        [
          "شکست اتصال",
          [
            1,
            2
          ],
          [
            "connect",
            "RST"
          ],
          "connect app:8080",
          "Connection refused",
          [
            "Pending",
            "Upstream error",
            "Refused"
          ],
          "اتصال upstream برقرار نمی‌شود.",
          "ECONNREFUSED با timeout فرق دارد.",
          "error"
        ],
        [
          "پاسخ edge",
          [
            1,
            0
          ],
          [
            "502"
          ],
          "HTTP/1.1 502 Bad Gateway",
          "502 Bad Gateway",
          [
            "502",
            "Generated 502",
            "Down"
          ],
          "در قرارداد NGINX نمونه، edge خطای gateway می‌دهد.",
          "status upstream و status client را در log جدا کنید.",
          "error"
        ]
      ],
      "502 به معنی قطع اتصال مرورگر نیست."
    ],
    [
      "timeout",
      "مهلت upstream",
      "اگر upstream پاسخ را دیر بدهد؟",
      "upstream response timeout",
      [
        [
          "ارسال",
          [
            1,
            2
          ],
          [
            "GET"
          ],
          "upstream request",
          "Accepted",
          [
            "Pending",
            "Waiting",
            "Busy"
          ],
          "اتصال برقرار است ولی پاسخ هنوز نرسیده.",
          "connect timeout و read timeout مستقل‌اند."
        ],
        [
          "پایان مهلت",
          [
            1
          ],
          [
            "read timeout"
          ],
          "proxy_read_timeout (model)",
          "Upstream timed out",
          [
            "Pending",
            "Timed out",
            "May still work"
          ],
          "مهلت خواندن در پراکسی تمام می‌شود؛ کار upstream ممکن است ادامه داشته باشد.",
          "retry عملیات دارای اثر نیاز به idempotency دارد.",
          "error"
        ],
        [
          "پاسخ",
          [
            1,
            0
          ],
          [
            "504"
          ],
          "HTTP/1.1 504 Gateway Timeout",
          "504 Gateway Timeout",
          [
            "504",
            "Generated 504",
            "Unknown outcome"
          ],
          "پاسخ gateway timeout نتیجه کسب‌وکار را اثبات نمی‌کند.",
          "request ID و log upstream را تطبیق دهید.",
          "error"
        ]
      ],
      "مهلت پاسخ با شکست قطعی عملیات فرق دارد."
    ]
  ],
  "pitfall": "به forwarded headers ورودی از اینترنت اعتماد نکنید؛ فقط پراکسی‌های مورد اعتماد را در برنامه تعریف کنید.",
  "takeaway": "edge مرز امنیتی و دو اتصال جدا دارد؛ timeout و خطا را تفکیک کنید.",
  "quiz": [
    "502 در مدل از کجا صادر شد؟",
    [
      "DNS client",
      "پراکسی بعد از شکست upstream",
      "DB به مرورگر"
    ],
    1,
    "edge پاسخ معتبر HTTP تولید می‌کند."
  ],
  "practice": [
    "برنامه IP کاربر را از X-Forwarded-For می‌گیرد؛ چه سیاستی لازم است؟",
    [
      "اعتماد به همه مقدارها",
      "اعتماد فقط به زنجیره پراکسی مشخص و sanitization",
      "حذف TLS"
    ],
    1,
    "header ورودی client قابل جعل است."
  ],
  "hint": "مرز اعتماد، نه صرف وجود header.",
  "terms": [
    [
      "Upstream",
      "سرویس پشت پراکسی"
    ],
    [
      "TLS termination",
      "پایان اتصال TLS در edge"
    ],
    [
      "502/504",
      "خطاهای gateway"
    ]
  ],
  "references": [
    [
      "NGINX proxy module",
      "https://nginx.org/en/docs/http/ngx_http_proxy_module.html"
    ],
    [
      "RFC 9110",
      "https://www.rfc-editor.org/rfc/rfc9110.html"
    ]
  ],
  "exercise": [
    "در مدل محلی وضعیت edge و upstream را جدا کنید.",
    "def status(connect, response):\n    return 502 if not connect else 504 if not response else 200\nassert status(False,False)==502\nassert status(True,False)==504\nprint('502, 504')",
    "دو شکست متفاوت.",
    "رفتار status دقیق به تنظیمات پراکسی وابسته است."
  ],
  "deep": {
    "title": "مهلت پراکسی و نتیجه نامعلوم POST",
    "question": "اگر پاسخ ثبت‌شده بعد از timeout برسد، retry چه اثری دارد؟",
    "assumptions": "edge timeout در t=50، DB commit در t=40، پاسخ t=60؛ مدل کلید یکتایی سفارشی.",
    "lanes": [
      "Client",
      "Proxy",
      "App/DB"
    ],
    "fields": {
      "orders": "تعداد سفارش",
      "status": "پاسخ client",
      "upstream": "وضعیت upstream",
      "attempt": "تلاش"
    },
    "code": "POST /orders\nIdempotency-Key: demo-42\n# proxy timeout is not rollback",
    "cases": [
      [
        "blind",
        "retry کور",
        {
          "orders": 0,
          "status": "Pending",
          "upstream": "Idle",
          "attempt": 0
        },
        [
          [
            0,
            0,
            1,
            "درخواست",
            "POST",
            "تلاش اول.",
            {
              "attempt": 1
            }
          ],
          [
            40,
            1,
            2,
            "ثبت",
            "COMMIT",
            "سفارش ثبت شد.",
            {
              "orders": 1,
              "upstream": "Committed"
            }
          ],
          [
            50,
            1,
            0,
            "مهلت",
            "504",
            "پاسخ هنوز نرسیده.",
            {
              "status": "504"
            },
            "error"
          ],
          [
            60,
            0,
            1,
            "retry",
            "POST",
            "اثر جدید ممکن است.",
            {
              "attempt": 2,
              "orders": 2,
              "status": "201"
            },
            "error"
          ]
        ],
        "دو سفارش."
      ],
      [
        "key",
        "کلید یکتایی",
        {
          "orders": 0,
          "status": "Pending",
          "upstream": "Idle",
          "attempt": 0
        },
        [
          [
            0,
            0,
            1,
            "درخواست",
            "POST key",
            "کلید ثابت.",
            {
              "attempt": 1
            }
          ],
          [
            40,
            1,
            2,
            "ثبت",
            "COMMIT + key",
            "اثر و key اتمیک.",
            {
              "orders": 1,
              "upstream": "Committed key"
            }
          ],
          [
            50,
            1,
            0,
            "مهلت",
            "504",
            "نتیجه client نامعلوم.",
            {
              "status": "504"
            },
            "error"
          ],
          [
            60,
            0,
            1,
            "retry",
            "same key",
            "نتیجه قبلی بازیابی شد.",
            {
              "attempt": 2,
              "status": "201",
              "orders": 1
            },
            "success"
          ]
        ],
        "یک سفارش."
      ]
    ],
    "diagnose": "upstream_connect_time، upstream_response_time، status و request ID را مقایسه کنید.",
    "tradeoff": "مهلت کوتاه بار را محدود می‌کند ولی نتیجه نامعلوم عملیات را حل نمی‌کند."
  }
});
export default lesson;
