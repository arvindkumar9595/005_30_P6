/* ---- Part B: routing table, handlers, dispatch ---- */
const RT={EA:'East',EB:'East',ES:'East',WE:'West',WA:'West',WS:'West',CE:'Central',CN:'Central',CT:'Central'};
const ZI={East:{room:'East Control Room',team:'Team Red',depot:'Depot E1'},West:{room:'West Control Room',team:'Team Blue',depot:'Depot W1'},Central:{room:'Central Control Room',team:'Team Green',depot:'Depot C1'}};
const ZC={East:'var(--E)',West:'var(--W)',Central:'var(--C)',Emergency:'var(--M)'};
const H=[];let hid=1;[['East',['Asha Rao','Dev Menon','Iqbal Shaikh']],['West',['Neha Joshi','Sam Fernandes','Priya Nair']],['Central',['Karan Shah','Lata Iyer','Omar Khan']]].forEach(([z,ns])=>ns.forEach((n,i)=>H.push({id:hid++,name:n,zone:z,role:i?'Backup':'Primary',cap:i?2:3,load:0,on:true})));
H.push({id:hid++,name:'Dr. Meera Das',zone:'Emergency',role:'Emergency lead',cap:2,load:0,on:true},{id:hid++,name:'Kabir Sen',zone:'Emergency',role:'Paramedic',cap:2,load:0,on:true});
let R=[],Q=[],LOG=[],seq=0,lf='All';
const free=z=>H.filter(h=>h.zone===z&&h.on&&h.load<h.cap),log=(r,dec,why,esc,ov)=>LOG.unshift({t:Date.now(),id:r.id,dec,why,esc,ov});
function assign(r,h,dec,why,esc,ov){h.load++;r.hid=h.id;r.status='Assigned';r.route=dec;r.updated=Date.now();Q=Q.filter(x=>x!==r);log(r,dec,why,esc,ov)}
function hold(r,kind,why,corr,retry,ov){r.corr=corr;r.route=kind;r.qwhy=why;if(!Q.includes(r))Q.push(r);if(!retry)log(r,kind,why,false,ov)}
function dispatch(r,retry){if(r.hid||r.status!=='Pending')return;const key=r.st.slice(3,5).toUpperCase();let z,ov=false;
if(r.cat==='Medical'){z='Emergency';ov=true}else if(r.cat==='Unmapped')return hold(r,'Correction queue','Unknown anomaly code '+r.an+', needs correction',true,retry);
else if(!RT[key])return hold(r,'Correction queue','Unknown routing key '+key+', sent to central fallback queue',true,retry);else z=RT[key];
r.zone=z;let f=free(z);if(f.length){const h=f[0];return assign(r,h,ov?'Priority override: emergency line':h.role==='Primary'?'Primary handler':'Backup handler',ov?'Medical always goes to the emergency line':h.role==='Primary'?'Primary available':'Primary unavailable or full, backup used',false,ov)}
if(!ov){f=free('Central');if(z!=='Central'&&f.length)return assign(r,f[0],'Escalated to Central Control',z+' handlers full or off duty',true,false)}
hold(r,'Waiting queue',ov?'Emergency line full, priority override goes first':'All '+z+' handlers busy, no escalation capacity',false,retry,ov)}
const order=(a,b)=>RANK[a.pri]-RANK[b.pri]||a.created-b.created||a.id.localeCompare(b.id);
const drain=()=>[...Q].filter(r=>!r.corr).sort(order).forEach(r=>dispatch(r,true));
function submit(f,ts=Date.now()){const s=check('st',f.st),a=check('an',f.an);if(!s.dfa)return{error:s.msg};if(!a.dfa)return{error:a.msg};
const c=classify(f.an,f.ds),id='MSA-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+String(++seq).padStart(4,'0');
const r={id,...f,cat:c.cat,codeCat:c.code,note:c.note,pri:prio(c.cat,f.ur),zone:null,status:'Pending',hid:null,created:ts,updated:ts};R.push(r);dispatch(r);return{r}}
const NEXT={Pending:'Assigned','Assigned':'In Progress','In Progress':'Resolved'};
function setStatus(r,s,ts){if(NEXT[r.status]!==s||!r.hid)return false;r.status=s;r.updated=ts||Date.now();if(s==='Resolved'){r.resolvedAt=r.updated;H.find(h=>h.id===r.hid).load--;drain()}return true}
