import fs from "fs";
const MORSE={A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",0:"-----",1:".----",2:"..---",3:"...--",4:"....-",5:".....",6:"-....",7:"--...",8:"---..",9:"----."};
export function morseWav(text,{wpm=15,freq=700,amp=0.3,noise=0,sr=48000,lead=1.0,tail=1.5,jitter=0,seed=1}={}){
  let s=seed; const rnd=()=>{s=(s*1664525+1013904223)>>>0; return s/4294967296;};
  const dit=1.2/wpm; const segs=[]; // [on, dur]
  segs.push([0,lead]);
  const words=text.toUpperCase().split(" ");
  words.forEach((w,wi)=>{ [...w].forEach((c,ci)=>{ [...MORSE[c]].forEach((sym,si)=>{ const j=1+(rnd()-.5)*2*jitter; segs.push([1,(sym==="."?dit:3*dit)*j]); if(si<MORSE[c].length-1) segs.push([0,dit*(1+(rnd()-.5)*2*jitter)]); }); if(ci<w.length-1) segs.push([0,3*dit]); }); if(wi<words.length-1) segs.push([0,7*dit]); });
  segs.push([0,tail]);
  const total=Math.round(segs.reduce((a,b)=>a+b[1],0)*sr); const out=new Int16Array(total); let pos=0,ph=0;
  for(const [on,d] of segs){ const n=Math.round(d*sr); for(let i=0;i<n;i++){ let v=0; if(on){ const t=i/sr; const env=Math.min(1,i/(0.004*sr),(n-i)/(0.004*sr)); v=Math.sin(2*Math.PI*freq*(pos+i)/sr)*amp*env; } v+= (rnd()-.5)*2*noise; out[pos+i]=Math.max(-1,Math.min(1,v))*32767; } pos+=n; }
  const buf=Buffer.alloc(44+out.length*2); buf.write("RIFF",0); buf.writeUInt32LE(36+out.length*2,4); buf.write("WAVEfmt ",8); buf.writeUInt32LE(16,16); buf.writeUInt16LE(1,20); buf.writeUInt16LE(1,22); buf.writeUInt32LE(sr,24); buf.writeUInt32LE(sr*2,28); buf.writeUInt16LE(2,32); buf.writeUInt16LE(16,34); buf.write("data",36); buf.writeUInt32LE(out.length*2,40); Buffer.from(out.buffer).copy(buf,44);
  return {buf,seconds:total/sr};
}
