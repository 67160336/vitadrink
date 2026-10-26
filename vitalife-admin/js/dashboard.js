/* Admin Dashboard (เฟส 6)
   รายได้นับเฉพาะคำสั่งซื้อที่ชำระแล้ว (เตรียมของ / จัดส่ง / สำเร็จ)
   "รอดำเนินการ" = รอชำระ + เตรียมของ */
const $ = id => document.getElementById(id);
const baht = n => '฿' + Math.round(n).toLocaleString('th-TH');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PAID = ['preparing', 'shipping', 'completed'];
const dayStart = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const fmtD = d => d.toLocaleDateString('th-TH', {day:'numeric', month:'short'});
const fmtDT = d => d.toLocaleString('th-TH', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
const paidOrders = ORDERS.filter(o => PAID.includes(o.status));

function renderStats() {
  const revenue = paidOrders.reduce((a, o) => a + o.total, 0);
  const pending = ORDERS.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const cards = [
    ['', baht(revenue), 'รายได้รวม'],
    ['s2', ORDERS.length.toLocaleString('th-TH'), 'คำสั่งซื้อทั้งหมด'],
    ['s3', pending.toLocaleString('th-TH'), 'คำสั่งซื้อที่รอดำเนินการ'],
    ['s4', CUSTOMER_COUNT.toLocaleString('th-TH'), 'จำนวนลูกค้า'],
  ];
  $('stats').innerHTML = cards.map(([c, v, l]) =>
    `<div class="stat ${c}"><div class="v">${v}</div><div class="l">${l}</div></div>`).join('');
}

function buckets(mode) {
  const today = dayStart(new Date()), out = [], DAY = 864e5;
  const sum = (from, to) => {
    const os = paidOrders.filter(o => o.date >= from && o.date < to);
    return {revenue: os.reduce((a, o) => a + o.total, 0), orders: os.length};
  };
  if (mode === 'w') {
    for (let w = 3; w >= 0; w--) {
      const to = new Date(today.getTime() + DAY - w * 7 * DAY), from = new Date(to.getTime() - 7 * DAY);
      out.push({label: fmtD(from) + ' – ' + fmtD(new Date(to - 1)), short: fmtD(from), ...sum(from, to)});
    }
  } else {
    for (let d = +mode - 1; d >= 0; d--) {
      const from = new Date(today.getTime() - d * DAY), to = new Date(from.getTime() + DAY);
      out.push({label: fmtD(from), short: String(from.getDate()), ...sum(from, to)});
    }
  }
  return out;
}

function renderRevenue(mode) {
  const b = buckets(mode), max = Math.max(...b.map(x => x.revenue), 1);
  const W = 640, H = 220, pad = {l:8, r:8, t:22, b:26}, bw = (W - pad.l - pad.r) / b.length;
  const maxI = b.findIndex(x => x.revenue === max);
  $('chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="กราฟรายได้">
    <line x1="${pad.l}" x2="${W - pad.r}" y1="${H - pad.b}" y2="${H - pad.b}"/>
    ${b.map((x, i) => {
      const h = (H - pad.t - pad.b) * x.revenue / max, bx = pad.l + i * bw + bw * .18, w = bw * .64;
      return `<rect class="bar ${i === maxI && x.revenue ? 'max' : ''}" x="${bx}" y="${H - pad.b - h}" width="${w}" height="${h}" rx="${Math.min(w / 2, 10)}"><title>${x.label}: ${baht(x.revenue)}</title></rect>
      <text x="${bx + w / 2}" y="${H - 8}" text-anchor="middle">${x.short}</text>
      ${x.revenue && b.length <= 8 ? `<text x="${bx + w / 2}" y="${H - pad.b - h - 6}" text-anchor="middle">${Math.round(x.revenue).toLocaleString('th-TH')}</text>` : ''}`;
    }).join('')}</svg>`;
  const total = b.reduce((a, x) => a + x.revenue, 0), cnt = b.reduce((a, x) => a + x.orders, 0);
  $('revTable').innerHTML = `<thead><tr><th>${mode === 'w' ? 'สัปดาห์' : 'วันที่'}</th><th class="n">คำสั่งซื้อ</th><th class="n">รายได้</th></tr></thead>
    <tbody>${b.slice().reverse().map(x => `<tr><td>${x.label}</td><td class="n">${x.orders}</td><td class="n">${baht(x.revenue)}</td></tr>`).join('')}</tbody>
    <tfoot><tr><th>รวม</th><th class="n">${cnt}</th><th class="n">${baht(total)}</th></tr></tfoot>`;
}

function renderLow() {
  const low = PRODUCTS.filter(p => p.stock <= p.threshold).sort((a, b) => a.stock / a.threshold - b.stock / b.threshold);
  $('lowCount').textContent = low.length + ' รายการ';
  $('low').innerHTML = low.length ? low.map(p => {
    const pct = Math.min(100, p.stock / p.threshold * 100);
    return `<li><div class="row"><span>${esc(p.name)}</span><b>${p.stock === 0 ? 'หมด' : 'เหลือ ' + p.stock}</b></div>
      <div class="cat">${CATEGORIES[p.cat]} · เกณฑ์ ${p.threshold}</div>
      <div class="cap" role="img" aria-label="สต็อก ${p.stock} จากเกณฑ์ ${p.threshold}"><i class="${p.stock === 0 ? 'zero' : ''}" style="width:${pct}%"></i></div></li>`;
  }).join('') : '<li class="empty">สต็อกสินค้าทุกรายการเพียงพอ</li>';
}

function renderRecent() {
  const rows = ORDERS.slice().sort((a, b) => b.date - a.date).slice(0, 8);
  $('recent').innerHTML = `<thead><tr><th>เลขที่</th><th>ลูกค้า</th><th>วันที่</th><th>สถานะ</th><th class="n">ยอดรวม</th></tr></thead><tbody>${
    rows.map(o => `<tr><td><b>${o.id}</b></td><td>${esc(o.customer)}</td><td>${fmtDT(o.date)}</td>
      <td><span class="tag st-${o.status}">${STATUS[o.status]}</span></td><td class="n">${baht(o.total)}</td></tr>`).join('')}</tbody>`;
}

$('today').textContent = new Date().toLocaleDateString('th-TH', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
renderStats(); renderLow(); renderRecent(); renderRevenue('7');
$('range').addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  document.querySelectorAll('#range button').forEach(x => x.classList.toggle('on', x === btn));
  renderRevenue(btn.dataset.r);
});
