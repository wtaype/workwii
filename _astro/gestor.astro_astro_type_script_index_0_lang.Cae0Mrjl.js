import{a as H,c as M,d as h,u as $,f as E,s as L}from"./firebase.BnSwXsAX.js";import{p as R}from"./auth.CWk_pl18.js";import{e as N,N as f}from"./widev.CmFY1L06.js";let x=null,d=[],u="pendientes",B="todos",k="",v=null;const I="wiSolicitudes",D="smiles",A=t=>{if(!t)return"—";const a=t.seconds?new Date(t.seconds*1e3):new Date(t);return a.toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"})+" a las "+a.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})},O=()=>d.filter(t=>{if(u==="pendientes"){if(t.estado!=="pendiente")return!1}else if(t.estado==="pendiente"||B!=="todos"&&t.estado!==B)return!1;if(k.trim()){const a=k.toLowerCase().trim(),s=`${t.nombre||""} ${t.apellidos||""}`.toLowerCase(),o=(t.usuario||"").toLowerCase(),n=(t.email||"").toLowerCase();if(!s.includes(a)&&!o.includes(a)&&!n.includes(a))return!1}return!0}),w=()=>{const t=d.filter(i=>i.estado==="pendiente").length,a=d.filter(i=>i.estado==="aprobado").length,s=d.filter(i=>i.estado==="rechazado").length,o=document.getElementById("stat_pending"),n=document.getElementById("stat_approved"),e=document.getElementById("stat_rejected"),r=document.getElementById("badge_pending"),l=document.getElementById("badge_history");o&&(o.textContent=String(t)),n&&(n.textContent=String(a)),e&&(e.textContent=String(s)),r&&(r.textContent=String(t)),l&&(l.textContent=String(a+s))},b=()=>{const t=O(),a=document.getElementById("gestor_table_body"),s=document.getElementById("gestor_mobile_list"),o=document.getElementById("gestor_empty"),n=document.getElementById("table_actions_header");if(n&&(n.textContent=u==="pendientes"?"Acciones":"Resolución"),t.length===0){if(a&&(a.innerHTML=""),s&&(s.innerHTML=""),o){o.classList.remove("dpn");const e=document.getElementById("empty_title"),r=document.getElementById("empty_desc");e&&r&&(u==="pendientes"?(e.textContent="No hay solicitudes pendientes",r.textContent="No tienes postulaciones pendientes de evaluar por el momento."):(e.textContent="Historial vacío",r.textContent="No se registran postulaciones evaluadas bajo los filtros actuales."))}return}o&&o.classList.add("dpn"),a&&(a.innerHTML=t.map(e=>{const r=`${e.nombre||""} ${e.apellidos||""}`.trim()||e.usuario||"Usuario",l=A(e.creado);let i="";return u==="pendientes"?i=`
            <div style="display:flex; flex-direction:column; gap:0.5rem">
              <div class="gestor_actions_group">
                <button class="gestor_btn_action btn_approve" data-id="${e.id}" title="Aprobar Solicitud"><i class="fas fa-check"></i></button>
                <button class="gestor_btn_action btn_reject" data-id="${e.id}" title="Rechazar Solicitud"><i class="fas fa-xmark"></i></button>
              </div>
              <div class="gestor_reject_box dpn" id="reject_box_${e.id}">
                <span class="gestor_label_min">Motivo de Rechazo *</span>
                <textarea class="gestor_feedback_input" id="feedback_${e.id}" placeholder="Escribe el motivo del rechazo de forma constructiva..."></textarea>
                <div class="gestor_reject_confirm_row">
                  <button class="gestor_btn_sm btn_cancel" data-id="${e.id}">Cancelar</button>
                  <button class="gestor_btn_sm btn_confirm" data-id="${e.id}">Rechazar</button>
                </div>
              </div>
            </div>
          `:i=`
            <div style="display:flex; flex-direction:column; gap:0.3rem">
              <span class="gestor_status_tag ${e.estado}">
                <i class="fas ${e.estado==="aprobado"?"fa-check-circle":"fa-times-circle"}"></i>
                ${e.estado}
              </span>
              ${e.respuesta?`<span style="font-size:0.78rem;color:var(--tx3);display:block;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${e.respuesta}">"${e.respuesta}"</span>`:""}
            </div>
          `,`
          <tr>
            <td>
              <div class="gestor_user_info">
                <span class="gestor_user_name">${r}</span>
                <span class="gestor_user_sub">
                  <span>@${e.usuario}</span>
                  <span>•</span>
                  <span>${e.email}</span>
                </span>
              </div>
            </td>
            <td>
              <div class="gestor_text_block">${e.motivo||"—"}</div>
            </td>
            <td>
              <span style="font-size:0.82rem;font-weight:600;color:var(--mco);display:block;max-width:180px;overflow-wrap:break-word">${e.ejemplos||"General"}</span>
              <small style="font-size:0.75rem;color:var(--tx3);display:block;margin-top:0.3rem">${l}</small>
            </td>
            <td>
              ${i}
            </td>
          </tr>
        `}).join("")),s&&(s.innerHTML=t.map(e=>{const r=`${e.nombre||""} ${e.apellidos||""}`.trim()||e.usuario||"Usuario",l=A(e.creado);let i="";return u==="pendientes"?i=`
            <div style="border-top:1px solid var(--brd);padding-top:1rem;margin-top:0.5rem;display:flex;flex-direction:column;gap:0.5rem">
              <div style="display:flex;gap:0.75rem">
                <button class="gestor_btn_secondary btn_approve" data-id="${e.id}" style="flex-grow:1;justify-content:center;background:rgba(40,167,69,0.08);border-color:rgba(40,167,69,0.15);color:var(--success)"><i class="fas fa-check"></i> Aprobar</button>
                <button class="gestor_btn_secondary btn_reject" data-id="${e.id}" style="flex-grow:1;justify-content:center;background:rgba(220,53,69,0.08);border-color:rgba(220,53,69,0.15);color:var(--error)"><i class="fas fa-xmark"></i> Rechazar</button>
              </div>
              <div class="gestor_reject_box dpn" id="reject_box_mob_${e.id}">
                <span class="gestor_label_min">Motivo de Rechazo *</span>
                <textarea class="gestor_feedback_input" id="feedback_mob_${e.id}" placeholder="Escribe el motivo del rechazo..."></textarea>
                <div class="gestor_reject_confirm_row">
                  <button class="gestor_btn_sm btn_cancel" data-id="${e.id}">Cancelar</button>
                  <button class="gestor_btn_sm btn_confirm" data-id="${e.id}">Rechazar</button>
                </div>
              </div>
            </div>
          `:i=`
            <div style="border-top:1px solid var(--brd);padding-top:1rem;margin-top:0.5rem;display:flex;flex-direction:column;gap:0.4rem">
              <span class="gestor_status_tag ${e.estado}">
                <i class="fas ${e.estado==="aprobado"?"fa-check-circle":"fa-times-circle"}"></i>
                ${e.estado}
              </span>
              ${e.respuesta?`<div class="gestor_text_block" style="font-style:italic;background:var(--bg4);padding:0.5rem;border-radius:6px;margin-top:0.2rem">"${e.respuesta}"</div>`:""}
            </div>
          `,`
          <div class="gestor_card_item">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div class="gestor_user_info">
                <span class="gestor_user_name">${r}</span>
                <span class="gestor_user_sub">@${e.usuario} • ${e.email}</span>
              </div>
            </div>
            <div>
              <span class="gestor_label_min">Motivo</span>
              <div class="gestor_text_block">${e.motivo||"—"}</div>
            </div>
            <div>
              <span class="gestor_label_min">Temática y Envío</span>
              <span style="font-size:0.85rem;font-weight:600;color:var(--mco);display:block">${e.ejemplos||"General"}</span>
              <small style="font-size:0.75rem;color:var(--tx3);display:block;margin-top:0.15rem">${l}</small>
            </div>
            ${i}
          </div>
        `}).join(""))},P=async()=>{if(!v)return;const t=v,a=document.getElementById("approve_modal");a&&a.classList.add("dpn");const s="¡Felicidades! Tu postulación ha sido evaluada y aprobada con éxito. Ahora cuentas con el rol de Editor oficial de WiiHope. Comienza a escribir palabras de aliento.";try{await $(E(h,I,t.id),{estado:"aprobado",respuesta:s,actualizado:L()}),await $(E(h,D,t.usuario),{rol:"editor",actualizado:L()}),d=d.map(o=>o.id===t.id?{...o,estado:"aprobado",respuesta:s}:o),w(),b(),f(`@${t.usuario} ha sido ascendido a Editor 🎉`,"success")}catch(o){console.error(o),f("Error al procesar la aprobación","error")}finally{v=null}},q=async(t,a)=>{const s=a?`feedback_mob_${t}`:`feedback_${t}`,o=document.getElementById(s),n=o?o.value.trim():"";if(!n){f("Por favor, escribe una retroalimentación formativa.","warning");return}const e=d.find(r=>r.id===t);if(e)try{await $(E(h,I,t),{estado:"rechazado",respuesta:n,actualizado:L()}),d=d.map(r=>r.id===t?{...r,estado:"rechazado",respuesta:n}:r),w(),b(),f(`Postulación de @${e.usuario} rechazada con comentarios.`,"info")}catch(r){console.error(r),f("Error al procesar el rechazo","error")}},T=(t,a)=>{const s=a?`reject_box_mob_${t}`:`reject_box_${t}`,o=document.getElementById(s);if(o&&(o.classList.toggle("dpn"),!o.classList.contains("dpn"))){const n=document.getElementById(a?`feedback_mob_${t}`:`feedback_${t}`);n&&n.focus()}},F=()=>{document.addEventListener("click",i=>{const p=i.target,g=p.closest(".btn_approve");if(g){const m=g.getAttribute("data-id"),c=d.find(y=>y.id===m);if(c){v=c;const y=document.getElementById("approve_user_name"),S=document.getElementById("approve_username"),j=document.getElementById("approve_modal");y&&(y.textContent=`${c.nombre||""} ${c.apellidos||""}`.trim()||c.usuario),S&&(S.textContent=c.usuario),j&&j.classList.remove("dpn")}}const _=p.closest(".btn_reject");if(_){const m=_.getAttribute("data-id");if(m){const c=_.classList.contains("gestor_btn_secondary");T(m,c)}}const C=p.closest(".btn_cancel");if(C){const m=C.getAttribute("data-id");if(m){const c=p.closest(".gestor_mobile_only")!==null;T(m,c)}}const z=p.closest(".btn_confirm");if(z){const m=z.getAttribute("data-id");if(m){const c=p.closest(".gestor_mobile_only")!==null;q(m,c)}}});const t=document.getElementById("gestor_search");t&&t.addEventListener("input",i=>{k=i.target.value,b()});const a=document.querySelectorAll(".gestor_filter_tag");a.forEach(i=>{i.addEventListener("click",p=>{a.forEach(_=>_.classList.remove("active"));const g=p.currentTarget;g.classList.add("active"),B=g.getAttribute("data-filter")||"todos",b()})});const s=document.getElementById("tab_pending_btn"),o=document.getElementById("tab_history_btn"),n=document.getElementById("history_filters");s&&o&&(s.addEventListener("click",()=>{s.classList.add("active"),o.classList.remove("active"),n&&n.classList.add("dpn"),u="pendientes",b()}),o.addEventListener("click",()=>{o.classList.add("active"),s.classList.remove("active"),n&&n.classList.remove("dpn"),u="historial",b()}));const e=document.getElementById("approve_btn_cancel"),r=document.getElementById("approve_btn_confirm"),l=document.getElementById("approve_modal");e&&e.addEventListener("click",()=>{l&&l.classList.add("dpn"),v=null}),r&&r.addEventListener("click",P)},G=async()=>{if(x=await R(["gestor","admin"]),!x)return;const t=document.getElementById("gestor_name");t&&(t.textContent=N(x.nombre||x.usuario||"Gestor"));const a=document.getElementById("gestor_loader"),s=document.getElementById("gestor_card");try{d=(await H(M(h,I))).docs.map(n=>({id:n.id,...n.data()})).sort((n,e)=>{const r=n.creado?.seconds||0;return(e.creado?.seconds||0)-r}),a&&(a.style.display="none"),s&&(s.style.display="flex"),w(),b(),F()}catch(o){console.error(o),a&&(a.style.display="none"),f("Error de conexión con la base de datos","error")}};document.addEventListener("astro:page-load",G);
