import{a as q,q as x,c as T,d as B,l as k,u as U,f as I,s as z,e as S}from"./firebase.BnSwXsAX.js";import{p as R}from"./auth.CWk_pl18.js";import{N as g}from"./widev.CmFY1L06.js";let A=null,u=[],h="todos",w="",v=null,p=null;const $="/smile.avif",D=e=>{if(!e)return"Inactivo";const a=e.seconds?new Date(e.seconds*1e3):new Date(e);return a.toLocaleDateString("es-ES",{day:"numeric",month:"short"})+" "+a.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})},H=()=>u.filter(e=>{if(h!=="todos"&&e.rol!==h)return!1;if(w.trim()){const a=w.toLowerCase().trim(),s=`${e.nombre||""} ${e.apellidos||""}`.toLowerCase(),o=(e.usuario||"").toLowerCase(),t=(e.email||"").toLowerCase();if(!s.includes(a)&&!o.includes(a)&&!t.includes(a))return!1}return!0}),y=()=>{const e=H(),a=document.getElementById("us_table_body"),s=document.getElementById("us_mobile_list"),o=document.getElementById("us_empty");if(e.length===0){a&&(a.innerHTML=""),s&&(s.innerHTML=""),o&&o.classList.remove("dpn");return}o&&o.classList.add("dpn"),a&&(a.innerHTML=e.map(t=>{const l=`${t.nombre||""} ${t.apellidos||""}`.trim()||t.usuario||"Usuario",c=t.avatar||$,i=D(t.ultActividad),d=t.estado||(t.activo?"activo":"bloqueado");return`
          <tr>
            <td>
              <div class="us_profile_cell">
                <img class="us_avatar" src="${c}" alt="${t.usuario}" onerror="this.src='${$}'" />
                <div class="us_user_meta">
                  <span class="us_name">${l}</span>
                  <span class="us_sub">@${t.usuario} • ${t.email}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="us_badge_tag ${t.rol}">${t.rol}</span>
            </td>
            <td>
              <span class="us_status_dot">
                <span class="us_dot ${d}"></span>
                ${d==="activo"?"Activo":"Bloqueado"}
              </span>
            </td>
            <td style="color:var(--tx3); font-size:0.82rem; font-weight:600;">
              ${i}
            </td>
            <td>
              <div class="us_actions">
                <button class="us_btn_action btn_edit" data-id="${t.usuario}" title="Editar Cuenta"><i class="fas fa-edit"></i></button>
                <button class="us_btn_action btn_delete" data-id="${t.usuario}" title="Eliminar Cuenta"><i class="fas fa-trash-alt"></i></button>
              </div>
            </td>
          </tr>
        `}).join("")),s&&(s.innerHTML=e.map(t=>{const l=`${t.nombre||""} ${t.apellidos||""}`.trim()||t.usuario||"Usuario",c=t.avatar||$,i=D(t.ultActividad),d=t.estado||(t.activo?"activo":"bloqueado");return`
          <div class="us_card_item">
            <div style="display:flex; gap:1.5vh; align-items:center;">
              <img class="us_avatar" src="${c}" alt="${t.usuario}" onerror="this.src='${$}'" />
              <div class="us_user_meta">
                <span class="us_name">${l}</span>
                <span class="us_sub">@${t.usuario} • ${t.email}</span>
              </div>
            </div>
            <div class="us_card_row" style="border-top:1px solid var(--brd); padding-top:1rem; margin-top:0.2rem">
              <span class="us_badge_tag ${t.rol}">${t.rol}</span>
              <span class="us_status_dot">
                <span class="us_dot ${d}"></span>
                ${d==="activo"?"Activo":"Bloqueado"}
              </span>
            </div>
            <div class="us_card_row">
              <small style="color:var(--tx3); font-size:0.75rem; font-weight:600;">Actividad: ${i}</small>
              <div class="us_actions">
                <button class="us_btn_action btn_edit" data-id="${t.usuario}"><i class="fas fa-edit"></i></button>
                <button class="us_btn_action btn_delete" data-id="${t.usuario}"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
          </div>
        `}).join(""))},M=async()=>{if(!v)return;const e=v,a=document.getElementById("modal_select_role"),s=document.getElementById("modal_select_status"),o=a?a.value:e.rol,t=s?s.value:e.estado,l=t==="activo",c=document.getElementById("edit_modal");c&&c.classList.add("dpn");try{await U(I(B,"smiles",e.usuario),{rol:o,estado:t,activo:l,actualizado:z()}),u=u.map(i=>i.usuario===e.usuario?{...i,rol:o,estado:t,activo:l}:i),y(),g(`Cuenta @${e.usuario} actualizada`,"success")}catch(i){console.error(i),g("Error al actualizar la cuenta","error")}finally{v=null}},j=async()=>{if(!p)return;const e=p,a=document.getElementById("delete_modal");a&&a.classList.add("dpn");try{await S(I(B,"smiles",e.usuario)),await S(I(B,"registros",e.usuario)),u=u.filter(s=>s.usuario!==e.usuario),y(),g(`Cuenta @${e.usuario} eliminada permanentemente`,"info")}catch(s){console.error(s),g("Error al eliminar la cuenta","error")}finally{p=null}},N=()=>{document.addEventListener("click",d=>{const b=d.target,m=b.closest(".btn_edit");if(m){const L=m.getAttribute("data-id"),n=u.find(r=>r.usuario===L);if(n){v=n;const r=document.getElementById("modal_username"),_=document.getElementById("modal_select_role"),f=document.getElementById("modal_select_status"),C=document.getElementById("edit_modal");r&&(r.textContent=n.usuario),_&&(_.value=n.rol),f&&(f.value=n.estado||(n.activo?"activo":"bloqueado")),C&&C.classList.remove("dpn")}}const E=b.closest(".btn_delete");if(E){const L=E.getAttribute("data-id"),n=u.find(r=>r.usuario===L);if(n){p=n;const r=document.getElementById("delete_user_display"),_=document.getElementById("delete_username"),f=document.getElementById("delete_modal");r&&(r.textContent=`${n.nombre||""} ${n.apellidos||""}`.trim()||n.usuario),_&&(_.textContent=n.usuario),f&&f.classList.remove("dpn")}}});const e=document.getElementById("us_search");e&&e.addEventListener("input",d=>{w=d.target.value,y()});const a=document.querySelectorAll(".us_filter_btn");a.forEach(d=>{d.addEventListener("click",b=>{a.forEach(E=>E.classList.remove("active"));const m=b.currentTarget;m.classList.add("active"),h=m.getAttribute("data-role")||"todos",y()})});const s=document.getElementById("modal_btn_cancel"),o=document.getElementById("modal_btn_save"),t=document.getElementById("delete_btn_cancel"),l=document.getElementById("delete_btn_confirm"),c=document.getElementById("edit_modal"),i=document.getElementById("delete_modal");s&&s.addEventListener("click",()=>{c&&c.classList.add("dpn"),v=null}),o&&o.addEventListener("click",M),t&&t.addEventListener("click",()=>{i&&i.classList.add("dpn"),p=null}),l&&l.addEventListener("click",j)},F=async()=>{if(sessionStorage.getItem("vault_unlocked")!=="true"){window.location.replace("/verificar");return}if(A=await R(["admin"]),!A)return;const e=document.getElementById("us_loader"),a=document.getElementById("us_card");try{u=(await q(x(T(B,"smiles"),k(300)))).docs.map(o=>o.data()).sort((o,t)=>{const l=o.ultActividad?.seconds||0;return(t.ultActividad?.seconds||0)-l}),e&&(e.style.display="none"),a&&(a.style.display="flex"),y(),N()}catch(s){console.error(s),e&&(e.style.display="none"),g("Error de conexión al obtener la lista de usuarios","error")}};document.addEventListener("astro:page-load",F);
