'use strict';
(() => {
 const $=id=>document.getElementById(id), all=s=>[...document.querySelectorAll(s)];
 const theatre=$('theatre'),journey=$('journey'),stage=document.querySelector('.stage'),movie=document.querySelector('.cinematic'),toggle=$('motion-toggle'),fields=all('#record .field');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let cinema=false,simple=false,pending=false,w=0,h=0,mobile=false,start=0,travel=1;
 const clamp=x=>Math.max(0,Math.min(1,x)), mix=(a,b,t)=>a+(b-a)*t;
 const ease=t=>{t=clamp(t);return t*t*(3-2*t)}, ramp=(p,a,b)=>ease((p-a)/(b-a));
 function keys(p,frames){let a=frames[0],b=frames.at(-1);for(let i=1;i<frames.length;i++)if(p<=frames[i][0]){a=frames[i-1];b=frames[i];break}return a.slice(1).map((v,i)=>mix(v,b[i+1],ramp(p,a[0],b[0])))}
 const move=(el,x,y,s=1)=>el.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${s.toFixed(4)})`;
 const opacity=(selector,v)=>all(selector).forEach(el=>el.style.opacity=clamp(v));
 const colour=(a,b,t)=>`rgb(${a.map((v,i)=>Math.round(mix(v,b[i],t))).join(' ')})`;
 function draw(){
  pending=false;if(!cinema)return;
  const p=clamp((scrollY-start)/travel);document.body.dataset.progress=p.toFixed(4);
  // Coordinates are in the theatre, shared by the site, the persistent dossier and its fields.
  const worldW=mobile?600:1000,worldH=mobile?820:620;
  const local=mobile?[44,490,510,260]:[80,370,340,190];
  const initialS=mobile?w*.58/worldW:w*.44/worldW;
  const initial=[(w-worldW*initialS)/2,h*.33,initialS];
  const zoomS=mobile?w*.87/local[2]:Math.min(w*.00122,2);
  const zoom=[w*(mobile?.065:.20)-local[0]*zoomS,h*.40-local[1]*zoomS,zoomS];
  const retreat=[w*(mobile?.20:.58),h*(mobile?.42:.12),mobile?.34:.49];
  const cam=keys(p,[[0,...initial],[.055,...initial],[.20,...zoom],[.25,...zoom],[.43,...retreat],[1,...retreat]]);
  move($('web-world'),...cam);$('web-world').style.opacity=1-ramp(p,.32,.49);
  $('web-world').style.filter=`blur(${2*ramp(p,.30,.47)}px)`;
  $('web-world').style.boxShadow=`0 ${mix(16,60,ramp(p,0,.2))}px ${mix(35,140,ramp(p,0,.2))}px rgb(49 35 18 / .16)`;
  const recordCam=p>.25?zoom:cam;
  const attached=[recordCam[0]+local[0]*recordCam[2],recordCam[1]+local[1]*recordCam[2],local[2]*recordCam[2],local[3]*recordCam[2]];
  const extracted=mobile?[w*.10,h*.34,w*.80,h*.40]:[w*.22,h*.34,w*.55,h*.42];
  const qualified=mobile?[w*.08,h*.29,w*.84,h*.55]:[w*.27,h*.31,w*.46,h*.43];
  const crm=mobile?[w*.08,h*.29,w*.84,h*.55]:[w*.18,h*.34,w*.64,h*.39];
  const free=mobile?[w*.10,h*.30,w*.80,h*.52]:[w*.14,h*.30,w*.72,h*.44];
  const posed=keys(p,[[0,...extracted],[.45,...extracted],[.57,...qualified],[.62,...qualified],[.69,...crm],[.73,...crm],[.82,...free],[1,...free]]);
  const detach=ramp(p,.25,.43), plate=attached.map((v,i)=>mix(v,posed[i],detach));
  const [x,y,cw,ch]=plate;
  const surface=$('record-surface');surface.style.width=cw+'px';surface.style.height=ch+'px';move(surface,x,y);
  surface.style.opacity=1-ramp(p,.745,.79);
  surface.style.boxShadow=`0 ${mix(12,40,detach)}px ${mix(26,85,detach)}px rgb(22 32 51 / .20)`;
  const enrich=ramp(p,.47,.57),liberate=ramp(p,.73,.82),assemble=ramp(p,.84,.94);
  const textDark=p<.768?0:1,textColour=colour([255,255,255],[22,32,51],textDark);
  const fieldScale=mix(recordCam[2],mobile?1:1.20,detach);
  fields.forEach((el,i)=>{
   const rawLocal=mobile?[[28,62],[28,144],[28,190],[28,230]][i]:[[25,55],[25,120],[25,145],[175,145]][i];
   const ax=recordCam[0]+(local[0]+rawLocal[0])*recordCam[2],ay=recordCam[1]+(local[1]+rawLocal[1])*recordCam[2];
   const pad=mobile?25:40;
   const simplePos=mobile?[x+pad,y+ch*(i===0?.27:.57)]:[x+pad+(i===1?cw*.49:0),y+ch*.40];
   const richPos=mobile?[x+pad,y+ch*(.19+i*.20)]:[x+pad+(i%2?cw*.51:0),y+ch*(i<2?.24:.62)];
   let fx=mix(ax,mix(simplePos[0],richPos[0],enrich),detach),fy=mix(ay,mix(simplePos[1],richPos[1],enrich),detach);
   if(!mobile&&i===1&&p<.43){
    const firstX=mix(recordCam[0]+(local[0]+25)*recordCam[2],x+pad,detach);
    const firstY=mix(recordCam[1]+(local[1]+55)*recordCam[2],y+ch*.40,detach);
    fx=firstX+cw*.49*ramp(p,.25,.34);fy=firstY+65*recordCam[2]*(1-ramp(p,.34,.43));
   }
   const loose=mobile?[w*[.13,.20,.13,.20][i],h*[.32,.44,.56,.68][i]]:[w*[.12,.59,.12,.67][i],h*[.34,.34,.68,.68][i]];
   fx=mix(fx,loose[0],liberate);fy=mix(fy,loose[1],liberate);
   const final=mobile?[w*.135,h*(.40+i*.10)]:[w*[.115,.345,.54,.72][i],h*.54];
   fx=mix(fx,final[0],mobile?assemble:ramp(p,.84,.89));fy=mix(fy,final[1],mobile?assemble:ramp(p,.89,.94));
   const s=mix(fieldScale,1,liberate);
   move(el,fx,fy,s);el.style.color=textColour;el.style.opacity=i>1?ramp(p,.51,.57):1;
   el.querySelector('dt').style.color=colour([193,200,212],[85,97,115],textDark);
   el.style.setProperty('--rule',String(.35*liberate*(1-assemble)));
  });
  const id=$('record-id'),ctx=$('record-context');
  const idX=mix(recordCam[0]+(local[0]+25)*recordCam[2],x+(mobile?25:40),detach),idY=mix(recordCam[1]+(local[1]+21)*recordCam[2],y+22,detach);
  move(id,mix(idX,w*(mobile?.135:.115),assemble),mix(idY,h*(mobile?.35:.475),assemble),mix(recordCam[2],1,detach));
  id.style.opacity=1-ramp(p,.74,.79)+ramp(p,.90,.94);id.style.color=p>.8?'#697181':'#bec8da';
  move(ctx,mix(recordCam[0]+(local[0]+local[2]-130)*recordCam[2],x+cw-(mobile?145:170),detach),idY,mix(recordCam[2],1,detach));
  ctx.style.opacity=1-ramp(p,.73,.78);ctx.style.color='#bec8da';ctx.textContent=p<.48?'Demande reçue':p<.64?'Qualification':'CRM · Dossier ouvert';
  const bgT=ramp(p,.25,.94);document.body.style.backgroundColor=colour([245,242,236],[216,222,225],bgT);
  $('depth-word').textContent=p<.49?'DEMANDE':p<.64?'QUALIFICATION':'CRM';
  $('depth-word').style.opacity=ramp(p,.31,.44)*(1-ramp(p,.72,.82));
  move($('depth-word'),0,mix(45,0,ramp(p,.30,.69)),mix(1.2,1,ramp(p,.30,.69)));
  $('space-lines').style.opacity=ramp(p,.62,.69)*(1-ramp(p,.81,.92));
  const build=ramp(p,.805,.935);$('system-shell').style.setProperty('--build',build);$('system-shell').style.opacity=ramp(p,.79,.83);
  opacity('.system-heading',ramp(p,.86,.93));opacity('.system-nav',ramp(p,.88,.94));opacity('.system-row',ramp(p,.88,.94));opacity('.system-note',ramp(p,.91,.94));
  let title='Sites web.',line='Une présence claire pour votre entreprise.';
  if(p>=.31&&p<.49){title='Automatisations.';line='La demande poursuit son chemin.'}
  else if(p>=.49&&p<.64){title='Qualification.';line='Le besoin prend forme.'}
  else if(p>=.64&&p<.74){title='CRM.';line='Un dossier, prêt pour la suite.'}
  else if(p>=.74){title='Outils sur mesure.';line='L’information devient un outil.'}
  $('scene-title').textContent=title;$('scene-line').textContent=line;
  let headingOpacity=p<.31?1-ramp(p,.10,.18):ramp(p,.31,.36)*(1-ramp(p,.80,.86));
  // Brief type changes happen during steady poses; no looping or autonomous animation.
  $('scene-heading').style.opacity=headingOpacity;
  $('progress-fill').style.transform=`scaleX(${p})`;
  const active=p<.28?0:p<.94?1:2;all('.transport a').forEach((a,i)=>i===active?a.setAttribute('aria-current','step'):a.removeAttribute('aria-current'));
 }
 function measure(){if(!cinema)return;const r=theatre.getBoundingClientRect();w=r.width;h=r.height;mobile=innerWidth<=900;start=journey.getBoundingClientRect().top+scrollY;travel=journey.offsetHeight-stage.offsetHeight;draw()}
 function mode(){const was=cinema,large=parseFloat(getComputedStyle(document.documentElement).fontSize)>22;cinema=!simple&&!reduced.matches&&innerHeight>=640&&!large;document.body.classList.toggle('cinematic-mode',cinema);document.body.dataset.mode=cinema?'cinematic':'simple';movie.hidden=!cinema;toggle.hidden=false;toggle.setAttribute('aria-pressed',String(!cinema));toggle.textContent=cinema?'Lecture sans mouvement':reduced.matches?'Mouvement réduit respecté':innerHeight<640||large?'Lecture adaptée à l’écran':'Voir le mouvement';toggle.disabled=reduced.matches||innerHeight<640||large;if(was!==cinema){scrollTo({top:0,behavior:'instant'});if(!cinema)document.body.style.backgroundColor=''}measure()}
 toggle.addEventListener('click',()=>{simple=!simple;mode()});
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(a.classList.contains('skip')&&cinema){e.preventDefault();simple=true;mode();$('lecture').focus()}else if(a.matches('[data-jump]')&&cinema){e.preventDefault();measure();scrollTo({top:start+Number(a.dataset.jump)*travel,behavior:'smooth'})}});
 addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(draw)}},{passive:true});addEventListener('resize',mode,{passive:true});reduced.addEventListener('change',mode);mode();document.fonts.ready.then(measure);
})();
