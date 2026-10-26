/* ข้อมูลตัวอย่าง (seed) สร้างอิงวันที่ปัจจุบัน กราฟจึงมีข้อมูลเสมอ
   เมื่อเชื่อมฐานข้อมูลจริง ให้แทนที่ PRODUCTS / ORDERS / CUSTOMER_COUNT ด้วยข้อมูลจาก API */
const CATEGORIES = ['วิตามินรวม','วิตามินซี','โอเมก้า-3','แร่ธาตุ','โปรตีน & ฟิตเนส'];

const PRODUCTS = [
  {id:1, name:'มัลติวิตามิน Daily Plus 60 เม็ด', cat:0, price:490, stock:42, threshold:10},
  {id:2, name:'วิตามินรวมสำหรับผู้หญิง 90 เม็ด', cat:0, price:690, stock:6,  threshold:10},
  {id:3, name:'วิตามินซี 1000 มก. 100 เม็ด',     cat:1, price:350, stock:58, threshold:15},
  {id:4, name:'วิตามินซี + ซิงค์ ชนิดเคี้ยว',     cat:1, price:420, stock:14, threshold:15},
  {id:5, name:'น้ำมันปลา โอเมก้า-3 1000 มก.',     cat:2, price:590, stock:31, threshold:10},
  {id:6, name:'โอเมก้า-3 ไตรกลีเซอไรด์ 60 แคปซูล', cat:2, price:850, stock:0,  threshold:8},
  {id:7, name:'แมกนีเซียม กลีซิเนต 120 เม็ด',     cat:3, price:560, stock:9,  threshold:10},
  {id:8, name:'ซิงค์ พิโคลิเนต 50 เม็ด',          cat:3, price:320, stock:27, threshold:10},
  {id:9, name:'แคลเซียม + วิตามินดี3',            cat:3, price:480, stock:35, threshold:12},
  {id:10,name:'เหล็ก ไบซิกลีเนต 30 เม็ด',         cat:3, price:390, stock:3,  threshold:8},
  {id:11,name:'เวย์โปรตีน ช็อกโกแลต 2 ปอนด์',     cat:4, price:1590,stock:18, threshold:6},
  {id:12,name:'เวย์โปรตีน วานิลลา 1 ปอนด์',       cat:4, price:890, stock:7,  threshold:6},
  {id:13,name:'ครีเอทีน โมโนไฮเดรต 300 กรัม',     cat:4, price:790, stock:22, threshold:8},
  {id:14,name:'BCAA ผงชงรสส้ม',                   cat:4, price:650, stock:11, threshold:10},
  {id:15,name:'วิตามินบีรวม 100 เม็ด',            cat:0, price:380, stock:46, threshold:12},
  {id:16,name:'วิตามินดี3 5000 IU 120 เม็ด',      cat:1, price:450, stock:5,  threshold:10},
];

const CUSTOMER_COUNT = 27;
const STATUS = {pending:'รอชำระ', preparing:'เตรียมของ', shipping:'จัดส่ง', completed:'สำเร็จ', cancelled:'ยกเลิก'};

const ORDERS = (() => {
  let s = 20260; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const names = ['สมชาย ใจดี','พิมพ์ชนก รักสุข','ธนากร วงศ์ทอง','นภัสสร แก้วมณี','อดิศักดิ์ บุญมา',
    'กมลชนก ศรีสุข','วิชัย ตั้งใจ','ปวีณา เพชรงาม','ณัฐพล สุขสวัสดิ์','สุดารัตน์ มีชัย','ภาณุวัฒน์ จันทร์เพ็ญ','รัตนา ดวงดี'];
  const list = [], now = Date.now();
  for (let i = 0; i < 46; i++) {
    const age = Math.floor(Math.pow(rnd(), 1.3) * 28);
    const date = new Date(now - age * 864e5 - Math.floor(rnd() * 12) * 36e5);
    if (date > now) date.setTime(now - 36e5);
    const items = [];
    for (let k = 0, n = 1 + Math.floor(rnd() * 3); k < n; k++) {
      const p = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)];
      items.push({productId:p.id, qty:1 + Math.floor(rnd() * 2), unitPrice:p.price});
    }
    const r = rnd(); let status;
    if (age > 5) status = r < .86 ? 'completed' : r < .94 ? 'cancelled' : 'shipping';
    else status = r < .25 ? 'pending' : r < .5 ? 'preparing' : r < .7 ? 'shipping' : r < .93 ? 'completed' : 'cancelled';
    const sub = items.reduce((a, x) => a + x.qty * x.unitPrice, 0);
    list.push({id:0, customer:names[Math.floor(rnd() * names.length)], date, status, items, total: sub + (sub >= 1000 ? 0 : 50)});
  }
  list.sort((a, b) => a.date - b.date).forEach((o, i) => o.id = 'VS-' + (1001 + i));
  return list;
})();
