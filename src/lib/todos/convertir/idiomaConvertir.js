// src/lib/convertir/idiomaConvertir.js
// Diccionario de traducción bilingüe para el Módulo de Conversión de CV a ATS

export const idiomaConvertir = {
  es: {
    header: {
      tit: 'Convertidor de CV a <span>Formato ATS</span>',
      desc: 'Sube tu currículum en PDF o Word y nuestra IA lo optimizará y estructurará al instante para superar los filtros de selección.'
    },
    step1: {
      tit: 'Convertir tu Curriculum Vitae',
      fileLabel: 'Arrastra tu currículum existente',
      dzTit: 'Arrastra tu archivo aquí o haz clic',
      dzSub: 'Admite formatos PDF y Word (.docx) — Máximo 4MB',
      progress: 'Leyendo contenido...',
      textareaLabel: 'Texto extraído del documento (Verifica o edita si es necesario):',
      textareaPl: 'Aquí aparecerá el texto de tu currículum al subir el archivo...',
      roleLabel: 'Puesto o Área al que postulas (Opcional)',
      rolePl: 'Ej: Desarrollador React, Especialista en Marketing, Asistente Administrativo',
      roleHelp: 'La IA orientará el vocabulario de tu CV hacia este rol específico.',
      langLabel: 'Idioma de optimización',
      langEs: 'Español Latinoamericano',
      langEn: 'Inglés (English)',
      langHelp: 'La IA traducirá y redactará todo tu CV en este idioma.',
      btnSubmit: 'Optimizar y Organizar con IA'
    },
    loader: {
      tit: 'Analizando currículum...',
      desc: 'Nuestra Inteligencia Artificial está estructurando tu información y optimizando tus logros para superar los filtros de contratación. Esto tomará unos segundos.',
      progress: 'Progreso de estructuración',
      tip: 'Tip ATS',
      cargandoTip: 'El formato de CV de dos columnas suele ser difícil de leer para los ATS antiguos. Te recomendamos usar un diseño de columna única como este.'
    },
    workspace: {
      previewATS: 'Vista Previa ATS',
      tipFoto: 'Consejo de foto',
      tipFotoDesc: 'Esta plantilla está diseñada sin foto por defecto porque los filtros de contratación automáticos ATS en EE.UU. y Europa penalizan o no leen currículums con imágenes. Te recomendamos descargar el CV sin foto.',
      btnReset: 'Convertir otro',
      btnDownload: 'Descargar CV',
      btnPrint: 'Imprimir PDF (Recomendado ATS)',
      btnPdf: 'Formato (.pdf)',
      btnWord: 'Word (.docx)',
      btnTxt: 'Texto (.txt)',
      btnMd: 'Markdown (.md)',
      btnJson: 'Respaldar (.json)',
      successMsg: '¡CV estructurado y optimizado con éxito! Revisa la vista previa.',
      confirmNewTitle: '¿Iniciar nueva optimización?',
      confirmNewDesc: 'Se perderán los cambios que no hayas descargado del currículum actual.',
      confirmCancel: 'Cancelar',
      confirmOk: 'Sí, nuevo',
      tabProyectos: 'Proyectos',
      tabCertificaciones: 'Certificaciones',
      projNombre: 'Nombre del Proyecto',
      projDesc: 'Descripción del Proyecto',
      projTecnologias: 'Tecnologías utilizadas',
      projLink: 'Enlace del Proyecto (Opcional)',
      certNombre: 'Nombre de la Certificación',
      certEmisor: 'Entidad Emisora',
      certFecha: 'Fecha de obtención',
      btnAdd: 'Añadir nuevo',
      btnRemove: 'Eliminar'
    }
  },
  en: {
    header: {
      tit: 'Resume Converter to <span>ATS Format</span>',
      desc: 'Upload your resume in PDF or Word and our AI will optimize and structure it instantly to beat selection filters.'
    },
    step1: {
      tit: 'Convert your Curriculum Vitae',
      fileLabel: 'Drag your existing resume',
      dzTit: 'Drag your file here or click',
      dzSub: 'Supports PDF and Word (.docx) formats — Maximum 4MB',
      progress: 'Reading content...',
      textareaLabel: 'Extracted text from the document (Verify or edit if necessary):',
      textareaPl: 'Your resume text will appear here once the file is uploaded...',
      roleLabel: 'Target Job Title or Field (Optional)',
      rolePl: 'e.g., React Developer, Marketing Specialist, Administrative Assistant',
      roleHelp: 'AI will align your resume vocabulary toward this specific role.',
      langLabel: 'Optimization language',
      langEs: 'Spanish',
      langEn: 'English',
      langHelp: 'AI will translate and write your entire CV in this language.',
      btnSubmit: 'Optimize & Organize with AI'
    },
    loader: {
      tit: 'Analyzing resume...',
      desc: 'Our Artificial Intelligence is structuring your information and optimizing your achievements to beat hiring filters. This will take a few seconds.',
      progress: 'Structuring progress',
      tip: 'ATS Tip',
      cargandoTip: 'Two-column resume layouts are often difficult for older ATS parsers to read. We recommend using a single-column layout like this one.'
    },
    workspace: {
      previewATS: 'ATS Preview',
      tipFoto: 'Photo tip',
      tipFotoDesc: 'This template is designed without a photo by default because automatic hiring filters (ATS) in the US and Europe penalize or do not read resumes with images. We recommend downloading the CV without a photo.',
      btnReset: 'Convert another',
      btnDownload: 'Download CV',
      btnPrint: 'Print PDF (ATS Recommended)',
      btnPdf: 'Format (.pdf)',
      btnWord: 'Word (.docx)',
      btnTxt: 'Text (.txt)',
      btnMd: 'Markdown (.md)',
      btnJson: 'Back up (.json)',
      successMsg: 'Resume structured and optimized successfully! Review the preview.',
      confirmNewTitle: 'Start new optimization?',
      confirmNewDesc: 'Unsaved changes to the current resume will be lost.',
      confirmCancel: 'Cancel',
      confirmOk: 'Yes, new',
      tabProyectos: 'Projects',
      tabCertificaciones: 'Certifications',
      projNombre: 'Project Name',
      projDesc: 'Project Description',
      projTecnologias: 'Technologies used',
      projLink: 'Project Link (Optional)',
      certNombre: 'Certification Name',
      certEmisor: 'Issuing Organization',
      certFecha: 'Date obtained',
      btnAdd: 'Add new',
      btnRemove: 'Remove'
    }
  }
};
