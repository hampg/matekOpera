import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generate,adapt,rng,type Config} from './math';
const base:Config={topic:'basic',operations:['+','-','×','÷'],range:100,level:1,adaptive:true,count:10,timed:false};
test('Minden művelet, számkör és szint: egész és korlátos értékek, helyes osztás',()=>{
for(const range of [100,1000])for(const level of [1,2,3])for(const op of ['+','-','×','÷'])for(let i=0;i<1000;i++){
const t=generate({...base,range,level,operations:[op]},i,i*71+17);assert.ok(Number.isInteger(t.answer)&&t.answer>=0&&t.answer<=range);
if(t.kind==='match')continue;
if(t.variant==='multi'){const nums=t.equation.match(/\d+/g)!.map(Number);assert.equal((nums[0]+nums[1])*nums[2],t.answer);continue;}
const nums=t.equation.match(/\d+/g)!.map(Number);nums.forEach(n=>assert.ok(n<=range));
if(t.remainder!==undefined){assert.ok(t.remainder>=0&&t.remainder<nums[1]);assert.equal(t.answer*nums[1]+t.remainder,nums[0]);}
else if(t.kind==='missing'){assert.equal(op==='+'?nums[0]+t.answer:op==='-'?nums[0]-t.answer:nums[0]*t.answer,nums[1]);}
else assert.equal(op==='+'?nums[0]+nums[1]:op==='-'?nums[0]-nums[1]:nums[0]*nums[1],t.answer);
assert.equal(t.hints.length,3);
}});
test('Geometriai érvényesség, kerület és terület',()=>{for(let i=0;i<2000;i++){
const t=generate({...base,topic:'geometry'},i,i*19);const a=t.a!,b=t.b!,c=t.c!;assert.ok(Number.isInteger(t.answer));if(t.unit==='m')assert.ok(!t.equation.includes('cm'));if(t.variant==='vertices'){assert.equal(t.answer,t.shape==='triangle'?3:4);continue;}if(t.variant==='side'){assert.equal(t.answer,a);continue;}if(t.variant==='compare'){assert.ok(t.answer>0);continue;}if(t.kind==='match'){assert.equal(t.pairs!.length,3);continue;}
if(t.shape==='triangle'){assert.ok(a+b>c&&a+c>b&&b+c>a);assert.equal(a*a+b*b,c*c);assert.equal(t.answer,t.area?a*b/2:a+b+c);}
else assert.equal(t.answer,t.area?a*b:2*(a+b));assert.ok(t.hints[2].includes(String(t.answer)));
}});
test('7, 8, 9 szorzótáblák és célzott ismétlés',()=>{let repeats=0;for(let i=0;i<1000;i++){const t=generate({...base,topic:'tables'},i,i,['9×8']);assert.ok(t.fact&&/^[789]×/.test(t.fact));if(t.fact==='9×8')repeats++;}assert.ok(repeats>400);});
test('Nehézség csak nyolc tapasztalat után változik, segítség számít',()=>{const good={correct:true,attempts:1,hints:0};assert.equal(adapt(1,Array(7).fill(good)),1);assert.equal(adapt(1,Array(8).fill(good)),2);assert.equal(adapt(2,Array(8).fill({...good,hints:1})),1);assert.equal(adapt(3,Array(8).fill(good)),3);});
test('Rögzített maghoz rögzített feladatok, matematikai részmegoldások',()=>{assert.deepEqual(generate(base,3,42),generate(base,3,42));assert.equal(rng(42)(),rng(42)());for(let i=0;i<1000;i++){const t=generate({...base,topic:'tables'},i,i*7);if(t.kind!=='missing'&&t.kind!=='match'){const [b,a]=t.fact!.split('×').map(Number);assert.equal(5*a+(b-5)*a,t.answer);assert.ok(t.hints[2].includes(String(t.answer)));}}});
test('Párosítások témához és művelethez igazodnak, egyértelműek és változatosak',()=>{
 for(const topic of ['basic','tables','geometry'] as const)for(const level of [1,2,3]){
  const sets=new Set<string>(),orders=new Set<string>();
  for(let seed=1;seed<=300;seed++){
   const t=generate({...base,topic,level},3,seed*7919);
   assert.equal(t.kind,'match');assert.equal(t.pairs!.length,3);
   assert.equal(new Set(t.pairs!.map(p=>p[1])).size,3);
   assert.deepEqual([...t.pairOptions!].sort((a,b)=>a-b),t.pairs!.map(p=>p[1]).sort((a,b)=>a-b));
   sets.add(JSON.stringify(t.pairs));orders.add(t.pairOptions!.map(n=>t.pairs!.findIndex(p=>p[1]===n)).join(','));
   for(const [label,value]of t.pairs!){
    assert.ok(Number.isInteger(value)&&value>=0);
    const nums=label.match(/\d+/g)!.map(Number);
    if(topic==='geometry'){
     const area=label.includes('T =');
     const expected=label.startsWith('Négyzet')?(area?nums[0]**2:4*nums[0]):label.startsWith('Téglalap')?(area?nums[0]*nums[1]:2*(nums[0]+nums[1])):area?nums[0]*nums[1]/2:nums.reduce((a,b)=>a+b,0);
     assert.equal(value,expected);
    }else{
     if(topic==='tables')assert.ok([7,8,9].includes(nums[0]));
     const expected=label.includes('+')?nums[0]+nums[1]:label.includes('−')?nums[0]-nums[1]:label.includes('×')?nums[0]*nums[1]:nums[0]/nums[1];
     assert.equal(value,expected);if(topic==='basic'){assert.ok(value<=base.range);nums.forEach(n=>assert.ok(n<=base.range));}
    }
    assert.ok(t.hints[2].includes(String(value)));
   }
   assert.deepEqual(t,generate({...base,topic,level},3,seed*7919));
  }
  assert.ok(sets.size>=80,`${topic}: csak ${sets.size} különböző feladatsor`);assert.equal(orders.size,6,`${topic}, ${level}: ${orders.size} sorrend`);
 }
 for(const op of ['+','-','×','÷'])for(let seed=1;seed<=300;seed++){
  const t=generate({...base,operations:[op]},3,seed*7919);
  for(const [label]of t.pairs!)assert.ok(label.includes(op==='-'?'−':op==='÷'?':':op));
 }
});
