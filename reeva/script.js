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
/* PARA ACTIVAR "CONTINUE WITH GOOGLE": pega aquí tu Client ID (ver instrucciones). Si lo dejas vacío, el botón avisa que falta configurarlo. */
const GOOGLE_CLIENT_ID='';

const USERS_KEY='reeva-users',SESSION_KEY='reeva-user',COMMENTS_KEY='reeva-comments';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readJSON=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
let user=readJSON(SESSION_KEY,null),mode='login';
const LOGIN_ICON=$('#btn-login').innerHTML;

function toast(msg){
  let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}
  t.textContent=msg;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2800);
}
/* Las contraseñas se guardan cifradas (SHA-256) SOLO en este navegador. Es una demo: para un sitio real hace falta un servidor. */
async function hash(t){
  if(window.crypto&&crypto.subtle&&window.TextEncoder){
    const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('reeva:'+t));
    return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  return btoa(unescape(encodeURIComponent('reeva:'+t)));
}

/* --- ventana (se construye aquí; reemplaza a la antigua del HTML) --- */
const oldModal=$('#modal');if(oldModal)oldModal.remove();
const logoSrc=($('.logo img')||{}).src||'';
document.body.insertAdjacentHTML('beforeend',`
<div class="modal" id="modal" hidden>
  <div class="modal-box auth" role="dialog" aria-modal="true" aria-labelledby="m-title">
    <button class="m-close" id="m-close" type="button" aria-label="Close">✕</button>
    ${logoSrc?`<img class="auth-logo" src="${logoSrc}" alt="REEVA">`:''}
    <h3 id="m-title">Welcome back</h3>
    <p class="auth-sub" id="m-sub"></p>
    <div class="auth-tabs"><button type="button" id="tab-login" class="on">Log in</button><button type="button" id="tab-signup">Sign up</button></div>
    <button class="auth-google" id="g-btn" type="button">
      <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.9-2.1 5.3-4.5 6.9l7.3 5.7c4.3-4 6.9-9.9 6.9-16.6z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
      Continue with Google
    </button>
    <p class="auth-or"><span>or with email</span></p>
    <form id="auth" novalidate>
      <label id="f-name" hidden>Name<input type="text" id="a-name" autocomplete="name"></label>
      <p class="err" id="e-name" hidden></p>
      <label>Email<input type="email" id="a-email" autocomplete="email"></label>
      <p class="err" id="e-email" hidden></p>
      <label>Password<span class="pw"><input type="password" id="a-pass" autocomplete="current-password">
        <button type="button" id="pw-eye" aria-label="Show or hide password"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></span></label>
      <p class="err" id="e-pass" hidden></p>
      <p class="err form" id="e-form" hidden></p>
      <button class="btn full" id="a-submit" type="submit">Log in</button>
    </form>
    <p class="auth-legal">By continuing, you agree to REEVA's terms and privacy policy.</p>
  </div>
</div>`);

function clearErrors(){
  ['name','email','pass','form'].forEach(k=>{$('#e-'+k).hidden=true});
  ['a-name','a-email','a-pass'].forEach(id=>$('#'+id).classList.remove('bad'));
}
function fieldError(k,msg){
  const e=$('#e-'+k);e.textContent=msg;e.hidden=false;
  const ids={name:'a-name',email:'a-email',pass:'a-pass'};if(ids[k])$('#'+ids[k]).classList.add('bad');
}
function setMode(m){
  mode=m;const su=m==='signup';
  $('#tab-login').classList.toggle('on',!su);$('#tab-signup').classList.toggle('on',su);
  $('#f-name').hidden=!su;
  $('#m-title').textContent=su?'Create your account':'Welcome back';
  $('#m-sub').textContent=su?'Join REEVA and give clothes a second life.':'Log in to comment and keep track of your cart.';
  $('#a-submit').textContent=su?'Create account':'Log in';
  $('#a-pass').setAttribute('autocomplete',su?'new-password':'current-password');
  clearErrors();
}
function openLogin(e){
  if(e&&e.preventDefault)e.preventDefault();
  $('#auth').reset();setMode('login');$('#user-menu').hidden=true;
  $('#modal').hidden=false;setTimeout(()=>$('#a-email').focus(),50);
}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-login]'))openLogin(e)});
$('#tab-login').onclick=()=>setMode('login');
$('#tab-signup').onclick=()=>setMode('signup');
$('#m-close').onclick=()=>$('#modal').hidden=true;
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').hidden=true};
$('#pw-eye').onclick=()=>{const p=$('#a-pass');p.type=p.type==='password'?'text':'password'};

/* --- sesión: avatar en el menú + mini menú "Log out" --- */
const menu=document.createElement('div');menu.id='user-menu';menu.hidden=true;
menu.innerHTML='<p class="um-name"></p><p class="um-mail"></p><button type="button" id="um-out">Log out</button>';
$('.nav-icons').appendChild(menu);
function renderUser(){
  const b=$('#btn-login');
  if(user){
    b.innerHTML=user.picture?`<img class="avatar" src="${esc(user.picture)}" alt="" referrerpolicy="no-referrer">`
      :`<span class="avatar">${esc((user.name||'?')[0].toUpperCase())}</span>`;
    b.setAttribute('aria-label','Account');
    $('.um-name').textContent=user.name;$('.um-mail').textContent=user.email;
  }else{b.innerHTML=LOGIN_ICON;b.setAttribute('aria-label','Log in');menu.hidden=true}
  updateCommentNote();
}
function finishLogin(u){
  user=u;localStorage.setItem(SESSION_KEY,JSON.stringify(u));
  $('#modal').hidden=true;renderUser();toast(`Welcome, ${u.name.split(' ')[0]}!`);
}
$('#btn-login').onclick=e=>{if(user){e.stopPropagation();menu.hidden=!menu.hidden}else openLogin()};
document.addEventListener('click',e=>{if(!e.target.closest('#user-menu,#btn-login'))menu.hidden=true});
$('#um-out').onclick=()=>{user=null;localStorage.removeItem(SESSION_KEY);renderUser();toast('You have been logged out')};

/* --- registro / inicio de sesión con email --- */
$('#auth').onsubmit=async e=>{
  e.preventDefault();clearErrors();
  const name=$('#a-name').value.trim(),email=$('#a-email').value.trim().toLowerCase(),pass=$('#a-pass').value;
  let bad=false;
  if(mode==='signup'&&name.length<2){fieldError('name','Please enter your name.');bad=true}
  if(!/^\S+@\S+\.\S+$/.test(email)){fieldError('email','Enter an email address like example@mysite.com.');bad=true}
  if(pass.length<6){fieldError('pass','Use at least 6 characters.');bad=true}
  if(bad)return;
  const users=readJSON(USERS_KEY,{}),h=await hash(pass);
  if(mode==='signup'){
    if(users[email]){fieldError('form','An account with this email already exists. Try logging in.');return}
    users[email]={name,hash:h};localStorage.setItem(USERS_KEY,JSON.stringify(users));
    finishLogin({name,email,provider:'email'});
  }else{
    const u=users[email];
    if(!u||u.hash!==h){fieldError('form','Incorrect email or password.');return}
    finishLogin({name:u.name,email,provider:'email'});
  }
};

/* --- Google --- */
function loadGoogle(){
  return new Promise((res,rej)=>{
    if(window.google&&google.accounts&&google.accounts.oauth2)return res();
    const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;
    s.onload=res;s.onerror=()=>rej(new Error('offline'));document.head.appendChild(s);
  });
}
async function googleLogin(){
  clearErrors();
  if(!GOOGLE_CLIENT_ID){fieldError('form','Google sign-in is not set up yet. Add your Client ID in script.js (GOOGLE_CLIENT_ID).');return}
  if(location.protocol==='file:'){fieldError('form','Google sign-in does not work when the page is opened as a file. Open the site with Live Server instead.');return}
  try{await loadGoogle()}catch(err){fieldError('form','Could not reach Google. Check your internet connection.');return}
  const client=google.accounts.oauth2.initTokenClient({
    client_id:GOOGLE_CLIENT_ID,scope:'openid email profile',
    callback:async r=>{
      if(r.error){fieldError('form','Google sign-in was cancelled.');return}
      try{
        const u=await (await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+r.access_token}})).json();
        finishLogin({name:u.name||u.email,email:u.email,picture:u.picture,provider:'google'});
      }catch(err){fieldError('form','Could not read your Google profile. Please try again.')}
    },
    error_callback:()=>fieldError('form','Google sign-in was cancelled.')
  });
  client.requestAccessToken();
}
$('#g-btn').onclick=googleLogin;

/* ---------- BLOG ---------- */
$('#posts').innerHTML=POSTS.map((p,i)=>`<article class="post" data-i="${i}"><img src="${IMG_DIR}${p.img}" alt="" loading="lazy">
  <div><p class="meta">${p.a} · ${p.d} · 4 min read</p><h4>${p.t}</h4><p>${p.x}</p></div></article>`).join('');
let currentPost=0;
function resetComment(){$('#comment').value='';$('#comment').rows=1;$('#c-actions').hidden=true}
function updateCommentNote(){
  const s=$('#c-actions .small');if(!s)return;
  s.innerHTML=user?`Posting as <b>${esc(user.name)}</b>`:'<a href="#" data-login>Log in</a> to post as a member';
}
function ensureCommentsList(){
  let l=$('#comments-list');
  if(!l){l=document.createElement('div');l.id='comments-list';$('#c-actions').insertAdjacentElement('afterend',l)}
  return l;
}
function renderComments(){
  const list=(readJSON(COMMENTS_KEY,{})[POSTS[currentPost].full]||[]).slice().reverse();
  ensureCommentsList().innerHTML=list.map(c=>`<div class="cm"><span class="avatar">${esc((c.name||'?')[0].toUpperCase())}</span>
    <div><b>${esc(c.name)}</b><small>${esc(c.date)}</small><p>${esc(c.text)}</p></div></div>`).join('');
}
$$('.post').forEach(el=>el.onclick=()=>{
  currentPost=+el.dataset.i;const p=POSTS[currentPost];
  const card=$('#blog-post .post-card')||$('#blog-post');
  let box=$('#post-body');
  if(!box){box=document.createElement('div');box.id='post-body';card.prepend(box)}
  ['#post-meta','#post-title'].forEach(s=>{const e=$(s);if(e)e.remove()});
  box.innerHTML=`<p class="meta">${p.a} · ${p.d} · 4 min read</p>
    <h2>${p.full}</h2>
    <img class="photo" src="${IMG_DIR}${p.img}" alt="">
    <div>${p.body||'<p class="small">'+p.x+'</p>'}</div>`;
  resetComment();updateCommentNote();renderComments();
  $('#blog-list').hidden=true;$('#blog-post').hidden=false;window.scrollTo(0,0);
});
function closePost(){$('#blog-list').hidden=false;$('#blog-post').hidden=true}
$('[data-back]').onclick=e=>{e.preventDefault();closePost()};
$('#comment').onfocus=()=>{$('#c-actions').hidden=false;$('#comment').rows=4};
$('#c-cancel').onclick=resetComment;
$('#c-post').onclick=()=>{
  if(!user){openLogin();return}
  const t=$('#comment').value.trim();if(!t)return;
  const all=readJSON(COMMENTS_KEY,{}),k=POSTS[currentPost].full;
  (all[k]=all[k]||[]).push({name:user.name,text:t,date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})});
  localStorage.setItem(COMMENTS_KEY,JSON.stringify(all));
  resetComment();renderComments();toast('Comment posted');
};

/* ---------- INIT ---------- */
renderCart();renderUser();route();
