import {author} from './author.ts';
export const {lesson,deep}=author({
  "slug": "factory",
  "title": "Factory Pattern — ساخت اشیاء",
  "order": 33,
  "description": "ساخت مستقیم، Simple Factory، Factory Method و خانواده محصولات را تفکیک کنید.",
  "actors": [
    [
      "Client",
      "Caller",
      "app"
    ],
    [
      "Factory",
      "Creation",
      "cpu"
    ],
    [
      "Product",
      "Interface",
      "key"
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
    "انتخاب کلاینت",
    "سیاست ساخت",
    "محصول"
  ],
  "context": "در مثال اول Simple Factory داریم، نه GoF Factory Method؛ در مثال دوم subclass ساخت را تعیین می‌کند.",
  "goal": "ایجاد شیء را از مصرف جدا کنید و تفاوت سه شکل factory را بفهمید.",
  "scenarios": [
    [
      "simple",
      "Simple Factory",
      "چگونه وابستگی client به concrete constructor کم می‌شود؟",
      "create('pdf')",
      [
        [
          "دریافت نوع",
          [
            0,
            1
          ],
          [
            "create pdf"
          ],
          "create('pdf')",
          "PDF selected",
          [
            "pdf",
            "Registry",
            "—"
          ],
          "نوع محصول در factory انتخاب می‌شود.",
          "ورودی ناشناخته باید صریح رد شود."
        ],
        [
          "ساخت",
          [
            1,
            2
          ],
          [
            "new Pdf"
          ],
          "new PdfExporter()",
          "PdfExporter",
          [
            "pdf",
            "Factory",
            "PDF #1"
          ],
          "factory تنظیمات لازم برای ساخت را اعمال می‌کند.",
          "factory ساده الزاماً inheritance ندارد."
        ],
        [
          "استفاده",
          [
            0,
            2
          ],
          [
            "export"
          ],
          "exporter.export(data)",
          "PDF bytes",
          [
            "export",
            "Product interface",
            "PDF"
          ],
          "client با قرارداد Exporter کار می‌کند.",
          "خطای ساخت را از خطای استفاده جدا کنید.",
          "success"
        ]
      ]
    ],
    [
      "method",
      "Factory Method",
      "آیا subclass می‌تواند مرحله ساخت را عوض کند؟",
      "ReportJob.makeExporter()",
      [
        [
          "اجرای workflow",
          [
            0,
            1
          ],
          [
            "run()"
          ],
          "ReportJob.run()",
          "Workflow started",
          [
            "ReportJob",
            "makeExporter",
            "—"
          ],
          "creator الگوریتم workflow را ثابت نگه می‌دارد.",
          "Factory Method یک نقطه توسعه در creator است."
        ],
        [
          "override ساخت",
          [
            1,
            2
          ],
          [
            "makeExporter"
          ],
          "CsvJob.makeExporter()",
          "CsvExporter",
          [
            "CsvJob",
            "Override",
            "CSV"
          ],
          "subclass نوع محصول را انتخاب می‌کند.",
          "محصول باید قرارداد مورد انتظار creator را حفظ کند."
        ],
        [
          "استفاده ثابت",
          [
            0,
            2
          ],
          [
            "export"
          ],
          "product.export(rows)",
          "CSV rows",
          [
            "Run unchanged",
            "Product interface",
            "CSV"
          ],
          "workflow به نوع concrete وابسته نیست.",
          "composition هم می‌تواند جای subclass مناسب باشد.",
          "success"
        ]
      ]
    ],
    [
      "family",
      "Abstract Factory و ناسازگاری",
      "آیا ترکیب دو خانواده UI درست کار می‌کند؟",
      "ThemeFactory",
      [
        [
          "انتخاب خانواده",
          [
            0,
            1
          ],
          [
            "darkFactory"
          ],
          "factory=DarkFactory()",
          "Dark selected",
          [
            "UI",
            "DarkFactory",
            "—"
          ],
          "Abstract Factory مجموعه محصولات مرتبط می‌سازد.",
          "قرارداد خانواده باید سازگاری را تعریف کند."
        ],
        [
          "ساخت محصولات",
          [
            1,
            2
          ],
          [
            "button + dialog"
          ],
          "factory.button(); factory.dialog()",
          "Dark pair",
          [
            "UI",
            "DarkFactory",
            "Dark button/dialog"
          ],
          "هر دو محصول از همان خانواده‌اند.",
          "تزریق یک factory از mixing ناخواسته جلوگیری می‌کند."
        ],
        [
          "ترکیب اشتباه",
          [
            0,
            2
          ],
          [
            "Light dialog"
          ],
          "DarkButton + LightDialog",
          "Family mismatch",
          [
            "UI",
            "Mixed",
            "Inconsistent theme"
          ],
          "ساخت جداگانه از دو خانواده می‌تواند invariant طراحی را نقض کند.",
          "تست سازگاری خانواده اضافه کنید.",
          "error"
        ]
      ],
      "محصولات مرتبط باید سازگار باشند."
    ]
  ],
  "pitfall": "یک switch کوچک لزوماً نیاز به Factory Method ندارد.",
  "takeaway": "ساخت متغیر را پشت قرارداد قرار دهید؛ الگوی مناسب را با محور تغییر انتخاب کنید.",
  "quiz": [
    "Factory Method کلاسیک چه می‌کند؟",
    [
      "تضمین یک نمونه",
      "واگذاری انتخاب محصول به subclass creator",
      "ارسال رویداد"
    ],
    1,
    "creator نقطه override ساخت دارد."
  ],
  "practice": [
    "UI به button و dialog هم‌خانواده نیاز دارد؛ کدام مناسب‌تر است؟",
    [
      "Abstract Factory",
      "Singleton",
      "Observer"
    ],
    0,
    "یک factory خانواده محصولات سازگار می‌سازد."
  ],
  "hint": "مسئله ساخت چند محصول مرتبط است.",
  "terms": [
    [
      "Product",
      "قرارداد محصول"
    ],
    [
      "Creator",
      "دارنده factory method"
    ],
    [
      "Abstract Factory",
      "کارخانه خانواده محصولات"
    ]
  ],
  "references": [
    [
      "Factory Method",
      "https://refactoring.guru/design-patterns/factory-method"
    ],
    [
      "Abstract Factory",
      "https://refactoring.guru/design-patterns/abstract-factory"
    ]
  ],
  "exercise": [
    "factory ساده را با dict در Python اجرا کنید.",
    "class Pdf: pass\nclass Csv: pass\nregistry={'pdf':Pdf,'csv':Csv}\nassert isinstance(registry['csv'](),Csv)\nprint('CSV')",
    "انتخاب CSV بدون تغییر مصرف‌کننده.",
    "این registry یک Simple Factory است."
  ],
  "deep": {
    "title": "افزودن فرمت جدید و هزینه تغییر",
    "question": "ثبت فرمت JSON کدام محل‌ها را تغییر می‌دهد؟",
    "assumptions": "دو مصرف‌کننده مستقل و یک قرارداد export؛ تعداد فایل‌ها مدل است.",
    "lanes": [
      "Report",
      "Backup",
      "Factory"
    ],
    "fields": {
      "clients": "فایل client تغییرکرده",
      "formats": "فرمت‌ها",
      "factory": "سیاست ساخت",
      "result": "نتیجه"
    },
    "code": "registry = {'pdf': Pdf, 'csv': Csv}\nregistry['json'] = Json\nproduct = registry[kind]()",
    "cases": [
      [
        "direct",
        "constructor در client",
        {
          "clients": 0,
          "formats": "PDF,CSV",
          "factory": "None",
          "result": "—"
        },
        [
          [
            0,
            0,
            null,
            "شاخه گزارش",
            "switch",
            "گزارش انتخاب مستقیم دارد.",
            {
              "factory": "Duplicated switch"
            }
          ],
          [
            1,
            1,
            null,
            "شاخه backup",
            "switch",
            "backup هم انتخاب دارد.",
            {
              "formats": "PDF,CSV"
            }
          ],
          [
            2,
            0,
            null,
            "افزودن JSON",
            "new Json",
            "گزارش اصلاح شد.",
            {
              "clients": 1
            }
          ],
          [
            3,
            1,
            null,
            "اصلاح backup",
            "new Json",
            "مصرف‌کننده دوم نیز تغییر می‌کند.",
            {
              "clients": 2,
              "formats": "PDF,CSV,JSON",
              "result": "2 edits"
            },
            "error"
          ]
        ],
        "دو محل انتخاب باید هماهنگ شوند."
      ],
      [
        "registry",
        "registry مشترک",
        {
          "clients": 0,
          "formats": "PDF,CSV",
          "factory": "Registry",
          "result": "—"
        },
        [
          [
            0,
            0,
            2,
            "درخواست",
            "create pdf",
            "client نوع می‌دهد.",
            {
              "result": "PDF"
            }
          ],
          [
            1,
            1,
            2,
            "درخواست دوم",
            "create csv",
            "قرارداد مشترک است.",
            {
              "result": "CSV"
            }
          ],
          [
            2,
            2,
            null,
            "ثبت JSON",
            "register",
            "فقط محل ساخت توسعه یافت.",
            {
              "formats": "PDF,CSV,JSON"
            }
          ],
          [
            3,
            0,
            2,
            "درخواست JSON",
            "create json",
            "client عمومی ثابت است.",
            {
              "result": "0 client edits"
            },
            "success"
          ]
        ],
        "نوع جدید بدون تغییر clientهای عمومی اضافه شد."
      ]
    ],
    "diagnose": "diff ساخت، آزمون نوع نامعتبر و قرارداد محصول را بررسی کنید.",
    "tradeoff": "registry ممکن است validation و lifecycle پیچیده داشته باشد؛ نوع unknown را صریح رد کنید."
  }
});
export default lesson;
