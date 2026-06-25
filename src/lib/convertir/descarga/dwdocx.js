/**
 * Genera y descarga el currículum en formato Microsoft Word (.doc) utilizando una plantilla HTML estructurada.
 * Utiliza etiquetas de control XML de Office para abrir por defecto en "Diseño de Impresión" (Print Layout) con márgenes correctos de 1 pulgada.
 * 
 * @param {object} cv - Objeto con los datos estructurados del currículum.
 */
export const descargarDocx = (cv) => {
  const isEn = cv.idioma === 'en';

  // Cabeceras de sección dinámicas según el idioma
  const textPerfil = isEn ? 'Professional Summary' : 'Perfil Profesional';
  const textExperiencia = isEn ? 'Work Experience' : 'Experiencia Laboral';
  const textEducacion = isEn ? 'Education' : 'Educación';
  const textSkills = isEn ? 'Skills & Languages' : 'Habilidades e Idiomas';
  const textSkillsLabel = isEn ? 'Skills' : 'Habilidades';
  const textIdiomasLabel = isEn ? 'Languages' : 'Idiomas';
  const textPresente = isEn ? 'Present' : 'Presente';

  // Construir una plantilla HTML compatible con Microsoft Word y sus vistas
  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/1999/xhtml'>
    <head>
      <meta charset="utf-8">
      <title>${cv.nombre || 'Currículum Vitae'}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page WordSection1 {
          size: 8.5in 11.0in;
          margin: 1.0in 1.0in 1.0in 1.0in;
          mso-header-margin: .5in;
          mso-footer-margin: .5in;
          mso-paper-source: 0;
        }
        div.WordSection1 {
          page: WordSection1;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.45;
          color: #333333;
        }
        h1 {
          font-size: 21pt;
          color: #111111;
          text-align: center;
          margin-top: 0;
          margin-bottom: 3pt;
          font-weight: bold;
        }
        .subtitle {
          font-size: 11.5pt;
          color: #444444;
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
          margin-bottom: 6pt;
          letter-spacing: 0.5px;
        }
        .contact-info {
          text-align: center;
          font-size: 9.5pt;
          color: #555555;
          margin-bottom: 18pt;
        }
        h2 {
          font-size: 11pt;
          color: #111111;
          text-transform: uppercase;
          border-bottom: 1.5px solid #222222;
          padding-bottom: 2pt;
          margin-top: 18pt;
          margin-bottom: 8pt;
          font-weight: bold;
          letter-spacing: 0.8px;
        }
        .item {
          margin-bottom: 12pt;
        }
        .item-desc {
          margin-top: 3pt;
          margin-left: 15pt;
        }
        ul {
          margin: 0;
          padding-left: 15pt;
        }
        li {
          margin-bottom: 2pt;
          text-align: justify;
        }
        .skills-section {
          margin-top: 4pt;
        }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        <h1>${cv.nombre || 'Nombre Completo'}</h1>
        ${cv.titulo ? `<div class="subtitle">${cv.titulo}</div>` : ''}
        
        <div class="contact-info">
          Email: ${cv.email || ''} 
          ${cv.telefono ? ` &bull; Teléfono: ${cv.telefono}` : ''} 
          ${cv.ubicacion ? ` &bull; Ubicación: ${cv.ubicacion}` : ''}
          ${cv.linkedin ? `<br>LinkedIn: ${cv.linkedin}` : ''}
          ${cv.web ? ` &bull; Web: ${cv.web}` : ''}
        </div>

        ${cv.resumen ? `
          <h2>${textPerfil}</h2>
          <div style="text-align: justify;">${cv.resumen}</div>
        ` : ''}

        ${cv.experiencias && cv.experiencias.length > 0 ? `
          <h2>${textExperiencia}</h2>
          ${cv.experiencias.map(exp => `
            <div class="item" style="page-break-inside: avoid; break-inside: avoid;">
              <table style="width: 100%; border: none; margin-bottom: 2pt;">
                <tr>
                  <td style="font-weight: bold; font-size: 10.5pt; text-align: left;">${exp.puesto.toUpperCase()}</td>
                  <td style="text-align: right; font-weight: bold; font-size: 10.5pt;">${exp.inicio} - ${exp.fin || textPresente}</td>
                </tr>
                <tr>
                  <td style="font-style: italic; color: #444444; text-align: left;">${exp.empresa}</td>
                  <td style="text-align: right; font-style: italic; color: #444444;">${exp.ubicacion || ''}</td>
                </tr>
              </table>
              ${exp.logros ? `
                <div class="item-desc">
                  <ul>
                    ${exp.logros.split('\n').map(l => {
                      const clean = l.trim().replace(/^-\s*/, '');
                      return clean ? `<li>${clean}</li>` : '';
                    }).filter(Boolean).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        ` : ''}

        ${cv.educacion && cv.educacion.length > 0 ? `
          <h2>${textEducacion}</h2>
          ${cv.educacion.map(edu => `
            <div class="item" style="page-break-inside: avoid; break-inside: avoid;">
              <table style="width: 100%; border: none; margin-bottom: 2pt;">
                <tr>
                  <td style="font-weight: bold; font-size: 10.5pt; text-align: left;">${edu.grado}</td>
                  <td style="text-align: right; font-weight: bold; font-size: 10.5pt;">${edu.inicio} - ${edu.fin}</td>
                </tr>
                <tr>
                  <td style="font-style: italic; color: #444444; text-align: left;">${edu.institucion}</td>
                  <td style="text-align: right; font-style: italic; color: #444444;">${edu.ubicacion || ''}</td>
                </tr>
              </table>
            </div>
          `).join('')}
        ` : ''}

        ${cv.skills ? `
          <h2>${textSkills}</h2>
          <div class="skills-section">
            <strong>${textSkillsLabel}:</strong> ${cv.skills}
          </div>
          ${cv.idiomas && cv.idiomas.length > 0 ? `
            <div style="margin-top: 5pt;">
              <strong>${textIdiomasLabel}:</strong> ${cv.idiomas.filter(Boolean).join(', ')}
            </div>
          ` : ''}
        ` : ''}
      </div>
    </body>
    </html>
  `;

  // MimeType para abrir como documento editable en Word
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(cv.nombre || 'CV_ATS').replace(/\s+/g, '_')}_CV_ATS.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
