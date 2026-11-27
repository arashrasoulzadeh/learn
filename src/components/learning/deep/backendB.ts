import type {DeepLesson} from './types';
export const backendB = [
  {
    "slug": "middleware",
    "title": "بازگشت زنجیره و await فراموش‌شده",
    "question": "آیا logger بدون await next() زمان واقعی handler را اندازه می‌گیرد؟",
    "assumptions": "مدل onion async با handler 50ms؛ قرارداد next یک Promise است. logger بیرونی پاسخ را finalize می‌کند.",
    "lanes": [
      "Logger",
      "Auth",
      "Handler"
    ],
    "fields": {
      "log": "ترتیب log",
      "chain": "Promise downstream",
      "response": "وضعیت پاسخ",
      "duration": "زمان گزارش‌شده ms"
    },
    "code": "async function logger(ctx, next) {\n  const start = now();\n  try { await next(); }\n  finally { log(now() - start); }\n}",
    "cases": [
      {
        "id": "missing",
        "label": "next بدون await/return",
        "initial": {
          "log": "—",
          "chain": "Idle",
          "response": "Pending",
          "duration": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "name": "ثبت آغاز",
            "wire": "log start",
            "why": "logger زمان شروع را می‌گیرد.",
            "patch": {
              "log": "start"
            }
          },
          {
            "at": 1,
            "lane": 0,
            "to": 1,
            "name": "فراخوانی بدون انتظار",
            "wire": "next()",
            "why": "Promise پایین‌دست آغاز می‌شود.",
            "patch": {
              "chain": "Pending"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 2,
            "name": "اجرای handler",
            "wire": "await I/O",
            "why": "کار برنامه ۵۰ms طول می‌کشد.",
            "patch": {
              "response": "Not ready"
            }
          },
          {
            "at": 3,
            "lane": 0,
            "name": "ثبت پایان زودهنگام",
            "wire": "log end",
            "why": "logger پیش از تکمیل handler پایان یافته.",
            "patch": {
              "log": "start,end",
              "duration": 3,
              "response": "Finalized too early"
            },
            "tone": "error"
          },
          {
            "at": 52,
            "lane": 2,
            "to": 1,
            "name": "نتیجه دیررس",
            "wire": "handler done",
            "why": "پاسخ دیرتر آماده شد و کنترل بیرونی پایان یافته است.",
            "patch": {
              "chain": "Fulfilled",
              "log": "start,end,handler"
            },
            "tone": "error"
          }
        ],
        "verdict": "مدت گزارش‌شده ۳ms به‌جای زمان کل؛ در این مدل پاسخ زود finalize شد."
      },
      {
        "id": "awaited",
        "label": "await next و finally",
        "initial": {
          "log": "—",
          "chain": "Idle",
          "response": "Pending",
          "duration": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "name": "ثبت آغاز",
            "wire": "log start",
            "why": "شروع logger.",
            "patch": {
              "log": "start"
            }
          },
          {
            "at": 1,
            "lane": 0,
            "to": 1,
            "name": "انتظار زنجیره",
            "wire": "await next()",
            "why": "logger ادامه خود را به Promise وابسته می‌کند.",
            "patch": {
              "chain": "Pending"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 2,
            "name": "اجرای handler",
            "wire": "await I/O",
            "why": "کار I/O بدون بلوکه کردن تابع بیرونی ادامه دارد.",
            "patch": {
              "response": "Not ready"
            }
          },
          {
            "at": 52,
            "lane": 2,
            "to": 1,
            "name": "پایان handler",
            "wire": "return result",
            "why": "نتیجه در context آماده است.",
            "patch": {
              "chain": "Fulfilled",
              "log": "start,handler",
              "response": "Ready"
            }
          },
          {
            "at": 53,
            "lane": 1,
            "to": 0,
            "name": "بازگشت و finally",
            "wire": "log end",
            "why": "logger پس از تکمیل پایین‌دست پایان را ثبت می‌کند.",
            "patch": {
              "log": "start,handler,end",
              "duration": 53,
              "response": "Finalized"
            },
            "tone": "success"
          }
        ],
        "verdict": "await یا return صحیح Promise قرارداد pipeline را حفظ می‌کند."
      }
    ],
    "diagnose": "trace start/end با request ID و زمان handler را مقایسه کنید؛ rejected Promise را در مرز خطا ببینید.",
    "tradeoff": "Express و Koa قراردادهای متفاوت دارند؛ این مدل دقیقاً onion async است.",
    "sources": [
      {
        "label": "Koa cascading middleware",
        "url": "https://koajs.com/"
      },
      {
        "label": "Express middleware",
        "url": "https://expressjs.com/en/guide/using-middleware.html"
      }
    ]
  },
  {
    "slug": "rest-api",
    "title": "Optimistic concurrency و Compare-And-Swap",
    "question": "آیا GET سپس PUT بدون شرط مانع lost update می‌شود؟",
    "assumptions": "دو کلاینت یک نمایش v1 را می‌خوانند؛ A قیمت 45 و B قیمت 40 می‌خواهد. ETag قوی و شرط اتمیک در DB در حالت دوم.",
    "lanes": [
      "Client A",
      "API / DB",
      "Client B"
    ],
    "fields": {
      "a": "نسخه A",
      "b": "نسخه B",
      "version": "نسخه جاری",
      "price": "قیمت ثبت‌شده",
      "status": "نتیجه B"
    },
    "code": "GET /products/42 -> ETag: \"v1\"\nPUT /products/42\nIf-Match: \"v1\"\n\nUPDATE products SET price=?,version=version+1\nWHERE id=? AND version=?;\n-- zero affected rows -> 412",
    "cases": [
      {
        "id": "blind",
        "label": "نوشتن بدون شرط",
        "initial": {
          "a": "—",
          "b": "—",
          "version": "v1",
          "price": 50,
          "status": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "خواندن A",
            "wire": "GET",
            "why": "A v1 را می‌گیرد.",
            "patch": {
              "a": "v1"
            }
          },
          {
            "at": 1,
            "lane": 2,
            "to": 1,
            "name": "خواندن B",
            "wire": "GET",
            "why": "B هم v1 را می‌گیرد.",
            "patch": {
              "b": "v1"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 1,
            "name": "ویرایش A",
            "wire": "PUT price=45",
            "why": "ثبت A نسخه را عوض می‌کند.",
            "patch": {
              "price": 45,
              "version": "v2"
            }
          },
          {
            "at": 3,
            "lane": 2,
            "to": 1,
            "name": "ویرایش B",
            "wire": "PUT price=40",
            "why": "B از نسخه قدیمی تصمیم گرفته اما شرطی ندارد.",
            "patch": {
              "price": 40,
              "version": "v3"
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 1,
            "to": 2,
            "name": "پاسخ B",
            "wire": "200 OK",
            "why": "تغییر A بی‌اطلاع B بازنویسی شد.",
            "patch": {
              "status": 200
            },
            "tone": "error"
          }
        ],
        "verdict": "آخرین نویسنده برنده شد؛ 200 موفقیت منطقی هم‌زمانی را ثابت نمی‌کند."
      },
      {
        "id": "cas",
        "label": "If-Match و شرط اتمیک",
        "initial": {
          "a": "—",
          "b": "—",
          "version": "v1",
          "price": 50,
          "status": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "خواندن A",
            "wire": "GET → v1",
            "why": "A نسخه را نگه می‌دارد.",
            "patch": {
              "a": "v1"
            }
          },
          {
            "at": 1,
            "lane": 2,
            "to": 1,
            "name": "خواندن B",
            "wire": "GET → v1",
            "why": "B نیز v1 را دارد.",
            "patch": {
              "b": "v1"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 1,
            "name": "نوشتن شرطی A",
            "wire": "If-Match v1",
            "why": "شرط هم‌زمان با نوشتن بررسی شد.",
            "patch": {
              "price": 45,
              "version": "v2"
            }
          },
          {
            "at": 3,
            "lane": 2,
            "to": 1,
            "name": "نوشتن شرطی B",
            "wire": "If-Match v1",
            "why": "v1 دیگر نسخه جاری نیست؛ هیچ row تغییر نمی‌کند.",
            "patch": {
              "status": "Mismatch"
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 1,
            "to": 2,
            "name": "رد شرط",
            "wire": "412",
            "why": "قیمت ۴۵ باقی ماند؛ B باید بازخوانی و تعارض را حل کند.",
            "patch": {
              "status": 412
            },
            "tone": "success"
          }
        ],
        "verdict": "قید نسخهٔ اتمیک از بازنویسی ناخواسته در این مدل جلوگیری کرد."
      }
    ],
    "diagnose": "HTTP ETag/If-Match و تعداد affected rows را در trace هماهنگ کنید.",
    "tradeoff": "صرف بررسی ETag پیش از UPDATE بدون تضمین اتمیک TOCTOU دارد؛ همه مسیرهای نوشتن باید نسخه را رعایت کنند.",
    "sources": [
      {
        "label": "Fielding REST",
        "url": "https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm"
      },
      {
        "label": "RFC 9110 conditional requests",
        "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
      }
    ]
  },
  {
    "slug": "authentication",
    "title": "MFA، هزینهٔ password verification و محدودیت تلاش",
    "question": "آیا گذرواژهٔ درست همیشه به معنی ایجاد session است؟",
    "assumptions": "مدل دفاعی ورود با password verifier و عامل دوم الزامی؛ هیچ رمز واقعی یا عملیات احراز تولیدی اجرا نمی‌شود.",
    "lanes": [
      "Client",
      "Auth service",
      "MFA / session"
    ],
    "fields": {
      "password": "عامل اول",
      "factor": "عامل دوم",
      "attempt": "تلاش تأیید",
      "session": "نشست",
      "response": "پاسخ"
    },
    "code": "if !rateLimiter.allow(account, context): reject()\nif !verifyPassword(password, storedHash): rejectGeneric()\nif !verifySecondFactor(challenge): reject()\nreturn rotateAndCreateSession(user)",
    "cases": [
      {
        "id": "password-only",
        "label": "سیاست ناقص: فقط گذرواژه",
        "initial": {
          "password": "Unknown",
          "factor": "Not checked",
          "attempt": 0,
          "session": "None",
          "response": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "تلاش ورود",
            "wire": "Login",
            "why": "سهمیهٔ نمونه اجازه می‌دهد.",
            "patch": {
              "attempt": 1
            }
          },
          {
            "at": 1,
            "lane": 1,
            "name": "بررسی verifier",
            "wire": "Argon2id verify",
            "why": "گذرواژهٔ نمونه درست است.",
            "patch": {
              "password": "Valid"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "name": "عامل دوم بررسی نمی‌شود",
            "wire": "Skip MFA",
            "why": "سیاست ناقص فقط عامل اول را ملاک قرار می‌دهد.",
            "patch": {
              "factor": "Skipped"
            },
            "tone": "error"
          },
          {
            "at": 3,
            "lane": 1,
            "to": 2,
            "name": "ساخت نشست",
            "wire": "new sid",
            "why": "نشست به وجود آمد بدون عامل دوم.",
            "patch": {
              "session": "Created"
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 1,
            "to": 0,
            "name": "پاسخ ورود",
            "wire": "200",
            "why": "کنترل MFA لازم اعمال نشد.",
            "patch": {
              "response": 200
            }
          }
        ],
        "verdict": "اگر سیاست به MFA نیاز دارد، عبور فقط با گذرواژه کافی نیست."
      },
      {
        "id": "mfa",
        "label": "الزام عامل دوم",
        "initial": {
          "password": "Unknown",
          "factor": "Pending",
          "attempt": 0,
          "session": "None",
          "response": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "تلاش ورود",
            "wire": "Login",
            "why": "سهمیه پیش از verifier بررسی شده.",
            "patch": {
              "attempt": 1
            }
          },
          {
            "at": 1,
            "lane": 1,
            "name": "تأیید عامل اول",
            "wire": "Password valid",
            "why": "هویت کامل هنوز ثابت نشده.",
            "patch": {
              "password": "Valid"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 0,
            "name": "چالش عامل دوم",
            "wire": "Challenge",
            "why": "نشست کامل هنوز صادر نشده است.",
            "patch": {
              "factor": "Required",
              "response": "MFA required"
            }
          },
          {
            "at": 3,
            "lane": 0,
            "to": 2,
            "name": "عدم تأیید عامل دوم",
            "wire": "No valid proof",
            "why": "فقدان عامل دوم موجب رد ورود کامل است.",
            "patch": {
              "factor": "Failed"
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 1,
            "to": 0,
            "name": "رد بدون نشست",
            "wire": "Denied",
            "why": "شناسه session کامل صادر نمی‌شود.",
            "patch": {
              "response": "Denied",
              "session": "None"
            },
            "tone": "success"
          }
        ],
        "verdict": "الزام عامل دوم اثر گذرواژهٔ افشاشده را کاهش می‌دهد؛ recovery و rate limit نیز مهم‌اند."
      }
    ],
    "diagnose": "فقط log ساختاریافتهٔ نتیجهٔ عامل‌ها، challenge lifecycle و محدودیت تلاش را بررسی کنید؛ رمز و OTP را ثبت نکنید.",
    "tradeoff": "MFA همه خطرها را حذف نمی‌کند؛ WebAuthn و سیاست بازیابی مقاوم در برابر phishing اهمیت دارند.",
    "sources": [
      {
        "label": "OWASP Authentication",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html"
      },
      {
        "label": "OWASP MFA",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html"
      },
      {
        "label": "OWASP Password Storage",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
      }
    ]
  },
  {
    "slug": "authorization",
    "title": "مرز tenant و کنترل سطح شیء",
    "question": "آیا داشتن role=editor برای تغییر هر سفارش کافی است؟",
    "assumptions": "سیاست نمونه: کاربر معتبر editor در tenant A فقط سفارش‌های tenant A و عملیات مجاز را می‌تواند تغییر دهد. مدل دفاعی.",
    "lanes": [
      "Client",
      "Policy",
      "Order store"
    ],
    "fields": {
      "identity": "هویت",
      "role": "نقش",
      "tenant": "tenant سفارش",
      "writes": "نوشتن",
      "decision": "تصمیم"
    },
    "code": "UPDATE orders SET status=?\nWHERE id=? AND tenant_id=?;\n-- tenant_id from verified principal, not request body\n-- also enforce operation / object permission",
    "cases": [
      {
        "id": "role-only",
        "label": "فقط بررسی نقش",
        "initial": {
          "identity": "user42 / tenant A",
          "role": "editor",
          "tenant": "B",
          "writes": 0,
          "decision": "Pending"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "درخواست",
            "wire": "PATCH order99",
            "why": "هویت معتبر است ولی order متعلق به B.",
            "patch": {
              "decision": "Checking"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "name": "بررسی role",
            "wire": "editor",
            "why": "سیاست ناقص scope شیء را بررسی نکرد.",
            "patch": {
              "decision": "Role passed"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 2,
            "name": "جست‌وجو بدون tenant",
            "wire": "id=99",
            "why": "رکورد tenant B انتخاب شد.",
            "patch": {
              "tenant": "B selected"
            },
            "tone": "error"
          },
          {
            "at": 3,
            "lane": 2,
            "name": "تغییر نامجاز",
            "wire": "UPDATE",
            "why": "قید tenant وجود ندارد.",
            "patch": {
              "writes": 1
            },
            "tone": "error"
          },
          {
            "at": 4,
            "lane": 1,
            "to": 0,
            "name": "پاسخ",
            "wire": "200",
            "why": "داده خارج از محدوده تغییر کرد.",
            "patch": {
              "decision": "Wrongly allowed"
            },
            "tone": "error"
          }
        ],
        "verdict": "RBAC به تنهایی برای کنترل سطح شیء کافی نیست."
      },
      {
        "id": "scoped",
        "label": "قید tenant و عملیات",
        "initial": {
          "identity": "user42 / tenant A",
          "role": "editor",
          "tenant": "B",
          "writes": 0,
          "decision": "Pending"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "درخواست",
            "wire": "PATCH order99",
            "why": "tenant از principal تأییدشده می‌آید.",
            "patch": {
              "decision": "Checking"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "name": "کنترل عملیات",
            "wire": "can edit?",
            "why": "نقش editor فقط اجازه اولیه می‌دهد.",
            "patch": {
              "decision": "Operation passed"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 2,
            "name": "query محدود به tenant",
            "wire": "id=99 AND tenant=A",
            "why": "هیچ ردیف مجازی تطبیق ندارد.",
            "patch": {
              "tenant": "No scoped match"
            }
          },
          {
            "at": 3,
            "lane": 2,
            "to": 1,
            "name": "عدم تغییر",
            "wire": "0 affected rows",
            "why": "اثر نوشتن ایجاد نشده است.",
            "patch": {
              "writes": 0
            }
          },
          {
            "at": 4,
            "lane": 1,
            "to": 0,
            "name": "رد مطابق قرارداد",
            "wire": "404 (hide existence)",
            "why": "پاسخ نمونه وجود منبع دیگر را افشا نمی‌کند.",
            "patch": {
              "decision": "Denied"
            },
            "tone": "success"
          }
        ],
        "verdict": "کنترل مجوز در query و policy باید با محدودهٔ هویت معتبر هم‌راستا باشد."
      }
    ],
    "diagnose": "تست matrix هویت × عملیات × resource و tenant را در محیط محلی اجرا کنید.",
    "tradeoff": "نقش و مالکیت و tenant ممکن است هم‌زمان لازم باشند؛ deny by default و کنترل هر درخواست.",
    "sources": [
      {
        "label": "OWASP Authorization",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
      },
      {
        "label": "OWASP API object authorization",
        "url": "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/"
      }
    ]
  },
  {
    "slug": "jwt",
    "title": "چرخهٔ کلید، kid و اعتبار claims",
    "question": "آیا امضای معتبر با کلید قبلی همیشه باید رد شود؟",
    "assumptions": "کلیدهای امضای نامتقارن K1/K2 نمونه‌اند؛ issuer/audience/alg ثابت، توکن K1 هنوز exp معتبر دارد. هیچ JWT واقعی تولید نمی‌شود.",
    "lanes": [
      "Issuer",
      "Verifier",
      "Trusted JWKS"
    ],
    "fields": {
      "issuer": "کلید جاری",
      "keys": "کلیدهای قابل اعتماد",
      "token": "توکن ارائه‌شده",
      "signature": "اعتبارسنجی",
      "result": "پاسخ"
    },
    "code": "// pseudocode: configured issuer + JWKS, not token-supplied URL\nverify(token, trustedKeys, {\n  algorithms: ['RS256'], issuer: expectedIss,\n  audience: 'orders'\n});\n// validate expiry and authorization separately",
    "cases": [
      {
        "id": "remove",
        "label": "حذف زودهنگام کلید قدیمی",
        "initial": {
          "issuer": "K1",
          "keys": "K1",
          "token": "K1 valid exp",
          "signature": "Unchecked",
          "result": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "توکن قبلی",
            "wire": "kid=K1",
            "why": "توکن هنوز منقضی نشده.",
            "patch": {
              "token": "K1 valid exp"
            }
          },
          {
            "at": 1,
            "lane": 0,
            "to": 2,
            "name": "چرخش امضا",
            "wire": "K2 published",
            "why": "issuer از K2 برای توکن تازه استفاده می‌کند.",
            "patch": {
              "issuer": "K2",
              "keys": "K1,K2"
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 2,
            "name": "حذف K1 زودهنگام",
            "wire": "Remove K1",
            "why": "فرض کلید compromise نشده؛ هنوز توکن معتبر قبلی هست.",
            "patch": {
              "keys": "K2"
            },
            "tone": "error"
          },
          {
            "at": 3,
            "lane": 1,
            "to": 2,
            "name": "جست‌وجوی کلید",
            "wire": "kid K1 missing",
            "why": "verifier پس از refresh کلید معتبر K1 ندارد.",
            "patch": {
              "signature": "Cannot verify"
            }
          },
          {
            "at": 4,
            "lane": 1,
            "name": "رد توکن",
            "wire": "401 invalid_token",
            "why": "توکن قدیمی معتبر زمانی، دیگر قابل verification نیست.",
            "patch": {
              "result": "401"
            },
            "tone": "error"
          }
        ],
        "verdict": "حذف زودهنگام کلید می‌تواند کاربران با توکن معتبر را قطع کند."
      },
      {
        "id": "overlap",
        "label": "هم‌پوشانی کنترل‌شده",
        "initial": {
          "issuer": "K1",
          "keys": "K1",
          "token": "K1 valid exp",
          "signature": "Unchecked",
          "result": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 2,
            "name": "انتشار کلید تازه",
            "wire": "Publish K2",
            "why": "قبل از استفادهٔ گسترده، K2 قابل دریافت است.",
            "patch": {
              "keys": "K1,K2"
            }
          },
          {
            "at": 1,
            "lane": 0,
            "name": "تغییر signer",
            "wire": "Sign new with K2",
            "why": "توکن‌های قدیمی تا exp ممکن است معتبر بمانند.",
            "patch": {
              "issuer": "K2"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 2,
            "name": "انتخاب کلید معتبر",
            "wire": "kid=K1",
            "why": "verifier کلید را از منبع پیکربندی‌شده انتخاب می‌کند.",
            "patch": {
              "signature": "K1 found"
            }
          },
          {
            "at": 3,
            "lane": 1,
            "name": "اعتبارسنجی",
            "wire": "sig + iss/aud/exp",
            "why": "تمام کنترل‌های نمونه و مجوز منبع درست‌اند.",
            "patch": {
              "signature": "Verified"
            }
          },
          {
            "at": 4,
            "lane": 1,
            "name": "پاسخ مجاز",
            "wire": "200",
            "why": "تا زمانی که K1 معتبر و توکن مطابق سیاست است، پذیرش ممکن است.",
            "patch": {
              "result": "200"
            },
            "tone": "success"
          },
          {
            "at": 5,
            "lane": 0,
            "to": 2,
            "name": "پایان عمر توکن‌ها",
            "wire": "Retire K1",
            "why": "پس از مهلت متناسب با عمر توکن و clock skew، K1 کنار می‌رود.",
            "patch": {
              "keys": "K2"
            }
          }
        ],
        "verdict": "برای rotation عادی هم‌پوشانی کنترل‌شده لازم است؛ compromise سیاست فوری جدا دارد."
      }
    ],
    "diagnose": "خطای unknown kid، cache refresh، issuer/audience و exp را بدون log توکن خام بررسی کنید.",
    "tradeoff": "kid ورودی غیرقابل اعتماد است؛ فقط کلیدهای منبع از پیش معتبر را استفاده کنید. در compromise ممکن است ابطال فوری ضروری باشد.",
    "sources": [
      {
        "label": "RFC 8725 JWT BCP",
        "url": "https://www.rfc-editor.org/rfc/rfc8725.html"
      },
      {
        "label": "RFC 7517 JWK",
        "url": "https://www.rfc-editor.org/rfc/rfc7517.html"
      },
      {
        "label": "RFC 7519 JWT",
        "url": "https://www.rfc-editor.org/rfc/rfc7519.html"
      }
    ]
  }
] satisfies DeepLesson[];
