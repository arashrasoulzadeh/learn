import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "solid",
  "title": "SOLID Principles — طراحی قابل تغییر",
  "order": 31,
  "description": "پنج اصل طراحی را روی تغییرات واقعی و قرارداد رفتار بررسی کنید.",
  "actors": [
    [
      "کلاینت",
      "Use case",
      "app"
    ],
    [
      "قرارداد",
      "Interface",
      "key"
    ],
    [
      "پیاده‌سازی",
      "Implementation",
      "cpu"
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
    ],
    [
      0,
      2
    ]
  ],
  "labels": [
    "مسئولیت / درخواست",
    "قرارداد",
    "اثر تغییر"
  ],
  "context": "نمودار مسیر فراخوانی زمان اجراست؛ وابستگی کد را از مثال‌ها بخوانید. SOLID قواعد مطلق نیست.",
  "goal": "تفاوت پنج اصل را با تشخیص دلیل تغییر، رفتار جایگزین و جهت وابستگی توضیح دهید.",
  "scenarios": [
    [
      "srp",
      "S — مسئولیت واحد",
      "با تغییر قالب گزارش چه بخش‌هایی باید تغییر کنند؟",
      "Invoice + PDF + persistence",
      [
        [
          "کلاس چندمسئولیتی",
          [
            0,
            2
          ],
          [
            "saveAndPrint"
          ],
          "class Invoice { total(); save(); printPdf(); }",
          "3 reasons to change",
          [
            "Invoice",
            "total/save/PDF",
            "Coupled"
          ],
          "محاسبه قیمت، ذخیره و نمایش به سه گروه نیاز متفاوت پاسخ می‌دهند.",
          "SRP یعنی یک دلیل تغییر مرتبط با یک actor، نه الزاماً یک متد."
        ],
        [
          "تفکیک مسئولیت",
          [
            0,
            1,
            2
          ],
          [
            "render(invoice)",
            "PDF adapter"
          ],
          "Invoice.total(); PdfRenderer.render(invoice)",
          "PDF isolated",
          [
            "Invoice total",
            "Renderer port",
            "PDF module"
          ],
          "تغییر قالب به renderer منتقل شد؛ محاسبه قیمت ثابت می‌ماند.",
          "با تغییر قالب تست‌های دامنه را بدون I/O اجرا کنید."
        ],
        [
          "تغییر مستقل",
          [
            1,
            2
          ],
          [
            "render HTML"
          ],
          "HtmlRenderer implements Renderer",
          "Only renderer changes",
          [
            "Domain stable",
            "Renderer",
            "HTML"
          ],
          "تغییر UI به دلیل تغییر قرارداد دامنه نیست.",
          "تفکیک بی‌دلیل کلاس‌های کوچک هزینه ناوبری دارد.",
          "success"
        ]
      ]
    ],
    [
      "ocp",
      "O — باز برای توسعه",
      "اضافه کردن تخفیف جدید چه کدی را تغییر می‌دهد؟",
      "Discount policy",
      [
        [
          "شرط در هسته",
          [
            0,
            2
          ],
          [
            "switch type"
          ],
          "if kind == 'vip': total *= .9",
          "Core branch",
          [
            "Checkout",
            "switch",
            "VIP"
          ],
          "هر نوع جدید مستلزم دستکاری تابع checkout است.",
          "اگر تغییرات کم‌اند، شرط ساده ممکن است کافی باشد."
        ],
        [
          "قرارداد پایدار",
          [
            0,
            1
          ],
          [
            "discount(total)"
          ],
          "interface Discount { apply(total): Money }",
          "Stable interface",
          [
            "Checkout",
            "Discount",
            "VIP"
          ],
          "سیاست تخفیف پشت قرارداد رفتار قرار می‌گیرد.",
          "قرارداد باید مقدار و واحد پول را مشخص کند."
        ],
        [
          "افزونه جدید",
          [
            1,
            2
          ],
          [
            "student.apply"
          ],
          "register('student', StudentDiscount)",
          "New policy added",
          [
            "Checkout unchanged",
            "Discount",
            "Student"
          ],
          "composition root سیاست تازه را انتخاب می‌کند؛ هسته نیاز به تغییر ندارد.",
          "OCP نسبت به محور تغییر مشخص است؛ همه تغییرات پیش‌بینی‌پذیر نیستند.",
          "success"
        ]
      ]
    ],
    [
      "lsp",
      "L — جایگزینی رفتاری",
      "آیا امضای یکسان متد برای جایگزینی کافی است؟",
      "Account.withdraw(amount)",
      [
        [
          "قرارداد پایه",
          [
            0,
            1
          ],
          [
            "withdraw 20"
          ],
          "pre: 0 < amount <= balance; post: balance -= amount",
          "Balance 100",
          [
            "Account",
            "withdraw contract",
            "100"
          ],
          "قرارداد شامل پیش‌شرط و پس‌شرط است.",
          "تست قرارداد را روی همه implementationها اجرا کنید."
        ],
        [
          "زیرنوع ناسازگار",
          [
            1,
            2
          ],
          [
            "withdraw 20"
          ],
          "FixedDeposit.withdraw(20) -> throw",
          "Contract violated",
          [
            "Client expects success",
            "Stronger precondition",
            "Rejected"
          ],
          "زیرنوعی که برداشت معتبر پایه را رد کند پیش‌شرط را قوی‌تر کرده است.",
          "LSP با inheritance یا امضای TypeScript به تنهایی تضمین نمی‌شود.",
          "error"
        ],
        [
          "اصلاح مدل",
          [
            0,
            1
          ],
          [
            "read balance"
          ],
          "ReadableAccount; WithdrawableAccount",
          "Separate capabilities",
          [
            "Client",
            "WithdrawableAccount",
            "Only valid types"
          ],
          "حساب غیرقابل برداشت فقط قرارداد خواندن را پیاده می‌کند.",
          "به جای override استثنایی، capability واقعی را مدل کنید.",
          "success"
        ]
      ],
      "قرارداد رفتاری با امضای مشترک فرق دارد."
    ],
    [
      "isp",
      "I — تفکیک رابط",
      "آیا مصرف‌کننده خواندن باید به write وابسته باشد؟",
      "Read-only report",
      [
        [
          "رابط چاق",
          [
            0,
            1
          ],
          [
            "read"
          ],
          "interface Store { read(); save(); delete(); }",
          "Unneeded methods",
          [
            "Report",
            "Store",
            "3 methods"
          ],
          "گزارش فقط خواندن نیاز دارد ولی به قرارداد نوشتن وابسته است.",
          "mockهای دارای متدهای غیرضروری نشانه‌ای از رابط نامناسب‌اند."
        ],
        [
          "تفکیک capability",
          [
            0,
            1
          ],
          [
            "query"
          ],
          "interface Reader { read(); }",
          "Read-only port",
          [
            "Report",
            "Reader",
            "1 method"
          ],
          "رابط بر نیاز مصرف‌کننده شکل می‌گیرد.",
          "رابط جدا به معنی کلاس جدا برای هر متد نیست."
        ],
        [
          "تغییر writer",
          [
            1,
            2
          ],
          [
            "write policy"
          ],
          "Writer.save(versionedRecord)",
          "Reader unaffected",
          [
            "Report stable",
            "Reader",
            "Writer changed"
          ],
          "تغییر قرارداد نوشتن به client خواندن سرایت نمی‌کند.",
          "ISP coupling را کاهش می‌دهد، نه همه وابستگی‌ها را.",
          "success"
        ]
      ]
    ],
    [
      "dip",
      "D — وارونگی وابستگی",
      "آیا دامنه باید SDK پرداخت را import کند؟",
      "Checkout → Payment port",
      [
        [
          "وابستگی مستقیم",
          [
            0,
            2
          ],
          [
            "SDK.charge"
          ],
          "import StripeSDK in Checkout",
          "Core imports vendor",
          [
            "Checkout",
            "Concrete SDK",
            "Vendor"
          ],
          "سیاست دامنه به جزئیات فروشنده وابسته شده است.",
          "تست واحد ممکن است به شبکه یا mock عمیق SDK نیاز پیدا کند."
        ],
        [
          "قرارداد دامنه",
          [
            0,
            1
          ],
          [
            "charge"
          ],
          "interface Payment { charge(amount): Receipt }",
          "Port owned by core",
          [
            "Checkout",
            "Payment port",
            "Unbound"
          ],
          "قرارداد متعلق به نیاز use case است.",
          "DIP جهت وابستگی کد را تغییر می‌دهد؛ DI شیوه اتصال runtime است."
        ],
        [
          "اتصال adapter",
          [
            1,
            2
          ],
          [
            "charge 100"
          ],
          "new Checkout(new FakePayment())",
          "Testable without network",
          [
            "Checkout",
            "Payment port",
            "Fake adapter"
          ],
          "adapter قرارداد را پیاده می‌کند و composition root آن را تزریق می‌کند.",
          "آزمون integration برای adapter واقعی همچنان لازم است.",
          "success"
        ]
      ]
    ]
  ],
  "pitfall": "افزایش تعداد interface به خودی خود SOLID نیست؛ رفتار و محور تغییر را بسنجید.",
  "takeaway": "اصل را بر اساس مشکل واقعی انتخاب کنید؛ coupling و قرارداد رفتاری را با تست قابل مشاهده کنید.",
  "quiz": [
    "کدام نقض LSP است؟",
    [
      "تغییر نام کلاس",
      "رد ورودی معتبر قرارداد پایه",
      "تزریق implementation در startup"
    ],
    1,
    "زیرنوع نباید پیش‌شرط را تقویت یا پس‌شرط را تضعیف کند."
  ],
  "practice": [
    "گزارش PDF و HTML دائم تغییر می‌کنند ولی محاسبه مالی ثابت است؛ چه تغییر اولویت دارد؟",
    [
      "کپی کل Invoice",
      "رابط renderer مستقل از دامنه",
      "انتقال همه منطق به یک singleton"
    ],
    1,
    "SRP و OCP در محور نمایش به کاهش تغییر دامنه کمک می‌کنند."
  ],
  "hint": "دلیل تغییر نمایش با دلیل تغییر محاسبه فرق دارد.",
  "terms": [
    [
      "SRP",
      "یک مسئولیت در برابر یک گروه دلیل تغییر"
    ],
    [
      "LSP",
      "حفظ قرارداد رفتاری هنگام جایگزینی"
    ],
    [
      "DIP",
      "وابستگی سیاست به قرارداد نه جزئیات"
    ]
  ],
  "references": [
    [
      "Microsoft architectural principles",
      "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles"
    ],
    [
      "Robert C. Martin — design principles",
      "https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html"
    ]
  ],
  "exercise": [
    "قرارداد برداشت را برای دو نوع حساب با Python بررسی کنید.",
    "def withdraw(balance, amount):\n    assert 0 < amount <= balance\n    return balance - amount\nassert withdraw(100,20)==80\nprint('contract passed')",
    "پس‌شرط ۸۰ است؛ زیرنوعی که برداشت ۲۰ را رد کند قرارداد را نمی‌پذیرد.",
    "این یک تست قرارداد نمونه است، نه اثبات همه ورودی‌ها."
  ],
  "deep": {
    "title": "هزینه تغییر سیاست پرداخت",
    "question": "تعویض فروشنده پرداخت چه تعداد فایل هسته را تغییر می‌دهد؟",
    "assumptions": "مدل دو use case و یک قرارداد پایدار؛ شمار فایل‌ها فرضی است.",
    "lanes": [
      "Checkout",
      "Refund",
      "Adapter"
    ],
    "fields": {
      "core": "فایل‌های هسته تغییرکرده",
      "sdk": "وابستگی",
      "tests": "تست‌های نیازمند SDK",
      "result": "نتیجه"
    },
    "code": "interface Payments { charge(amount): Receipt; refund(id): void }\n// core imports port; composition root supplies adapter",
    "cases": [
      [
        "direct",
        "SDK مستقیم",
        {
          "core": 0,
          "sdk": "Vendor A",
          "tests": 2,
          "result": "Pending"
        },
        [
          [
            0,
            0,
            null,
            "وابستگی checkout",
            "import A",
            "checkout مستقیم SDK دارد.",
            {
              "sdk": "A in core"
            }
          ],
          [
            1,
            1,
            null,
            "وابستگی refund",
            "import A",
            "refund نیز به SDK متصل است.",
            {
              "tests": 2
            }
          ],
          [
            2,
            0,
            2,
            "تعویض charge",
            "B charge",
            "هسته اول تغییر می‌کند.",
            {
              "core": 1
            }
          ],
          [
            3,
            1,
            2,
            "تعویض refund",
            "B refund",
            "هسته دوم تغییر می‌کند.",
            {
              "core": 2,
              "result": "Core changed"
            },
            "error"
          ]
        ],
        "دو use case به جزئیات فروشنده وابسته‌اند."
      ],
      [
        "port",
        "قرارداد دامنه",
        {
          "core": 0,
          "sdk": "Port",
          "tests": 0,
          "result": "Pending"
        },
        [
          [
            0,
            0,
            2,
            "اجرای charge",
            "charge",
            "قرارداد ثابت است.",
            {
              "sdk": "Adapter A"
            }
          ],
          [
            1,
            1,
            2,
            "اجرای refund",
            "refund",
            "تست fake مستقل است.",
            {
              "tests": 0
            }
          ],
          [
            2,
            2,
            null,
            "تعویض adapter",
            "Adapter B",
            "فقط adapter و wiring تغییر می‌کنند.",
            {
              "sdk": "Adapter B"
            }
          ],
          [
            3,
            0,
            2,
            "تست قرارداد",
            "same port",
            "هسته ثابت باقی می‌ماند.",
            {
              "result": "Core unchanged"
            },
            "success"
          ]
        ],
        "در فرض قرارداد کافی، صفر فایل هسته تغییر می‌کند."
      ]
    ],
    "diagnose": "وابستگی import، تست قرارداد و diff فایل‌های دامنه را بررسی کنید.",
    "tradeoff": "اگر قرارداد مصنوعی یا ناقص باشد تغییر فروشنده همچنان دامنه را درگیر می‌کند."
  }
});
export default lesson;
