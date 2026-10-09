/* Arangkada dealer network console: demo logic.
   Everything runs in the browser; the "branches" and "HQ" are simulated in memory. */
const BR=[
  {code:'CBO',name:'Cubao',area:'Quezon City'},
  {code:'MKT',name:'Makati Avenue',area:'Makati'},
  {code:'MDE',name:'Mandaue',area:'Cebu'},
  {code:'BJD',name:'Bajada',area:'Davao City'},
  {code:'JRO',name:'Jaro',area:'Iloilo City'},
  {code:'BGO',name:'Session Road',area:'Baguio'}];
const SKUS=[
  {id:'HC125',brand:'Honda',model:'Click 125',price:80900,ep:'KF41E',code:'C125',ghost:'CLICK',kind:'scooter',cat:'Scooter'},
  {id:'HADV',brand:'Honda',model:'ADV 160',price:166900,ep:'KF57E',code:'A160',ghost:'ADV',kind:'scooter',cat:'Adventure scooter'},
  {id:'YNMX',brand:'Yamaha',model:'NMAX 155',price:151900,ep:'G3J8E',code:'N155',ghost:'NMAX',kind:'scooter',cat:'Maxi scooter'},
  {id:'YMGR',brand:'Yamaha',model:'Mio Gear',price:76900,ep:'E33PE',code:'MG',ghost:'MIO',kind:'scooter',cat:'Scooter'},
  {id:'SRDR',brand:'Suzuki',model:'Raider R150 Fi',price:107900,ep:'CGA2',code:'R150',ghost:'RAIDER',kind:'street',cat:'Underbone'},
  {id:'SBGM',brand:'Suzuki',model:'Burgman Street',price:77900,ep:'AF21',code:'BS',ghost:'BURGMAN',kind:'scooter',cat:'Scooter'},
  {id:'KBRK',brand:'Kawasaki',model:'Barako II',price:86600,ep:'BC175',code:'B2',ghost:'BARAKO',kind:'street',cat:'Utility bike'},
  {id:'KRNS',brand:'Kawasaki',model:'Rouser NS125',price:87900,ep:'JL125',code:'NS',ghost:'ROUSER',kind:'street',cat:'Naked sport'}];
const COLORS=['Pearl white','Matte black','Racing red','Midnight blue','Graphite grey'];
const NAMES=['Ma. Liza Dela Cruz','Jomar Santos','Rhea Villanueva','Arnel Bautista','Kristine Ramos','Dennis Aquino'];
const RATES={12:.016,18:.017,24:.018,36:.019};
const STAGES=['Invoice issued','Docs and insurance complete','Filed with LTO','OR/CR released','Plate released'];
const ST_LABEL={AVAILABLE:'Available',RESERVED:'Reserved',IN_TRANSIT:'In transit',SOLD:'Sold'};
const NAV=[{v:'home',label:'Home'},{v:'showroom',label:'Showroom'},{v:'financing',label:'Financing'},{v:'registration',label:'Registration'},{v:'network',label:'Network'}];
const CALLS=[
  ['Point of sale','Agents sell what is on their floor, cash or installment, with or without internet.'],
  ['Outbox','Every sale is saved at the branch first, then sent to HQ in order.'],
  ['Offline mode','A branch that loses signal keeps selling. HQ catches up when it reconnects.'],
  ['Credit scoring','HQ scores every application, so all branches follow the same rules.'],
  ['LTO filing','A registration file opens the moment a sale reaches HQ.'],
  ['Price lists','HQ publishes prices once. Branches pick them up on their next sync.']];

let seed=7;
const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
const pick=a=>a[Math.floor(rnd()*a.length)];
const digits=n=>{let s='';for(let i=0;i<n;i++)s+=Math.floor(rnd()*10);return s};
const fmt=n=>'₱'+Math.round(n).toLocaleString('en-PH');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const sku=id=>SKUS.find(s=>s.id===id);
const tm=d=>d.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
function uuid7(){const t=Date.now().toString(16).padStart(12,'0');let r='';for(let i=0;i<20;i++)r+=Math.floor(Math.random()*16).toString(16);
  return `${t.slice(0,8)}-${t.slice(8)}-7${r.slice(0,3)}-${r.slice(3,7)}-${r.slice(7,19)}`}
const arrow=()=>'<svg class="arr" viewBox="0 0 28 10" aria-hidden="true"><path d="M0 5H26M21 1l5 4-5 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const chev=d=>`<svg viewBox="0 0 14 14" aria-hidden="true"><path d="${d==='up'?'M2 9l5-5 5 5':'M2 5l5 5 5-5'}" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

/* ---------- original bike illustrations ---------- */
function wheel(cx,cy,r){
  let sp='';for(let k=0;k<5;k++){const a=k*72*Math.PI/180;sp+=`<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*r*.7).toFixed(1)}" y2="${(cy+Math.sin(a)*r*.7).toFixed(1)}" class="rim" stroke-width="3"/>`}
  return `<circle cx="${cx}" cy="${cy}" r="${r}" class="tire" stroke-width="${r*.24}"/><circle cx="${cx}" cy="${cy}" r="${r*.72}" class="rim" stroke-width="2.5"/>${sp}<circle cx="${cx}" cy="${cy}" r="${r*.34}" class="rim" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="${r*.12}" class="hubc"/>`;
}
function bike(kind,lit=true){
  const cls='bk'+(lit?'':' dim');
  if(kind==='street')return `<svg class="${cls}" viewBox="0 0 420 250" aria-hidden="true">
    <ellipse cx="210" cy="238" rx="170" ry="8" class="shadow"/>
    <path d="M95 180 L205 156" class="metal" stroke-width="9"/>
    <path d="M140 112 L205 152" class="metal" stroke-width="7"/>
    ${wheel(95,180,55)}${wheel(325,180,55)}
    <rect x="165" y="124" width="74" height="52" rx="10" class="engine"/>
    <path d="M178 136h48M178 148h48M178 160h48" class="metal" stroke-width="2"/>
    <path d="M212 174 Q182 198 122 200 L92 198" class="pipe" stroke-width="7"/>
    <path d="M300 132 Q325 112 354 128" class="seat" style="fill:none;stroke:var(--seat);stroke-width:8;stroke-linecap:round"/>
    <path d="M275 70 L325 180" class="fork" stroke-width="7"/>
    <path d="M160 98 Q190 66 250 72 Q270 76 272 100 Q232 114 166 112 Z" class="body"/>
    <path d="M86 96 Q120 84 166 96 L163 111 Q125 113 90 108 Z" class="seat"/>
    <path d="M66 92 L90 90 L94 104 L70 104 Z" class="body"/>
    <path d="M262 60 L294 50" class="metal" stroke-width="5"/>
    <circle cx="294" cy="92" r="13" class="light"/><circle cx="294" cy="92" r="13" fill="none" stroke="#555" stroke-width="3"/>
  </svg>`;
  return `<svg class="${cls}" viewBox="0 0 420 250" aria-hidden="true">
    <ellipse cx="210" cy="238" rx="165" ry="8" class="shadow"/>
    ${wheel(105,192,44)}${wheel(322,192,44)}
    <path d="M116 170 Q160 160 192 174 L182 194 Q140 200 116 188 Z" class="engine"/>
    <path d="M52 160 Q58 118 112 112 L200 112 Q214 150 250 150 L262 98 L280 58 L296 62 L286 112 Q318 130 342 150 L346 162 L290 168 Q262 172 230 168 L140 168 Q100 172 52 160 Z" class="body"/>
    <path d="M204 150 L250 150 L240 167 L204 167 Z" class="seat"/>
    <path d="M100 106 Q150 88 206 102 L204 114 L104 116 Z" class="seat"/>
    <path d="M296 160 Q322 140 350 156" style="fill:none;stroke:var(--seat);stroke-width:8;stroke-linecap:round"/>
    <path d="M272 56 L306 46" class="metal" stroke-width="5"/>
    <path d="M316 120 L342 128 L340 140 L314 134 Z" class="light"/>
  </svg>`;
}

/* ---------- state ---------- */
let S;
function makeState(){
  seed=7;
  const st={current:'CBO',view:S?S.view:'home',hero:S?S.hero:2,tab:'floor',drawer:null,hlc:0,units:[],apps:[],test:[],testing:false,
    form:{customer:'',mobile:'',pay:'install',dp:20,term:24},
    credit:{name:'',income:35000,obligations:4000,years:3,comaker:'yes',sku:'HC125',dp:20,term:24},
    filters:{branch:'all',status:'all',model:'all'},
    branches:BR.map(b=>({...b,online:true,outbox:[],priceVersion:1,prices:Object.fromEntries(SKUS.map(s=>[s.id,s.price])),siSeq:1200+Math.floor(rnd()*500)})),
    central:{priceVersion:1,prices:Object.fromEntries(SKUS.map(s=>[s.id,s.price])),inbox:new Set(),sales:[],collections:0,lto:[],log:[],dups:0,processed:0,lastBatch:[]}};
  let n=1;
  st.branches.forEach((b,bi)=>{
    const count=6+Math.floor(rnd()*3);
    for(let i=0;i<count;i++){const s=pick(SKUS);
      st.units.push({id:'U'+(n++),sku:s.id,engine:`${s.ep}-${digits(7)}`,chassis:`PH${s.id}${digits(6)}`,color:pick(COLORS),
        custodian:b.code,status:'AVAILABLE',version:1,pending:false,reservedFor:null,dest:null})}
    const u=st.units.find(x=>x.custodian===b.code);
    u.status='SOLD';u.version=2;
    const si=`${b.code}-SI-${String(b.siSeq++).padStart(6,'0')}`,price=sku(u.sku).price;
    st.central.sales.push({unitId:u.id,si,customer:NAMES[bi],price});
    st.central.collections+=Math.round(price*.2);
    st.central.lto.push({unitId:u.id,si,customer:NAMES[bi],branch:b.code,stage:Math.floor(rnd()*4),opened:Date.now()-(3+Math.floor(rnd()*18))*864e5});
  });
  st.central.log.push({kind:'pull',text:'All six branches synced at opening. Price list v1.',at:new Date()});
  return st;
}
const br=c=>S.branches.find(b=>b.code===c);
const cur=()=>br(S.current);
const unit=id=>S.units.find(u=>u.id===id);
function log(kind,text){S.central.log.push({kind,text,at:new Date()});if(S.central.log.length>200)S.central.log.shift()}
function finance(price,dp,term){const dpAmt=Math.round(price*dp/100),fin=price-dpAmt,rate=RATES[term],monthly=fin/term+fin*rate;return {dpAmt,fin,rate,monthly,total:dpAmt+monthly*term}}
function score(a){
  const dti=(a.obligations+a.monthly)/Math.max(a.income,1);
  let s=40+Math.min(a.years,5)*5+(a.comaker==='yes'?10:0)+(dti<=.3?25:dti<=.4?12:dti<=.5?0:-20);
  s=Math.max(0,Math.min(100,Math.round(s)));
  return {dti,score:s,decision:s>=75?'Approved':s>=60?'For C.I. visit':'Declined'};
}

/* ---------- outbox & HQ ---------- */
function emit(b,type,payload){b.outbox.push({id:uuid7(),branch:b.code,type,payload,hlc:Date.now()*1000+(++S.hlc%1000),at:new Date()})}
function applyCentral(ev){
  const C=S.central;
  if(C.inbox.has(ev.id)){C.dups++;log('dup',`Duplicate ${ev.id.slice(0,13)}… from ${ev.branch} ignored, already processed.`);return}
  C.inbox.add(ev.id);C.processed++;
  const p=ev.payload,u=p.unitId?unit(p.unitId):null;
  if(u)u.pending=false;
  if(ev.type==='UnitSold'){
    C.sales.push({unitId:p.unitId,si:p.si,customer:p.customer,price:p.price});C.collections+=p.cashIn;
    C.lto.push({unitId:p.unitId,si:p.si,customer:p.customer,branch:ev.branch,stage:0,opened:Date.now()});
    log('sale',`${ev.branch} sold a ${sku(p.sku).brand} ${sku(p.sku).model} to ${p.customer} (${p.si}, ${p.pay==='cash'?'cash':p.term+' months'}). LTO file opened.`);
  }else if(ev.type==='CreditApplicationSubmitted'){
    const a=S.apps.find(x=>x.id===p.appId);
    if(a){const r=score(a);Object.assign(a,r,{status:r.decision});log('credit',`HQ scored ${a.name}'s application from ${ev.branch}: ${r.score}/100, ${r.decision.toLowerCase()}.`)}
  }else if(ev.type==='UnitReleasedForTransfer')log('lease',`${ev.branch} released ${u.engine} for transfer to ${p.dest}. HQ logistics now owns it.`);
  else if(ev.type==='UnitReceived')log('lease',`${ev.branch} received ${u.engine}. Custody moved to ${ev.branch}.`);
}
function tick(){
  let changed=false;
  for(const b of S.branches){
    if(!b.online)continue;
    if(b.priceVersion<S.central.priceVersion){b.prices={...S.central.prices};b.priceVersion=S.central.priceVersion;log('pull',`${b.code} pulled price list v${b.priceVersion}.`);changed=true}
    if(b.outbox.length){const batch=b.outbox.splice(0,4);batch.forEach(applyCentral);S.central.lastBatch=batch;changed=true}
  }
  if(changed)render(true);
}

/* ---------- actions ---------- */
function sellable(b,u){return u&&u.custodian===b.code&&(u.status==='AVAILABLE'||(u.status==='RESERVED'&&u.reservedFor===b.code))}
function sell(b,u,customer,pay,dp,term){
  const price=b.prices[u.sku],f=finance(price,dp,term);
  u.status='SOLD';u.version++;u.pending=true;u.reservedFor=null;
  const si=`${b.code}-SI-${String(++b.siSeq).padStart(6,'0')}`;
  emit(b,'UnitSold',{unitId:u.id,sku:u.sku,price,pay,dp,term,monthly:f.monthly,customer,si,cashIn:pay==='cash'?price:f.dpAmt});
  return si;
}
function tryReserve(req,u){
  const cust=br(u.custodian);
  if(!req.online)return {ok:false,reason:`${req.code} is offline. Holds on another branch's unit need HQ.`};
  if(!cust||!cust.online)return {ok:false,reason:`${u.custodian} is offline, so it can't confirm the hold. Its unit stays untouchable until it reconnects.`};
  if(u.status!=='AVAILABLE')return {ok:false,reason:`That unit is ${ST_LABEL[u.status].toLowerCase()} at ${u.custodian}.`};
  u.status='RESERVED';u.reservedFor=req.code;u.version++;
  log('lease',`HQ granted ${req.code} a 48-hour hold on ${u.engine} at ${u.custodian}.`);
  return {ok:true};
}
function toast(msg,err){const t=$('#toast');t.textContent=msg;t.className='show'+(err?' err':'');clearTimeout(toast.h);toast.h=setTimeout(()=>t.className='',3800)}
function go(v){S.view=v;closeDrawer();render();window.scrollTo({top:0,behavior:'smooth'});const m=$('#main');m.classList.remove('viewin');void m.offsetWidth;m.classList.add('viewin')}
function toggleBranch(code){const x=br(code);x.online=!x.online;log(x.online?'pull':'block',`${x.code} went ${x.online?'online':'offline'}.`);render(true)}
function workAs(code){S.current=code;closeDrawer();render();toast(`Now working as ${br(code).name}.`)}
function promo(){const s=pick(SKUS);S.central.prices[s.id]-=3000;S.central.priceVersion++;
  log('pull',`HQ published price list v${S.central.priceVersion}: ${s.brand} ${s.model} now ${fmt(S.central.prices[s.id])}.`);
  toast(`Promo published. Online branches pick up v${S.central.priceVersion} on their next sync.`);render(true)}
function replay(){const L=S.central.lastBatch;if(!L.length){toast('Nothing has been sent yet. Record a sale first.',true);return}
  L.forEach(applyCentral);toast(`Resent ${L.length} event${L.length>1?'s':''}. HQ recognized each one and applied nothing twice.`);render(true)}
function resetDemo(){closeDrawer();S=makeState();render();toast('Demo reset to the opening state.')}
async function runTest(){
  if(S.testing)return;
  const A=br('MDE'),B=br('MKT'),u=S.units.find(x=>x.custodian==='MDE'&&x.status==='AVAILABLE');
  S.test=[];
  const step=(t,c='')=>{S.test.push({t,c});render(true)};
  if(!u){step('Mandaue has no available units left. Reset the demo to run the test again.','bad');return}
  S.testing=true;B.online=true;
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  step('Mandaue loses its internet connection.');A.online=false;render(true);await wait(1200);
  const si=sell(A,u,'Walk-in buyer (test)','cash',20,24);
  step(`Mandaue sells ${u.engine} for cash anyway. Invoice ${si} is saved locally and one event waits in its outbox.`);await wait(1500);
  step('Meanwhile, a Makati agent finds the same unit in the network and tries to reserve it.');await wait(1300);
  const r=tryReserve(B,u);
  step(r.ok?'Hold granted. This should never happen.':`Blocked: ${r.reason}`,r.ok?'bad':'good');await wait(1500);
  step('Mandaue reconnects and its outbox drains to HQ.');A.online=true;render(true);await wait(2400);
  step('HQ records the unit as sold once, by the branch that physically had it. Nothing to merge.','good');
  S.testing=false;render(true);
}

/* ---------- shared views ---------- */
const stBadge=u=>`<span class="st ${u.status}">${ST_LABEL[u.status]}${u.status==='RESERVED'?' for '+u.reservedFor:''}${u.status==='IN_TRANSIT'?' to '+u.dest:''}</span>`;
const feed=n=>S.central.log.slice(-n).reverse().map(l=>`<li class="${l.kind}"><time>${tm(l.at)}</time>${esc(l.text)}</li>`).join('');
const phead=(g,t,l)=>`<header class="phead"><span class="ghost" aria-hidden="true">${g}</span><h1>${t}</h1><p class="lede">${l}</p></header>`;
const floorUnits=b=>S.units.filter(u=>sellable(b,u));
function hub(){
  const cx=200,cy=200,R=150;let lines='',nodes='';
  S.branches.forEach((b,i)=>{
    const a=(i*60-90)*Math.PI/180,x=+(cx+R*Math.cos(a)).toFixed(1),y=+(cy+R*Math.sin(a)).toFixed(1);
    lines+=`<line x1="${x}" y1="${y}" x2="${cx}" y2="${cy}" class="link ${b.online?'on':'off'}"/>`;
    nodes+=`<g><rect x="${x-27}" y="${y-14}" width="54" height="28" rx="5" class="plt"/><text x="${x}" y="${y+5.5}" text-anchor="middle" class="pltx">${b.code}</text>
      ${b.outbox.length?`<circle cx="${x+27}" cy="${y-14}" r="11" class="qb"/><text x="${x+27}" y="${y-10}" text-anchor="middle" class="qbx">${b.outbox.length}</text>`:''}
      ${b.online?'':`<text x="${x}" y="${y+32}" text-anchor="middle" class="offx">offline</text>`}</g>`;
  });
  const off=S.branches.filter(b=>!b.online).length;
  return `<svg class="hub" viewBox="-10 -10 420 430" role="img" aria-label="Network map: ${6-off} of 6 branches online">
    <circle cx="200" cy="200" r="150" class="ring"/><circle cx="200" cy="200" r="92" class="ring"/>${lines}
    <g class="db"><path class="c" d="M156 176 V224 A44 13 0 0 0 244 224 V176"/><ellipse cx="200" cy="176" rx="44" ry="13"/><path class="l" d="M156 192 A44 13 0 0 0 244 192 M156 208 A44 13 0 0 0 244 208"/></g>
    <text x="200" y="266" text-anchor="middle" class="hubx">HQ</text>${nodes}</svg>`;
}
function invRows(){
  const F=S.filters,me=S.current;
  return S.units.filter(u=>(F.branch==='all'||u.custodian===F.branch||(u.status==='IN_TRANSIT'&&u.dest===F.branch))&&(F.status==='all'||u.status===F.status)&&(F.model==='all'||u.sku===F.model));
}
function invAction(u){
  const me=S.current;
  if(u.custodian===me&&u.status==='RESERVED'&&u.reservedFor!==me)return `<button class="btn small" data-act="release" data-id="${u.id}">Release to ${u.reservedFor}</button>`;
  if(u.status==='IN_TRANSIT'&&u.dest===me)return `<button class="btn small primary" data-act="receive" data-id="${u.id}">Receive</button>`;
  if(sellable(cur(),u))return `<button class="btn small primary" data-act="open" data-id="${u.id}">Sell</button>`;
  if(u.status==='AVAILABLE'&&u.custodian!==me)return `<button class="btn small" data-act="reserve" data-id="${u.id}">Reserve for ${me}</button>`;
  return '';
}

/* ---------- views ---------- */
const VIEWS={
  home:{full(){const s=SKUS[S.hero];
    return `<section class="wrap hero">
      <span class="ghost" id="hero-ghost" aria-hidden="true">${s.ghost}</span>
      <div class="hero-copy">
        <h1>Every branch.<br>One live floor.</h1>
        <p class="lede">Sell, finance and register motorcycles across the whole network, even when a branch loses its connection.</p>
        <div class="feat" id="hero-feat"></div>
      </div>
      <div class="hero-art" id="hero-art">${bike(s.kind)}</div>
      <div class="index" role="group" aria-label="Featured model">
        <button class="ix-arrow" data-act="hero-step" data-d="-1" aria-label="Previous model">${chev('up')}</button><span class="rail"></span>
        ${SKUS.map((x,i)=>`<button class="ix" data-act="hero" data-i="${i}" aria-label="${x.brand} ${x.model}" aria-current="${i===S.hero}">${i+1}</button>`).join('')}
        <span class="rail"></span><button class="ix-arrow" data-act="hero-step" data-d="1" aria-label="Next model">${chev('down')}</button>
      </div>
    </section>
    <section class="wrap"><div class="stats" id="home-stats"></div></section>
    <section class="wrap">
      <div class="shead"><h2>Choose your<br>next ride</h2><span class="tag">8 models, 4 brands</span></div>
      <div class="rides" id="rides"></div>
    </section>
    <section class="wrap">
      <div class="shead"><h2>How a sale<br>moves</h2><span class="tag">Live network map</span></div>
      <div class="flow">
        <span class="vghost l" aria-hidden="true">SYNC</span><span class="vghost r" aria-hidden="true">LIVE</span>
        <div class="calls left">${CALLS.slice(0,3).map(c=>`<div class="call"><div class="lab"><span>${c[0]}</span><i class="dots"></i>${arrow()}</div><p>${c[1]}</p></div>`).join('')}</div>
        <div id="home-hub"></div>
        <div class="calls right">${CALLS.slice(3).map(c=>`<div class="call"><div class="lab"><span>${c[0]}</span><i class="dots"></i>${arrow()}</div><p>${c[1]}</p></div>`).join('')}</div>
      </div>
    </section>`},
    live(){
      renderFeat();
      const C=S.central,on=S.branches.filter(b=>b.online).length,avail=S.units.filter(u=>u.status==='AVAILABLE').length,pend=S.branches.reduce((a,b)=>a+b.outbox.length,0);
      $('#home-stats').innerHTML=[[`${on}/6`,'Branches online',on<6],[avail,'Units on floors'],[C.sales.length,'Sales at HQ'],[pend,'Waiting to sync',pend>0]]
        .map(([v,l,a])=>`<div class="stat${a?' alert':''}"><b>${v}</b><span>${l}</span></div>`).join('');
      $('#rides').innerHTML=SKUS.map((s,i)=>{const on=i===S.hero,n=S.units.filter(u=>u.sku===s.id&&u.status==='AVAILABLE').length;
        return `<button class="ride${on?' on':''}" data-act="ride" data-i="${i}" aria-label="Feature ${s.brand} ${s.model}" aria-pressed="${on}">
          ${on?`<span class="ride-panel"><span class="lab">${s.brand}</span><span class="more">${arrow()} ${n} on floors</span><span class="ride-code">${s.code}</span></span>`:''}
          <span class="ride-art">${bike(s.kind,on)}</span>${on?'':`<span class="ride-name">${s.brand} ${s.model}</span>`}</button>`}).join('');
      $('#home-hub').innerHTML=hub();
    }},

  showroom:{full(){const b=cur(),F=S.filters;
    return `<div class="wrap">${phead('FLOOR','Showroom',`${b.name}, ${b.area}. Sell anything on your floor, even offline. For units at other branches, place a hold through HQ.`)}
      <div class="toolbar">
        <div class="tabs" role="tablist">
          <button class="tab" role="tab" data-act="tab" data-t="floor" aria-selected="${S.tab==='floor'}">Your floor <span id="floor-n"></span></button>
          <button class="tab" role="tab" data-act="tab" data-t="all" aria-selected="${S.tab==='all'}">Whole network</button>
        </div>
        ${S.tab==='all'?`<div class="filters">
          <label>Branch<select data-filter="branch"><option value="all">All branches</option>${S.branches.map(x=>`<option value="${x.code}" ${F.branch===x.code?'selected':''}>${x.name}</option>`).join('')}</select></label>
          <label>Model<select data-filter="model"><option value="all">All models</option>${SKUS.map(s=>`<option value="${s.id}" ${F.model===s.id?'selected':''}>${s.brand} ${s.model}</option>`).join('')}</select></label>
          <label>Status<select data-filter="status"><option value="all">Any status</option>${Object.entries(ST_LABEL).map(([k,v])=>`<option value="${k}" ${F.status===k?'selected':''}>${v}</option>`).join('')}</select></label>
        </div>`:''}
      </div>
      <div id="show-body"></div></div>`},
    live(){
      const b=cur(),mine=floorUnits(b);
      const fn=$('#floor-n');if(fn)fn.textContent=`(${mine.length})`;
      if(S.tab==='floor'){
        $('#show-body').innerHTML=mine.length?`<div class="cards">${mine.map(u=>{const s=sku(u.sku);return `<article class="card">
          <span class="card-ghost" aria-hidden="true">${s.code[0]}</span>
          <span class="lab">${s.brand} ${s.cat}</span><h3>${s.model}</h3>
          <div class="card-meta"><span class="plate">${u.engine}</span><span>${u.color}</span>${u.status==='RESERVED'?'<span class="st warn">Held for you</span>':''}</div>
          <div class="card-art">${bike(s.kind)}</div>
          <div class="card-foot"><button class="linkbtn" data-act="open" data-id="${u.id}">${arrow()}Sell this unit</button><span class="muted">${fmt(b.prices[u.sku])}</span></div>
        </article>`}).join('')}</div>`
        :`<div class="panel"><p class="empty">No units on your floor right now. Find one in the network and place a hold.</p><button class="btn primary" data-act="tab" data-t="all">Browse the whole network</button></div>`;
      }else{
        const rows=invRows();
        $('#show-body').innerHTML=`<p class="muted" style="margin:0 0 10px">${rows.length} units</p><div class="tbl-wrap"><table><thead><tr><th>Engine no.</th><th>Model</th><th>Chassis no.</th><th>Custodian</th><th>Status</th><th>Ver.</th><th>HQ copy</th><th></th></tr></thead><tbody>
          ${rows.map(u=>{const s=sku(u.sku);return `<tr><td><span class="plate">${u.engine}</span></td><td>${s.brand} ${s.model}</td><td class="muted">${u.chassis}</td>
          <td>${u.custodian?u.custodian+(br(u.custodian).online?'':' <span class="pend">offline</span>'):'<span class="muted">HQ logistics</span>'}</td><td>${stBadge(u)}</td><td class="num">v${u.version}</td>
          <td>${u.pending?'<span class="pend">Not yet synced</span>':'<span class="muted">Up to date</span>'}</td><td class="num">${invAction(u)}</td></tr>`}).join('')||'<tr><td colspan="8" class="empty">No units match these filters.</td></tr>'}
          </tbody></table></div>`;
      }
    }},

  financing:{full(){const c=S.credit;
    return `<div class="wrap">${phead('LOAN','Financing','The branch takes the application and HQ scores it. If the branch is offline, the application waits in the outbox and the decision arrives after it syncs.')}
    <div class="two">
      <section class="panel form"><h2>New application</h2>
        <label>Applicant name<input type="text" data-c="name" value="${esc(c.name)}" placeholder="Maria Santos" autocomplete="off"></label>
        <div class="grid2">
          <label>Monthly net income (₱)<input type="number" min="0" step="500" data-c="income" value="${c.income}"></label>
          <label>Other monthly loans (₱)<input type="number" min="0" step="500" data-c="obligations" value="${c.obligations}"></label>
          <label>Years with employer<input type="number" min="0" max="40" data-c="years" value="${c.years}"></label>
          <label>Co-maker<select data-c="comaker"><option value="yes" ${c.comaker==='yes'?'selected':''}>Yes</option><option value="no" ${c.comaker==='no'?'selected':''}>No</option></select></label>
          <label>Model<select data-c="sku">${SKUS.map(s=>`<option value="${s.id}" ${c.sku===s.id?'selected':''}>${s.brand} ${s.model}</option>`).join('')}</select></label>
          <label>Term<select data-c="term">${[12,18,24,36].map(t=>`<option value="${t}" ${c.term===t?'selected':''}>${t} months</option>`).join('')}</select></label>
        </div>
        <label>Downpayment: <output id="cdp-out">${c.dp}%</output><input type="range" min="10" max="50" step="5" data-c="dp" value="${c.dp}"></label>
        <button class="btn primary" data-act="apply">Submit to HQ</button>
      </section>
      <section class="panel"><h2>Amortization preview</h2><div id="credit-preview"></div></section>
    </div>
    <section><div class="tbl-wrap"><table><thead><tr><th>Applicant</th><th>Branch</th><th>Model</th><th>Monthly</th><th>Debt to income</th><th>Score</th><th>Decision</th></tr></thead><tbody id="credit-list"></tbody></table></div></section></div>`},
    live(){renderCreditPreview();
      $('#credit-list').innerHTML=S.apps.slice().reverse().map(a=>{const cls=a.status==='Approved'?'ok':a.status==='Declined'?'bad':a.status==='For C.I. visit'?'warn':'info';
        return `<tr><td>${esc(a.name)}</td><td>${a.branch}</td><td>${sku(a.sku).model}</td><td class="num">${fmt(a.monthly)}</td>
        <td class="num">${a.dti!=null?Math.round(a.dti*100)+'%':'–'}</td><td class="num">${a.score!=null?a.score:'–'}</td><td><span class="st ${cls}">${a.status}</span></td></tr>`}).join('')
        ||'<tr><td colspan="7" class="empty">No applications yet. Submit one above.</td></tr>';
    }},

  registration:{full(){const L=S.central.lto.slice().reverse();
    return `<div class="wrap">${phead('LTO','Registration',"HQ's registration desk. A file opens automatically when a sale reaches HQ, so sales from offline branches appear after they sync.")}
    <div class="tbl-wrap"><table><thead><tr><th>Invoice</th><th>Customer</th><th>Unit</th><th>Progress</th><th>Current step</th><th>Days open</th><th></th></tr></thead><tbody>
    ${L.map(r=>{const u=unit(r.unitId),i=S.central.lto.indexOf(r),done=r.stage>=STAGES.length-1;
      return `<tr><td>${r.si}</td><td>${esc(r.customer)}</td><td><span class="plate">${u.engine}</span></td>
      <td><div class="bar" aria-label="Step ${r.stage+1} of ${STAGES.length}">${STAGES.map((_,k)=>`<span class="${k<=r.stage?'on':''}"></span>`).join('')}</div></td>
      <td>${STAGES[r.stage]}</td><td class="num">${Math.max(0,Math.round((Date.now()-r.opened)/864e5))}</td>
      <td class="num">${done?'<span class="st ok">Complete</span>':`<button class="btn small" data-act="lto" data-i="${i}">Mark ${STAGES[r.stage+1].toLowerCase()}</button>`}</td></tr>`}).join('')}
    </tbody></table></div></div>`}},

  network:{full(){const C=S.central;
    return `<div class="wrap">${phead('SYNC','Network','Each branch writes to its own database and queues events in an outbox. HQ applies each event once, by ID. Switch branches off to see what keeps working.')}
    <div class="ctl-row">
      <button class="btn primary" data-act="test" ${S.testing?'disabled':''}>Run the double-sell test</button>
      <button class="btn" data-act="promo">Publish a promo price</button>
      <button class="btn" data-act="replay">Resend last batch</button>
    </div>
    <div class="net">
      <div>${hub()}</div>
      <div class="blist">${S.branches.map(b=>`<div class="brow${b.online?'':' off'}">
        <span class="plate">${b.code}</span>
        <div><div class="nm">${b.name}</div><div class="meta">Price list v${b.priceVersion}${b.priceVersion<C.priceVersion?' <span class="pend">behind</span>':''}</div></div>
        <span class="meta q">${b.outbox.length?`<span class="pend">${b.outbox.length} in outbox</span>`:'Outbox empty'}</span>
        <button class="switch" role="switch" aria-checked="${b.online}" aria-label="${b.name} online" data-act="toggle" data-code="${b.code}"><span></span></button>
      </div>`).join('')}</div>
    </div>
    <div class="two">
      <section class="panel"><h2>Double-sell test</h2>
        ${S.test.length?`<ol class="steps">${S.test.map(s=>`<li class="${s.c}">${esc(s.t)}</li>`).join('')}</ol>`:'<p class="empty">Runs a scripted scenario: Mandaue goes offline and sells a unit while Makati tries to grab the same one.</p>'}
      </section>
      <section class="panel"><h2>HQ inbox</h2>
        <div class="istats"><div><b>${C.processed}</b><span>Events applied</span></div><div><b>${C.dups}</b><span>Duplicates ignored</span></div><div><b>v${C.priceVersion}</b><span>Price list at HQ</span></div></div>
        <ol class="feed">${feed(8)}</ol>
      </section>
    </div></div>`}}
};

function renderFeat(){
  const el=$('#hero-feat');if(!el)return;
  const s=SKUS[S.hero],b=cur(),price=b.prices[s.id],f=finance(price,20,24);
  const here=S.units.filter(u=>u.sku===s.id&&sellable(b,u)).length,all=S.units.filter(u=>u.sku===s.id&&u.status==='AVAILABLE').length;
  el.innerHTML=`<span class="lab">${s.brand} ${s.cat}</span><div class="feat-name">${s.model}</div>
    <dl class="feat-dl"><div><dt>Price at ${b.code}</dt><dd>${fmt(price)}</dd></div><div><dt>From, 20% down</dt><dd>${fmt(f.monthly)}/mo</dd></div>
    <div><dt>On your floor</dt><dd>${here}</dd></div><div><dt>Across the network</dt><dd>${all}</dd></div></dl>
    <div class="cta"><button class="linkbtn" data-act="hero-sell">${arrow()}Sell one now</button><button class="linkbtn quiet" data-act="hero-finance">Work out a loan</button></div>`;
}
function setHero(i){
  if(S.view!=='home')return;
  S.hero=(i+SKUS.length)%SKUS.length;const s=SKUS[S.hero];
  const g=$('#hero-ghost'),a=$('#hero-art');
  g.textContent=s.ghost;a.innerHTML=bike(s.kind);
  [g,a,$('#hero-feat')].forEach(e=>{e.classList.remove('swap');void e.offsetWidth;e.classList.add('swap')});
  document.querySelectorAll('.ix').forEach(x=>x.setAttribute('aria-current',+x.dataset.i===S.hero));
  VIEWS.home.live();
}
function renderCalc(){
  const el=$('#pos-calc');if(!el)return;
  const b=cur(),u=S.drawer&&unit(S.drawer),F=S.form;if(!u)return;
  const s=sku(u.sku),price=b.prices[u.sku];
  if(F.pay==='cash'){el.innerHTML=`<dl><dt>Cash price</dt><dd class="big">${fmt(price)}</dd></dl>`;return}
  const f=finance(price,F.dp,F.term);
  el.innerHTML=`<dl><dt>Price</dt><dd>${fmt(price)}</dd><dt>Downpayment (${F.dp}%)</dt><dd>${fmt(f.dpAmt)}</dd>
    <dt>Amount financed</dt><dd>${fmt(f.fin)}</dd><dt>Add-on rate</dt><dd>${(f.rate*100).toFixed(1)}% a month</dd>
    <dt>Monthly, ${F.term} months</dt><dd class="big">${fmt(f.monthly)}</dd><dt>Total paid</dt><dd>${fmt(f.total)}</dd></dl>`;
}
function renderCreditPreview(){
  const el=$('#credit-preview');if(!el)return;
  const c=S.credit,price=cur().prices[c.sku],f=finance(price,c.dp,c.term),pre=score({...c,monthly:f.monthly});
  let rows='',bal=f.fin;const pr=f.fin/c.term,int=f.fin*f.rate;
  for(let m=1;m<=c.term;m++){bal-=pr;rows+=`<tr><td>${m}</td><td class="num">${fmt(pr)}</td><td class="num">${fmt(int)}</td><td class="num">${fmt(Math.max(0,bal))}</td></tr>`}
  el.innerHTML=`<div class="calc"><dl><dt>Unit price at ${cur().code}</dt><dd>${fmt(price)}</dd><dt>Downpayment</dt><dd>${fmt(f.dpAmt)}</dd>
    <dt>Monthly amortization</dt><dd class="big">${fmt(f.monthly)}</dd><dt>Debt to income after this loan</dt><dd>${Math.round(pre.dti*100)}%</dd>
    <dt>Branch pre-check</dt><dd>${pre.score}/100, likely ${pre.decision.toLowerCase()}</dd></dl></div>
    <div class="sched"><table><thead><tr><th>Month</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="note">Flat add-on method with illustrative rates. HQ makes the final decision.</p>`;
}

/* ---------- drawer ---------- */
function openDrawer(id){
  S.drawer=id;renderDrawer(false);
  const d=$('#drawer');d.classList.add('open');d.setAttribute('aria-hidden','false');$('#scrim').classList.add('open');
  openDrawer.ret=document.activeElement;setTimeout(()=>{const i=d.querySelector('[data-f="customer"]');i&&i.focus()},260);
}
function closeDrawer(){
  if(!S||!S.drawer)return;S.drawer=null;
  const d=$('#drawer');d.classList.remove('open');d.setAttribute('aria-hidden','true');$('#scrim').classList.remove('open');
  if(openDrawer.ret&&document.contains(openDrawer.ret))openDrawer.ret.focus();
}
function renderDrawer(live){
  const b=cur(),u=S.drawer&&unit(S.drawer);
  if(!u||!sellable(b,u)){if(live&&S.drawer){closeDrawer();toast('That unit is no longer on your floor.',true)}return}
  const s=sku(u.sku),F=S.form;
  if(!live)$('#drawer').innerHTML=`<div class="d-head"><div><span class="lab">${s.brand} ${s.cat}</span><h2 class="d-title">${s.model}</h2>
      <div class="card-meta"><span class="plate">${u.engine}</span><span>${u.color}</span></div></div>
      <button class="x" data-act="close" aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8"/></svg></button></div>
    <div class="d-art">${bike(s.kind)}</div>
    <div class="form" id="pos-form" data-pay="${F.pay}">
      <label>Customer name<input type="text" data-f="customer" value="${esc(F.customer)}" autocomplete="off" placeholder="Juan dela Cruz"></label>
      <label>Mobile number<input type="tel" data-f="mobile" value="${esc(F.mobile)}" inputmode="tel" placeholder="0917 123 4567"></label>
      <fieldset class="seg"><legend>Payment</legend>
        <label><input type="radio" name="pay" value="install" data-f="pay" ${F.pay==='install'?'checked':''}>Installment</label>
        <label><input type="radio" name="pay" value="cash" data-f="pay" ${F.pay==='cash'?'checked':''}>Cash</label></fieldset>
      <div class="inst-only grid2">
        <label>Downpayment: <output id="dp-out">${F.dp}%</output><input type="range" min="10" max="50" step="5" data-f="dp" value="${F.dp}"></label>
        <label>Term<select data-f="term">${[12,18,24,36].map(t=>`<option value="${t}" ${F.term===t?'selected':''}>${t} months</option>`).join('')}</select></label>
      </div>
      <div id="pos-calc" class="calc"></div>
      <button class="btn primary" data-act="sell">Record sale</button>
      <p class="note" id="pos-note"></p>
    </div>
    <h3 class="d-sub">Same model elsewhere</h3><div id="d-other" class="mini"></div>`;
  renderCalc();
  const behind=b.priceVersion<S.central.priceVersion;
  $('#pos-note').innerHTML=`${b.code} is using price list v${b.priceVersion}${behind?`. HQ has v${S.central.priceVersion}; it arrives when ${b.code} reconnects.`:', the latest.'} ${b.online?'':'<strong>Offline:</strong> the sale is saved here and sent to HQ later.'}`;
  const others=S.units.filter(x=>x.sku===u.sku&&x.custodian!==b.code&&x.status!=='SOLD');
  $('#d-other').innerHTML=others.length?others.map(x=>`<div class="mini-row"><span class="plate">${x.engine}</span><span class="who">${x.custodian?br(x.custodian).name:'On the road'}${x.custodian&&!br(x.custodian).online?' <span class="pend">offline</span>':''}</span>
    ${x.status==='AVAILABLE'?`<button class="btn small" data-act="reserve" data-id="${x.id}">Reserve</button>`:stBadge(x)}</div>`).join(''):`<p class="empty">No other branch has a ${s.model} in stock.</p>`;
}

/* ---------- palette ---------- */
const PAL={i:0,items:[]};
function cmds(){const b=cur();return [
  ...NAV.map(n=>({t:`Go to ${n.label}`,k:'Page',run:()=>go(n.v)})),
  ...S.branches.filter(x=>x.code!==S.current).map(x=>({t:`Work as ${x.name} (${x.code})`,k:'Branch',run:()=>workAs(x.code)})),
  {t:`Take ${b.code} ${b.online?'offline':'online'}`,k:'Network',run:()=>toggleBranch(b.code)},
  {t:'Run the double-sell test',k:'Network',run:()=>{go('network');runTest()}},
  {t:'Publish a promo price',k:'Network',run:promo},
  {t:'Resend last batch to HQ',k:'Network',run:replay},
  ...SKUS.map((s,i)=>({t:`Feature ${s.brand} ${s.model}`,k:'Model',run:()=>{S.hero=i;S.view==='home'?setHero(i):go('home')}})),
  {t:'Reset demo',k:'Demo',run:resetDemo}]}
function openPal(){$('#pal').classList.add('open');const q=$('#pal-q');q.value='';filterPal();q.focus()}
function closePal(){$('#pal').classList.remove('open')}
function filterPal(){const q=$('#pal-q').value.trim().toLowerCase();PAL.items=cmds().filter(c=>!q||(c.t+' '+c.k).toLowerCase().includes(q)).slice(0,14);PAL.i=0;drawPal()}
function drawPal(){
  $('#pal-list').innerHTML=PAL.items.map((c,i)=>`<li role="option" id="po${i}" aria-selected="${i===PAL.i}" data-act="pal-run" data-i="${i}"><span>${esc(c.t)}</span><span class="muted">${c.k}</span></li>`).join('')||'<li class="empty">No matching commands.</li>';
  $('#pal-q').setAttribute('aria-activedescendant','po'+PAL.i);const el=$('#po'+PAL.i);el&&el.scrollIntoView({block:'nearest'});
}
function runPal(i){const c=PAL.items[i];if(!c)return;closePal();c.run()}

/* ---------- chrome ---------- */
function renderChrome(){
  const L=$('#links');
  if(!L.children.length)L.innerHTML=NAV.map(n=>`<button data-act="go" data-v="${n.v}">${n.label}</button>`).join('');
  L.querySelectorAll('button').forEach(x=>x.dataset.v===S.view?x.setAttribute('aria-current','page'):x.removeAttribute('aria-current'));
  const sel=$('#as');
  if(!sel.options.length)sel.innerHTML=S.branches.map(b=>`<option value="${b.code}">${b.code} ${b.name}</option>`).join('');
  if(document.activeElement!==sel)sel.value=S.current;
  const b=cur(),c=$('#conn');c.className='conn'+(b.online?'':' off');
  c.innerHTML=`<span class="dot${b.online?'':' off'}"></span>${b.online?'Online':'Offline'}`;
  c.setAttribute('aria-label',`${b.name} is ${b.online?'online':'offline'}. Toggle connection.`);
  const n=S.branches.reduce((a,x)=>a+x.outbox.length,0);$('#ob-n').textContent=n;$('#outbox').classList.toggle('has',n>0);
  const l=S.central.log[S.central.log.length-1];
  $('#pulse').innerHTML=`<span class="dot"></span><strong>Live at HQ</strong><span class="muted">${tm(l.at)}</span><span class="txt">${esc(l.text)}</span>`;
  $('#foot').innerHTML=`<div class="wrap foot-in">
    <div><div class="logo" style="cursor:default">ARANGKADA</div><p class="muted">Dealer network console for multi-branch motorcycle sales, financing and registration.</p><p class="muted">Demo build. Prices and rates are illustrative.</p></div>
    <div><h4>Console</h4><div class="flinks">${NAV.map(x=>`<button data-act="go" data-v="${x.v}">${x.label}</button>`).join('')}</div></div>
    <div><h4>Branches</h4><div class="flinks">${S.branches.map(x=>`<button data-act="work" data-code="${x.code}"><span class="dot${x.online?'':' off'}"></span>${x.name}</button>`).join('')}</div></div>
    <div><h4>Models</h4><div class="flinks">${SKUS.slice(0,6).map((s,i)=>`<button data-act="feature" data-i="${i}">${s.brand} ${s.model}</button>`).join('')}</div></div>
  </div><div class="wrap foot-bar"><span>Press <span class="kbd">Ctrl K</span> or <span class="kbd">/</span> for quick commands</span><button data-act="reset">Reset demo</button></div>`;
}
function render(partial=false){
  renderChrome();
  const v=VIEWS[S.view];
  if(partial&&v.live)v.live();
  else{$('#main').innerHTML=v.full();v.live&&v.live()}
  if(S.drawer)renderDrawer(true);
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]');if(!t)return;
  const a=t.dataset.act,b=cur();
  if(a==='pal-bg'){if(e.target===t)closePal();return}
  if(a==='pal'){openPal();return}
  if(a==='pal-run'){runPal(+t.dataset.i);return}
  if(a==='go'){go(t.dataset.v);return}
  if(a==='work'){workAs(t.dataset.code);return}
  if(a==='feature'){S.hero=+t.dataset.i;S.view==='home'?(setHero(S.hero),window.scrollTo({top:0,behavior:'smooth'})):go('home');return}
  if(a==='toggle-cur'){toggleBranch(b.code);return}
  if(a==='toggle'){toggleBranch(t.dataset.code);return}
  if(a==='reset'){resetDemo();return}
  if(a==='hero'){setHero(+t.dataset.i);return}
  if(a==='hero-step'){setHero(S.hero+ +t.dataset.d);return}
  if(a==='ride'){setHero(+t.dataset.i);window.scrollTo({top:0,behavior:'smooth'});return}
  if(a==='hero-sell'){const s=SKUS[S.hero],u=S.units.find(x=>x.sku===s.id&&sellable(b,x));
    if(u){openDrawer(u.id);return}
    S.filters={branch:'all',status:'AVAILABLE',model:s.id};S.tab='all';go('showroom');
    toast(`No ${s.model} on your floor. Here's where it is in the network.`);return}
  if(a==='hero-finance'){S.credit.sku=SKUS[S.hero].id;go('financing');return}
  if(a==='tab'){S.tab=t.dataset.t;render();return}
  if(a==='open'){openDrawer(t.dataset.id);return}
  if(a==='close'){closeDrawer();return}
  if(a==='sell'){
    const u=S.drawer&&unit(S.drawer),F=S.form;
    if(!u||!sellable(b,u)){toast('That unit is no longer on your floor.',true);return}
    if(!F.customer.trim()){toast('Enter the customer name to issue the invoice.',true);$('[data-f="customer"]').focus();return}
    const si=sell(b,u,F.customer.trim(),F.pay,F.dp,F.term);
    F.customer='';F.mobile='';closeDrawer();render();
    toast(`Sale recorded, invoice ${si}. ${b.online?'Sending to HQ.':'Saved offline; it goes to HQ when this branch reconnects.'}`);return}
  if(a==='reserve'){const u=unit(t.dataset.id),r=tryReserve(b,u);
    toast(r.ok?`Held for ${b.code}. Ask ${u.custodian} to release it for transfer.`:r.reason,!r.ok);if(!r.ok)log('block',`Hold refused: ${r.reason}`);render(true);return}
  if(a==='release'){const u=unit(t.dataset.id);
    if(!b.online){toast('Releasing a unit hands it to HQ logistics, so this branch must be online.',true);return}
    u.status='IN_TRANSIT';u.dest=u.reservedFor;u.reservedFor=null;u.custodian=null;u.version++;u.pending=true;
    emit(b,'UnitReleasedForTransfer',{unitId:u.id,dest:u.dest});toast(`${u.engine} is on its way to ${u.dest}.`);render(true);return}
  if(a==='receive'){const u=unit(t.dataset.id);
    if(!b.online){toast('Receiving takes custody from HQ logistics, so this branch must be online.',true);return}
    u.status='AVAILABLE';u.custodian=b.code;u.dest=null;u.version++;u.pending=true;
    emit(b,'UnitReceived',{unitId:u.id});toast(`${u.engine} received. It's now on your floor.`);render(true);return}
  if(a==='apply'){const c=S.credit;
    if(!c.name.trim()){toast('Enter the applicant name.',true);return}
    if(!(c.income>0)){toast('Enter a monthly income above zero.',true);return}
    const f=finance(b.prices[c.sku],c.dp,c.term);
    const app={id:uuid7(),branch:b.code,name:c.name.trim(),income:c.income,obligations:c.obligations,years:c.years,comaker:c.comaker,sku:c.sku,dp:c.dp,term:c.term,monthly:f.monthly,status:'Waiting for sync',dti:null,score:null};
    S.apps.push(app);emit(b,'CreditApplicationSubmitted',{appId:app.id});c.name='';render();
    toast(b.online?'Submitted. HQ will score it in a moment.':'Saved offline. HQ scores it after this branch reconnects.');return}
  if(a==='lto'){const r=S.central.lto[+t.dataset.i];if(r.stage<STAGES.length-1){r.stage++;log('pull',`Registration ${r.si}: ${STAGES[r.stage].toLowerCase()}.`)}render();return}
  if(a==='test'){runTest();return}
  if(a==='promo'){promo();return}
  if(a==='replay'){replay();return}
});
function onField(e){
  const t=e.target;
  if(t.id==='pal-q'){filterPal();return}
  if(t.id==='as'){if(e.type==='change')workAs(t.value);return}
  if(t.dataset.f){const f=t.dataset.f;S.form[f]=(f==='dp'||f==='term')?+t.value:t.value;
    if(f==='pay')$('#pos-form').dataset.pay=S.form.pay;
    if(f==='dp')$('#dp-out').textContent=S.form.dp+'%';
    renderCalc();return}
  if(t.dataset.c){const c=t.dataset.c;S.credit[c]=['income','obligations','years','dp','term'].includes(c)?(+t.value||0):t.value;
    if(c==='dp')$('#cdp-out').textContent=S.credit.dp+'%';renderCreditPreview();return}
  if(t.dataset.filter){S.filters[t.dataset.filter]=t.value;VIEWS.showroom.live()}
}
document.addEventListener('input',onField);
document.addEventListener('change',onField);
document.addEventListener('keydown',e=>{
  const palOpen=$('#pal').classList.contains('open');
  const typing=/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();palOpen?closePal():openPal();return}
  if(palOpen){
    if(e.key==='Escape'){closePal();return}
    if(e.key==='ArrowDown'){e.preventDefault();PAL.i=Math.min(PAL.i+1,PAL.items.length-1);drawPal();return}
    if(e.key==='ArrowUp'){e.preventDefault();PAL.i=Math.max(PAL.i-1,0);drawPal();return}
    if(e.key==='Enter'){e.preventDefault();runPal(PAL.i);return}
    return;
  }
  if(e.key==='Escape'&&S.drawer){closeDrawer();return}
  if(typing||S.drawer)return;
  if(e.key==='/'){e.preventDefault();openPal();return}
  if(S.view==='home'&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){setHero(S.hero+(e.key==='ArrowRight'?1:-1))}
});

S=makeState();
render();
setInterval(tick,1600);
