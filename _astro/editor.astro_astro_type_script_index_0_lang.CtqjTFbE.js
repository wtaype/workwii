import{a as L,c as $,d as h,e as I,f as S}from"./firebase.BnSwXsAX.js";import{p as k}from"./auth.CWk_pl18.js";import{S as w,e as C,N as p}from"./widev.CmFY1L06.js";let l=null,m=[],v="todos",g="",f=null;const E="blog",y=e=>e?(e.seconds?new Date(e.seconds*1e3):new Date(e)).toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"}):"—",x=()=>m.filter(e=>{if(v==="activo"){if(e.activo!==!0)return!1}else if(v==="borrador"&&e.activo===!0)return!1;if(g.trim()){const n=g.toLowerCase().trim();if(!(e.titulo||"").toLowerCase().includes(n))return!1}return!0}),B=()=>{const e=m.length,n=m.filter(a=>a.activo===!0).length,s=m.filter(a=>a.activo!==!0).length,o=m.filter(a=>!!a.pin).length,r=document.getElementById("kpi_total"),t=document.getElementById("kpi_active"),d=document.getElementById("kpi_drafts"),i=document.getElementById("kpi_pins");r&&(r.textContent=String(e)),t&&(t.textContent=String(n)),d&&(d.textContent=String(s)),i&&(i.textContent=String(o))},b=()=>{const e=x(),n=document.getElementById("ed_table_body"),s=document.getElementById("ed_mobile_list"),o=document.getElementById("ed_empty"),r=document.getElementById("list_count_lbl");if(r&&(r.textContent=`${e.length} artículo${e.length===1?"":"s"} encontrado${e.length===1?"":"s"}`),e.length===0){if(n&&(n.innerHTML=""),s&&(s.innerHTML=""),o){o.classList.remove("dpn");const t=document.getElementById("ed_empty_desc");t&&(g.trim()?t.textContent="Ninguna de tus historias coincide con la búsqueda.":t.textContent="Aún no has redactado ninguna historia en WiiHope. ¡Crea tu primer post!")}return}o&&o.classList.add("dpn"),n&&(n.innerHTML=e.map(t=>{const d=t.imagen||"https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300",i=y(t.creado);let a="";return t.pin?a='<span class="ed_badge_status pinned"><i class="fas fa-thumbtack"></i> Pin</span>':t.activo?a='<span class="ed_badge_status public"><i class="fas fa-globe"></i> Público</span>':a='<span class="ed_badge_status draft"><i class="fas fa-file"></i> Borrador</span>',`
          <tr id="row_${t.id}">
            <td>
              <div class="ed_post_cell">
                <div class="ed_post_thumb" style="background-image: url('${d}')"></div>
                <div class="ed_post_title_info">
                  <a href="/${t.slug||t.id}" target="_blank" class="ed_post_title">${t.titulo||"Sin título"}</a>
                  <span class="ed_post_url">/${t.slug||t.id}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="ed_badge_cat">${t.categoria||"General"}</span>
            </td>
            <td>
              ${a}
            </td>
            <td>
              <span style="font-size:0.85rem;color:var(--tx3);font-weight:600">${i}</span>
            </td>
            <td>
              <div class="ed_actions_col">
                <a href="/nuevo?edit=${t.slug||t.id}" class="ed_btn_icon btn_edit" title="Editar historia"><i class="fas fa-pen"></i></a>
                <button class="ed_btn_icon btn_delete" data-id="${t.id}" title="Eliminar historia"><i class="fas fa-trash"></i></button>
              </div>
            </td>
          </tr>
        `}).join("")),s&&(s.innerHTML=e.map(t=>{const d=t.imagen||"https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300",i=y(t.creado);let a="";return t.pin?a='<span class="ed_badge_status pinned"><i class="fas fa-thumbtack"></i> Pin</span>':t.activo?a='<span class="ed_badge_status public"><i class="fas fa-globe"></i> Público</span>':a='<span class="ed_badge_status draft"><i class="fas fa-file"></i> Borrador</span>',`
          <div class="ed_card_item" id="row_mob_${t.id}">
            <div class="ed_mob_header">
              <div class="ed_mob_thumb" style="background-image: url('${d}')"></div>
              <div class="ed_mob_title_box">
                <a href="/${t.slug||t.id}" target="_blank" class="ed_mob_title">${t.titulo||"Sin título"}</a>
                <span class="ed_badge_cat" style="display:inline-block;margin-top:0.25rem">${t.categoria||"General"}</span>
              </div>
            </div>
            <div class="ed_mob_meta">
              <div>
                ${a}
                <small style="font-size:0.75rem;color:var(--tx3);display:block;margin-top:0.25rem">${i}</small>
              </div>
              <div class="ed_actions_col">
                <a href="/nuevo?edit=${t.slug||t.id}" class="ed_btn_icon btn_edit"><i class="fas fa-pen"></i></a>
                <button class="ed_btn_icon btn_delete" data-id="${t.id}"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        `}).join(""))},H=async()=>{if(!f)return;const e=f,n=document.getElementById("delete_modal");n&&n.classList.add("dpn");try{await I(S(h,E,e.id)),typeof localStorage<"u"&&(localStorage.removeItem(`wi_post_${e.slug||e.id}`),Object.keys(localStorage).filter(s=>s.startsWith("wi_blogs")||s.startsWith("wi_draft_edit_"+(e.slug||e.id))).forEach(s=>localStorage.removeItem(s))),m=m.filter(s=>s.id!==e.id),B(),b(),p("Artículo eliminado permanentemente","success")}catch(s){console.error(s),p("Error al intentar eliminar el artículo","error")}finally{f=null}},T=()=>{document.addEventListener("click",t=>{const i=t.target.closest(".btn_delete");if(i){const a=i.getAttribute("data-id"),c=m.find(u=>u.id===a);if(c){f=c;const u=document.getElementById("delete_post_title"),_=document.getElementById("delete_modal");u&&(u.textContent=`"${c.titulo||"Sin título"}"`),_&&_.classList.remove("dpn")}}});const e=document.getElementById("delete_btn_cancel"),n=document.getElementById("delete_btn_confirm"),s=document.getElementById("delete_modal");e&&s&&e.addEventListener("click",()=>{s.classList.add("dpn"),f=null}),n&&n.addEventListener("click",H);const o=document.getElementById("ed_search");o&&o.addEventListener("input",t=>{g=t.target.value,b()});const r=document.querySelectorAll(".ed_filter_btn");r.forEach(t=>{t.addEventListener("click",d=>{r.forEach(a=>a.classList.remove("active"));const i=d.currentTarget;i.classList.add("active"),v=i.getAttribute("data-filter")||"todos",b()})})},P=async()=>{if(l=await k(["editor","gestor","admin"]),!l)return;const e=`${(l.nombre||"?")[0]}${(l.apellidos||"")[0]||""}`.toUpperCase(),n=document.getElementById("ed_av");n&&(n.textContent=e);const s=document.getElementById("ed_saludo");s&&(s.innerHTML=`${w()} <strong>${C(l.nombre||l.usuario||"")}</strong>`);const o=document.getElementById("ed_role_lbl");o&&(l.rol==="admin"?o.innerHTML='<i class="fas fa-crown"></i> Administrador':l.rol==="gestor"?o.innerHTML='<i class="fas fa-shield-alt"></i> Gestor Editorial':o.innerHTML='<i class="fas fa-pen-fancy"></i> Editor de WiiHope');const r=document.getElementById("ed_btn_gestor");r&&(l.rol==="gestor"||l.rol==="admin")&&r.classList.remove("dpn");const t=document.getElementById("ed_loader"),d=document.getElementById("ed_card");try{const a=(await L($(h,E))).docs.map(c=>({id:c.id,...c.data()}));l.rol==="admin"?m=a:m=a.filter(c=>c.usuario===l.usuario||c.email===l.email),m.sort((c,u)=>{const _=c.creado?.seconds||0;return(u.creado?.seconds||0)-_}),t&&(t.style.display="none"),d&&(d.style.display="flex"),B(),b(),T()}catch(i){console.error(i),t&&(t.style.display="none"),p("Error cargando base de datos","error")}};document.addEventListener("astro:page-load",P);
