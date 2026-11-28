// Code examples are illustrative TypeScript/pseudocode; no arbitrary code is executed.
export type Workshop = {
 title:string; problem:string; change:string; before:string; after:string;
 choices:readonly [string,string]; correct:0|1; wrong:string; resultBefore:string;
 resultAfter:string; why:string; tradeoff:string;
};
const w=(title:string,problem:string,change:string,before:string,after:string,choices:Workshop['choices'],correct:0|1,wrong:string,resultBefore:string,resultAfter:string,why:string,tradeoff:string):Workshop=>({title,problem,change,before,after,choices,correct,wrong,resultBefore,resultAfter,why,tradeoff});
export const workshops:Record<string,Workshop>={
 'solid:srp':w('S — تغییر مستقل','در فروشگاه، Invoice هم مبلغ را حساب می‌کند و هم PDF می‌سازد.','تیم طراحی خروجی HTML می‌خواهد؛ محاسبه ۱۰۰ یورو نباید تغییر کند.',
 'class Invoice {\n  total() { return 100 }\n  render() { return "PDF" }\n}',
 'class Invoice { total() { return 100 } }\nconst render = (i: Invoice) =>\n  "<p>" + i.total() + "</p>";',
 ['تغییر فقط تابع نمایش','اضافه کردن HTML به منطق محاسبه'],0,'قالب گزارش و قیمت دو دلیل مستقل برای تغییرند.','Invoice must change; total = 100','Only renderer changes; total = 100','مسئولیت بر اساس دلیل تغییر جدا می‌شود، نه تعداد متدها.','اگر هیچ تغییر مستقلی وجود ندارد، شکستن کلاس کوچک ارزش کمی دارد.'),
 'solid:ocp':w('O — افزودن سیاست جدید','تابع checkout نوع تخفیف را با شرط انتخاب می‌کند.','تخفیف دانشجویی ۲۰٪ به مبلغ ۱۰۰ اضافه می‌شود.',
 'function total(n: number, kind: string) {\n  return kind === "vip" ? n * 0.9 : n;\n}',
 'type Discount = (n: number) => number;\nconst total = (n: number, d: Discount) => d(n);\nconst student: Discount = n => n * 0.8;\ntotal(100, student);',
 ['شرط جدید در checkout','سیاست جدید با قرارداد ثابت'],1,'شرط جدید کار می‌کند اما همان هسته را برای هر سیاست تغییر می‌دهد.','student => 100 until core changes','student => 80; total unchanged','هسته برای یک محور تغییر مشخص (سیاست تخفیف) ثابت می‌ماند.','اگر تنها دو حالت پایدار داریم، شرط ساده ممکن است خواناتر باشد.'),
 'solid:lsp':w('L — قرارداد رفتار','قرارداد حساب اجازه برداشت مبلغ مثبت تا سقف موجودی را می‌دهد.','کلاینت از حساب با موجودی ۱۰۰، مبلغ ۲۰ را برداشت می‌کند.',
 'class Account {\n  withdraw(n: number) { /* debit n */ }\n}\nclass Locked extends Account {\n  withdraw(n: number) { throw Error("locked") }\n}',
 'interface Readable { balance: number }\ninterface Withdrawable extends Readable {\n  withdraw(n: number): void;\n}\n// Locked implements Readable only.',
 ['حساب قفل‌شده همان قرارداد برداشت را دارد','قرارداد خواندن از برداشت جدا شود'],1,'امضای یکسان، رفتار وعده‌داده‌شده را تضمین نمی‌کند.','withdraw(20) => throws','eligible account => balance 80','زیرنوع نباید عملیات معتبر قرارداد پایه را غیرمجاز کند.','اگر قرارداد پایه از ابتدا رد برداشت را مجاز می‌داند، باید آن قرارداد متفاوت را بررسی کرد.'),
 'solid:isp':w('I — رابط بر اساس نیاز','سرویس گزارش فقط رکورد می‌خواند، اما به رابط نوشتن و حذف هم وابسته است.','برای ذخیره نسخه رکورد اجباری می‌شود.',
 'interface Store {\n  read(): string; save(v: string): void;\n  delete(): void;\n}\nfunction report(s: Store) { return s.read() }',
 'interface Reader { read(): string }\ninterface Writer { save(v: string, version: number): void }\nfunction report(s: Reader) { return s.read() }',
 ['گزارش فقط به Reader وابسته باشد','گزارش به تمام عملیات Store وابسته بماند'],0,'گزارش هیچ نیازی به save ندارد؛ وابستگی اضافی تست را دشوار می‌کند.','Report mocks must implement save/delete','Report mock needs read only','مصرف‌کننده به قابلیت‌هایی وابسته است که واقعاً استفاده می‌کند.','برای هر متد الزاماً یک interface جدا لازم نیست.'),
 'solid:dip':w('D — جهت وابستگی','Checkout مستقیماً SDK پرداخت را import می‌کند.','می‌خواهیم پرداخت ۱۰۰ را بدون شبکه تست کنیم.',
 'import { sdk } from "./vendor";\nconst checkout = () => sdk.charge(100);',
 'interface Payment { charge(n: number): string }\nconst checkout = (p: Payment) => p.charge(100);\ncheckout({ charge: n => "fake:" + n });',
 ['تست هسته باید SDK واقعی را صدا بزند','هسته به قرارداد متعلق به خودش وابسته باشد'],1,'SDK جزئیات بیرونی است؛ تست سیاست کسب‌وکار نباید به آن گره بخورد.','Vendor call unless mocked','fake:100; no network','adapter بیرونی قرارداد هسته را پیاده می‌کند؛ DI نمونه را وصل می‌کند.','تست یکپارچگی SDK واقعی هنوز لازم است.'),
 singleton:w('یک نمونه، در چه محدوده‌ای؟','یک سرویس حافظه‌ای برای تنظیمات ساخته‌ایم و دو مصرف‌کننده آن را می‌خواهند.','دو مصرف‌کننده در یک فرایند مقدار شمارنده را تغییر می‌دهند.',
 'const make = () => ({ count: 0 });\nconst a = make(), b = make();\na.count++;',
 'const shared = { count: 0 };\nconst get = () => shared;\nconst a = get(), b = get();\na.count++;',
 ['b.count برابر ۰ است','b.count برابر ۱ است'],1,'هر دو متغیر در نسخه مشترک به یک شیء اشاره می‌کنند.','a.count = 1; b.count = 0','a.count = 1; b.count = 1','Singleton هویت یک نمونه را در محدوده تعریف‌شده مشترک می‌کند، نه در کل شبکه.','برای state متغیر، نمونه مشترک تست و هم‌زمانی را دشوار می‌کند؛ تزریق نمونه معمولاً کنترل بهتری می‌دهد.'),
 factory:w('ساخت شیء را از مصرف آن جدا کن','صفحه گزارش مستقیماً PDF exporter می‌سازد.','مشتری دوم CSV می‌خواهد، ولی فراخوانی export ثابت است.',
 'const exporter = new PdfExporter();\nexporter.export(rows);',
 'interface Exporter { export(rows: Row[]): string }\nconst create = (kind: "pdf" | "csv"): Exporter =>\n  kind === "pdf" ? new PdfExporter() : new CsvExporter();\ncreate("csv").export(rows);',
 ['انتخاب کلاس را در هر مصرف‌کننده تکرار کنیم','انتخاب را به تابع ساخت منتقل کنیم'],1,'تکرار شرط ساخت باعث پراکندگی تصمیم و وابستگی به کلاس‌ها می‌شود.','Hard-coded PDF exporter','CSV exporter; caller uses export(rows)','این نمونه Simple Factory است؛ Factory Method و Abstract Factory ساختارهای متفاوتی دارند.','برای ساخت یک کلاس ساده و ثابت، factory اضافه لازم نیست.'),
 strategy:w('الگوریتم قابل تعویض','هزینه ارسال استاندارد ۵۰۰ و سریع ۱۱۰۰ سنت است.','کاربر هنگام checkout ارسال سریع انتخاب می‌کند.',
 'const shipping = () => 500;\nconst total = 2000 + shipping();',
 'type Shipping = () => number;\nconst total = (s: Shipping) => 2000 + s();\nconst express = () => 1100;\ntotal(express);',
 ['قیمت نهایی ۳۱۰۰ سنت است','قیمت نهایی ۲۵۰۰ سنت است'],0,'سیاست سریع جای استاندارد را می‌گیرد؛ جمع قیمت کالا تغییر نکرده است.','2500 cents (standard only)','3100 cents (express)','Strategy رفتار قابل تعویض را پشت یک قرارداد می‌گذارد؛ Factory روی ساخت نمونه تمرکز دارد.','برای دو حالت بدون تغییر، شرط ساده ممکن است ارزان‌تر باشد.'),
 observer:w('یک رویداد، چند شنونده','سبد خرید باید شمارنده و گزارش رویداد را به‌روز کند.','یک محصول اضافه می‌شود؛ بعد گزارش دیگر نباید اعلان دریافت کند.',
 'function add() {\n  badge.update(); analytics.track();\n}\n// add knows both consumers',
 'const listeners = new Set([badge, analytics]);\nlisteners.delete(analytics);\nfor (const listener of listeners) listener.update();',
 ['فقط badge به‌روز می‌شود','هر دو شنونده به‌روز می‌شوند'],0,'حذف شنونده از مجموعه یعنی اعلان بعدی به آن ارسال نمی‌شود.','badge + analytics called','badge called; analytics removed','ناشر شنونده‌ها را از طریق قرارداد فراخوانی می‌کند؛ اشتراک و لغو اشتراک مستقل است.','در اعلان همگام، خطای یک شنونده می‌تواند بقیه را متوقف کند؛ سیاست خطا لازم است.'),
 'dependency-injection':w('وابستگی را از بیرون بده','سرویس ثبت سفارش خودش درگاه پرداخت واقعی را می‌سازد.','تست باید پاسخ fake برای پرداخت ۱۰۰ دریافت کند.',
 'class Checkout {\n  pay() { return new RealGateway().charge(100) }\n}',
 'interface Gateway { charge(n: number): string }\nclass Checkout {\n  constructor(private gateway: Gateway) {}\n  pay() { return this.gateway.charge(100) }\n}\nnew Checkout({charge: n => "fake:" + n}).pay();',
 ['نمونه fake در سازنده تزریق شود','یک درگاه global مخفی استفاده شود'],0,'global وابستگی را مخفی می‌کند و جداسازی تست را سخت‌تر می‌کند.','RealGateway created internally','fake:100; dependency explicit','DI نحوه تامین وابستگی است؛ container الزامی نیست و با DIP یکی نیست.','طول عمر نمونه مهم است؛ singleton نباید وابستگی scoped را نگه دارد.'),
 'repository-pattern':w('قانون کسب‌وکار مستقل از ذخیره‌سازی','سرویس سفارش مستقیماً SQL اجرا می‌کند.','در تست، سفارش ۴۲ را از حافظه بخوانیم؛ نه از دیتابیس.',
 'async function getOrder(id: number) {\n  return db.query("SELECT * FROM orders WHERE id = ?", [id]);\n}',
 'interface Orders { find(id: number): Promise<Order | null> }\nconst getOrder = (r: Orders, id: number) => r.find(id);\n// Inject a fake repository with order 42.',
 ['سرویس باید SQL را نگه دارد','قرارداد repository در مرز کاربرد قرار گیرد'],1,'سرویس به پرس‌وجوی مشخص وابسته نیست؛ قرارداد دریافت Order را نیاز دارد.','Database required','Order 42 from fake repository','repository دسترسی به مدل دامنه را پنهان می‌کند؛ لزوماً wrapper عمومی CRUD نیست.','تست fake رفتار تراکنش و concurrency دیتابیس واقعی را تضمین نمی‌کند.'),
 'clean-architecture':w('وابستگی کد به سمت داخل','Use case ایجاد سفارش، مدل ORM را مستقیماً import می‌کند.','می‌خواهیم ORM را عوض کنیم بدون تغییر قانون مبلغ سفارش.',
 'import { OrderRow } from "./orm";\nfunction place(row: OrderRow) { /* business rules */ }',
 'type Order = { id: number; total: number };\ninterface Orders { save(order: Order): Promise<void> }\n// use case owns the port; ORM adapter imports it.\nconst place = (r: Orders, o: Order) => r.save(o);',
 ['هسته به مدل ORM وابسته بماند','adapter بیرونی به قرارداد هسته وابسته شود'],1,'اگر مدل ORM وارد هسته شود، تغییر زیرساخت به قانون کسب‌وکار سرایت می‌کند.','Core imports ORM','Core owns Order and Orders port','جهت import به داخل است؛ فراخوانی زمان اجرا می‌تواند از هسته به adapter بیرونی باشد.','لایه‌های زیاد برای یک CRUD ساده هزینه غیرضروری دارند.'),
 'monolith-microservices':w('مرز استقرار و شکست','در یک فروشگاه، سفارش و موجودی در یک برنامه‌اند.','اگر بعد از رزرو موجودی ثبت سفارش شکست بخورد، چه می‌شود؟',
 'transaction(() => {\n  stock.reserve(42);\n  orders.create(42); // throws\n}); // one database transaction',
 'await stockService.reserve(42);\ntry { await orderService.create(42); }\ncatch { await stockService.release(42); }\n// simplified compensation; retries needed',
 ['rollback محلی خودکار بین دو سرویس وجود دارد','جبران و retry قابل اعتماد لازم است'],1,'تراکنش محلی هر سرویس، تراکنش سراسری خودکار نیست.','Single DB transaction: reservation rolled back','Separate services: release must succeed or retry','استقرار مستقل هزینه شبکه، شکست جزئی و سازگاری داده را اضافه می‌کند.','Monolith ماژولار می‌تواند انتخاب بهتر باشد؛ جداسازی وقتی ارزش دارد که نیاز مستقل روشن باشد.'),
 'event-driven-architecture':w('رویداد تکراری، اثر تکراری؟','مصرف‌کننده هر OrderPlaced را به شمارنده سفارش اضافه می‌کند.','broker رویداد با شناسه e42 را دوبار تحویل می‌دهد.',
 'let count = 0;\nfor (const event of ["e42", "e42"]) count++;',
 'const seen = new Set<string>();\nlet count = 0;\nfor (const id of ["e42", "e42"]) {\n  if (!seen.has(id)) { seen.add(id); count++; }\n}',
 ['شمارنده ۱ می‌شود','شمارنده ۲ می‌شود'],0,'در نسخه دوم شناسه تکراری قبل از اعمال اثر بررسی می‌شود.','count = 2','count = 1','مصرف‌کننده idempotent اثر تکراری را کنترل می‌کند؛ تحویل تکراری هنوز ممکن است.','در محیط واقعی dedup و اثر باید پایدار و اتمیک باشند؛ Set حافظه‌ای در crash کافی نیست.')
};
export function workshopFor(slug:string,scenario:string):Workshop|undefined{
 return workshops[slug+':'+scenario]??workshops[slug];
}
