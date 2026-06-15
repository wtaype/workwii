import{h as g}from"./widev.CmFY1L06.js";let c=null;const f=e=>({Animales:"#0EBEFF",Naturaleza:"#25b62a",Amor:"#ff3849",Inspiración:"#ffa726",Vida:"#6a00f5"})[e]??"var(--mco)",m=e=>{const s=f(e.categoria);return`
      <a href="/${e.slug||e.id||""}" class="ib_card">
        <div class="ib_img" style="background-image:url('${e.imagen||e.portada||"/poster.webp"}')">
          <span class="ib_cat" style="background:color-mix(in srgb,${s} 20%,transparent);color:${s}">${e.categoria||"Blog"}</span>
        </div>
        <div class="ib_body">
          <h3 class="ib_tit">${e.titulo||"Sin título"}</h3>
          <p class="ib_resumen">${(e.resumen||e.descripcion||"").slice(0,90)}...</p>
          <div class="ib_meta">
            <span><i class="fas fa-calendar-alt"></i> ${e.creado?new Date(e.creado).toLocaleDateString("es-PE",{day:"numeric",month:"short",year:"numeric"}):""}</span>
            <span><i class="fas fa-eye"></i> ${e.vistas||0}</span>
            <span><i class="fas fa-heart" style="color:#fe0149"></i> ${e.likes||0}</span>
          </div>
        </div>
      </a>`},u=()=>{c&&(clearInterval(c),c=null)},p=async e=>{try{return}catch{if(!e){const a=document.getElementById("ib_grid");a&&!a.querySelector(".ib_card")&&(a.innerHTML='<p class="ib_empty"><i class="fas fa-dove"></i> Error al cargar artículos...</p>')}}},b=()=>{u();let e=0;const s=document.querySelectorAll(".hero_roles .role");s.length&&(c=setInterval(()=>{s[e].classList.remove("active"),e=(e+1)%s.length,s[e].classList.add("active")},2500)),g();let a=null;try{const t=localStorage.getItem("wi_blogs");if(t){const o=JSON.parse(t);o&&Date.now()<o.expiry?a=o:localStorage.removeItem("wi_blogs")}}catch{}const n=!!(a&&a.value&&a.value.length);if(n){const t=document.getElementById("ib_grid");t&&(t.innerHTML=a.value.map(m).join("")),g()}p(n)};document.addEventListener("astro:page-load",b);document.addEventListener("astro:before-preparation",u);
