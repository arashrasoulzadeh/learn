import type {BackendLesson} from './types';
const lesson = {
  "slug": "stack-heap",
  "title": "Stack و Heap — عمر داده و فراخوانی",
  "description": "پشتهٔ فراخوانی، اشیای heap، ارجاع و عمر داده را با یک مدل سادهٔ JavaScript دنبال کنید.",
  "order": 12,
  "model": "memory",
  "actors": [
    {
      "label": "فراخواننده",
      "sub": "Caller",
      "icon": "app"
    },
    {
      "label": "پشتهٔ اجرا",
      "sub": "Call stack",
      "icon": "memory"
    },
    {
      "label": "اشیا",
      "sub": "Heap model",
      "icon": "db"
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
  "visual": {
    "title": "فریم‌ها و ارجاع‌های زنده",
    "labels": [
      "Call stack",
      "Heap objects",
      "ارجاع‌های قابل دسترسی"
    ],
    "context": "این مدل مفهومی یک runtime مدیریت‌شده است؛ جای واقعی هر مقدار، بهینه‌سازی‌ها و زمان GC به پیاده‌سازی وابسته‌اند."
  },
  "teaching": {
    "goal": "عمر یک فریم را از عمر شیء جدا کنید و بفهمید چرا یک شیء بعد از return ممکن است زنده بماند.",
    "terms": [
      [
        "Frame",
        "اطلاعات مربوط به یک فراخوانی فعال."
      ],
      [
        "Heap",
        "ناحیهٔ مفهومی نگهداری اشیای با عمر مستقل از فریم."
      ],
      [
        "Reachability",
        "قابل دسترس بودن شیء از ریشه‌های runtime."
      ],
      [
        "Garbage collection",
        "بازیابی حافظهٔ اشیای غیرقابل دسترس در runtime مدیریت‌شده."
      ]
    ],
    "practice": {
      "question": "تابع make یک شیء می‌سازد و آن را return می‌کند. فراخواننده ارجاع را نگه می‌دارد. آیا با خروج تابع شیء حتماً حذف می‌شود؟",
      "options": [
        "بله همیشه",
        "خیر؛ از فراخواننده قابل دسترس است",
        "بله چون روی CPU بوده"
      ],
      "correct": 1,
      "explanation": "فریم تابع پایان یافته، اما شیء هنوز از یک ریشهٔ زنده قابل دسترس است.",
      "hint": "عمر فریم و عمر شیء یکسان نیست."
    }
  },
  "scenarios": [
    {
      "id": "call",
      "label": "بازگشت شیء از تابع",
      "example": "const x = make()",
      "steps": [
        {
          "name": "ورود به تابع",
          "short": "ورود تابع",
          "detail": "فراخوانی make یک فریم فعال می‌سازد.",
          "route": [
            0,
            1
          ],
          "packet": "CALL",
          "input": "const x = make()",
          "output": "push make frame",
          "result": "تابع روی پشته قرار گرفت.",
          "explanation": "فریم caller منتظر نتیجهٔ تابع است.",
          "state": [
            "caller | make",
            "—",
            "—"
          ]
        },
        {
          "name": "ساخت شیء",
          "short": "ساخت شیء",
          "detail": "در مدل، شیء در heap ساخته می‌شود و متغیر محلی به آن ارجاع می‌دهد.",
          "route": [
            1,
            2
          ],
          "packet": "ALLOC",
          "input": "const obj = {n: 7}",
          "output": "object #1",
          "result": "شیء با ارجاع محلی زنده است.",
          "explanation": "شیء و ارجاع آن دو مفهوم جدا هستند.",
          "state": [
            "caller | make",
            "obj#1={n:7}",
            "obj → #1"
          ]
        },
        {
          "name": "بازگشت ارجاع",
          "short": "بازگشت",
          "detail": "ارجاع به caller می‌رسد و فریم make پایان می‌یابد.",
          "route": [
            1,
            0
          ],
          "packet": "RETURN",
          "input": "return obj",
          "output": "x → #1",
          "result": "شیء هنوز در دسترس است.",
          "explanation": "return فریم را پایان می‌دهد، نه هر شیء ساخته‌شده در آن.",
          "state": [
            "caller",
            "obj#1={n:7}",
            "x → #1"
          ],
          "tone": "success"
        }
      ],
      "prediction": "بعد از return آیا شیء ساخته‌شده هنوز از caller قابل دسترس است؟"
    },
    {
      "id": "alias",
      "label": "دو ارجاع به یک شیء",
      "example": "let y = x",
      "steps": [
        {
          "name": "ساخت ارجاع اول",
          "short": "ساخت شیء",
          "detail": "x به شیء شمارهٔ ۱ اشاره می‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "REF",
          "input": "let x = {n:7}",
          "output": "x → #1",
          "result": "یک شیء ساخته شد.",
          "explanation": "انتساب شیء به یک متغیر جدید در JS به معنی clone عمیق نیست.",
          "state": [
            "caller",
            "obj#1={n:7}",
            "x → #1"
          ]
        },
        {
          "name": "کپی ارجاع",
          "short": "کپی ارجاع",
          "detail": "y نیز به همان شیء اشاره می‌کند.",
          "route": [
            1
          ],
          "packet": "ALIAS",
          "input": "let y = x",
          "output": "x,y → #1",
          "result": "دو ارجاع، یک شیء.",
          "explanation": "متغیر مستقل است اما هدف ارجاع مشترک است.",
          "state": [
            "caller",
            "obj#1={n:7}",
            "x,y → #1"
          ]
        },
        {
          "name": "تغییر از طریق y",
          "short": "تغییر ویژگی",
          "detail": "y.n تغییر می‌کند؛ x نیز همان شیء را مشاهده می‌کند.",
          "route": [
            1,
            2
          ],
          "packet": "SET",
          "input": "y.n = 9",
          "output": "x.n === 9",
          "result": "تغییر مشترک مشاهده شد.",
          "explanation": "برای ساخت شیء مستقل باید روش کپی مناسب انتخاب کنید؛ spread فقط کپی سطحی است.",
          "state": [
            "caller",
            "obj#1={n:9}",
            "x,y → #1"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "کپی ارجاع با کپی شیء اشتباه می‌شود.",
      "prediction": "اگر y همان شیء x باشد، تغییر y.n چه اثری بر x.n دارد؟"
    },
    {
      "id": "retained",
      "label": "حافظهٔ نگه‌داشته‌شده",
      "example": "cache retains object",
      "steps": [
        {
          "name": "ساخت داده و نگهداری در cache",
          "short": "ذخیره در کش",
          "detail": "یک آرایهٔ زنده شیء را نگه می‌دارد.",
          "route": [
            1,
            2
          ],
          "packet": "STORE",
          "input": "cache.push(obj)",
          "output": "cache[0] → #1",
          "result": "شیء قابل دسترس است.",
          "explanation": "GC چیزی را که هنوز قابل دسترس است صرفاً به خاطر پایان تابع حذف نمی‌کند.",
          "state": [
            "caller | work",
            "obj#1",
            "cache[0] → #1"
          ]
        },
        {
          "name": "پایان تابع",
          "short": "پایان تابع",
          "detail": "فریم work حذف می‌شود، اما cache از caller قابل دسترس است.",
          "route": [
            1
          ],
          "packet": "RETURN",
          "input": "return",
          "output": "work frame removed",
          "result": "شیء هنوز زنده است.",
          "explanation": "انباشت ارجاع در cache بدون محدودیت می‌تواند مصرف حافظه را افزایش دهد.",
          "state": [
            "caller",
            "obj#1",
            "cache[0] → #1"
          ],
          "tone": "error"
        },
        {
          "name": "حذف آخرین ارجاع",
          "short": "حذف ارجاع",
          "detail": "در این نمونه cache پاک می‌شود و ارجاع دیگری باقی نمی‌ماند.",
          "route": [
            1,
            2
          ],
          "packet": "CLEAR",
          "input": "cache.length = 0",
          "output": "object eligible for GC",
          "result": "شیء واجد شرایط بازیابی است.",
          "explanation": "واجد شرایط بودن با اجرای فوری GC یا کاهش فوری RSS فرق دارد.",
          "state": [
            "caller",
            "obj#1 eligible",
            "—"
          ],
          "tone": "success"
        }
      ],
      "edgeCase": "رشد حافظه به علت نگهداری ارجاع‌های غیرضروری.",
      "prediction": "آیا پایان تابع برای آزاد شدن شیئی که cache نگه داشته کافی است؟"
    },
    {
      "id": "recursion",
      "label": "فراخوانی بازگشتی بدون شرط پایان",
      "example": "function recurse() { recurse() }",
      "prediction": "اگر هر فراخوانی بدون رسیدن به شرط پایان، فراخوانی دیگری ایجاد کند، چه منبعی پر می‌شود؟",
      "edgeCase": "بازگشت بدون شرط پایان می‌تواند محدودیت پشتهٔ اجرا را تمام کند.",
      "steps": [
        {
          "name": "اولین فراخوانی بازگشتی",
          "short": "ساخت فریم",
          "detail": "تابع recurse شروع می‌شود و یک فراخوانی جدید از خودش ایجاد می‌کند.",
          "route": [
            0,
            1
          ],
          "packet": "CALL",
          "input": "function recurse(){ recurse() }",
          "output": "caller → recurse",
          "result": "اولین فریم فعال است.",
          "explanation": "فراخوانی هنوز پایان نیافته و فریم آن باید اطلاعات ادامهٔ اجرا را نگه دارد.",
          "state": [
            "caller | recurse",
            "—",
            "—"
          ]
        },
        {
          "name": "رشد پشته بدون بازگشت",
          "short": "رشد پشته",
          "detail": "در این مدل هر فراخوانی فریم تازه‌ای می‌سازد و هیچ فراخوانی به حالت return نمی‌رسد.",
          "route": [
            1
          ],
          "packet": "PUSH",
          "input": "recurse(); recurse(); … (nested calls)",
          "output": "Stack depth grows",
          "result": "فریم‌های فعال انباشته می‌شوند.",
          "explanation": "پشته ظرفیت محدود دارد. شمار دقیق فریم‌ها به runtime و بهینه‌سازی‌ها بستگی دارد؛ این نمایش اندازهٔ واقعی را اندازه نمی‌گیرد.",
          "state": [
            "caller | recurse#1 | recurse#2 | recurse#3",
            "—",
            "—"
          ]
        },
        {
          "name": "رسیدن به حد فراخوانی",
          "short": "خطای پشته",
          "detail": "در runtime رایج JavaScript بدون حذف فریم‌های tail call، بازگشت نامحدود به خطای محدودیت پشته می‌رسد.",
          "route": [
            1
          ],
          "packet": "ERROR",
          "input": "Maximum call stack size exceeded (typical JS)",
          "output": "RangeError (runtime dependent)",
          "result": "شرط پایان یا الگوریتم مناسب لازم است.",
          "explanation": "در بعضی موتورهای JavaScript پیام یا نوع خطا متفاوت است. برای الگوریتم بازگشتی، شرط پایان و عمق قابل کنترل طراحی کنید؛ نمونهٔ نامحدود را اجرا نکنید.",
          "state": [
            "Stack limit reached",
            "—",
            "—"
          ],
          "tone": "error"
        }
      ]
    }
  ],
  "pitfall": "Stack و Heap را مکان فیزیکی قطعی برای همهٔ متغیرها ندانید. اندازهٔ پشته محدود است و GC فوری یا تضمین‌کنندهٔ کاهش RSS نیست.",
  "takeaway": "فریم‌های فعال و گراف ارجاع‌ها دو مدل مکمل برای فهم عمر داده‌اند.",
  "quiz": {
    "question": "اگر دو متغیر به یک شیء JS اشاره کنند، تغییر ویژگی آن از یکی چه اثری دارد؟",
    "options": [
      "دیگری شیء مستقل دارد",
      "دیگری همان تغییر را می‌بیند",
      "همیشه خطای GC"
    ],
    "correct": 1,
    "explanation": "هر دو ارجاع به یک شیء دارند."
  },
  "references": [
    {
      "label": "MDN — Memory management",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management"
    },
    {
      "label": "MDN — JavaScript execution model",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model"
    },
    {
      "label": "MDN — Too much recursion",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion"
    }
  ],
  "field": {
    "task": "در Console مرورگر یا Node.js این مثال محلی را اجرا کنید.",
    "observe": "۹ چاپ می‌شود و ارجاع بازگشتی زنده می‌ماند.",
    "limit": "این آزمایش محل واقعی اشیا یا زمان GC را اندازه نمی‌گیرد.",
    "command": "function make() { return {n: 7}; }\nconst x = make();\nconst y = x;\ny.n = 9;\nconsole.log(x.n);",
    "next": {
      "slug": "async-await",
      "label": "Async / Await",
      "category": "software-engineering"
    }
  }
} satisfies BackendLesson;
export default lesson;
