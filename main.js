'use strict';
(() => {
  const root=document.documentElement, body=document.body;
  const journey=document.getElementById('journey'), stage=document.querySelector('.stage'), theatre=document.getElementById('theatre');
  const record=document.getElementById('record'), fields=[...record.querySelectorAll('.field')];
  const toggle=document.getElementById('motion-toggle'), movie=document.querySelector('.cinematic');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const $=id=>document.getElementById(id), all=s=>[...document.querySelectorAll(s)];
  let userSimple=false, cinematic=false, ticking=false, w=0,h=0,mobile=false,start=0,travel=0,p=0;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const ramp=(v,a,b)=>smooth((v-a)/(b-a));
  function keys(v,frames){let a=frames[0],b=frames[frames.length-1];for(let i=1;i<frames.length;i++){if(v<=frames[i][0]){a=frames[i-1];b=frames[i];break;}}const t=smooth((v-a[0])/(b[0]-a[0]));return a.slice(1).map((x,i)=>mix(x,b[i+1],t));}
  function colour(a,b,t){return `rgb(${a.map((n,i)=>Math.round(mix(n,b[i],t))).join(',')})`;}
  const opacity=(selector,value)=>all(selector).forEach(el=>el.style.opacity=clamp(value));
  function draw(){
    ticking=false;if(!cinematic)return;
    p=clamp((scrollY-start)/travel);body.dataset.progress=p.toFixed(4);
    const entering=ramp(p,.12,.36), routing=ramp(p,.27,.41)*(1-ramp(p,.74,.90)), system=ramp(p,.73,.94), enrich=ramp(p,.32,.53);
    const gap=ramp(p,.11,.28)*(1-ramp(p,.74,.95));
    const A=mobile?[.04,.035,.92,.88]:[.07,.08,.86,.82];
    const B=mobile?[.04,.035,.92,.45]:[.07,.08,.86,.46];
    const O=mobile?[.025,.035,.95,.90]:[.025,.04,.95,.90];
    const C=mobile?[.04,.035,.92,.92]:[.075,.055,.85,.82];
    const fr=keys(p,[[0,...A],[.12,...A],[.26,...B],[.42,...O],[.73,...O],[1,...C]]);
    const x=fr[0]*w,y=fr[1]*h,fw=fr[2]*w,fh=fr[3]*h,r=x+fw,b=y+fh;
    $('frame-fill').setAttribute('d',`M${x} ${y}H${r}V${b}H${x}Z`);
    $('frame-fill').style.opacity=1-.90*gap;
    $('frame-left').setAttribute('d',`M${x} ${y}V${b}`);
    $('frame-right').setAttribute('d',`M${r} ${y}V${b}`);
    $('frame-top').setAttribute('d',`M${x} ${y}H${r}`);
    const middle=mobile?w*.5:w*.29;
    const g1=mix(middle,x,gap),g2=mix(middle,r,gap);
    $('frame-bottom').setAttribute('d',`M${x} ${b}H${g1}M${g2} ${b}H${r}`);
    opacity('#frame-left,#frame-right',1-.3*gap);opacity('#frame-top',1-.25*gap);
    $('frame-svg').dataset.bounds=[x,y,fw,fh].map(v=>v.toFixed(1)).join(',');
    const cardHeight=mobile?Math.max(158,h*.36):Math.max(166,h*.33);
    const ch=cardHeight/h,exitY=Math.min(.64,1-ch-.018);
    const coords=mobile?
      [[0,.10,.50,.80,ch],[.12,.10,.50,.80,ch],[.26,.10,exitY,.80,ch],[.40,.15,.38,.80,ch],[.57,.15,.46,.80,ch],[.73,.15,.55,.80,ch],[1,.10,.395,.80,Math.max(214,h*.46)/h]]:
      [[0,.13,.52,.32,ch],[.12,.13,.52,.32,ch],[.26,.13,exitY,.32,ch],[.40,.06,.47,.28,ch],[.57,.36,.47,.28,ch],[.73,.65,.47,.28,ch],[1,.12,.445,.76,Math.max(100,h*.20)/h]];
    const cr=keys(p,coords),cx=cr[0]*w,cy=cr[1]*h,cw=cr[2]*w,cheight=cr[3]*h;
    record.style.width=`${cw}px`;record.style.height=`${cheight}px`;record.style.transform=`translate3d(${Math.round(cx)}px,${Math.round(cy)}px,0)`;
    record.style.backgroundColor='#172033';
    record.style.color='#ffffff';
    record.style.borderColor='#172033';
    record.style.boxShadow=`0 ${mix(14,3,system)}px ${mix(32,10,system)}px rgb(23 32 51 / ${mix(.13,.04,system)})`;
    record.querySelector('.record-edge').style.backgroundColor='#a5bbff';
    const pad=mobile?18:22;
    fields.forEach((field,i)=>{
      const a=[[pad,42],[pad,94],[pad,98],[cw*.51,98]][i];
      const bb=[[pad,42],[cw*.53,42],[pad,99],[cw*.53,99]][i];
      let end=mobile?[pad,18+i*48]:[pad+(cw-2*pad)*[0,.28,.47,.67][i],25];
      const bx=mix(a[0],bb[0],ramp(p,.30,.40)),by=mix(a[1],bb[1],ramp(p,.40,.50));
      const xt=mobile&&(i===1||i===3)?ramp(system,.82,1):!mobile&&i===2?ramp(system,0,.55):system;
      const yt=!mobile&&i===2?ramp(system,.55,1):system;
      const fx=mix(bx,end[0],xt),fy=mix(by,end[1],yt);
      field.style.transform=`translate3d(${Math.round(fx)}px,${Math.round(fy)}px,0)`;
      field.style.opacity=i>1?ramp(p,.50,.57):1;
      field.querySelector('dt').style.color='#c1c8d4';
      if(i===0)field.querySelector('dd').style.fontSize=`${mobile?16:mix(17,18,system)}px`;
    });
    opacity('.record-context',1-system);opacity('.record-foot',(1-enrich)*(1-system));
    $('record-context').textContent=p<.34?'Demande issue du site':p<.49?'La demande entre dans le suivi':p<.64?'La même demande · Qualification':'La même demande · CRM';
    opacity('.browser-caption',1-ramp(p,.12,.30));opacity('.web-content,.web-side-note',1-ramp(p,.10,.27));
    opacity('.flow-heading',routing);opacity('.route-svg',routing);opacity('.system-heading,.system-surface',system);
    let points,path;
    if(mobile){points=[[w*.075,h*.36],[w*.075,h*.54],[w*.075,h*.75]];path=`M${points[0].join(' ')}L${points[2].join(' ')}`;}
    else{points=[[w*.20,h*.40],[w*.50,h*.40],[w*.79,h*.40]];path=`M${points[0].join(' ')} C${w*.31} ${h*.27},${w*.37} ${h*.53},${points[1].join(' ')} S${w*.68} ${h*.30},${points[2].join(' ')}`;}
    $('route-base').setAttribute('d',path);$('route-active').setAttribute('d',path);
    const length=$('route-active').getTotalLength();$('route-active').style.strokeDasharray=length;$('route-active').style.strokeDashoffset=length*(1-clamp((p-.40)/.33));
    const active=p<.49?0:p<.64?1:2;
    all('.node').forEach((node,i)=>{node.style.left=points[i][0]+'px';node.style.top=points[i][1]+'px';node.style.opacity=routing;node.classList.toggle('current',i===active);node.querySelector('span').style.opacity=mobile?0:1;});
    let phase='A',moment='A / AVANT',caption='La demande appartient à votre site.';
    if(p>.14){phase='B';moment='B / PENDANT';caption=p<.34?'Elle quitte le cadre. Son identité reste.':p<.49?'La demande entre dans le suivi.':p<.64?'Qualification : le besoin reste identifiable.':p<.79?'Le CRM conserve la demande et la suite à donner.':'Les informations prennent leur place dans l’outil.';}
    if(p>.94){phase='C';moment='C / APRÈS';caption='La même demande devient une '+(mobile?'fiche':'ligne')+' de travail.';}
    body.dataset.phase=phase;$('moment').textContent=moment;$('caption').textContent=caption;
    all('.transport a').forEach((a,i)=>{if(['A','B','C'][i]===phase)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
    $('progress-fill').style.transform=`scaleX(${p})`;
  }
  function schedule(){if(!ticking){ticking=true;requestAnimationFrame(draw);}}
  function measure(){if(!cinematic)return;const r=theatre.getBoundingClientRect();w=r.width;h=r.height;mobile=innerWidth<=700;start=journey.getBoundingClientRect().top+scrollY;travel=journey.offsetHeight-stage.offsetHeight;draw();}
  function setMode(){
    const old=cinematic;
    const largeText=parseFloat(getComputedStyle(root).fontSize)>22;
    cinematic=!reduced.matches&&!userSimple&&innerHeight>=720&&!largeText;
    body.classList.toggle('cinematic-mode',cinematic);body.dataset.mode=cinematic?'cinematic':'simple';movie.hidden=!cinematic;
    toggle.hidden=false;toggle.setAttribute('aria-pressed',String(!cinematic));
    toggle.textContent=cinematic?'Lecture sans mouvement':reduced.matches?'Mouvement réduit respecté':innerHeight<720||largeText?'Lecture adaptée à l’écran':'Voir le mouvement';
    toggle.disabled=reduced.matches||innerHeight<720||largeText;
    if(old!==cinematic&&old)scrollTo({top:0,behavior:'instant'});
    if(cinematic)measure();
  }
  toggle.addEventListener('click',()=>{userSimple=!userSimple;setMode();});
  document.addEventListener('click',event=>{
    const a=event.target.closest('a');if(!a||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    if(a.classList.contains('skip')&&cinematic){event.preventDefault();userSimple=true;setMode();$('lecture').focus();return;}
    if(a.matches('[data-jump]')&&cinematic){event.preventDefault();measure();scrollTo({top:start+Number(a.dataset.jump)*travel,behavior:'smooth'});}
  });
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',()=>{setMode();measure();},{passive:true});
  reduced.addEventListener('change',setMode);
  setMode();
})();
