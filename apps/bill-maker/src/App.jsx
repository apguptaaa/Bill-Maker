import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

const UNITS = /^(kg|kgs|g|gm|gram|grams|pound|pounds|pond|lb|lbs|pcs|pc|piece|pieces|dozen|dz|litre|liter|ltr|l|ml|plate|box|packet|pack)$/i;
const NUM = /^(\d+(\.\d+)?|\d+\/\d+)x?$/i;
const toNum = s => { s = s.replace(/x$/i, ''); if (s.includes('/')) { const [a, b] = s.split('/'); return a / b; } return parseFloat(s); };
const fmt = n => '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function parseLine(line) {
  const t = line.replace(/\/-/g, ' ').replace(/₹/g, ' ').replace(/\brs\.?(?=\s|\d|$)/gi, ' ').trim().split(/\s+/).filter(Boolean);
  if (t.length < 2) return { error: 'Enter both the name and the price' };
  const last = t.pop();
  if (!/^\d+(\.\d+)?$/.test(last)) return { error: 'Put the price (a number) at the end' };
  const rate = parseFloat(last);
  let qty = 1, unit = '';
  if (t.length && NUM.test(t[0])) qty = toNum(t.shift());
  if (t.length > 1 && UNITS.test(t[0])) { unit = t.shift().toLowerCase(); if (unit === 'pond') unit = 'pound'; }
  const name = t.join(' ');
  if (!name) return { error: 'Enter the item name' };
  return { qty, unit, name: name.charAt(0).toUpperCase() + name.slice(1), rate, amount: qty * rate };
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const two = n => n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
const three = n => (n >= 100 ? ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' : '') : '') + (n % 100 ? two(n % 100) : '');
function numWords(n) {
  if (n === 0) return 'Zero';
  const out = [], cr = Math.floor(n / 1e7); n %= 1e7;
  const la = Math.floor(n / 1e5); n %= 1e5;
  const th = Math.floor(n / 1e3); n %= 1e3;
  if (cr) out.push(three(cr) + ' Crore');
  if (la) out.push(two(la) + ' Lakh');
  if (th) out.push(two(th) + ' Thousand');
  if (n) out.push(three(n));
  return out.join(' ');
}
const rupeesInWords = t => { const pp = Math.round(t * 100), r = Math.floor(pp / 100), p = pp % 100; return 'Rupees ' + numWords(r) + (p ? ' and ' + numWords(p) + ' Paise' : '') + ' Only'; };

const TPLS = [
  { id: 'choco', name: 'Chocolate', bg: '#fff7ef', pat: 'repeating-linear-gradient(45deg, rgba(74,44,26,.06) 0 2px, transparent 2px 12px)', a: '#7c4a2a', h: '#4a2c1a', hc: '#f6d9a8', s: '#4a2c1a', hb: '#4a2c1a', font: 'Georgia,serif' },
  { id: 'bluewhite', name: 'Blue & White', bg: '#f0f6ff', pat: 'repeating-linear-gradient(45deg, rgba(37,99,235,.07) 0 2px, transparent 2px 12px)', a: '#2563eb', h: '#ffffff', hc: '#1d4ed8', s: '#2563eb', hb: '#2563eb', font: 'system-ui,sans-serif' },
  { id: 'beige', name: 'Beige', bg: '#faf5ea', pat: 'radial-gradient(rgba(139,107,62,.16) 1.6px, transparent 2px) 0 0/16px 16px', a: '#8b6b3e', h: '#d9c7a3', hc: '#4a3820', s: '#d9c7a3', hb: '#8b6b3e', font: 'Georgia,serif' },
];

function WmLogo({ name, color, logo }) {
  const words = (name || '').toUpperCase().split(/\s+/).filter(Boolean);
  const lines = words.length > 3 ? [words[0], words[1], words.slice(2).join(' ')] : words;
  const longest = Math.max(1, ...lines.map(l => l.length));
  const fs = longest > 8 ? 17 : 22;
  const y0 = lines.length > 2 ? 160 : 172;
  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="wmTop" d="M 40,150 A 110,110 0 0 1 260,150" />
        <path id="wmBot" d="M 28,150 A 122,122 0 0 0 272,150" />
      </defs>
      <circle cx="150" cy="150" r="140" fill="none" stroke={color} strokeWidth="6" />
      <circle cx="150" cy="150" r="132" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="150" cy="150" r="90" fill="none" stroke={color} strokeWidth="2" />
      <text fontSize="17" fontWeight="700" letterSpacing="4" fill={color} fontFamily="Georgia,serif"><textPath href="#wmTop" startOffset="50%" textAnchor="middle">PURE EGGLESS</textPath></text>
      <text fontSize="15" fontWeight="700" letterSpacing="3" fill={color} fontFamily="Georgia,serif"><textPath href="#wmBot" startOffset="50%" textAnchor="middle">FRESHLY BAKED CAKES</textPath></text>
      {logo ? <image href={logo} x="85" y="85" width="130" height="130" preserveAspectRatio="xMidYMid meet" /> : (
        <g fill={color}>
          <g transform="translate(75,36) scale(0.5)">
            <polygon points="98,178 106,122 130,152 150,112 170,152 194,122 202,178" />
            <rect x="98" y="182" width="104" height="14" rx="3" />
            <circle cx="106" cy="118" r="6" /><circle cx="150" cy="108" r="7" /><circle cx="194" cy="118" r="6" />
          </g>
          {lines.map((l, i) => <text key={i} x="150" y={y0 + i * (fs + 5)} fontSize={fs} fontWeight="700" textAnchor="middle" letterSpacing="1" fontFamily="Georgia,serif">{l}</text>)}
        </g>
      )}
    </svg>
  );
}

function SigPad({ onSave, onCancel }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const pos = e => { const c = ref.current, r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * c.width / r.width, y: (e.clientY - r.top) * c.height / r.height }; };
  const down = e => { const c = ref.current, x = c.getContext('2d'), p = pos(e); c.setPointerCapture(e.pointerId); drawing.current = true; x.lineWidth = 3; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#111'; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x + 0.1, p.y + 0.1); x.stroke(); };
  const move = e => { if (!drawing.current) return; const x = ref.current.getContext('2d'), p = pos(e); x.lineTo(p.x, p.y); x.stroke(); };
  const up = () => { drawing.current = false; };
  const clear = () => { const c = ref.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); };
  return (
    <div style={{ marginTop: 8 }}>
      <canvas ref={ref} width={500} height={160} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ width: '100%', height: 'auto', touchAction: 'none', background: '#fff', border: '1.5px dashed #999', borderRadius: 8, cursor: 'crosshair' }} />
      <div className="hint">Sign inside the box with your finger or mouse</div>
      <div className="btns" style={{ marginTop: 6 }}>
        <button className="p" onClick={() => onSave(ref.current.toDataURL('image/png'))}>Save signature</button>
        <button onClick={clear}>Clear</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function App() {
  const [shop, setShop] = useState('Royal Cake Bakery');
  const [tag, setTag] = useState('Fresh Cakes • Pastries • Cookies');
  const [addr, setAddr] = useState('');
  const [phone, setPhone] = useState('');
  const [cust, setCust] = useState('');
  const [custPh, setCustPh] = useState('');
  const [billNo, setBillNo] = useState('001');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [gst, setGst] = useState('0');
  const [disc, setDisc] = useState('0');
  const [pay, setPay] = useState('Paid');
  const [note, setNote] = useState('Thank you! Visit again 🙏');
  const [tpl, setTpl] = useState('choco');
  const [layout, setLayout] = useState('modern');
  const pattern = false;
  const decor = true;
  const [para, setPara] = useState('100% Pure Eggless  •  Freshly Baked Cakes');
  const [footTag, setFootTag] = useState('🌾 Freshly baked with love 🌾');
  const [foot2, setFoot2] = useState('This is a computer generated invoice');
  const [wm, setWm] = useState('logo');
  const [gstin, setGstin] = useState('');
  const [fssai, setFssai] = useState('');
  const [custAddr, setCustAddr] = useState('');
  const [terms, setTerms] = useState('1. Cake once sold will not be taken back.\n2. Please check items at the time of delivery.\n3. Cakes are best consumed the same day.');
  const [logo, setLogo] = useState('');
  const [sig, setSig] = useState('');
  const [sigName, setSigName] = useState('Authorized Signature');
  const [showSig, setShowSig] = useState(true);
  const [pad, setPad] = useState(false);
  const pickSig = e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setSig(r.result);
    r.readAsDataURL(f);
  };
  const [list, setList] = useState([
    { id: 1, name: 'Blueberry cake', qty: 1, unit: 'pound', rate: 250 },
    { id: 2, name: 'Chocolate pastry', qty: 2, unit: 'pcs', rate: 60 },
  ]);
  const [nm, setNm] = useState('');
  const [q, setQ] = useState('1');
  const [un, setUn] = useState('pound');
  const [rt, setRt] = useState('');
  const [quick, setQuick] = useState('');
  const [formErr, setFormErr] = useState('');
  const nextId = useRef(10);
  const addItem = () => {
    const qty = parseFloat(q), rate = parseFloat(rt);
    if (!nm.trim()) return setFormErr('Enter the cake / item name');
    if (!(qty > 0)) return setFormErr('Enter a valid weight / quantity');
    if (!(rate >= 0) || rt === '') return setFormErr('Enter the rate');
    setList(l => [...l, { id: nextId.current++, name: nm.trim().replace(/^./, c => c.toUpperCase()), qty, unit: un, rate }]);
    setNm(''); setQ('1'); setRt(''); setFormErr('');
  };
  const addQuick = () => {
    const p = parseLine(quick.trim());
    if (p.error) return setFormErr('"' + quick + '" → ' + p.error);
    setList(l => [...l, { id: nextId.current++, name: p.name, qty: p.qty, unit: p.unit, rate: p.rate }]);
    setQuick(''); setFormErr('');
  };
  const removeItem = id => setList(l => l.filter(x => x.id !== id));
  const billRef = useRef(null);
  const boxRef = useRef(null);
  const innerRef = useRef(null);
  const [mode, setMode] = useState('side');
  const [pv, setPv] = useState({ scale: 1, w: null, h: 0 });
  useEffect(() => {
    const box = boxRef.current, inner = innerRef.current;
    if (!box || !inner || !window.ResizeObserver) return;
    const BASE = 440;
    const upd = () => {
      const w = box.clientWidth;
      const sc = w > 0 && w < BASE ? w / BASE : 1;
      const h = Math.round(inner.offsetHeight * sc);
      setPv(p => (p.scale === sc && p.h === h ? p : { scale: sc, w: sc < 1 ? BASE : null, h }));
    };
    const ro = new ResizeObserver(upd);
    ro.observe(box); ro.observe(inner); upd();
    return () => ro.disconnect();
  }, [layout, mode]);

  const [msg, setMsg] = useState('');

  const T = TPLS.find(t => t.id === tpl);
  const showDate = date ? date.split('-').reverse().join('-') : '';
  const today = () => setDate(new Date().toISOString().slice(0, 10));
  const pickLogo = e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setLogo(r.result);
    r.readAsDataURL(f);
  };

  const downloadImage = async () => {
    setMsg('Creating image...');
    try {
      const canvas = await html2canvas(billRef.current, {
        onclone: doc => { const w = doc.getElementById('scaleWrap'); if (w) w.style.transform = 'none'; },
        scale: 2,
        backgroundColor: pattern ? T.bg : '#ffffff',
      });
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bill-' + (billNo || 'new') + '.png';
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Image saved ✅');
    } catch {
      setMsg('Download failed. Use Print to save as PDF.');
    }
  };

  const items = list.map(x => ({ ...x, amount: x.qty * x.rate }));
  const sub = items.reduce((s, i) => s + i.amount, 0);
  const d = Math.min(sub, Math.max(0, parseFloat(disc) || 0));
  const g = ((sub - d) * (parseFloat(gst) || 0)) / 100;
  const total = sub - d + g;
  const vars = { '--a': T.a, '--h': T.h, '--hc': T.hc, '--s': T.s, '--hb': T.hb, fontFamily: T.font, background: pattern ? T.pat + ', ' + T.bg : '#ffffff' };

  return (
    <div className={'wrap ' + mode}>
      <div className="card noprint">
        <h1>🧾 Bakery Bill Maker</h1>
        <div className="mobonly lays">
          <button className={mode === 'side' ? 'on' : ''} onClick={() => setMode('side')}>◧ Side by side</button>
          <button className={mode === 'stack' ? 'on' : ''} onClick={() => setMode('stack')}>▭ Stacked</button>
        </div>
        <div className="hint">Fill in the cake name, weight and rate in the boxes below.</div>

        <label>Bill layout</label>
        <div className="lays">
          {[['modern', '🎨 Modern'], ['receipt', '🧾 Receipt (small)']].map(([k, n]) => (
            <button key={k} className={layout === k ? 'on' : ''} onClick={() => setLayout(k)}>{n}</button>
          ))}
        </div>

        <label>Watermark</label>
        <select value={wm} onChange={e => setWm(e.target.value)}>{[['logo', 'Shop logo (in a circle)'], ['none', 'None']].map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select>
        <label>Color theme</label>
        <div className="tpls">
          {TPLS.map(t => (
            <button key={t.id} className={'sw' + (t.id === tpl ? ' on' : '')} onClick={() => setTpl(t.id)}>
              <i style={{ background: t.pat + ', ' + t.bg, borderTop: '8px solid ' + t.s }} />{t.name}
            </button>
          ))}
        </div>

        <label>Logo (upload image)</label>
        <input type="file" accept="image/*" onChange={pickLogo} />
        {logo && <div className="btns" style={{ marginTop: 6 }}><button onClick={() => setLogo('')}>Remove logo</button></div>}

        <label style={{ marginTop: 14 }}>Signature</label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text)', fontSize: 13 }}><input type="checkbox" style={{ width: 'auto' }} checked={showSig} onChange={e => setShowSig(e.target.checked)} /> Show signature on bill</label>
        {showSig && <>
        <div className="btns" style={{ marginTop: 0 }}>
          <button onClick={() => setPad(p => !p)}>✍️ Draw signature</button>
          {sig && <button onClick={() => setSig('')}>Remove signature</button>}
        </div>
        {pad && <SigPad onSave={d => { setSig(d); setPad(false); }} onCancel={() => setPad(false)} />}
        <label>Or upload a signature image</label>
        <input type="file" accept="image/*" onChange={pickSig} />
        <label>Signature label text</label>
        <input value={sigName} onChange={e => setSigName(e.target.value)} />
        </>}

        <div className="row">
          <div><label>Shop name</label><input value={shop} onChange={e => setShop(e.target.value)} /></div>
          <div><label>Tagline</label><input value={tag} onChange={e => setTag(e.target.value)} /></div>
        </div>
        <div className="row">
          <div><label>Address</label><input value={addr} onChange={e => setAddr(e.target.value)} /></div>
          <div><label>Shop phone</label><input value={phone} onChange={e => setPhone(e.target.value)} /></div>
        </div>
        <div className="row">
          <div><label>GSTIN (optional)</label><input value={gstin} onChange={e => setGstin(e.target.value)} /></div>
          <div><label>FSSAI Lic. No. (optional)</label><input value={fssai} onChange={e => setFssai(e.target.value)} /></div>
        </div>
        <div className="row">
          <div><label>Customer name</label><input value={cust} onChange={e => setCust(e.target.value)} /></div>
          <div><label>Customer phone</label><input value={custPh} onChange={e => setCustPh(e.target.value)} /></div>
        </div>
        <label>Customer address (optional)</label><input value={custAddr} onChange={e => setCustAddr(e.target.value)} />
        <div className="row">
          <div><label>Bill no.</label><input value={billNo} onChange={e => setBillNo(e.target.value)} /></div>
          <div><label>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /><button style={{ marginTop: 6, padding: '4px 10px', fontSize: 12 }} onClick={today}>Today</button></div>
        </div>
        <div className="row">
          <div><label>Discount (₹)</label><input type="number" min="0" value={disc} onChange={e => setDisc(e.target.value)} /></div>
          <div><label>GST %</label><input type="number" min="0" value={gst} onChange={e => setGst(e.target.value)} /></div>
        </div>
        <div className="row">
          <div><label>Payment</label><select value={pay} onChange={e => setPay(e.target.value)}><option>Paid</option><option>Unpaid</option><option>Advance</option><option>None</option></select></div>
          <div><label>Thank-you message</label><input value={note} onChange={e => setNote(e.target.value)} /></div>
        </div>
        <label>Paragraph (shown below the header, write anything)</label>
        <textarea style={{ minHeight: 70 }} value={para} onChange={e => setPara(e.target.value)} placeholder="e.g. Special order: 2 kg chocolate cake, delivery by 5 PM" />
        <div className="hint">Leave it empty to hide this section.</div>
        <label>Terms & conditions (one point per line)</label>
        <textarea style={{ minHeight: 80 }} value={terms} onChange={e => setTerms(e.target.value)} />
        <label style={{ marginTop: 14, fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>Footer (thank-you section)</label>
        <label>Line above the thank-you message</label><input value={footTag} onChange={e => setFootTag(e.target.value)} />
        <label>Small print at the bottom</label><input value={foot2} onChange={e => setFoot2(e.target.value)} />
        <label style={{ marginTop: 16, fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>➕ Add item</label>
        <label>Cake / item name</label>
        <input list="cakes" value={nm} onChange={e => setNm(e.target.value)} placeholder="e.g. Blueberry cake" />
        <datalist id="cakes">{['Blueberry cake', 'Chocolate cake', 'Black forest cake', 'Pineapple cake', 'Butterscotch cake', 'Red velvet cake', 'Vanilla cake', 'Strawberry cake', 'Chocolate pastry', 'Cookies', 'Brownie', 'Cupcake'].map(c => <option key={c} value={c} />)}</datalist>
        <div className="row3">
          <div><label>Weight / Qty</label><input type="number" min="0" step="any" value={q} onChange={e => setQ(e.target.value)} /></div>
          <div><label>Unit</label><select value={un} onChange={e => setUn(e.target.value)}>{['pound', 'kg', 'g', 'pcs', 'dozen', 'plate', 'box', 'packet'].map(u => <option key={u}>{u}</option>)}</select></div>
          <div><label>Rate (₹ per unit)</label><input type="number" min="0" step="any" value={rt} onChange={e => setRt(e.target.value)} placeholder="250" /></div>
        </div>
        <div className="hint">Amount: <b>{fmt((parseFloat(q) || 0) * (parseFloat(rt) || 0))}</b></div>
        <div className="btns"><button className="p" onClick={addItem}>Add item</button></div>
        {formErr && <div className="err">{formErr}</div>}

        <label>Or type it in one line (optional)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={quick} onChange={e => setQuick(e.target.value)} onKeyDown={e => e.key === 'Enter' && addQuick()} placeholder="1 pound blueberry cake 250" />
          <button onClick={addQuick}>Add</button>
        </div>

        <label style={{ marginTop: 14 }}>Added items ({list.length})</label>
        {list.length === 0 && <div className="hint">No items yet</div>}
        {items.map(i => (
          <div className="li" key={i.id}>
            <span>{i.name} — {i.qty} {i.unit} × {fmt(i.rate)} = <b>{fmt(i.amount)}</b></span>
            <button onClick={() => removeItem(i.id)} aria-label="delete">🗑️</button>
          </div>
        ))}
        <div className="btns">
          <button className="p" onClick={downloadImage}>⬇️ Download image</button>
          <button onClick={() => window.print()}>🖨️ Print bill</button>
          <button onClick={() => setList([])}>Remove all items</button>
        </div>
        {msg && <div className="hint">{msg}</div>}
      </div>

      <div className="pvcol"><div className="pvbox" ref={boxRef} style={{ height: pv.scale < 1 ? pv.h : 'auto' }}><div id="scaleWrap" ref={innerRef} style={{ width: pv.w ? pv.w + 'px' : '100%', transform: pv.scale < 1 ? 'scale(' + pv.scale + ')' : 'none', transformOrigin: 'top left' }}>
      <div className={'card bill lay-' + layout} ref={billRef} style={vars}>
        {decor && layout !== 'receipt' && <div className="drip" />}
        {wm !== 'none' && <div className="wm"><WmLogo name={shop} color={T.a} logo={logo} /></div>}
        <div className="bhead">
          <div className="bl">
            {logo && <img src={logo} alt="logo" />}
            <div className="bn">
              <h2>{shop || 'Shop Name'}</h2>
              {tag && <div className="tg">{tag}</div>}
              {(addr || phone) && <div className="ad">{[addr, phone].filter(Boolean).join(' | ')}</div>}
              {(gstin || fssai) && (
                <div className="hmeta">
                  {gstin && <div>GSTIN: <b>{gstin}</b></div>}
                  {fssai && <div>FSSAI: <b>{fssai}</b></div>}
                </div>
              )}
            </div>
          </div>
          <div className="br">
            <div className="itl">{parseFloat(gst) > 0 ? 'TAX INVOICE' : 'INVOICE'}</div>
            {pay !== 'None' && <span className="badge">{pay.toUpperCase()}</span>}
            <div className="hmeta">
              <div>Invoice no: <b>#{billNo}</b></div>
              <div>Date: <b>{showDate}</b></div>
            </div>
            <div className="hbill">
              <h4>Billed to</h4>
              <b>{cust || 'Walk-in Customer'}</b>
              {custPh && <div>{custPh}</div>}
              {custAddr && <div>{custAddr}</div>}
            </div>
          </div>
        </div>
        <div className="in">
          {para && <div className="para">{para}</div>}
          {items.length === 0
            ? <div className="empty">No items added yet</div>
            : (
              <div className="tw">
                <table width="100%">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th style={{ textAlign: 'left' }}>Item</th>
                      <th>Weight</th>
                      <th className="r">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td>{item.name}</td>
                        <td style={{ textAlign: 'center' }}>{item.qty}{item.unit ? ' ' + item.unit : ''}</td>
                        <td className="r">{fmt(item.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
          <div className="bottom">
            <div>
              <div className="words"><b>Amount in words</b>{rupeesInWords(total)}</div>
              {note && <div className="fe">{note}</div>}
              {terms && (
                <div className="terms">
                  <h4>Terms & Conditions</h4>
                  {terms.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                </div>
              )}
            </div>
            <div>
              <div className="totals">
                <div className="trow"><span>Subtotal</span><span>{fmt(sub)}</span></div>
                {d > 0 && <div className="trow"><span>Discount</span><span>− {fmt(d)}</span></div>}
                {g > 0 && <div className="trow"><span>GST ({gst}%)</span><span>+ {fmt(g)}</span></div>}
                <div className="trow gt"><span>Total</span><span>{fmt(total)}</span></div>
              </div>
              {showSig && (
                <div className="signrow">
                  <div className="sign">
                    {sig ? <img src={sig} alt="signature" /> : <div style={{ height: 50 }} />}
                    <div className="sl">{sigName}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="foot">
          {footTag && <b>{footTag}</b>}
          {foot2 && <span>{foot2}</span>}
        </div>
      </div>
      </div></div></div>
    </div>
  );
}
