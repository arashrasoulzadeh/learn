import type {DeepLesson} from './types';
export const backendA: DeepLesson[] = [
  {
    "slug": "process-thread",
    "title": "زمان‌بندی، interleaving و بخش بحرانی",
    "question": "اگر دو thread هر کدام x را یک بار زیاد کنند، آیا همیشه x=2 است؟",
    "assumptions": "مدل read/modify/write با ترتیب زمان‌بندی مشخص؛ رفتار data race در زبان‌هایی مانند C++ لزوماً تعریف‌شده نیست.",
    "lanes": [
      "Thread A",
      "Memory",
      "Thread B"
    ],
    "fields": {
      "a": "ثبات A",
      "b": "ثبات B",
      "x": "شمارنده",
      "lock": "مالک قفل",
      "done": "افزایش‌های کامل"
    },
    "code": "# pseudocode: protect the entire read-modify-write\nwith mutex:\n    old = counter\n    counter = old + 1",
    "cases": [
      {
        "id": "race",
        "label": "بدون قفل",
        "initial": {
          "a": "—",
          "b": "—",
          "x": 0,
          "lock": "None",
          "done": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 1,
            "to": 0,
            "name": "خواندن A",
            "wire": "READ x=0",
            "why": "A نسخه محلی صفر دارد.",
            "patch": {
              "a": 0
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 2,
            "name": "خواندن B",
            "wire": "READ x=0",
            "why": "B پیش از نوشتن A همان مقدار را می‌خواند.",
            "patch": {
              "b": 0
            }
          },
          {
            "at": 2,
            "lane": 0,
            "name": "محاسبه A",
            "wire": "0+1",
            "why": "محاسبه محلی حافظه مشترک را تغییر نمی‌دهد.",
            "patch": {
              "a": 1
            }
          },
          {
            "at": 3,
            "lane": 2,
            "name": "محاسبه B",
            "wire": "0+1",
            "why": "B نیز بر اساس مقدار قدیمی محاسبه می‌کند.",
            "patch": {
              "b": 1
            }
          },
          {
            "at": 4,
            "lane": 0,
            "to": 1,
            "name": "نوشتن A",
            "wire": "STORE 1",
            "why": "اولین افزایش ثبت شد.",
            "patch": {
              "x": 1,
              "done": 1
            }
          },
          {
            "at": 5,
            "lane": 2,
            "to": 1,
            "name": "نوشتن B",
            "wire": "STORE 1",
            "why": "نوشتن دوم مقدار اول را بازنویسی کرد.",
            "patch": {
              "x": 1,
              "done": 2
            },
            "tone": "error"
          }
        ],
        "verdict": "دو افزایش کامل شده اما شمارنده ۱ است؛ lost update."
      },
      {
        "id": "locked",
        "label": "قفل کل read-modify-write",
        "initial": {
          "a": "—",
          "b": "—",
          "x": 0,
          "lock": "Free",
          "done": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "قفل A",
            "wire": "LOCK",
            "why": "A وارد بخش بحرانی شد.",
            "patch": {
              "lock": "A"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 0,
            "name": "خواندن و محاسبه A",
            "wire": "READ 0; ADD 1",
            "why": "A مقدار تازه را نگه می‌دارد.",
            "patch": {
              "a": 1
            }
          },
          {
            "at": 2,
            "lane": 2,
            "to": 1,
            "name": "درخواست B",
            "wire": "WAIT",
            "why": "B نمی‌تواند خواندن حفاظت‌شده را انجام دهد.",
            "patch": {
              "b": "Waiting"
            }
          },
          {
            "at": 3,
            "lane": 0,
            "to": 1,
            "name": "ثبت و آزادسازی",
            "wire": "STORE 1; UNLOCK",
            "why": "تغییر A قابل مشاهده است.",
            "patch": {
              "x": 1,
              "lock": "Free",
              "done": 1
            }
          },
          {
            "at": 4,
            "lane": 2,
            "to": 1,
            "name": "قفل و خواندن B",
            "wire": "LOCK; READ 1",
            "why": "B مقدار تازه را می‌گیرد.",
            "patch": {
              "lock": "B",
              "b": 2
            }
          },
          {
            "at": 5,
            "lane": 2,
            "to": 1,
            "name": "ثبت و آزادسازی B",
            "wire": "STORE 2",
            "why": "هر دو افزایش ثبت شدند.",
            "patch": {
              "x": 2,
              "lock": "Free",
              "done": 2
            },
            "tone": "success"
          }
        ],
        "verdict": "قفل روی کل عملیات لازم است، نه فقط STORE."
      }
    ],
    "diagnose": "برای race از تست زمان‌بندی کنترل‌شده، ThreadSanitizer در زبان مناسب و بررسی invariant استفاده کنید.",
    "tradeoff": "قفل هزینه contention دارد؛ atomic RMW برای عملیات ساده مناسب است، نه هر invariant چندشیئی.",
    "sources": [
      {
        "label": "POSIX threads",
        "url": "https://pubs.opengroup.org/onlinepubs/9799919799/"
      },
      {
        "label": "Python threading",
        "url": "https://docs.python.org/3/library/threading.html"
      }
    ]
  },
  {
    "slug": "stack-heap",
    "title": "Reachability و retention در closure",
    "question": "آیا خروج تابع برای جمع‌آوری شیء بزرگ کافی است؟",
    "assumptions": "مدل گراف ارجاع JS؛ اندازهٔ شیء فرضی 8 MiB و یک closure در registry. زمان GC واقعی مدل نمی‌شود.",
    "lanes": [
      "Call stack",
      "Heap",
      "Registry"
    ],
    "fields": {
      "stack": "فریم‌ها",
      "root": "ریشهٔ زنده",
      "object": "شیء 8 MiB",
      "retained": "حافظهٔ قابل دسترس"
    },
    "code": "const handlers = new Map();\nfunction install(id) {\n  const data = new Uint8Array(8 * 1024 * 1024);\n  handlers.set(id, () => data[0]);\n}\n// on dispose: handlers.delete(id);",
    "cases": [
      {
        "id": "retain",
        "label": "بدون cleanup",
        "initial": {
          "stack": "caller",
          "root": "Empty",
          "object": "Absent",
          "retained": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "name": "ورود install",
            "wire": "PUSH frame",
            "why": "فریم جدید ساخته شد.",
            "patch": {
              "stack": "caller → install"
            }
          },
          {
            "at": 1,
            "lane": 0,
            "to": 1,
            "name": "تخصیص",
            "wire": "data=8 MiB",
            "why": "فریم به data ارجاع دارد.",
            "patch": {
              "object": "Reachable from frame",
              "retained": 8
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 2,
            "name": "ثبت closure",
            "wire": "handlers.set",
            "why": "closure به data ارجاع دارد.",
            "patch": {
              "root": "registry→closure→data"
            }
          },
          {
            "at": 3,
            "lane": 0,
            "name": "بازگشت تابع",
            "wire": "POP frame",
            "why": "فریم حذف شد، ولی registry زنده است.",
            "patch": {
              "stack": "caller",
              "object": "Reachable via closure"
            }
          },
          {
            "at": 4,
            "lane": 2,
            "to": 1,
            "name": "تحلیل GC",
            "wire": "Mark reachable",
            "why": "data هنوز از ریشه قابل دسترس است.",
            "patch": {
              "retained": 8
            },
            "tone": "error"
          }
        ],
        "verdict": "پایان تابع الزاماً حافظهٔ شیء را آزاد نمی‌کند."
      },
      {
        "id": "cleanup",
        "label": "حذف ارجاع هنگام dispose",
        "initial": {
          "stack": "caller",
          "root": "Empty",
          "object": "Absent",
          "retained": 0
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "name": "ورود تابع",
            "wire": "PUSH",
            "why": "فریم فعال شد.",
            "patch": {
              "stack": "caller → install"
            }
          },
          {
            "at": 1,
            "lane": 0,
            "to": 1,
            "name": "ساخت شیء",
            "wire": "ALLOC 8 MiB",
            "why": "ارجاع محلی ساخته شد.",
            "patch": {
              "object": "Reachable from frame",
              "retained": 8
            }
          },
          {
            "at": 2,
            "lane": 0,
            "to": 2,
            "name": "ثبت callback",
            "wire": "handlers.set",
            "why": "ریشه جدید ساخته شد.",
            "patch": {
              "root": "registry→closure→data"
            }
          },
          {
            "at": 3,
            "lane": 0,
            "name": "بازگشت",
            "wire": "POP",
            "why": "registry همچنان شیء را نگه می‌دارد.",
            "patch": {
              "stack": "caller",
              "object": "Reachable via closure"
            }
          },
          {
            "at": 4,
            "lane": 0,
            "to": 2,
            "name": "پایان عمر مصرف",
            "wire": "handlers.delete",
            "why": "آخرین مسیر قابل دسترس در مدل حذف شد.",
            "patch": {
              "root": "Empty",
              "object": "Unreachable",
              "retained": 0
            }
          },
          {
            "at": 5,
            "lane": 1,
            "name": "واجد شرایط GC",
            "wire": "Eligible",
            "why": "GC ممکن است بعداً اجرا شود؛ RSS فوری تضمین نیست.",
            "patch": {
              "object": "Eligible for GC"
            },
            "tone": "success"
          }
        ],
        "verdict": "cleanup مالکیت callback را پایان می‌دهد؛ زمان واقعی بازیابی حافظه به runtime وابسته است."
      }
    ],
    "diagnose": "Heap snapshot را با retaining paths، allocation sampling و تعداد listener مقایسه کنید.",
    "tradeoff": "GC تضمین آزادسازی فوری منابع خارجی نمی‌دهد؛ cleanup صریح و چرخه عمر مهم است.",
    "sources": [
      {
        "label": "MDN Memory management",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management"
      },
      {
        "label": "MDN Execution model",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model"
      }
    ]
  },
  {
    "slug": "async-await",
    "title": "زمان‌بندی I/O، شکست و cancellation",
    "question": "وقتی Promise.all زود reject شود آیا بقیه کارها متوقف می‌شوند؟",
    "assumptions": "دو I/O مستقل، A در t=20 شکست و B در t=100 تمام می‌شود؛ B در حالت دوم AbortSignal را رعایت می‌کند. زمان ms آموزشی.",
    "lanes": [
      "Caller",
      "I/O A",
      "I/O B"
    ],
    "fields": {
      "a": "Promise A",
      "b": "Promise B",
      "combined": "Promise.all",
      "work": "کار باقی‌مانده",
      "abort": "Abort signal"
    },
    "code": "const ctrl = new AbortController();\ntry {\n  await Promise.all([loadA(ctrl.signal), loadB(ctrl.signal)]);\n} catch (e) {\n  ctrl.abort();\n  throw e;\n}",
    "cases": [
      {
        "id": "no-cancel",
        "label": "فقط Promise.all",
        "initial": {
          "a": "Idle",
          "b": "Idle",
          "combined": "Idle",
          "work": 0,
          "abort": "No"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "شروع A",
            "wire": "start A",
            "why": "تابع اول پیش از await آغاز می‌شود.",
            "patch": {
              "a": "Pending",
              "work": 1
            }
          },
          {
            "at": 0,
            "lane": 0,
            "to": 2,
            "name": "شروع B",
            "wire": "start B",
            "why": "کارها هم‌پوشانی دارند.",
            "patch": {
              "b": "Pending",
              "work": 2,
              "combined": "Pending"
            }
          },
          {
            "at": 20,
            "lane": 1,
            "to": 0,
            "name": "شکست A",
            "wire": "reject A",
            "why": "Promise.all با اولین reject رد می‌شود.",
            "patch": {
              "a": "Rejected",
              "combined": "Rejected",
              "work": 1
            },
            "tone": "error"
          },
          {
            "at": 21,
            "lane": 0,
            "name": "مدیریت خطا",
            "wire": "catch only",
            "why": "گرفتن خطا خودکار B را متوقف نمی‌کند.",
            "patch": {
              "abort": "No"
            }
          },
          {
            "at": 100,
            "lane": 2,
            "to": 0,
            "name": "اتمام دیرهنگام B",
            "wire": "B fulfilled",
            "why": "B بدون cancellation تا انتها ادامه داد.",
            "patch": {
              "b": "Fulfilled",
              "work": 0
            }
          }
        ],
        "verdict": "Promise.all fail-fast است، نه cancel-all."
      },
      {
        "id": "cancel",
        "label": "با cancellation",
        "initial": {
          "a": "Idle",
          "b": "Idle",
          "combined": "Idle",
          "work": 0,
          "abort": "No"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "شروع A",
            "wire": "start A",
            "why": "تابع اول پیش از await آغاز می‌شود.",
            "patch": {
              "a": "Pending",
              "work": 1
            }
          },
          {
            "at": 0,
            "lane": 0,
            "to": 2,
            "name": "شروع B",
            "wire": "start B",
            "why": "کارها هم‌پوشانی دارند.",
            "patch": {
              "b": "Pending",
              "work": 2,
              "combined": "Pending"
            }
          },
          {
            "at": 20,
            "lane": 1,
            "to": 0,
            "name": "شکست A",
            "wire": "reject A",
            "why": "Promise.all با اولین reject رد می‌شود.",
            "patch": {
              "a": "Rejected",
              "combined": "Rejected",
              "work": 1
            },
            "tone": "error"
          },
          {
            "at": 21,
            "lane": 0,
            "name": "مدیریت خطا",
            "wire": "abort()",
            "why": "cancellation جداگانه درخواست می‌شود.",
            "patch": {
              "abort": "Requested"
            }
          },
          {
            "at": 22,
            "lane": 0,
            "to": 2,
            "name": "توقف B",
            "wire": "AbortSignal",
            "why": "عملیات سازگار با signal متوقف شد.",
            "patch": {
              "b": "Aborted",
              "work": 0
            },
            "tone": "success"
          }
        ],
        "verdict": "خطای ترکیبی و توقف منابع دو سازوکار جدا هستند."
      }
    ],
    "diagnose": "در trace واقعی مدت عملیات، درخواست‌های فعال، AbortError و timeout را بررسی کنید.",
    "tradeoff": "لغو محلی به معنی rollback اثر سمت سرور نیست؛ هر API باید signal را پشتیبانی کند.",
    "sources": [
      {
        "label": "MDN Promise.all",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all"
      },
      {
        "label": "MDN Fetch cancellation",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
      }
    ]
  },
  {
    "slug": "event-loop",
    "title": "Long task، microtask و پاسخ‌گویی UI",
    "question": "آیا Promise.then یک محاسبهٔ طولانی را از thread اصلی خارج می‌کند؟",
    "assumptions": "مدل یک agent مرورگر؛ محاسبه 80ms؛ task ورودی در t=10 آماده می‌شود. زمان‌بندی واقعی مرورگر سیاست‌های بیشتر دارد.",
    "lanes": [
      "Main JS",
      "Microtasks",
      "Worker"
    ],
    "fields": {
      "stack": "پشته اصلی",
      "micro": "صف microtask",
      "input": "رویداد ورودی",
      "latency": "تأخیر ورودی ms"
    },
    "code": "// Promise.then still uses the main JS agent\nPromise.resolve().then(compute);\n// for CPU work, offload to a Worker when appropriate\nworker.postMessage(data);",
    "cases": [
      {
        "id": "microtask",
        "label": "کار سنگین در microtask",
        "initial": {
          "stack": "Script",
          "micro": "Empty",
          "input": "—",
          "latency": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "ثبت کار",
            "wire": "then(compute)",
            "why": "callback در microtask قرار می‌گیرد.",
            "patch": {
              "micro": "compute 80ms"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "to": 0,
            "name": "شروع checkpoint",
            "wire": "RUN compute",
            "why": "microtask روی agent اصلی اجرا می‌شود.",
            "patch": {
              "stack": "compute",
              "micro": "Empty"
            }
          },
          {
            "at": 10,
            "lane": 0,
            "name": "آماده شدن ورودی",
            "wire": "click queued",
            "why": "کار ورودی نمی‌تواند وسط compute اجرا شود.",
            "patch": {
              "input": "Waiting"
            },
            "tone": "error"
          },
          {
            "at": 81,
            "lane": 0,
            "name": "پایان compute",
            "wire": "return",
            "why": "پشته آزاد شد.",
            "patch": {
              "stack": "Empty"
            }
          },
          {
            "at": 81,
            "lane": 0,
            "name": "پردازش ورودی",
            "wire": "click handler",
            "why": "ورودی حداقل ۷۱ms انتظار داشت.",
            "patch": {
              "input": "Handled",
              "latency": 71
            }
          }
        ],
        "verdict": "Promise کار CPU را موازی نمی‌کند؛ microtask طولانی UI را مسدود می‌کند."
      },
      {
        "id": "worker",
        "label": "انتقال کار CPU به Worker",
        "initial": {
          "stack": "Script",
          "micro": "Empty",
          "input": "—",
          "latency": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 2,
            "name": "ارسال داده",
            "wire": "postMessage",
            "why": "انتقال/کپی داده هزینه دارد؛ محاسبه به worker واگذار شد.",
            "patch": {
              "stack": "Dispatch"
            }
          },
          {
            "at": 1,
            "lane": 2,
            "name": "شروع محاسبه",
            "wire": "compute 80ms",
            "why": "worker agent مستقل دارد.",
            "patch": {
              "stack": "Main idle"
            }
          },
          {
            "at": 10,
            "lane": 0,
            "name": "آماده شدن ورودی",
            "wire": "click ready",
            "why": "agent اصلی آزاد است.",
            "patch": {
              "input": "Ready"
            }
          },
          {
            "at": 11,
            "lane": 0,
            "name": "پردازش ورودی",
            "wire": "click handler",
            "why": "در trace نمونه یک ms انتظار داشت.",
            "patch": {
              "input": "Handled",
              "latency": 1
            }
          },
          {
            "at": 81,
            "lane": 2,
            "to": 0,
            "name": "تحویل نتیجه",
            "wire": "message",
            "why": "نتیجه با پیام به main می‌رسد.",
            "patch": {
              "stack": "Handle result"
            },
            "tone": "success"
          }
        ],
        "verdict": "offload پاسخ‌گویی را بهبود می‌دهد اما هزینهٔ ارتباط و مدیریت worker دارد."
      }
    ],
    "diagnose": "Performance panel، long tasks، interaction latency و flame chart را بررسی کنید.",
    "tradeoff": "timer و render فرصت‌های دقیق تضمین‌شده ندارند؛ انتقال داده به worker ممکن است گران باشد.",
    "sources": [
      {
        "label": "HTML Event loops",
        "url": "https://html.spec.whatwg.org/multipage/webappapis.html#event-loops"
      },
      {
        "label": "MDN Microtask guide",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide"
      }
    ]
  },
  {
    "slug": "api-routing",
    "title": "مسیر، decoding و کنترل ورودی",
    "question": "آیا route matched یعنی id معتبر و handler مجاز است؟",
    "assumptions": "مسیریاب فرضی با decode یک‌باره و اولویت مسیر ثابت؛ اعتبارسنجی id فقط عدد صحیح مثبت. پاسخ 400 قراردادی.",
    "lanes": [
      "Client",
      "Router",
      "Handler"
    ],
    "fields": {
      "raw": "مسیر خام",
      "route": "قاعدهٔ تطبیق",
      "id": "پارامتر",
      "calls": "خواندن DB",
      "status": "پاسخ"
    },
    "code": "GET /products/:id\nconst id = parseValidatedPositiveInteger(params.id);\nif (!id) return badRequest();\nreturn loadAuthorizedProduct(id);",
    "cases": [
      {
        "id": "valid",
        "label": "شناسه معتبر",
        "initial": {
          "raw": "/products/42",
          "route": "—",
          "id": "—",
          "calls": 0,
          "status": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "تجزیه path",
            "wire": "GET /products/42",
            "why": "query جدا می‌شود.",
            "patch": {
              "raw": "/products/42"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "name": "تطبیق",
            "wire": "/products/:id",
            "why": "پارامتر هنوز string است.",
            "patch": {
              "route": "Matched",
              "id": "\"42\""
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 2,
            "name": "اعتبارسنجی",
            "wire": "id=42",
            "why": "تبدیل و بررسی کامل ورودی موفق شد.",
            "patch": {
              "id": 42
            }
          },
          {
            "at": 3,
            "lane": 2,
            "name": "خواندن مجاز",
            "wire": "query id=42",
            "why": "در این نمونه permission بررسی شده.",
            "patch": {
              "calls": 1
            }
          },
          {
            "at": 4,
            "lane": 2,
            "to": 0,
            "name": "پاسخ",
            "wire": "200 OK",
            "why": "وجود route به تنهایی نتیجه را تضمین نمی‌کند.",
            "patch": {
              "status": 200
            },
            "tone": "success"
          }
        ],
        "verdict": "تطبیق، validation و authorization سه مرحله‌اند."
      },
      {
        "id": "invalid",
        "label": "پارامتر نامعتبر",
        "initial": {
          "raw": "/products/abc",
          "route": "—",
          "id": "—",
          "calls": 0,
          "status": "—"
        },
        "events": [
          {
            "at": 0,
            "lane": 0,
            "to": 1,
            "name": "تجزیه",
            "wire": "GET /products/abc",
            "why": "path از نظر ساختاری معتبر است.",
            "patch": {
              "raw": "/products/abc"
            }
          },
          {
            "at": 1,
            "lane": 1,
            "name": "تطبیق",
            "wire": "/products/:id",
            "why": "قاعده پارامتری تطبیق یافت.",
            "patch": {
              "route": "Matched",
              "id": "abc"
            }
          },
          {
            "at": 2,
            "lane": 1,
            "to": 2,
            "name": "اعتبارسنجی",
            "wire": "invalid integer",
            "why": "handler نباید query را با ورودی نامعتبر بسازد.",
            "patch": {
              "id": "Rejected"
            },
            "tone": "error"
          },
          {
            "at": 3,
            "lane": 2,
            "name": "توقف پیش از DB",
            "wire": "no query",
            "why": "هنوز هیچ خواندن DB انجام نشده.",
            "patch": {
              "calls": 0
            }
          },
          {
            "at": 4,
            "lane": 2,
            "to": 0,
            "name": "پاسخ قرارداد",
            "wire": "400 Bad Request",
            "why": "خطای ورودی با نبود route فرق دارد.",
            "patch": {
              "status": 400
            },
            "tone": "error"
          }
        ],
        "verdict": "route matched الزاماً handler موفق نیست؛ validation قبل از I/O."
      }
    ],
    "diagnose": "route name، path template، validation error و status را در log ساختاریافته بررسی کنید.",
    "tradeoff": "قواعد normalize و decode به framework وابسته‌اند؛ پارامتر را دوبار decode نکنید و query پارامتری بسازید.",
    "sources": [
      {
        "label": "RFC 3986",
        "url": "https://www.rfc-editor.org/rfc/rfc3986.html"
      },
      {
        "label": "RFC 9110",
        "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
      }
    ]
  }
];
