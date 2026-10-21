
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
    updateProfile,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";



const firebaseConfig = {
  apiKey: "AIzaSyDpBhZW9L8hKYwFR9kJycRSbi6nadZPJ9c",
  authDomain: "reeva-9b01f.firebaseapp.com",
  projectId: "reeva-9b01f",
  storageBucket: "reeva-9b01f.firebasestorage.app",
  messagingSenderId: "574458340001",
  appId: "1:574458340001:web:572bffafb007be40fd86e0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
// ---------- FIRESTORE: USER PROFILES ----------

async function saveUserProfile(firebaseUser) {
  if (!firebaseUser) return;

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  const profile = {
  uid: firebaseUser.uid,
  name: firebaseUser.displayName || firebaseUser.email || 'User',
  email: firebaseUser.email || '',
  picture: firebaseUser.photoURL || '',
  banner: userSnap.exists() ? (userSnap.data().banner || '') : '',
  bio: userSnap.exists() ? (userSnap.data().bio || '') : '',
  provider: firebaseUser.providerData[0]?.providerId || 'password',
  updatedAt: serverTimestamp()
};



  if (!userSnap.exists()) {
    profile.createdAt = serverTimestamp();
  }

  await setDoc(userRef, profile, { merge: true });
}
/* Si algo falla en el JavaScript, muestra el error en una franja roja arriba de la página */
window.addEventListener('error',e=>{
  if(e.target&&e.target!==window)return;
  const b=document.createElement('div');
  b.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#b00020;color:#fff;font:14px/1.4 monospace;padding:10px 14px';
  b.textContent='ERROR en script.js: '+e.message+' (línea '+e.lineno+')';
  document.documentElement.classList.add('js-failed');
  document.body.appendChild(b);
});

/* Carpeta donde están TUS imágenes (con barra / al final). Cámbiala si tu carpeta se llama distinto */
const IMG_DIR='Imagenes/';

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>'B/. '+n.toFixed(2);

/* Si una imagen no carga, muestra un recuadro con el NOMBRE DEL ARCHIVO que el código espera encontrar en /images */
document.addEventListener('error',e=>{
  const t=e.target;
  if(!t||t.tagName!=='IMG'||t.dataset.fail)return;
  t.dataset.fail=1;
  const name=decodeURIComponent((t.getAttribute('src')||'').split('/').pop()).replace(/[<>&"]/g,'');
  t.src='data:image/svg+xml;utf8,'+encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#ead6b2"/>'+
    '<text x="50%" y="46%" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#c00d0d">Missing image</text>'+
    '<text x="50%" y="57%" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#2c7f99">'+name+'</text></svg>');
},true);


/* ---------- DATOS ---------- */
const PRODUCTS=[
 {id:1, name:'Star print sweater',            price:10, old:15, cat:'Upcycled Clothing',   img:'star-print-sweater.png',
  desc:'A navy top decorated with three appliqué stars in polka dot, gingham and solid fabrics. Each star is stitched by hand from reclaimed materials, so no two pieces are exactly alike.'},
 {id:2, name:'Skyline Stripe Halter Top',     price:10, old:15, cat:'Sustainable Fashion', img:'skyline-stripe-halter-top.png',
  desc:'A light blue and white striped halter top with a tie detail at the neckline. Created to give existing fabric a second life, it is perfect for warm days and easy to dress up or down.'},
 {id:3, name:'Coat with star print',          price:15, old:22, cat:'Upcycled Clothing',   img:'coat-with-star-print.png',
  desc:'A black hoodie with a bold graphic and a grey star patch, with matching star patches on the sleeves. Reworked by hand from donated garments into something bold and unique.'},
 {id:4, name:'black jacket',                  price:15, old:20, cat:'Upcycled Clothing',   img:'black-jacket.jpg',
  desc:'A patchwork jacket built from blocks of navy, cream and black fabric. A statement piece that shows how scraps can become a design, available with matching shorts.'},
 {id:5, name:'Coat with a print on the back', price:20, old:30, cat:'Upcycled Clothing',   img:'coat-with-a-print-in-the-back.png',
  desc:'A soft grey hoodie with a surfboard print on the back that makes every exit memorable. Handmade from reclaimed materials, it is an exclusive piece from our designers.'},
 {id:7, name:'Pants with prints',             price:15, old:20, cat:'Upcycled Clothing',   img:'pants-with-prints.jpg',
  desc:'Wide-leg jeans with patchwork panels of floral and striped fabric. Each patch is placed by hand, so every pair has its own personality and keeps textile waste out of landfills.'},
 {id:8, name:'Red blouse',                    price:10, old:30, cat:'Sustainable Fashion', img:'red-blouse.jpg',
  desc:'A sleeveless red gingham top with side ties. Light, easy to style and made from reclaimed fabric to show that sustainable fashion can be fun.'},
 {id:9, name:'Double Star Hoodie',            price:10, old:15, cat:'Upcycled Clothing',   img:'double-star-hoodie.png',  soldOut:true,
  desc:'A cozy hoodie with a double star design, made by hand from reused materials. This piece is currently sold out, but new upcycled designs are added all the time.'},
 {id:10,name:'Lucky 8 Hoodie',                price:15, old:25, cat:'Upcycled Clothing',   img:'lucky-8-hoodie.png', soldOut:true,
  desc:'A navy hoodie with an 8-ball appliqué outlined in sparkling beads and a gingham star. A one-of-a-kind piece, currently sold out, but our designers are always working on the next one.'},
 {id:11,name:'White oversize',                price:10, old:15, cat:'Sustainable Fashion', img:'white-oversize.png',
  desc:'A light grey oversized sweatshirt decorated with star-shaped patches in denim and leopard print. Comfortable, relaxed and made from reclaimed materials.'},
 {id:6, name:'Patchwork Midi Skirt',          price:30,          cat:'Upcycled Clothing',   img:'falda-midi-patchwork.jpg',
  desc:'Midi skirt made with the patchwork technique, joining scraps of classic men\'s shirt fabrics. An exclusive piece with a fluid drape that celebrates creative reuse.'}
];
const SIZES=['S','L'],PATTERNS=['Stripes','Checks','Plain'];
const POSTS=[
 {t:'Upcycling: Turning Old Clothes into...',full:'Upcycling: Turning Old Clothes into Fashion Treasures',x:'Fast fashion has led to an increase in the amount of clothing...',img:'blog1.jpg',a:'Ana Torres',d:'4 Aug',
  body:`<p class="small">Fast fashion has led to a huge increase in the amount of clothing we throw away. Upcycling offers a creative answer: instead of discarding a garment, we reimagine it as something new and more valuable.</p>
  <h4>What is upcycling?</h4>
  <p class="small">Upcycling means transforming used clothes or leftover fabric into new pieces of higher quality or value. Unlike recycling, the material is not broken down. It keeps its shape and its story, and gets a new design.</p>
  <h4>How a garment is transformed at REEVA</h4>
  <ul class="small"><li><b>Collection:</b> donors drop off clothes at our collection centers.</li><li><b>Selection:</b> we choose garments with usable fabric, even if they are worn or damaged.</li><li><b>Deconstruction:</b> pieces are carefully taken apart to recover fabric, buttons and trims.</li><li><b>Redesign:</b> emerging designers combine the materials into unique, one-of-a-kind pieces.</li><li><b>Documentation:</b> each piece is shared with its story on our platform.</li></ul>
  <h4>Try it at home</h4>
  <ul class="small"><li>Turn an old pair of jeans into a tote bag.</li><li>Patch worn knees with fabric scraps for a bold new look.</li><li>Cut a long-sleeve shirt into a top and use the leftovers as a headband.</li></ul>
  <p class="small">Every upcycled piece keeps tons of textile waste out of landfills and shows that a forgotten garment can have a second life.</p>`},
 {t:'Sustainable Fashion: The Future of...',full:'Sustainable Fashion: The Future of Circular Clothing',x:'Sustainable fashion has stopped being a passing trend and...',img:'blog2.jpg',a:'Carlos Rios',d:'12 Aug',
  body:`<p class="small">Sustainable fashion has stopped being a passing trend and become an urgent need. As awareness of the industry's environmental impact grows, more consumers look for options that are both attractive and responsible.</p>
  <h4>What is circular clothing?</h4>
  <p class="small">Circular clothing is an approach that looks at the whole life cycle of a garment. The goal is to minimize waste and make the most of every resource, so that instead of throwing clothes away, they can go back into the production cycle to be reused or recycled.</p>
  <h4>Benefits of circular clothing</h4>
  <ul class="small"><li><b>Waste reduction:</b> reusing and recycling means less clothing ends up in landfills.</li><li><b>Resource savings:</b> making new garments uses large amounts of water and energy, and circular models help conserve them.</li><li><b>Lower environmental impact:</b> fewer new raw materials means less pollution and fewer chemicals used in textile production.</li></ul>
  <h4>Brands leading the change</h4>
  <p class="small">More and more brands are adopting circular practices. Patagonia is well known for its commitment to sustainability, with a program that repairs used garments and encourages customers to buy less and keep their clothes longer.</p>
  <h4>How to be a conscious shopper</h4>
  <ul class="small"><li>Buy fewer pieces, but choose quality and durability.</li><li>Repair before you replace.</li><li>Choose second-hand and upcycled garments.</li><li>Donate clothes you no longer wear instead of throwing them away.</li></ul>
  <p class="small">The next time you go shopping, remember that your choices matter. Choose sustainability and be part of the change.</p>`},
 {t:'Connecting Talent: Designers...',full:'Connecting Talent: Designers and Donors United',x:'Eco-friendly fashion has stopped being a passing trend and...',img:'blog3.jpg',a:'Maria Sanchez',d:'20 Aug',
  body:`<p class="small">Behind every REEVA garment there is a community. Donors give clothing a second chance, and local designers turn it into something new. Together, they close the fashion loop.</p>
  <h4>For donors</h4>
  <p class="small">Donating is simple. Gather clothes you no longer use, bring them to one of our collection centers and let us do the rest. Clothes in good condition, occasional-use clothing and textile accessories are all welcome.</p>
  <h4>For emerging designers</h4>
  <p class="small">REEVA gives young talent access to materials, visibility and a place to sell their work. With the support of partners like INADEH and the University of Panama, designers can build their skills and bring their ideas to life.</p>
  <h4>For conscious buyers</h4>
  <p class="small">Every piece in our marketplace is unique and comes with its story. Buying one supports a local designer and keeps textile waste out of landfills.</p>
  <h4>What we achieve together</h4>
  <ul class="small"><li><b>12,500 kg</b> of textiles saved from landfills.</li><li><b>450 garments</b> transformed into new creations.</li><li><b>12.5 T of CO₂</b> avoided by not producing new clothes.</li></ul>
  <p class="small">Together we build a circular economy where every garment tells a new story. Join us as a donor, a designer or a buyer.</p>`}
];

/* ---------- ROUTER ---------- */
const views=$$('.view');
function route(){
  const name=(location.hash||'#home').slice(1).split('/')[0];
  const id=views.some(v=>v.id===name)?name:'home';
  views.forEach(v=>v.classList.toggle('show',v.id===id));
  $$('#menu a').forEach(a=>a.classList.toggle('active',a.dataset.link===id));
  $('#menu').classList.remove('open');
  window.scrollTo(0,0);
  if(id==='marketplace')showList();
  if(id==='blog')closePost();
  startObservers();
}
addEventListener('hashchange',route);
$('#burger').onclick=()=>$('#menu').classList.toggle('open');

/* ---------- CONTADORES + REVEAL ---------- */
function countUp(el){
  const end=+el.dataset.count,dec=+el.dataset.dec||0,sep=el.dataset.sep,t0=performance.now();
  const f=now=>{const p=Math.min((now-t0)/1400,1),v=end*(1-Math.pow(1-p,3));
    let s=v.toFixed(dec);if(sep)s=(+s).toLocaleString('en-US');el.textContent=s;
    if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  if(e.target.dataset.count)countUp(e.target);else e.target.classList.add('on');
  io.unobserve(e.target);
}),{threshold:.15,rootMargin:'0px 0px -6% 0px'});
function startObservers(){
  const v=$('.view.show');if(!v)return;
  $$('.rv,.reveal',v).forEach(el=>{el.classList.remove('on');io.observe(el)});
  $$('[data-count]:not([data-done])',v).forEach(el=>{el.dataset.done=1;io.observe(el)});
}
function setBase(k){
  const o=k==='map'?'sat':'map';map.removeLayer(layers[o]);layers[k].addTo(map);
  $('#m-map').classList.toggle('on',k==='map');$('#m-sat').classList.toggle('on',k==='sat');
}

/* ---------- MARKETPLACE ---------- */
let cat='All Products';
const CATS=['All Products','Upcycled Clothing','Eco Accessories','Sustainable Fashion'];
function renderChips(){
  $('#chips').innerHTML=CATS.map(c=>`<button class="${c===cat?'on':''}">${c}</button>`).join('');
  $$('#chips button').forEach(b=>b.onclick=()=>{cat=b.textContent;renderChips();renderGrid()});
}
const SORTERS={
  rec:(a,b)=>a.order-b.order,
  new:(a,b)=>b.order-a.order,
  asc:(a,b)=>Number(a.price)-Number(b.price),
  desc:(a,b)=>Number(b.price)-Number(a.price),
  az:(a,b)=>a.name.localeCompare(b.name),
  za:(a,b)=>b.name.localeCompare(a.name)
};
PRODUCTS.forEach((p,i)=>p.order=i);
function renderGrid(){
  const l=PRODUCTS.filter(p=>cat===CATS[0]||p.cat===cat).sort(SORTERS[$('#sort').value]||SORTERS.rec);
  $('#count').textContent=l.length+' products';
  $('#grid').innerHTML=l.map(p=>`<div class="card" data-id="${p.id}">
    <img src="${IMG_DIR}${p.img}" alt="${p.name}" loading="lazy"><div>${p.name}</div>
    <div>${p.old?`<s>${money(p.old)}</s>`:''}${money(p.price)}</div>
    ${p.soldOut?'<button class="add" disabled>Sold out</button>':'<button class="add">+ Add to cart</button>'}</div>`).join('');
  $$('.card').forEach(c=>c.onclick=()=>showDetail(PRODUCTS.find(x=>x.id==c.dataset.id)));
}
$('#sort').onchange=renderGrid;
function showList(){$('#mk-list').hidden=false;$('#mk-detail').hidden=true;renderChips();renderGrid()}
function showDetail(p){
  let size=null,pat=null,q=1;
  const box=$('#mk-detail');$('#mk-list').hidden=true;box.hidden=false;window.scrollTo(0,0);
  const draw=(bad)=>{
    box.innerHTML=`<p class="crumbs"><a href="#marketplace" id="back">‹ Back to products</a></p>
    <div class="detail"><img src="${IMG_DIR}${p.img}" alt="${p.name}"><div>
      <h2>${p.name}</h2><p class="small">${p.old?`<s>${money(p.old)}</s> `:''}${money(p.price)}</p>
      <p class="small" style="margin-top:1rem">Size *</p>
      <div class="opts ${bad&&!size?'bad':''}" data-k="size">${SIZES.map(s=>`<button class="${s===size?'on':''}">${s}</button>`).join('')}${bad&&!size?'<em>⊘ Choose a size</em>':''}</div>
      <p class="small">Pattern *</p>
      <div class="opts ${bad&&!pat?'bad':''}" data-k="pat">${PATTERNS.map(s=>`<button class="${s===pat?'on':''}">${s}</button>`).join('')}${bad&&!pat?'<em>⊘ Choose a pattern</em>':''}</div>
      <p class="small">Quantity *</p>
      <div class="qty"><button id="qm">−</button><span>${q}</span><button id="qp">+</button></div>
      ${p.soldOut
        ?'<button class="btn" id="sold" disabled style="opacity:.5;cursor:not-allowed">Sold out</button>'
        :'<button class="btn" id="add">Add to cart</button><button class="btn teal" id="buy">Buy now</button>'}
      <p class="small" style="margin-top:1rem">${p.desc||'Unique piece created from reused materials by emerging designers.'}</p>
    </div></div>`;
    $('#back').onclick=e=>{e.preventDefault();showList()};
    $$('.opts').forEach(o=>$$('button',o).forEach(b=>b.onclick=()=>{
      o.dataset.k==='size'?size=b.textContent:pat=b.textContent;draw(bad)}));
    $('#qm').onclick=()=>{q=Math.max(1,q-1);draw(bad)};$('#qp').onclick=()=>{q++;draw(bad)};
    const go=()=>{ if(!size||!pat){draw(true);return false}
      addToCart(p,size,pat,q);return true};
    if(!p.soldOut){
      $('#add').onclick=()=>{if(go())openDrawer()};
      $('#buy').onclick=()=>{if(go())openCheckout()};
    }
  };
  draw(false);
}

/* ---------- CARRITO ---------- */
let cart=JSON.parse(localStorage.getItem('reeva-cart')||'[]');
function save(){localStorage.setItem('reeva-cart',JSON.stringify(cart));renderCart()}
function addToCart(p,size,pat,q){
  const k=`${p.id}-${size}-${pat}`,it=cart.find(i=>i.k===k);
  it?it.q+=q:cart.push({k,id:p.id,name:p.name,price:p.price,img:p.img,size,pat,q});save();
}
const total=()=>cart.reduce((s,i)=>s+i.price*i.q,0),units=()=>cart.reduce((s,i)=>s+i.q,0);
function renderCart(){
  $('#cart-count').textContent=units();$('#d-items').textContent=`(${units()} ${units()===1?'item':'items'})`;
  $('#d-total').textContent=money(total());
  $('#d-body').innerHTML=cart.length?cart.map((i,n)=>`<div class="ci"><img src="${IMG_DIR}${i.img}" alt="">
    <div><div>${i.name}</div><div>Size: ${i.size}<br>Pattern: ${i.pat}</div>
    <div class="qty"><button data-n="${n}" data-d="-1">−</button><span>${i.q}</span><button data-n="${n}" data-d="1">+</button></div></div>
    <div style="text-align:right"><button data-del="${n}" aria-label="Remove item"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7l1 13h9l1-13"/><path d="M10 11v6M14 11v6"/></svg></button><div style="margin-top:1.6rem">${money(i.price*i.q)}</div></div></div>`).join('')
    :'<p class="empty">Your cart is empty.<br>Explore the Marketplace to find your next piece.</p>';
  $$('#d-body [data-d]').forEach(b=>b.onclick=()=>{const i=cart[b.dataset.n];i.q+=+b.dataset.d;if(i.q<1)cart.splice(b.dataset.n,1);save()});
  $$('#d-body [data-del]').forEach(b=>b.onclick=()=>{b.closest('.ci').classList.add('out');setTimeout(()=>{cart.splice(b.dataset.del,1);save()},220)});
}
function openDrawer(){$('#drawer').classList.add('open');$('#overlay').classList.add('on')}
function closeAll(){$('#drawer').classList.remove('open');$('#overlay').classList.remove('on');$('#modal').hidden=true}
$('#btn-cart').onclick=openDrawer;$('#d-close').onclick=closeAll;$('#overlay').onclick=closeAll;
$('#d-view').onclick=()=>{closeAll();location.hash='#marketplace'};
$('#d-checkout').onclick=openCheckout;
addEventListener('keydown',e=>{if(e.key==='Escape'){closeAll();$('#checkout').hidden=true}});

/* ---------- CHECKOUT ---------- */
function openCheckout(){
  closeAll();
  $('#co-items').innerHTML=cart.map(i=>`<div class="co-it"><span>${i.q}× ${i.name}<br><small>Size: ${i.size} · Pattern: ${i.pat}</small></span><span>${money(i.price*i.q)}</span></div>`).join('')||'<p class="small">No items.</p>';
  ['#co-sub','#co-tot'].forEach(s=>$(s).textContent=money(total()));
  $('#checkout').hidden=false;
}
$('#co-back').onclick=e=>{e.preventDefault();$('#checkout').hidden=true};


/* ---------- LOGIN / SIGN UP ---------- */

const SESSION_KEY = 'reeva-user';
const COMMENTS_KEY = 'reeva-comments';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

const readJSON = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};

let user = null;
let mode = 'login';

const LOGIN_ICON = $('#btn-login').innerHTML;

function toast(msg) {
  let t = $('.toast');

  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }

  t.textContent = msg;
  t.classList.add('on');

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('on'), 2800);
}

/* Construcción del formulario de autenticación */

const oldModal = $('#modal');
if (oldModal) oldModal.remove();

const logoSrc = ($('.logo img') || {}).src || '';

document.body.insertAdjacentHTML('beforeend', `
<div class="modal" id="modal" hidden>
  <div class="modal-box auth" role="dialog"
       aria-modal="true" aria-labelledby="m-title">

    <button class="m-close" id="m-close"
            type="button" aria-label="Close">✕</button>

    ${logoSrc
      ? `<img class="auth-logo" src="${logoSrc}" alt="REEVA">`
      : ''}

    <h3 id="m-title">Welcome back</h3>
    <p class="auth-sub" id="m-sub"></p>

    <div class="auth-tabs">
      <button type="button" id="tab-login" class="on">Log in</button>
      <button type="button" id="tab-signup">Sign up</button>
    </div>

    <button class="auth-google" id="g-btn" type="button">
      <svg viewBox="0 0 48 48" width="20" height="20"
           aria-hidden="true">
        <path fill="#EA4335"
          d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
        <path fill="#4285F4"
          d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.9-2.1 5.3-4.5 6.9l7.3 5.7c4.3-4 6.9-9.9 6.9-16.6z"/>
        <path fill="#FBBC05"
          d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/>
        <path fill="#34A853"
          d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
      </svg>
      Continue with Google
    </button>

    <p class="auth-or"><span>or with email</span></p>

    <form id="auth" novalidate>
      <label id="f-name" hidden>
        Name
        <input type="text" id="a-name" autocomplete="name">
      </label>
      <p class="err" id="e-name" hidden></p>

      <label>
        Email
        <input type="email" id="a-email" autocomplete="email">
      </label>
      <p class="err" id="e-email" hidden></p>

      <label>
        Password
        <span class="pw">
          <input type="password" id="a-pass"
                 autocomplete="current-password">
          <button type="button" id="pw-eye"
                  aria-label="Show or hide password">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </span>
      </label>
      <p class="err" id="e-pass" hidden></p>
      <p class="err form" id="e-form" hidden></p>

      <button class="btn full" id="a-submit" type="submit">
        Log in
      </button>
    </form>

    <p class="auth-legal">
      By continuing, you agree to REEVA's terms and privacy policy.
    </p>
  </div>
</div>
`);

function clearErrors() {
  ['name', 'email', 'pass', 'form'].forEach(k => {
    $('#e-' + k).hidden = true;
  });

  ['a-name', 'a-email', 'a-pass'].forEach(id => {
    $('#' + id).classList.remove('bad');
  });
}

function fieldError(k, msg) {
  const el = $('#e-' + k);
  if (!el) return;

  el.textContent = msg;
  el.hidden = false;

  const ids = {
    name: 'a-name',
    email: 'a-email',
    pass: 'a-pass'
  };

  if (ids[k]) $('#' + ids[k]).classList.add('bad');
}

function setMode(m) {
  mode = m;
  const signup = m === 'signup';

  $('#tab-login').classList.toggle('on', !signup);
  $('#tab-signup').classList.toggle('on', signup);
  $('#f-name').hidden = !signup;

  $('#m-title').textContent =
    signup ? 'Create your account' : 'Welcome back';

  $('#m-sub').textContent = signup
    ? 'Join REEVA and give clothes a second life.'
    : 'Log in to comment and keep track of your cart.';

  $('#a-submit').textContent =
    signup ? 'Create account' : 'Log in';

  $('#a-pass').setAttribute(
    'autocomplete',
    signup ? 'new-password' : 'current-password'
  );

  clearErrors();
}

function openLogin(e) {
  if (e && e.preventDefault) e.preventDefault();

  $('#auth').reset();
  setMode('login');
  $('#user-menu').hidden = true;
  $('#modal').hidden = false;

  setTimeout(() => $('#a-email').focus(), 50);
}

document.addEventListener('click', e => {
  if (e.target.closest && e.target.closest('[data-login]')) {
    openLogin(e);
  }
});

$('#tab-login').onclick = () => setMode('login');
$('#tab-signup').onclick = () => setMode('signup');

$('#m-close').onclick = () => {
  $('#modal').hidden = true;
};

$('#modal').onclick = e => {
  if (e.target.id === 'modal') $('#modal').hidden = true;
};

$('#pw-eye').onclick = () => {
  const p = $('#a-pass');
  p.type = p.type === 'password' ? 'text' : 'password';
};

/* Menú de usuario */

const menu = document.createElement('div');
menu.id = 'user-menu';
menu.hidden = true;
menu.innerHTML = `
  <p class="um-name"></p>
  <p class="um-mail"></p>
<a href="/profile/profile.html" id="um-profile">My profile ↗</a>
  <button type="button" id="um-out">Log out</button>
`;


$('.nav-icons').appendChild(menu);

function renderUser() {
  const button = $('#btn-login');

  if (user) {
    button.innerHTML = user.picture
      ? `<img class="avatar" src="${esc(user.picture)}"
              alt="" referrerpolicy="no-referrer">`
      : `<span class="avatar">${esc(
          (user.name || '?')[0].toUpperCase()
        )}</span>`;

    button.setAttribute('aria-label', 'Account');
    $('.um-name').textContent = user.name || '';
    $('.um-mail').textContent = user.email || '';
  } else {
    button.innerHTML = LOGIN_ICON;
    button.setAttribute('aria-label', 'Log in');
    menu.hidden = true;
  }

  updateCommentNote();
}

/* Firebase mantiene el estado de la sesión */

onAuthStateChanged(auth, firebaseUser => {
  console.log("REEVA main — Firebase user:", firebaseUser?.uid ?? null);

  if (firebaseUser) {
    user = {
      name: firebaseUser.displayName || firebaseUser.email || 'User',
      email: firebaseUser.email || '',
      picture: firebaseUser.photoURL || '',
      provider: firebaseUser.providerData[0]?.providerId || 'password'
    };
  } else {
    user = null;
  }

  renderUser();
  
if ($('#blog-post') && !$('#blog-post').hidden) {
  renderComments();
}
});

function finishLogin(u) {
  user = u;

  localStorage.setItem(SESSION_KEY, JSON.stringify(u));

  $('#modal').hidden = true;
  renderUser();

  toast(`Welcome, ${(u.name || 'User').split(' ')[0]}!`);
}

$('#btn-login').onclick = e => {
  if (user) {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
  } else {
    openLogin();
  }
};

document.addEventListener('click', e => {
  if (!e.target.closest('#user-menu, #btn-login')) {
    menu.hidden = true;
  }
});

/* Cerrar sesión */

$('#um-out').onclick = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem(SESSION_KEY);
    menu.hidden = true;
    toast('You have been logged out');
  } catch (error) {
    console.error('Logout error:', error);
    toast('Could not log out. Please try again.');
  }
};

/* Registro e inicio de sesión con correo */

$('#auth').onsubmit = async e => {
  e.preventDefault();
  clearErrors();

  const name = $('#a-name').value.trim();
  const email = $('#a-email').value.trim();
  const pass = $('#a-pass').value;

  let invalid = false;

  if (mode === 'signup' && name.length < 2) {
    fieldError('name', 'Please enter your name.');
    invalid = true;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    fieldError('email', 'Enter a valid email address.');
    invalid = true;
  }

  if (pass.length < 6) {
    fieldError('pass', 'Use at least 6 characters.');
    invalid = true;
  }

  if (invalid) return;

  try {
    let credential;

    if (mode === 'signup') {
      credential = await createUserWithEmailAndPassword(
        auth,
        email,
        pass
      );

      await updateProfile(credential.user, {
        displayName: name
      });
    } else {
      credential = await signInWithEmailAndPassword(
        auth,
        email,
        pass
      );
    }

    const firebaseUser = credential.user;
    
try {
  await saveUserProfile(firebaseUser);
} catch (error) {
  console.error('Could not save user profile:', error);
}
    finishLogin({
      name: firebaseUser.displayName || name || firebaseUser.email,
      email: firebaseUser.email || email,
      picture: firebaseUser.photoURL || '',
      provider: firebaseUser.providerData[0]?.providerId || 'password'
    });

  } catch (error) {
    console.error(
      'Firebase authentication error:',
      error.code,
      error.message
    );

    if (error.code === 'auth/email-already-in-use') {
      fieldError(
        'form',
        'This email already has an account. Try logging in.'
      );
    } else if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password'
    ) {
      fieldError('form', 'Incorrect email or password.');
    } else if (error.code === 'auth/weak-password') {
      fieldError('pass', 'Please choose a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      fieldError('email', 'Please enter a valid email.');
    } else if (error.code === 'auth/too-many-requests') {
      fieldError(
        'form',
        'Too many attempts. Please wait a little and try again.'
      );
    } else if (error.code === 'auth/network-request-failed') {
      fieldError(
        'form',
        'Network error. Check your internet connection.'
      );
    } else {
      fieldError('form', 'Something went wrong. Please try again.');
    }
  }
};

/* Inicio de sesión con Google */

async function googleLogin() {
  clearErrors();

  try {
    const result = await signInWithPopup(auth, googleProvider);
   const firebaseUser = result.user;

try {
  await saveUserProfile(firebaseUser);
} catch (error) {
  console.error('Could not save Google user profile:', error);
}

finishLogin({
      name: firebaseUser.displayName || firebaseUser.email || 'User',
      email: firebaseUser.email || '',
      picture: firebaseUser.photoURL || '',
      provider: 'google.com'
    });

  } catch (error) {
    console.error(
      'Google sign-in error:',
      error.code,
      error.message
    );

    if (error.code === 'auth/popup-closed-by-user') {
      fieldError('form', 'Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      fieldError('form', 'Your browser blocked the sign-in popup.');
    } else if (error.code === 'auth/unauthorized-domain') {
      fieldError(
        'form',
        'This website domain is not authorized in Firebase.'
      );
    } else {
      fieldError('form', 'Could not sign in with Google. Please try again.');
    }
  }
}

$('#g-btn').onclick = googleLogin;


/* ---------- BLOG ---------- */

$('#posts').innerHTML = POSTS.map((p, i) => `
  <article class="post" data-i="${i}">
    <img src="${IMG_DIR}${p.img}" alt="" loading="lazy">
    <div>
      <p class="meta">${p.a} · ${p.d} · 4 min read</p>
      <h4>${p.t}</h4>
      <p>${p.x}</p>
    </div>
  </article>
`).join('');

let currentPost = 0;
let firestoreComments = [];
let unsubscribeComments = null;


function resetComment() {
  $('#comment').value = '';
  $('#comment').rows = 1;
  $('#c-actions').hidden = true;
}

function updateCommentNote() {
  const s = $('#c-actions .small');
  if (!s) return;

  s.innerHTML = user
    ? `Posting as <b>${esc(user.name)}</b>`
    : '<a href="#" data-login>Log in</a> to post as a member';
}

function ensureCommentsList() {
  let list = $('#comments-list');

  if (!list) {
    list = document.createElement('div');
    list.id = 'comments-list';
    $('#c-actions').insertAdjacentElement('afterend', list);
  }

  return list;
}


function subscribeToComments() {
  if (unsubscribeComments) {
    unsubscribeComments();
    unsubscribeComments = null;
  }

  firestoreComments = [];
  renderComments();

  const key = POSTS[currentPost].full;

  const commentsQuery = query(
    collection(db, 'comments'),
    where('postKey', '==', key)
  );

  unsubscribeComments = onSnapshot(
    commentsQuery,
    snapshot => {
      firestoreComments = snapshot.docs.map(commentDoc => ({
        id: commentDoc.id,
        ...commentDoc.data()
      }));

      firestoreComments.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeA - timeB;
      });

      renderComments();
    },
    error => {
      console.error('Could not load comments:', error);
      toast('Could not load comments. Please try again.');
    }
  );
}

function renderComments() {
  const comments = [...firestoreComments].reverse();
  const list = ensureCommentsList();

  list.innerHTML = comments.map(comment => {
    const isOwner =
      !!auth.currentUser &&
      !!comment.uid &&
      comment.uid === auth.currentUser.uid;

    const editedLabel = comment.edited
      ? '<span class="comment-edited">Edited</span>'
      : '';

    return `
      <div class="cm reeva-comment"
           data-comment-id="${esc(comment.id)}">
        <span class="avatar comment-avatar">
          ${esc((comment.name || '?')[0].toUpperCase())}
        </span>

        <div class="comment-content">
          <div class="comment-header">
            <div class="comment-author">
              <b>${esc(comment.name || 'User')}</b>
              <div class="comment-meta">
                <span>${esc(comment.date || '')}</span>
                ${editedLabel}
              </div>
            </div>

            ${isOwner ? `
              <div class="comment-tools">
                <button
                  type="button"
                  class="comment-icon-btn edit-comment"
                  aria-label="Edit comment"
                  title="Edit comment">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  class="comment-icon-btn delete-comment"
                  aria-label="Delete comment"
                  title="Delete comment">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 6h18"/>
                    <path d="M8 6V4h8v2"/>
                    <path d="m19 6-1 14H6L5 6"/>
                    <path d="M10 11v5M14 11v5"/>
                  </svg>
                </button>
              </div>
            ` : ''}
          </div>

          <div class="comment-message">
            <p class="comment-text">${esc(comment.text || '')}</p>
          </div>

          ${isOwner ? `
            <div class="comment-edit-area" hidden>
              <textarea
                class="comment-edit-input"
                maxlength="2000"
                aria-label="Edit your comment">${esc(comment.text || '')}</textarea>

              <div class="comment-edit-actions">
                <button type="button" class="comment-cancel-edit">
                  Cancel
                </button>
                <button type="button" class="comment-save-edit">
                  Save changes
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Open the inline editor
  list.querySelectorAll('.edit-comment').forEach(button => {
    button.onclick = () => {
      const box = button.closest('.reeva-comment');
      const message = box.querySelector('.comment-message');
      const editor = box.querySelector('.comment-edit-area');
      const input = box.querySelector('.comment-edit-input');

      message.hidden = true;
      editor.hidden = false;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    };
  });

  // Cancel editing
  list.querySelectorAll('.comment-cancel-edit').forEach(button => {
    button.onclick = () => renderComments();
  });

  // Save edited comment in Firestore
  list.querySelectorAll('.comment-save-edit').forEach(button => {
    button.onclick = async () => {
      const box = button.closest('.reeva-comment');
      const id = box.dataset.commentId;
      const input = box.querySelector('.comment-edit-input');
      const newText = input.value.trim();

      if (!newText) {
        toast('Your comment cannot be empty.');
        input.focus();
        return;
      }

      const comment = firestoreComments.find(item => item.id === id);

      if (
        !auth.currentUser ||
        !comment ||
        comment.uid !== auth.currentUser.uid
      ) {
        toast('You can only edit your own comments.');
        return;
      }

      if (newText.length > 2000) {
        toast('Your comment is too long.');
        return;
      }

      if (newText === comment.text) {
        renderComments();
        return;
      }

      button.disabled = true;

      try {
        await updateDoc(doc(db, 'comments', id), {
          text: newText,
          edited: true,
          editedAt: serverTimestamp()
        });

        toast('Comment updated');
      } catch (error) {
        console.error('Could not edit comment:', error);
        toast('Could not update comment. Please try again.');
        button.disabled = false;
      }
    };
  });

  // Delete comment from Firestore
  list.querySelectorAll('.delete-comment').forEach(button => {
    button.onclick = async () => {
      const box = button.closest('.reeva-comment');
      const id = box.dataset.commentId;
      const comment = firestoreComments.find(item => item.id === id);

      if (
        !auth.currentUser ||
        !comment ||
        comment.uid !== auth.currentUser.uid
      ) {
        toast('You can only delete your own comments.');
        return;
      }

      if (!confirm('Delete your comment?')) return;

      button.disabled = true;

      try {
        await deleteDoc(doc(db, 'comments', id));
        toast('Comment deleted');
      } catch (error) {
        console.error('Could not delete comment:', error);
        toast('Could not delete comment. Please try again.');
        button.disabled = false;
      }
    };
  });
}


$$('.post').forEach(el => {
  el.onclick = () => {
    currentPost = Number(el.dataset.i);
    const post = POSTS[currentPost];
    const card = $('#blog-post .post-card') || $('#blog-post');

    let box = $('#post-body');

    if (!box) {
      box = document.createElement('div');
      box.id = 'post-body';
      card.prepend(box);
    }

    ['#post-meta', '#post-title'].forEach(selector => {
      const element = $(selector);
      if (element) element.remove();
    });

    box.innerHTML = `
      <p class="meta">${post.a} · ${post.d} · 4 min read</p>
      <h2>${post.full}</h2>
      <img class="photo" src="${IMG_DIR}${post.img}" alt="">
      <div>${post.body || '<p class="small">' + post.x + '</p>'}</div>
    `;

    resetComment();
    updateCommentNote();
    subscribeToComments();

    $('#blog-list').hidden = true;
    $('#blog-post').hidden = false;
    window.scrollTo(0, 0);
  };
});


function closePost() {
  if (unsubscribeComments) {
    unsubscribeComments();
    unsubscribeComments = null;
  }

  firestoreComments = [];

  $('#blog-list').hidden = false;
  $('#blog-post').hidden = true;
}

$('[data-back]').onclick = event => {
  event.preventDefault();
  closePost();
};

$('#comment').onfocus = () => {
  $('#c-actions').hidden = false;
  $('#comment').rows = 4;
};

$('#c-cancel').onclick = resetComment;


$('#c-post').onclick = async () => {
  if (!user || !auth.currentUser) {
    openLogin();
    return;
  }

  const text = $('#comment').value.trim();

  if (!text) {
    toast('Write a comment first.');
    return;
  }

  if (text.length > 2000) {
    toast('Your comment is too long.');
    return;
  }

  const button = $('#c-post');
  button.disabled = true;

  try {
    await addDoc(collection(db, 'comments'), {
      postKey: POSTS[currentPost].full,
      uid: auth.currentUser.uid,
      name: user.name || auth.currentUser.displayName || 'User',
      text,
      edited: false,
      date: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      createdAt: serverTimestamp()
    });

    resetComment();
    toast('Comment posted');
  } catch (error) {
    console.error('Could not post comment:', error);
    toast('Could not post comment. Please try again.');
  } finally {
    button.disabled = false;
  }
};

/* ---------- INIT ---------- */
renderCart();renderUser();route();
