/* ---- Part A: explicit DFA, regex, classifier (case-sensitive STA/A; letters accept a-z and A-Z) ---- */
function makeDFA(pat){const n=pat.length,T={};for(let i=0;i<n;i++)T['q'+i]=[[pat[i],'q'+(i+1)]];T['q'+n]=[];
const m=(c,ch)=>c==='L'?/^[A-Za-z]$/.test(ch):c==='D'?/^[0-9]$/.test(ch):c===ch;
return{pat,T,n,accept:'q'+n,run(s){let st='q0',path=[],fail=-1;for(let i=0;i<s.length;i++){const e=T[st].find(t=>m(t[0],s[i])),to=e?e[1]:'dead';path.push({ch:s[i],from:st,to});if(to==='dead'){fail=i;st=to;break}st=to}return{accepted:st===this.accept,path,fail}}}}
const DFA={st:makeDFA(['S','T','A','L','L','D','D','D']),an:makeDFA(['A','D','D'])},RX={st:/^STA[A-Za-z]{2}[0-9]{3}$/,an:/^A[0-9]{2}$/};
function why(k,s,r){if(!s)return'Field is empty';if(r.accepted)return'Valid format';const i=r.fail<0?s.length:r.fail;
if(k==='st'){if(r.fail<0)return i<5?'Station code is incomplete: needs STA, 2 letters and 3 digits':'Station code needs exactly 3 digits at the end';if(i<3)return'Station code must start with STA (uppercase)';if(i<5)return'Station code must have exactly 2 letters after STA';if(i<8)return'Station code must end with exactly 3 digits';return'Station code has extra characters after the 3 digits'}
if(r.fail<0)return'Anomaly code is incomplete: needs A and 2 digits';return i<1?'Anomaly code must start with A (uppercase)':i<3?'Anomaly code must be A followed by exactly 2 digits':'Anomaly code has extra characters after the 2 digits'}
function check(k,s){const d=DFA[k].run(s),r=RX[k].test(s);return{dfa:d.accepted,rx:r,agree:d.accepted===r,path:d.path,msg:why(k,s,d)}}
const CODE={A01:'Safety',A02:'Technical',A03:'Crowd',A04:'Cleanliness',A05:'Medical'},PRI=['Medical','Safety','Technical','Crowd','Cleanliness'],RANK={Critical:0,High:1,Medium:2,Low:3};
const KW={Medical:['injur','medical','faint','unconscious','ambulance'],Safety:['fire','accident','danger','smoke'],Technical:['breakdown','lift','machine','escalator'],Crowd:['crowd','rush','overcrowd'],Cleanliness:['dirty','garbage','waste','spill']};
/* rule: final category = highest priority among {code category} + keyword categories. Unknown code stays Unmapped. */
function classify(an,desc){const d=(desc||'').toLowerCase(),hits=PRI.filter(c=>KW[c].some(w=>d.includes(w))),code=CODE[an]||null;
if(!code)return{cat:'Unmapped',code:null,note:'Unknown anomaly code '+an+': left Unmapped and sent to the correction queue'};
const cat=PRI.find(c=>c===code||hits.includes(c));const note=hits.some(h=>h!==code)?`Conflict resolved by priority rule: code says ${code}, text says ${hits.join(' + ')}, so ${cat} wins`:'';return{cat,code,note}}
const prio=(c,u)=>c==='Medical'||u==='Critical'?'Critical':c==='Safety'||u==='High'?'High':u==='Low'?'Low':'Medium';
