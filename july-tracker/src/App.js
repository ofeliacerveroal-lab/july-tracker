import React, { useState, useEffect, useCallback, useRef } from 'react';

// ── Design tokens ──────────────────────────────────────────────
const C = {
  sage:       '#4A7C6F',
  sageDark:   '#2F5249',
  sageLight:  '#E8F2EF',
  coral:      '#D95F3B',
  coralLight: '#FCEEE9',
  slate:      '#1E2D2A',
  slateLight: '#4A5C58',
  cream:      '#F7F5F1',
  white:      '#FFFFFF',
  border:     '#D4E0DC',
  gold:       '#C4934A',
  goldLight:  '#FBF3E7',
};

// ── Shared storage key ─────────────────────────────────────────
// Both users share the same localStorage key via the same origin.
// July and the client use the same deployed URL so data is shared.
const KEYS = {
  tension:      'jt_tension',
  meals:        'jt_meals',
  measurements: 'jt_measurements',
  role:         'jt_role',
};

// Fecha en formato YYYY-MM-DD usando la hora LOCAL (no UTC), para que
// coincida con PLAN_DAYS y con lo que ve el usuario en su huso horario.
function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
const TODAY = isoDate(new Date());

function readLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  // Notify other tabs
  window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(value) }));
}

function useShared(key, init) {
  // init suele ser un literal nuevo en cada render ([] o {}). Lo guardamos en
  // una ref para que el efecto dependa solo de `key` y no se resuscriba (con su
  // add/removeEventListener) en cada render.
  const initRef = useRef(init);
  const [val, setVal] = useState(() => readLS(key, initRef.current));
  useEffect(() => {
    const handler = (e) => { if (e.key === key) setVal(readLS(key, initRef.current)); };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);
  const save = useCallback((v) => { setVal(v); writeLS(key, v); }, [key]);
  return [val, save];
}

// ── Icons ──────────────────────────────────────────────────────
const Ic = {
  heart:  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:18,height:18}}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  food:   <svg viewBox="0 0 24 24" fill="currentColor" style={{width:18,height:18}}><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>,
  chart:  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:18,height:18}}><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 17.49z"/></svg>,
  guide:  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:18,height:18}}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>,
  camera: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:20,height:20}}><path d="M12 15.2c-1.77 0-3.2-1.43-3.2-3.2 0-1.77 1.43-3.2 3.2-3.2 1.77 0 3.2 1.43 3.2 3.2 0 1.77-1.43 3.2-3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>,
  trash:  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
  check:  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  plus:   <svg viewBox="0 0 24 24" fill="currentColor" style={{width:18,height:18}}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>,
  bell:   <svg viewBox="0 0 24 24" fill="currentColor" style={{width:18,height:18}}><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>,
  menu:   <svg viewBox="0 0 24 24" fill="currentColor" style={{width:18,height:18}}><path d="M8.1 13.34l2.83-2.83L3.91 3.5a4 4 0 0 0 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>,
};

// ── Food groups (shared by Guía and Menú) ──────────────────────
const FOOD_GROUPS = {
  verduras:  ['Tomates','Pepinos','Lechuga','Zanahoria','Calabacín','Brócoli','Coliflor','Pimiento','Champiñones','Berenjena','Espárragos','Judías verdes'],
  proteinas: ['Huevos','Pollo','Pavo','Pescado','Atún','Salmón','Gambas','Lentejas','Garbanzos','Judías','Yogur griego','Kéfir','Queso fresco','Queso cottage'],
  carbos:    ['Arroz','Quinoa','Patata','Batata','Cuscús','Pan integral','Avena','Pasta','Frutas','Maíz'],
  grasas:    ['Aceite de oliva','Aguacate','Frutos secos','Pistachos','Aceitunas','Semillas de girasol','Nueces','Semillas de chía/lino','Crema de cacahuete 100%'],
};
const BREAKFASTS = [
  'Yogur griego + fruta + un puñado de frutos secos',
  '2 huevos + tostada integral + aguacate',
  'Queso fresco + fruta + café',
  'Avena con leche + plátano + nueces',
  'Tortilla de claras + tomate + pan integral',
  'Kéfir + fruta + semillas de chía',
];
const SNACKS = ['Fruta de temporada','Un puñado de frutos secos','Yogur griego','Palitos de zanahoria + hummus','Queso fresco','Pistachos'];

// ── Meal config ────────────────────────────────────────────────
const MEAL_SLOTS = [
  { id:'breakfast', label:'Desayuno',  time:'~08:00', icon:'☀️', tip:'Proteínas + café · yogur griego, huevos o queso con fruta/tostada' },
  { id:'lunch',     label:'Comida',    time:'14:00–15:00', icon:'🍽️', tip:'50% verduras · 25% proteína · 25% carbohidratos + grasas saludables' },
  { id:'dinner',    label:'Cena',      time:'21:30–22:30', icon:'🌙', tip:'50% verduras · 25% proteína · 25% carbohidratos + grasas saludables' },
  { id:'snack',     label:'Tentempié', time:'entre comidas', icon:'🍎', tip:'Tentempié libre · también haz foto si lo tienes' },
];

// ════════════════════════════════════════════════════════════════
// ROLE SELECT — first screen
// ════════════════════════════════════════════════════════════════
function RoleSelect({ onSelect }) {
  return (
    <div style={{ minHeight:'100vh', background:C.sageDark, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32 }}>
      <div style={{ fontSize:48, marginBottom:16 }}>💚</div>
      <h1 style={{ color:C.white, fontSize:26, fontWeight:800, marginBottom:8, textAlign:'center' }}>July Tracker</h1>
      <p style={{ color:'rgba(255,255,255,.65)', fontSize:14, marginBottom:40, textAlign:'center' }}>Seguimiento de salud compartido</p>
      <div style={{ display:'flex', flexDirection:'column', gap:14, width:'100%', maxWidth:300 }}>
        <RoleBtn icon="🏋️" title="Soy yo (la cliente)" sub="Registro mis comidas, tensión y peso" onPress={() => onSelect('client')} />
        <RoleBtn icon="👩‍⚕️" title="Soy July" sub="Veo el progreso de mi clienta" onPress={() => onSelect('coach')} />
      </div>
      <p style={{ color:'rgba(255,255,255,.4)', fontSize:11, marginTop:32, textAlign:'center' }}>Los datos se comparten entre las dos en este dispositivo</p>
    </div>
  );
}

function RoleBtn({ icon, title, sub, onPress }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onPress} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{ background: hover ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.2)',
        borderRadius:16, padding:'18px 20px', cursor:'pointer', textAlign:'left', transition:'all .2s', color:C.white }}>
      <div style={{ fontSize:24, marginBottom:6 }}>{icon}</div>
      <div style={{ fontWeight:700, fontSize:16 }}>{title}</div>
      <div style={{ fontSize:13, opacity:.65, marginTop:2 }}>{sub}</div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════
export default function App() {
  const [role, setRole] = useShared(KEYS.role, null);
  const [tab, setTab] = useState('hoy');
  const [tension, saveTension] = useShared(KEYS.tension, []);
  const [meals, saveMeals] = useShared(KEYS.meals, []);
  const [measurements, saveMeasurements] = useShared(KEYS.measurements, [
    { date:'2026-06-11', weight:91.75, waist:107, hips:61.5 }
  ]);
  const [reminder, setReminder] = useState(null);
  const [toast, setToast] = useState(null);
  // Recuerda el último aviso ya mostrado para no volver a abrirlo cada minuto
  // mientras dura su franja horaria (si el usuario lo cierra, no reaparece).
  const lastReminderRef = useRef(null);

  // Reminder logic
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      let msg = null;
      if (t >= '07:45' && t < '08:05') msg = '¡Hora del desayuno! Haz la foto 📸';
      else if (t >= '14:00' && t < '14:10') msg = '¡Hora de comer! Foto antes de empezar 📸';
      else if (t >= '19:00' && t < '19:10') msg = 'Tensión arterial nocturna — mídela ahora 💊';
      else if (t >= '21:30' && t < '21:40') msg = '¡Hora de cenar! No olvides la foto 📸';

      if (msg) {
        // Solo se muestra una vez por franja; tras cerrarlo no reaparece.
        if (msg !== lastReminderRef.current) {
          lastReminderRef.current = msg;
          setReminder(msg);
        }
      } else {
        // Fuera de toda franja: reseteamos para que el próximo aviso se muestre.
        lastReminderRef.current = null;
      }
    };
    check();
    const iv = setInterval(check, 60000);
    return () => clearInterval(iv);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  if (!role) return <RoleSelect onSelect={(r) => { setRole(r); }} />;

  const tabs = role === 'coach'
    ? [
        { id:'resumen', label:'Resumen', icon:Ic.chart },
        { id:'fotos',   label:'Fotos',   icon:Ic.food },
        { id:'tension', label:'Tensión', icon:Ic.heart },
        { id:'peso',    label:'Progreso',icon:Ic.chart },
      ]
    : [
        { id:'hoy',     label:'Hoy',     icon:Ic.food },
        { id:'menu',    label:'Menú',    icon:Ic.menu },
        { id:'tension', label:'Tensión', icon:Ic.heart },
        { id:'peso',    label:'Progreso',icon:Ic.chart },
        { id:'guia',    label:'Guía',    icon:Ic.guide },
      ];

  // Reset tab if switching role
  const activeTab = tabs.find(t => t.id === tab) ? tab : tabs[0].id;

  return (
    <div style={{ minHeight:'100vh', background:C.cream, fontFamily:"'Inter', system-ui, sans-serif", color:C.slate }}>

      {/* Header */}
      <div style={{ background:C.sageDark, color:C.white, padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:2, opacity:.6, textTransform:'uppercase', marginBottom:1 }}>
            {role === 'coach' ? '👩‍⚕️ Vista de July' : '💚 Mi seguimiento'}
          </div>
          <div style={{ fontSize:18, fontWeight:800, letterSpacing:-.5 }}>July Tracker</div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ textAlign:'right', fontSize:11, opacity:.7 }}>
            <div>{new Date().toLocaleDateString('es-ES',{weekday:'long'})}</div>
            <div>{new Date().toLocaleDateString('es-ES',{day:'2-digit',month:'short'})}</div>
          </div>
          <button onClick={() => { setRole(null); setTab('hoy'); }}
            style={{ background:'rgba(255,255,255,.12)', border:'none', borderRadius:8, padding:'6px 10px', color:C.white, cursor:'pointer', fontSize:11, fontWeight:600 }}>
            Cambiar
          </button>
        </div>
      </div>

      {/* Reminder banner */}
      {reminder && role === 'client' && (
        <div style={{ background:C.coral, color:C.white, padding:'10px 20px', fontSize:13, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>{Ic.bell} {reminder}</span>
          <button onClick={() => setReminder(null)} style={{ background:'transparent', border:'none', color:C.white, cursor:'pointer', fontSize:20, lineHeight:1 }}>×</button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', background:C.sageDark, color:C.white,
          padding:'10px 20px', borderRadius:24, fontSize:13, fontWeight:600, zIndex:999, whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(0,0,0,.25)' }}>
          {toast}
        </div>
      )}

      {/* Tab nav */}
      <div style={{ display:'flex', background:C.white, borderBottom:`1px solid ${C.border}`, position:'sticky', top:role==='client'&&reminder?87:53, zIndex:99 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:1, padding:'11px 4px 9px', background:'none', border:'none', cursor:'pointer',
              borderBottom: activeTab===t.id ? `3px solid ${C.sage}` : '3px solid transparent',
              color: activeTab===t.id ? C.sage : C.slateLight,
              fontSize:10, fontWeight:600, display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'color .15s' }}>
            <span style={{ color:'inherit' }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding:'16px 14px 100px', maxWidth:540, margin:'0 auto' }}>
        {/* CLIENT TABS */}
        {role === 'client' && activeTab === 'hoy'     && <TabHoy meals={meals} saveMeals={saveMeals} showToast={showToast} />}
        {role === 'client' && activeTab === 'menu'    && <TabMenu />}
        {role === 'client' && activeTab === 'tension' && <TabTension tension={tension} saveTension={saveTension} showToast={showToast} />}
        {role === 'client' && activeTab === 'peso'    && <TabPeso measurements={measurements} saveMeasurements={saveMeasurements} showToast={showToast} />}
        {role === 'client' && activeTab === 'guia'    && <TabGuia />}
        {/* COACH TABS */}
        {role === 'coach' && activeTab === 'resumen'  && <TabCoachResumen tension={tension} meals={meals} measurements={measurements} />}
        {role === 'coach' && activeTab === 'fotos'    && <TabCoachFotos meals={meals} />}
        {role === 'coach' && activeTab === 'tension'  && <TabTension tension={tension} saveTension={saveTension} showToast={showToast} readOnly />}
        {role === 'coach' && activeTab === 'peso'     && <TabPeso measurements={measurements} saveMeasurements={saveMeasurements} showToast={showToast} readOnly />}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB: HOY (client)
// ════════════════════════════════════════════════════════════════
function TabHoy({ meals, saveMeals, showToast }) {
  // Día seleccionado del plan (hoy si está dentro, si no el primer día)
  const initialDate = PLAN_DAYS.some(p => p.iso === TODAY) ? TODAY : PLAN_DAYS[0].iso;
  const [selDate, setSelDate] = useState(initialDate);

  const dayMeals = meals.filter(m => m.date === selDate);
  const photoCount = dayMeals.filter(m => m.image).length;

  // Nº de fotos por día para el indicador de cumplimiento del calendario
  const photosByDay = {};
  meals.forEach(m => { if (m.image) photosByDay[m.date] = (photosByDay[m.date] || 0) + 1; });

  const selObj = PLAN_DAYS.find(p => p.iso === selDate);
  const isToday = selDate === TODAY;
  const dayLabel = isToday ? 'hoy' : (selObj
    ? `el ${selObj.d.toLocaleDateString('es-ES',{weekday:'long', day:'numeric', month:'long'})}`
    : selDate);

  const addMeal = (slotId, imageData, note) => {
    const entry = { id:Date.now(), date:selDate, slot:slotId, image:imageData, note,
      ts: new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}) };
    saveMeals([...meals, entry]);
    showToast('✓ Foto guardada');
  };
  const deleteMeal = (id) => { saveMeals(meals.filter(m => m.id !== id)); showToast('Eliminado'); };

  return (
    <div>
      {/* Calendario del plan */}
      <div style={{ background:C.white, borderRadius:16, padding:16, marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
        <div style={{ fontWeight:700, marginBottom:2 }}>Mi seguimiento · 7 días</div>
        <div style={{ fontSize:11, color:C.slateLight, marginBottom:12 }}>Sáb 20 → Vie 26 de junio · toca un día para ver o añadir sus comidas</div>
        <div style={{ display:'flex', gap:5 }}>
          {PLAN_DAYS.map(({ iso, d }) => {
            const isSel = selDate === iso;
            const done = (photosByDay[iso] || 0) >= 3;
            const some = (photosByDay[iso] || 0) > 0;
            const isFuture = iso > TODAY;
            return (
              <button key={iso} onClick={() => setSelDate(iso)}
                style={{ flex:1, padding:'8px 0', borderRadius:10, cursor:'pointer',
                  border: isSel ? `2px solid ${C.sageDark}` : `1px solid ${C.border}`,
                  background: isSel ? C.sageLight : C.white, opacity: isFuture ? .55 : 1, lineHeight:1.3 }}>
                <div style={{ fontSize:10, color:C.slateLight, textTransform:'capitalize' }}>{d.toLocaleDateString('es-ES',{weekday:'short'}).replace('.','')}</div>
                <div style={{ fontSize:15, fontWeight:700, color:C.slate }}>{d.getDate()}</div>
                <div style={{ fontSize:11, marginTop:2, height:14 }}>{done ? '✅' : some ? '🟡' : (isFuture ? '' : '⬜')}</div>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize:11, color:C.slateLight, marginTop:10 }}>✅ 3 fotos · 🟡 alguna foto · ⬜ sin fotos</div>
      </div>

      {/* Photo counter */}
      <div style={{ background: photoCount>=3 ? C.sageLight : C.goldLight, border:`1px solid ${photoCount>=3 ? C.sage : C.gold}`,
        borderRadius:16, padding:16, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:13, fontWeight:700, color: photoCount>=3 ? C.sageDark : C.gold }}>Fotos enviadas a July {dayLabel}</span>
          <span style={{ fontSize:26, fontWeight:800, color: photoCount>=3 ? C.sageDark : C.gold }}>{photoCount}<span style={{fontSize:16,fontWeight:400}}>/3</span></span>
        </div>
        <div style={{ height:6, background:'rgba(0,0,0,.08)', borderRadius:99 }}>
          <div style={{ height:'100%', width:`${Math.min(photoCount/3*100,100)}%`, background: photoCount>=3 ? C.sage : C.gold, borderRadius:99, transition:'width .4s' }} />
        </div>
        {photoCount>=3 && <div style={{ marginTop:8, fontSize:12, color:C.sageDark, fontWeight:600 }}>✓ ¡Objetivo del día cumplido!</div>}
      </div>

      {MEAL_SLOTS.map(slot => (
        <MealSlot key={slot.id} slot={slot}
          entries={dayMeals.filter(m => m.slot === slot.id)}
          onAdd={(img, note) => addMeal(slot.id, img, note)}
          onDelete={deleteMeal} />
      ))}
    </div>
  );
}

function MealSlot({ slot, entries, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState(null);
  const done = entries.length > 0;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Compress image before storing
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h = h * MAX / w; w = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setPreview(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    onAdd(preview, note);
    setOpen(false); setNote(''); setPreview(null);
  };

  return (
    <div style={{ background:C.white, borderRadius:16, padding:16, marginBottom:12, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:12, background: done ? C.sageLight : C.cream,
          border:`2px solid ${done ? C.sage : C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
          {slot.icon}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>{slot.label}</div>
          <div style={{ fontSize:11, color:C.slateLight }}>{slot.time}</div>
        </div>
        {done && <div style={{ color:C.sage, fontSize:12, fontWeight:600, flexShrink:0 }}>✓ {entries.length}</div>}
        <button onClick={() => setOpen(!open)}
          style={{ background: done ? C.sageLight : C.sage, color: done ? C.sage : C.white,
            border:`1px solid ${C.sage}`, borderRadius:10, padding:'7px 14px', cursor:'pointer', fontSize:13, fontWeight:600, flexShrink:0 }}>
          + Añadir
        </button>
      </div>

      {/* Tip */}
      <div style={{ marginTop:10, padding:'8px 12px', background:C.cream, borderRadius:8, fontSize:12, color:C.slateLight, borderLeft:`3px solid ${C.sage}` }}>
        {slot.tip}
      </div>

      {/* Existing entries */}
      {entries.map(e => (
        <div key={e.id} style={{ marginTop:10, display:'flex', gap:10, alignItems:'flex-start', padding:'10px 0', borderTop:`1px solid ${C.border}` }}>
          {e.image && <img src={e.image} alt="comida" style={{ width:70, height:70, objectFit:'cover', borderRadius:10, border:`1px solid ${C.border}`, flexShrink:0 }} />}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, color:C.slateLight }}>{e.ts}</div>
            {e.note && <div style={{ fontSize:13, marginTop:3, wordBreak:'break-word' }}>{e.note}</div>}
          </div>
          <button onClick={() => onDelete(e.id)} style={{ background:'none', border:'none', color:C.slateLight, cursor:'pointer', padding:4, flexShrink:0 }}>
            {Ic.trash}
          </button>
        </div>
      ))}

      {/* Add form */}
      {open && (
        <div style={{ marginTop:12, padding:14, background:C.cream, borderRadius:12, border:`1px dashed ${C.border}` }}>
          <label style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 14px', background:C.white,
            border:`1px solid ${C.border}`, borderRadius:10, cursor:'pointer', fontSize:13, color:C.sage, fontWeight:600, marginBottom:10 }}>
            {Ic.camera} {preview ? 'Cambiar foto' : 'Seleccionar foto de la cámara'}
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display:'none' }} />
          </label>
          {preview && <img src={preview} alt="preview" style={{ width:'100%', maxHeight:200, objectFit:'cover', borderRadius:10, marginBottom:10 }} />}
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="¿Qué has comido? (opcional)"
            style={{ width:'100%', padding:'9px 12px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13,
              fontFamily:'inherit', resize:'none', minHeight:56, outline:'none', marginBottom:10 }} />
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={submit} disabled={!preview && !note.trim()}
              style={{ flex:1, padding:'11px', background: (preview||note.trim()) ? C.sage : C.border, color:C.white,
                border:'none', borderRadius:10, cursor: (preview||note.trim()) ? 'pointer' : 'default', fontWeight:700, fontSize:14 }}>
              Guardar
            </button>
            <button onClick={() => { setOpen(false); setPreview(null); setNote(''); }}
              style={{ padding:'11px 16px', background:'none', border:`1px solid ${C.border}`, borderRadius:10, cursor:'pointer', fontSize:14 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB: TENSIÓN
// ════════════════════════════════════════════════════════════════
// Plan fijo de 7 días: sábado 20 → viernes 26 de junio de 2026
const PLAN_DAYS = Array.from({ length:7 }, (_, i) => {
  const d = new Date(2026, 5, 20 + i); // mes 5 = junio (hora local)
  return { iso: isoDate(d), d };
});

function TabTension({ tension, saveTension, showToast, readOnly }) {
  // Día seleccionado: hoy si está dentro del plan, si no el primer día del plan
  const initialDate = PLAN_DAYS.some(p => p.iso === TODAY) ? TODAY : PLAN_DAYS[0].iso;
  const [selDate, setSelDate] = useState(initialDate);
  const [period, setPeriod] = useState('morning');
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [pulse, setPulse] = useState('');

  // Índice de mediciones por día+periodo para poder mostrar valores y editarlos
  const byKey = {};
  tension.forEach(t => { byKey[`${t.date}|${t.period}`] = t; });

  // Seleccionar una casilla (día + mañana/noche) y precargar su valor para editar
  const selectCell = (date, prd) => {
    setSelDate(date); setPeriod(prd);
    const e = byKey[`${date}|${prd}`];
    setSys(e ? String(e.sys) : '');
    setDia(e ? String(e.dia) : '');
    setPulse(e && e.pulse ? String(e.pulse) : '');
  };

  const editing = !!byKey[`${selDate}|${period}`];

  const add = () => {
    if (!sys || !dia) return;
    const existing = byKey[`${selDate}|${period}`];
    const entry = { id: existing ? existing.id : Date.now(), date:selDate, sys:+sys, dia:+dia,
      pulse: pulse ? +pulse : null, period,
      ts: new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}) };
    saveTension(existing ? tension.map(t => t.id === existing.id ? entry : t) : [...tension, entry]);
    showToast(existing ? '✓ Tensión actualizada' : '✓ Tensión guardada');
  };
  const del = (id) => { saveTension(tension.filter(t => t.id !== id)); showToast('Eliminado'); };

  const classify = (s, d) => {
    if (s < 120 && d < 80) return { label:'Normal', color:C.sage };
    if (s < 130 && d < 80) return { label:'Elevada', color:C.gold };
    return { label:'Alta', color:C.coral };
  };

  const fullDays = PLAN_DAYS.filter(p => byKey[`${p.iso}|morning`] && byKey[`${p.iso}|evening`]).length;

  return (
    <div>
      {/* 7-day grid */}
      <div style={{ background:C.sageLight, border:`1px solid ${C.sage}`, borderRadius:16, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, color:C.sageDark, marginBottom:4 }}>Control de 7 días · mañana ☀️ y noche 🌙</div>
        <div style={{ fontSize:11, color:C.sageDark, marginBottom:12 }}>Sáb 20 → Vie 26 de junio{!readOnly && ' · toca una casilla para anotar o editar'}</div>
        <div style={{ display:'flex', gap:5 }}>
          {PLAN_DAYS.map(({ iso, d }) => {
            const cell = (prd, emoji) => {
              const on = !!byKey[`${iso}|${prd}`];
              const isSel = !readOnly && selDate === iso && period === prd;
              return {
                flex:1, height:24, borderRadius:6, background: on ? C.sage : C.white,
                border: isSel ? `2px solid ${C.sageDark}` : `1px solid ${on?C.sage:C.border}`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:11,
                cursor: readOnly ? 'default' : 'pointer',
              };
            };
            return (
              <div key={iso} style={{ flex:1, textAlign:'center' }}>
                <div style={{ fontSize:9, color:C.slateLight, marginBottom:4 }}>{d.toLocaleDateString('es-ES',{weekday:'narrow'})}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  <div onClick={readOnly ? undefined : () => selectCell(iso,'morning')} style={cell('morning')}>
                    {byKey[`${iso}|morning`] ? <span style={{color:C.white}}>✓</span> : <span style={{opacity:.4}}>☀️</span>}
                  </div>
                  <div onClick={readOnly ? undefined : () => selectCell(iso,'evening')} style={cell('evening')}>
                    {byKey[`${iso}|evening`] ? <span style={{color:C.white}}>✓</span> : <span style={{opacity:.4}}>🌙</span>}
                  </div>
                </div>
                <div style={{ fontSize:8, color:C.slateLight, marginTop:3 }}>{d.getDate()}/{d.getMonth()+1}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize:12, color:C.sageDark, marginTop:10, fontWeight:600 }}>
          {fullDays}/7 días completos (mañana + noche)
        </div>
      </div>

      {/* Input (hidden for coach) */}
      {!readOnly && (
        <div style={{ background:C.white, borderRadius:16, padding:16, marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>{editing ? 'Editar medición' : 'Registrar medición'}</div>
          {/* Day selector */}
          <div style={{ fontSize:10, color:C.slateLight, fontWeight:600, marginBottom:6 }}>Día</div>
          <div style={{ display:'flex', gap:5, marginBottom:12 }}>
            {PLAN_DAYS.map(({ iso, d }) => (
              <button key={iso} onClick={() => selectCell(iso, period)}
                style={{ flex:1, padding:'7px 0', borderRadius:9, border:`1.5px solid ${selDate===iso?C.sage:C.border}`,
                  background: selDate===iso ? C.sageLight : C.white, color: selDate===iso ? C.sageDark : C.slateLight,
                  fontWeight:600, fontSize:11, cursor:'pointer', lineHeight:1.3 }}>
                <div style={{ textTransform:'capitalize' }}>{d.toLocaleDateString('es-ES',{weekday:'short'}).replace('.','')}</div>
                <div style={{ fontSize:13, fontWeight:700 }}>{d.getDate()}</div>
              </button>
            ))}
          </div>
          <div style={{ fontSize:10, color:C.slateLight, fontWeight:600, marginBottom:6 }}>Momento del día</div>
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            {[{v:'morning',l:'Mañana ☀️'},{v:'evening',l:'Noche 🌙'}].map(p => (
              <button key={p.v} onClick={() => selectCell(selDate, p.v)}
                style={{ flex:1, padding:'9px', borderRadius:10, border:`1.5px solid ${period===p.v?C.sage:C.border}`,
                  background: period===p.v ? C.sageLight : C.white, color: period===p.v ? C.sageDark : C.slateLight,
                  fontWeight:600, fontSize:13, cursor:'pointer', transition:'all .15s' }}>
                {p.l}
              </button>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
            {[{label:'Sistólica',val:sys,set:setSys,ph:'105'},{label:'Diastólica',val:dia,set:setDia,ph:'71'},{label:'Pulso',val:pulse,set:setPulse,ph:'77'}].map(f => (
              <div key={f.label}>
                <label style={{ fontSize:10, color:C.slateLight, display:'block', marginBottom:4, fontWeight:600 }}>{f.label}</label>
                <input type="number" inputMode="numeric" value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                  style={{ width:'100%', padding:'10px 6px', border:`1px solid ${C.border}`, borderRadius:10,
                    fontSize:20, fontWeight:700, textAlign:'center', outline:'none', color:C.slate }} />
              </div>
            ))}
          </div>
          <button onClick={add} disabled={!sys||!dia}
            style={{ width:'100%', padding:13, background:(sys&&dia)?C.sage:C.border, color:C.white,
              border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:(sys&&dia)?'pointer':'default', transition:'background .2s' }}>
            {editing ? 'Actualizar medición' : 'Guardar medición'}
          </button>
        </div>
      )}

      {/* History */}
      {tension.length > 0 && (
        <div style={{ background:C.white, borderRadius:16, padding:16, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>Historial</div>
          {[...tension].reverse().slice(0,20).map(t => {
            const cls = classify(t.sys, t.dia);
            return (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 0', borderBottom:`1px solid ${C.border}` }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, color:C.slateLight }}>{t.date} · {t.period==='morning'?'Mañana ☀️':'Noche 🌙'} · {t.ts}</div>
                  <div style={{ fontSize:21, fontWeight:700, letterSpacing:-.5, marginTop:2 }}>
                    {t.sys}/{t.dia}
                    {t.pulse && <span style={{ fontSize:13, color:C.slateLight, fontWeight:400 }}> · pulso {t.pulse}</span>}
                  </div>
                </div>
                <div style={{ padding:'4px 12px', borderRadius:20, background:cls.color+'20', color:cls.color, fontSize:12, fontWeight:700, flexShrink:0 }}>{cls.label}</div>
                {!readOnly && <button onClick={()=>del(t.id)} style={{ background:'none', border:'none', color:C.slateLight, cursor:'pointer', flexShrink:0 }}>{Ic.trash}</button>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB: PESO / PROGRESO
// ════════════════════════════════════════════════════════════════
function TabPeso({ measurements, saveMeasurements, showToast, readOnly }) {
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');

  const add = () => {
    if (!weight) return;
    const entry = { date:TODAY, weight:+weight, waist:waist?+waist:null, hips:hips?+hips:null };
    // Una sola medición por día: si ya existe una de hoy, se actualiza en vez de
    // duplicarla (evita keys repetidas y que borrar elimine las dos).
    const exists = measurements.some(m => m.date === TODAY);
    saveMeasurements(exists
      ? measurements.map(m => m.date === TODAY ? entry : m)
      : [...measurements, entry]);
    setWeight(''); setWaist(''); setHips('');
    showToast(exists ? '✓ Medición actualizada' : '✓ Medición guardada');
  };
  const del = (date) => { saveMeasurements(measurements.filter(m=>m.date!==date)); showToast('Eliminado'); };

  const last = measurements[measurements.length-1];
  const first = measurements[0];
  const diffW = measurements.length>1 ? (last.weight - first.weight).toFixed(2) : null;
  const diffWaist = measurements.length>1 && last.waist && first.waist ? (last.waist - first.waist).toFixed(1) : null;

  return (
    <div>
      {/* Stats */}
      {measurements.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
          <StatCard label="Peso actual" value={`${last.weight} kg`}
            sub={diffW!==null ? (parseFloat(diffW)<0 ? `${diffW} kg 🎉` : `+${diffW} kg`) : 'Inicio'} color={C.sage} />
          <StatCard label="Cintura" value={last.waist ? `${last.waist} cm` : '—'}
            sub={diffWaist!==null ? (parseFloat(diffWaist)<0 ? `${diffWaist} cm 🎉` : `+${diffWaist} cm`) : 'Inicio'} color={C.gold} />
        </div>
      )}

      {/* Chart */}
      {measurements.length > 1 && (
        <div style={{ background:C.white, borderRadius:16, padding:16, marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>Evolución del peso</div>
          <MiniChart data={measurements} field="weight" color={C.sage} unit="kg" />
        </div>
      )}

      {/* Input */}
      {!readOnly && (
        <div style={{ background:C.white, borderRadius:16, padding:16, marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ fontWeight:700, marginBottom:4 }}>Registrar medición</div>
          <div style={{ fontSize:12, color:C.slateLight, marginBottom:12 }}>Una vez por semana</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
            {[{label:'Peso (kg)',val:weight,set:setWeight,ph:'91.75'},{label:'Cintura cm',val:waist,set:setWaist,ph:'107'},{label:'Caderas cm',val:hips,set:setHips,ph:'62'}].map(f=>(
              <div key={f.label}>
                <label style={{ fontSize:10, color:C.slateLight, display:'block', marginBottom:4, fontWeight:600 }}>{f.label}</label>
                <input type="number" inputMode="decimal" value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                  style={{ width:'100%', padding:'10px 6px', border:`1px solid ${C.border}`, borderRadius:10,
                    fontSize:16, fontWeight:700, textAlign:'center', outline:'none', color:C.slate }} />
              </div>
            ))}
          </div>
          <button onClick={add} disabled={!weight}
            style={{ width:'100%', padding:13, background:weight?C.sage:C.border, color:C.white,
              border:'none', borderRadius:10, fontWeight:700, fontSize:15, cursor:weight?'pointer':'default' }}>
            Guardar
          </button>
        </div>
      )}

      {/* History */}
      <div style={{ background:C.white, borderRadius:16, padding:16, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
        <div style={{ fontWeight:700, marginBottom:12 }}>Historial semanal</div>
        {[...measurements].reverse().map(m => (
          <div key={m.date} style={{ display:'flex', alignItems:'center', padding:'11px 0', borderBottom:`1px solid ${C.border}`, gap:10 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, color:C.slateLight }}>{m.date}</div>
              <div style={{ fontWeight:700, fontSize:18 }}>{m.weight} kg</div>
              {(m.waist||m.hips) && <div style={{ fontSize:12, color:C.slateLight }}>{m.waist&&`Cintura ${m.waist} cm`}{m.waist&&m.hips&&' · '}{m.hips&&`Caderas ${m.hips} cm`}</div>}
            </div>
            {!readOnly && <button onClick={()=>del(m.date)} style={{ background:'none', border:'none', color:C.slateLight, cursor:'pointer' }}>{Ic.trash}</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniChart({ data, field, color, unit }) {
  const vals = data.map(d=>d[field]).filter(Boolean);
  if (vals.length < 2) return null;
  const min = Math.min(...vals) - 0.5;
  const max = Math.max(...vals) + 0.5;
  const W = 400, H = 90;
  const px = (i) => (i/(data.length-1))*(W-30)+15;
  const py = (v) => H - ((v-min)/(max-min))*(H-20) - 10;
  const points = data.map((d,i)=>`${px(i)},${py(d[field])}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H}}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((d,i)=>(
        <g key={i}>
          <circle cx={px(i)} cy={py(d[field])} r="4.5" fill={color}/>
          <text x={px(i)} y={py(d[field])-9} textAnchor="middle" fontSize="9" fill={color} fontWeight="600">{d[field]}{unit}</text>
        </g>
      ))}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB: RESUMEN (coach only)
// ════════════════════════════════════════════════════════════════
function TabCoachResumen({ tension, meals, measurements }) {
  const todayMeals = meals.filter(m => m.date === TODAY);
  const photoCount = todayMeals.filter(m => m.image).length;
  // Últimos 7 días (hoy incluido), comparando cadenas de fecha YYYY-MM-DD para
  // no depender de la hora ni colar mediciones con fecha futura.
  const weekAgo = isoDate(new Date(Date.now() - 6 * 86400000));
  const last7tension = tension.filter(t => t.date >= weekAgo && t.date <= TODAY);
  const last = measurements[measurements.length-1];
  const first = measurements[0];

  const classify = (s,d) => {
    if (s<120&&d<80) return {label:'Normal',color:C.sage};
    if (s<130&&d<80) return {label:'Elevada',color:C.gold};
    return {label:'Alta',color:C.coral};
  };

  const avgTension = last7tension.length > 0 ? {
    sys: Math.round(last7tension.reduce((a,t)=>a+t.sys,0)/last7tension.length),
    dia: Math.round(last7tension.reduce((a,t)=>a+t.dia,0)/last7tension.length),
  } : null;

  return (
    <div>
      <div style={{ background:C.sageLight, border:`1px solid ${C.sage}`, borderRadius:16, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:800, fontSize:16, color:C.sageDark, marginBottom:4 }}>Vista de July 👩‍⚕️</div>
        <div style={{ fontSize:13, color:C.slateLight }}>Resumen del progreso de tu clienta</div>
      </div>

      {/* Today summary */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <StatCard label="Fotos hoy" value={`${photoCount}/3`} sub={photoCount>=3?'✓ Objetivo cumplido':'Pendiente'} color={photoCount>=3?C.sage:C.gold} />
        <StatCard label="Peso actual" value={last?`${last.weight} kg`:'—'}
          sub={measurements.length>1?(last.weight-first.weight).toFixed(2)+' kg total':'Sin cambios aún'} color={C.sage} />
      </div>

      {/* Tension average */}
      {avgTension && (
        <div style={{ background:C.white, borderRadius:16, padding:16, marginBottom:12, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ fontWeight:700, marginBottom:8 }}>Tensión media (7 días)</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:26, fontWeight:800, letterSpacing:-.5 }}>{avgTension.sys}/{avgTension.dia}</div>
            <div style={{ padding:'4px 12px', borderRadius:20, background:classify(avgTension.sys,avgTension.dia).color+'20',
              color:classify(avgTension.sys,avgTension.dia).color, fontSize:13, fontWeight:700 }}>
              {classify(avgTension.sys,avgTension.dia).label}
            </div>
          </div>
          <div style={{ fontSize:12, color:C.slateLight, marginTop:4 }}>{last7tension.length} mediciones en 7 días</div>
        </div>
      )}

      {/* Weight chart */}
      {measurements.length > 1 && (
        <div style={{ background:C.white, borderRadius:16, padding:16, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>Evolución del peso</div>
          <MiniChart data={measurements} field="weight" color={C.sage} unit="kg" />
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB: FOTOS (coach only)
// ════════════════════════════════════════════════════════════════
function TabCoachFotos({ meals }) {
  const [filter, setFilter] = useState('all');
  const withPhotos = meals.filter(m => m.image);
  const filtered = filter === 'all' ? withPhotos : withPhotos.filter(m => m.slot === filter);
  const byDate = filtered.reduce((acc, m) => { (acc[m.date] = acc[m.date]||[]).push(m); return acc; }, {});
  const dates = Object.keys(byDate).sort().reverse();

  return (
    <div>
      <div style={{ display:'flex', gap:6, marginBottom:16, overflowX:'auto', paddingBottom:4 }}>
        {[{v:'all',l:'Todas'},{v:'breakfast',l:'☀️ Desayuno'},{v:'lunch',l:'🍽️ Comida'},{v:'dinner',l:'🌙 Cena'},{v:'snack',l:'🍎 Tentempié'}].map(f=>(
          <button key={f.v} onClick={()=>setFilter(f.v)}
            style={{ padding:'7px 14px', borderRadius:20, border:`1.5px solid ${filter===f.v?C.sage:C.border}`,
              background: filter===f.v?C.sageLight:C.white, color: filter===f.v?C.sageDark:C.slateLight,
              fontWeight:600, fontSize:12, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
            {f.l}
          </button>
        ))}
      </div>

      {dates.length === 0 && (
        <div style={{ textAlign:'center', padding:40, color:C.slateLight, fontSize:14 }}>Aún no hay fotos registradas</div>
      )}

      {dates.map(date => (
        <div key={date} style={{ marginBottom:20 }}>
          <div style={{ fontWeight:700, fontSize:13, color:C.slateLight, marginBottom:10, textTransform:'uppercase', letterSpacing:.5 }}>
            {new Date(date).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {byDate[date].map(m => (
              <div key={m.id} style={{ background:C.white, borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
                <img src={m.image} alt="comida" style={{ width:'100%', aspectRatio:'1', objectFit:'cover' }} />
                <div style={{ padding:'8px 10px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.sage }}>
                    {MEAL_SLOTS.find(s=>s.id===m.slot)?.icon} {MEAL_SLOTS.find(s=>s.id===m.slot)?.label}
                  </div>
                  {m.note && <div style={{ fontSize:11, color:C.slateLight, marginTop:2 }}>{m.note}</div>}
                  <div style={{ fontSize:10, color:C.border, marginTop:2 }}>{m.ts}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB: GUÍA (client)
// ════════════════════════════════════════════════════════════════
function TabGuia() {
  return (
    <div>
      <div style={{ background:C.sageLight, border:`1px solid ${C.sage}`, borderRadius:16, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:800, fontSize:15, color:C.sageDark, marginBottom:4 }}>📋 Indicaciones de July</div>
        <div style={{ fontSize:13, color:C.slateLight }}>Tu plan para el primer mes</div>
      </div>

      {[
        { emoji:'💊', title:'Tensión arterial · 7 días', color:C.coral, items:[
          'Mañana: mídete en reposo antes de levantarte', 'Noche: entre las 19:00 y las 21:00, en reposo', 'Anota también el pulso cada vez',
        ]},
        { emoji:'☀️', title:'Desayuno', color:C.gold, items:[
          'Alimentos ricos en proteínas + café', 'Opción 1: yogur griego + fruta', 'Opción 2: 2 huevos + tostada integral', 'Opción 3: queso fresco + fruta',
        ]},
        { emoji:'🍽️', title:'Comida (14:00–15:00)', color:C.sage, items:[
          'Plato completo y bien presentado', '½ plato de verduras', '¼ proteína (pollo, pescado, huevos, legumbres…)', '¼ carbohidratos (arroz, patata, pasta…)', 'Un poco de grasa saludable',
        ]},
        { emoji:'🌙', title:'Cena (21:30–22:30)', color:C.sageDark, items:[
          'Igual que la comida: plato completo', 'No te saltes la cena para no tener hambre nocturna',
        ]},
        { emoji:'📸', title:'Fotos diarias', color:C.coral, items:[
          'Haz foto antes de comer (no después)', '3 fotos mínimo al día para July', 'También puedes hacer tentempié con foto',
        ]},
        { emoji:'⚖️', title:'Medición semanal', color:C.gold, items:[
          'Una vez por semana: peso, cintura y caderas', 'Siempre a la misma hora (mejor por la mañana)', 'Inicio: 91,750 kg · 107 cm cintura',
        ]},
      ].map(s => (
        <div key={s.title} style={{ background:C.white, borderRadius:16, padding:16, marginBottom:12, boxShadow:'0 1px 4px rgba(0,0,0,.05)', borderLeft:`4px solid ${s.color}` }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:10 }}>{s.emoji} {s.title}</div>
          {s.items.map(item => (
            <div key={item} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:7, fontSize:13 }}>
              <span style={{ color:s.color, flexShrink:0, marginTop:1 }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      ))}

      {/* Plate diagram */}
      <div style={{ background:C.white, borderRadius:16, padding:16, marginBottom:12, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>🍽️ El plato perfecto</div>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
          <svg viewBox="0 0 160 160" style={{width:150,height:150}}>
            <circle cx="80" cy="80" r="72" fill="#f5f5f5"/>
            <path d="M80 80 L80 8 A72 72 0 0 1 80 152 Z" fill={C.sage+'bb'}/>
            <path d="M80 80 L80 8 A72 72 0 0 0 8 80 Z" fill={C.gold+'bb'}/>
            <path d="M80 80 L8 80 A72 72 0 0 0 80 152 Z" fill={C.coral+'bb'}/>
            <text x="108" y="82" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.sageDark}>50%</text>
            <text x="108" y="95" textAnchor="middle" fontSize="9" fill={C.sageDark}>Verduras</text>
            <text x="44" y="48" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.sageDark}>25%</text>
            <text x="44" y="61" textAnchor="middle" fontSize="9" fill={C.sageDark}>Proteína</text>
            <text x="44" y="116" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.sageDark}>25%</text>
            <text x="44" y="129" textAnchor="middle" fontSize="9" fill={C.sageDark}>Carbos</text>
            <circle cx="80" cy="80" r="72" fill="none" stroke={C.border} strokeWidth="2"/>
          </svg>
        </div>
        {[
          {color:C.sage, label:'Verduras (½)', desc:'Fibra y vitaminas para la digestión'},
          {color:C.gold, label:'Proteínas (¼)', desc:'Mantener y reparar músculo'},
          {color:C.coral, label:'Carbohidratos (¼)', desc:'Energía'},
          {color:C.sageDark, label:'Grasas saludables', desc:'Hormonas y salud del corazón'},
        ].map(r => (
          <div key={r.label} style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:r.color, flexShrink:0 }}/>
            <div style={{ fontSize:13 }}><strong>{r.label}</strong> — {r.desc}</div>
          </div>
        ))}
      </div>

      {/* Food lists */}
      {[
        { title:'🥦 Verduras (½ plato)', color:C.sage, items:FOOD_GROUPS.verduras },
        { title:'🍗 Proteínas (¼ plato)', color:C.gold, items:FOOD_GROUPS.proteinas },
        { title:'🍚 Carbohidratos (¼ plato)', color:C.coral, items:FOOD_GROUPS.carbos },
        { title:'🥑 Grasas saludables', color:C.sageDark, items:FOOD_GROUPS.grasas },
      ].map(fl => <FoodList key={fl.title} {...fl} />)}
    </div>
  );
}

function FoodList({ title, items, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom:10 }}>
      <button onClick={() => setOpen(!open)}
        style={{ width:'100%', padding:'12px 14px', background:C.white, border:`1px solid ${C.border}`,
          borderRadius:12, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center',
          fontWeight:700, fontSize:13, color:C.slate, boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
        <span>{title}</span>
        <span style={{ color:C.slateLight, fontSize:12 }}>{open?'▴':'▾'} {items.length} alimentos</span>
      </button>
      {open && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:'12px 4px' }}>
          {items.map(item => (
            <span key={item} style={{ padding:'4px 12px', background:color+'18', border:`1px solid ${color}30`,
              borderRadius:20, fontSize:12, color, fontWeight:500 }}>{item}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TAB: MENÚ (client) — genera platos siguiendo la regla ½·¼·¼
// ════════════════════════════════════════════════════════════════
const sample = (arr, n) => {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
};
const buildPlate = () => ({
  verduras:  sample(FOOD_GROUPS.verduras, 2),
  proteina:  sample(FOOD_GROUPS.proteinas, 1)[0],
  carbo:     sample(FOOD_GROUPS.carbos, 1)[0],
  grasa:     sample(FOOD_GROUPS.grasas, 1)[0],
});
const buildMenu = () => ({
  desayuno: sample(BREAKFASTS, 1)[0],
  comida:   buildPlate(),
  cena:     buildPlate(),
  tentempie: sample(SNACKS, 1)[0],
});

function Plate({ p }) {
  const Row = ({ color, label, value }) => (
    <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:6, fontSize:13 }}>
      <span style={{ width:10, height:10, borderRadius:3, background:color, flexShrink:0, marginTop:4 }} />
      <div><strong style={{ color:C.slate }}>{label}:</strong> {value}</div>
    </div>
  );
  return (
    <div>
      <Row color={C.sage}     label="½ Verduras"  value={p.verduras.join(' · ')} />
      <Row color={C.gold}     label="¼ Proteína"  value={p.proteina} />
      <Row color={C.coral}    label="¼ Carbos"    value={p.carbo} />
      <Row color={C.sageDark} label="Grasa"       value={p.grasa} />
    </div>
  );
}

function TabMenu() {
  const [menu, setMenu] = useState(buildMenu);

  const Card = ({ emoji, title, color, children }) => (
    <div style={{ background:C.white, borderRadius:16, padding:16, marginBottom:12, boxShadow:'0 1px 4px rgba(0,0,0,.05)', borderLeft:`4px solid ${color}` }}>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:10 }}>{emoji} {title}</div>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ background:C.sageLight, border:`1px solid ${C.sage}`, borderRadius:16, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:800, fontSize:15, color:C.sageDark, marginBottom:4 }}>🍽️ Tu menú de hoy</div>
        <div style={{ fontSize:13, color:C.slateLight }}>Generado con los alimentos de tu plan · ½ verduras · ¼ proteína · ¼ carbos + grasa saludable</div>
      </div>

      <Card emoji="☀️" title="Desayuno" color={C.gold}>
        <div style={{ fontSize:13 }}>{menu.desayuno}</div>
      </Card>
      <Card emoji="🍽️" title="Comida" color={C.sage}><Plate p={menu.comida} /></Card>
      <Card emoji="🌙" title="Cena" color={C.sageDark}><Plate p={menu.cena} /></Card>
      <Card emoji="🍎" title="Tentempié" color={C.coral}>
        <div style={{ fontSize:13 }}>{menu.tentempie}</div>
      </Card>

      <button onClick={() => setMenu(buildMenu())}
        style={{ width:'100%', padding:14, background:C.sage, color:C.white, border:'none', borderRadius:12,
          fontWeight:700, fontSize:15, cursor:'pointer', marginTop:4 }}>
        🔄 Generar otro menú
      </button>
      <div style={{ textAlign:'center', fontSize:11, color:C.slateLight, marginTop:10 }}>
        Las cantidades siguen la regla del plato: mitad verduras, un cuarto proteína y un cuarto carbohidratos, con un poco de grasa saludable.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Shared components
// ════════════════════════════════════════════════════════════════
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background:color+'12', border:`1px solid ${color}30`, borderRadius:16, padding:16 }}>
      <div style={{ fontSize:10, color, fontWeight:700, textTransform:'uppercase', letterSpacing:.5, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:800, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color, opacity:.7, marginTop:5 }}>{sub}</div>
    </div>
  );
}
