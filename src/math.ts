export type Topic='basic'|'tables'|'geometry';
export type Kind='input'|'choice'|'missing'|'match'|'repair'|'interactive';
export type Config={topic:Topic;operations:string[];range:number;level:number;adaptive:boolean;count:number;timed:boolean};
export type Task={id:number;kind:Kind;prompt:string;answer:number;remainder?:number;equation:string;hints:string[];options:number[];fact?:string;shape?:'square'|'rectangle'|'triangle';a?:number;b?:number;c?:number;area?:boolean;pairOptions?:number[];pairs?:[string,number][];wrong?:number;unit?:string;hideA?:boolean;variant?:string};
export function rng(seed:number){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
export function adapt(level:number,history:{correct:boolean;attempts:number;hints:number}[]){const h=history.slice(-8);if(h.length<8)return level;const clean=h.filter(x=>x.correct&&x.attempts===1&&x.hints===0).length;return clean>=7?Math.min(3,level+1):clean<=3?Math.max(1,level-1):level;}
function shuffle<T>(values:T[], random:()=>number):T[]{
 const result=[...values];
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
function matching(config:Config,id:number,random:()=>number):Task{
 const int=(a:number,b:number)=>a+Math.floor(random()*(b-a+1));
 const limit=config.level===1?Math.min(config.range,20):config.level===2?Math.min(config.range,100):config.range;
 const pool:[string,number][]=[];
 let unit:string|undefined,equation='Jelölj ki egy műveletet, majd az eredményét.';
 let lead='Minden művelethez egy eredmény tartozik.',step='Számold ki külön-külön a műveleteket.';
 if(config.topic==='geometry'){
  unit=random()<.5?'cm':'m';const area=random()<.5,max=config.level===1?6:config.level===2?10:15;
  const symbol=area?'T':'K';
  for(let a=2;a<=max;a++){
   pool.push([`Négyzet: oldal ${a} ${unit}, ${symbol} = ?`,area?a*a:4*a]);
   for(let b=2;b<=max;b++)pool.push([`Téglalap: oldalak ${a} és ${b} ${unit}, ${symbol} = ?`,area?a*b:2*(a+b)]);
  }
  for(let k=1;k<=Math.floor(max/3)+1;k++)pool.push([area?`Háromszög: alap ${3*k}, magasság ${4*k} ${unit}, T = ?`:`Háromszög: oldalak ${3*k}, ${4*k}, ${5*k} ${unit}, K = ?`,area?6*k*k:12*k]);
  equation=`Minden eredmény ${unit}${area?'²':''}-ben értendő. Kijelöléssel vagy húzással párosíthatsz.`;
  lead=area?'A terület a lefedett felület nagyságát méri.':'A kerület az összes oldalhossz összege.';
  step=area?'Négyzet: oldal × oldal. Téglalap: a × b. Háromszög: alap × magasság : 2.':'Négyzet: 4 × oldal. Téglalap: 2 × (a + b). Háromszög: a + b + c.';
 }else if(config.topic==='tables'){
  for(const a of [7,8,9])for(let b=1;b<=10;b++)pool.push([`${a} × ${b}`,a*b]);
  step='Bontsd a szorzót 5 + 2, 5 + 3 vagy 10 − 1 alakban, ha ez segít.';
 }else{
  const ops=config.operations.length?config.operations:['+'];
  for(let i=0;i<120;i++){
   const op=ops[i%ops.length];let a=int(0,limit),b=0,value=0,label='';
   if(op==='+'){b=int(0,limit-a);value=a+b;label=`${a} + ${b}`;}
   else if(op==='-'){b=int(0,a);value=a-b;label=`${a} − ${b}`;}
   else{b=int(2,config.level===1?5:config.level===2?10:25);a=int(0,Math.floor(limit/b));value=op==='÷'?a:a*b;label=op==='÷'?`${a*b} : ${b}`:`${a} × ${b}`;}
   pool.push([label,value]);
  }
 }
 const pairs:[string,number][]=[];
 for(const pair of shuffle(pool,random)){
  if(!pairs.some(p=>p[1]===pair[1]))pairs.push(pair);
  if(pairs.length===3)break;
 }
 const pairOptions=shuffle(pairs.map(p=>p[1]),random);
 return {id,kind:'match',prompt:config.topic==='geometry'?'Párosítsd az alakzatokat az eredményekkel!':'Párosítsd a műveleteket az eredményekkel!',answer:pairs[0][1],equation,hints:[lead,step,pairs.map(([label,value])=>`${label.replace(' = ?','')} → ${value}${unit?` ${unit}${equation.includes('²')?'²':''}`:''}`).join('; ')],options:[],pairs,pairOptions,unit,fact:config.topic==='tables'?pairs[0][0].replaceAll(' ',''):undefined};
}
export function generate(config:Config,id:number,seed:number,weak:string[]=[]):Task{
 const r=rng(seed),int=(a:number,b:number)=>a+Math.floor(r()*(b-a+1));let kind:Kind=(['input','choice','missing','match','repair','interactive'] as Kind[])[id%6];
 if(kind==='match')return matching(config,id,r);
 let answer=0,remainder:number|undefined,equation='',prompt='',hints:string[]=[],fact:string|undefined,extra:Partial<Task>={};
 const limit=config.level===1?Math.min(config.range,20):config.level===2?Math.min(config.range,100):config.range;
 if(config.topic==='geometry'){
 const shape=(['square','rectangle','triangle'] as const)[(id+Math.floor(id/6))%3];let a=int(2,12),b=int(2,10),c=0;
 if(shape==='square')b=a;if(shape==='triangle'){const k=int(1,4);a=3*k;b=4*k;c=5*k;}
 const area=id%2===0;answer=area?(shape==='triangle'?a*b/2:a*b):(shape==='triangle'?a+b+c:2*(a+b));
 const name={square:'négyzet',rectangle:'téglalap',triangle:'háromszög'}[shape];
 prompt=`Mennyi a ${name} ${area?'területe':'kerülete'}?`;equation=shape==='triangle'?`alap: ${a} cm · magasság: ${b} cm${area?'':` · harmadik oldal: ${c} cm`}`:`oldalak: ${a} cm és ${b} cm`;
 hints=area?[shape==='triangle'?'A háromszög egy ugyanilyen alapú és magasságú téglalap fele.':'A terület az egységnégyzetek száma.',`Az alap és a magasság szorzata: ${a} × ${b} = ${a*b}.`,shape==='triangle'?`T = ${a} × ${b} : 2 = ${answer} cm².`:`T = ${a} × ${b} = ${answer} cm².`]:['A kerület az összes oldalhossz összege.',shape==='triangle'?`Add össze az oldalakat: ${a} + ${b} + ${c}.`:`Két ${a} cm-es és két ${b} cm-es oldal van.`,shape==='triangle'?`K = ${a} + ${b} + ${c} = ${answer} cm.`:`K = 2 × (${a} + ${b}) = ${answer} cm.`];
 const unit=id%4===0?'m':'cm';equation=equation.replaceAll('cm',unit);hints=hints.map(h=>h.replaceAll('cm',unit));extra={shape,a,b,c,area,unit};
 if(kind==='missing'&&shape!=='triangle'){
 const total=answer;answer=a;prompt=`Mekkora a ${name} hiányzó oldala?`;equation=`${area?'Terület':'Kerület'}: ${total} ${unit}${area?'²':''}${shape==='rectangle'?` · másik oldal: ${b} ${unit}`:''}`;
 hints=[area?'A területből visszafelé következtess az oldalra.':'A kerület az összes oldal összege.',shape==='square'?`${area?'Keresd azt a számot, amely önmagával szorozva a területet adja.':`Oszd a kerületet néggyel: ${total} : 4.`}`:area?`${total} : ${b} adja a hiányzó oldalt.`:`${total} : 2 − ${b} adja a hiányzó oldalt.`,`A hiányzó oldal ${answer} ${unit}.`];extra.hideA=true;extra.area=false;extra.variant='side';
 }else if(kind==='missing')kind='input';
 if(kind==='choice'&&id%12===7){prompt=`Hány csúcsa van a ${name}nek?`.replace('négyzetnek','négyzetnek').replace('téglalapnek','téglalapnak').replace('háromszögnek','háromszögnek');answer=shape==='triangle'?3:4;equation='Számold meg a sarkokat az ábrán!';hints=['Az oldalak találkozásánál van egy csúcs.','Haladj körbe az alakzat mentén, minden sarkot egyszer számolj.',`A csúcsok száma ${answer}.`];extra.variant='vertices';}
 if(kind==='input'&&id%12===6&&shape!=='triangle'){prompt='Hány négyzetcentiméterrel nagyobb a második téglalap területe?';equation=`Első: ${a} × ${b} cm · második: ${a+1} × ${b} cm`;answer=b;hints=['Számold ki a két területet, majd vond ki a kisebbet a nagyobból.',`Első: ${a*b} cm². Második: ${(a+1)*b} cm².`,`${(a+1)*b} − ${a*b} = ${b} cm².`];extra={variant:'compare',unit:'cm',area:true};}
 
 }else{
 const op=config.topic==='tables'?'×':(config.operations.length?config.operations:['+'])[int(0,Math.max(0,config.operations.length-1))];let a=0,b=0;
 if(op==='×'||op==='÷'){
 b=config.topic==='tables'?int(7,9):int(2,config.level===1?5:config.level===2?10:25);a=int(0,Math.min(config.topic==='tables'?10:limit,Math.floor(limit/b)));
 if(config.topic==='tables'&&weak.length&&r()<.55){const f=weak[int(0,weak.length-1)].split('×').map(Number);if(f.length===2){b=f[0];a=f[1];}}
 if(op==='×'){answer=a*b;fact=`${b}×${a}`;equation=`${b} × ${a}`;hints=[`Bontsd fel a ${b}-et 5 + ${b-5} alakban.`,`${b} × ${a} = 5 × ${a} + ${b-5} × ${a}.`,`${5*a} + ${(b-5)*a} = ${answer}.`];if(b<5)hints=[`A szorzás ismételt összeadás.`,`${b} csoportban egyenként ${a} elem van.`,`${b} × ${a} = ${answer}.`];}
 else{const q=a;remainder=config.level===1?0:int(0,Math.min(b-1,limit-q*b));a=q*b+remainder;answer=q;equation=`${a} : ${b}`;hints=['Keresd az osztó legnagyobb többszörösét, amely nem nagyobb az osztandónál.',`${b} × ${q} = ${b*q}; ${a} − ${b*q} = ${remainder}.`,`${a} : ${b} = ${q}, maradék ${remainder}. Ellenőrzés: ${q} × ${b} + ${remainder} = ${a}.`];}
 }else{a=int(0,limit);b=int(0,op==='+'?limit-a:a);answer=op==='+'?a+b:a-b;equation=`${a} ${op==='-'?'−':'+'} ${b}`;const tens=Math.floor(b/10)*10,ones=b%10;hints=[op==='+'?'Bontsd a második számot tízesekre és egyesekre.':'Előbb a tízeseket, majd az egyeseket vond ki.',`${a} ${op} ${tens} = ${op==='+'?a+tens:a-tens}.`,`${a} ${op} ${tens} ${op} ${ones} = ${answer}.`];}
 prompt='Számold ki az eredményt!';
 if(config.level===3&&id%6===0&&op!=='÷'){
 const x=int(1,Math.floor(config.range/4)),y=int(1,Math.floor(config.range/4)),z=int(1,2);answer=(x+y)*z;equation=`(${x} + ${y}) × ${z}`;hints=['Először mindig a zárójelben lévő műveletet végezd el.',`${x} + ${y} = ${x+y}.`,`${x+y} × ${z} = ${answer}.`];extra.variant='multi';
 }
 
 if(kind==='interactive')kind='input';
 if(kind==='missing'&&remainder===undefined){const known=answer;answer=b;equation=op==='×'?`${a} × □ = ${known}`:`${a} ${op==='-'?'−':op} □ = ${known}`;prompt='Melyik szám hiányzik?';hints=['Gondolkodj a fordított művelettel.',op==='×'?(a===0?'A szorzat nulla. Több megoldás is lehet; most válasszuk az eredeti tényezőt.':`${known} : ${a} adja a hiányzó tényezőt.`):`${op==='+'?known:a} − ${op==='+'?a:known} adja a hiányzó számot.`,`A hiányzó szám ${answer}.`];if(op==='×'&&a===0){kind='input';answer=known;equation=`${a} × ${b}`;hints=['Nullaszor bármennyi nulla.','Nincs egyetlen csoport sem.',`0 × ${b} = 0.`];}}

 }
 if(remainder!==undefined&&kind==='missing')kind='input';
 if(kind==='repair'){extra.wrong=answer+1;prompt='Valaki eltévesztette. Írd be a helyes eredményt!';}
 const options=[answer,...[1,2,3].map(n=>answer+n*(answer%2===0?2:3))].sort(()=>r()-.5);
 return {id,kind,prompt,answer,remainder,equation,hints,options,fact,...extra};
}
