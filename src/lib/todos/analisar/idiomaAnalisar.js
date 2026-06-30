// src/lib/analisar/idiomaAnalisar.js
// Diccionario de traducción bilingüe para el Módulo de Análisis de CV

export const idiomaAnalisar = {
  es: {
    header: {
      tit: 'Optimiza tu CV para <span>Filtros ATS</span>',
      desc: 'Sube tu currículum (PDF o Word). Te diremos el nivel de compatibilidad con tu puesto de interés y cómo mejorar paso a paso para pasar la selección.'
    },
    entry: {
      tit: 'Analizar tu Currículum Vitae',
      fileLabel: 'Sube tu currículum existente',
      dzTit: 'Arrastra tu archivo aquí o haz clic',
      dzSub: 'Formatos soportados: PDF y Word (.docx) — Hasta 4MB',
      progress: 'Subiendo archivo...',
      roleLabel: 'Puesto o Título Deseado',
      rolePl: 'Ej: Desarrollador React, Diseñador UX...',
      langLabel: 'Idioma del Reporte',
      langEs: 'Español (Latinoamerica)',
      langEn: 'Inglés (English EEUU)',
      btnAnalyze: 'Analizar Compatibilidad con IA'
    },
    loader: {
      tit: 'Analizando tu currículum con IA',
      eta: 'Analizando · ~15 segundos restantes',
      progress: 'Progreso del análisis',
      tip: 'Tip',
      cargandoTip: 'Cargando consejo...'
    },
    results: {
      gaugeTit: 'Compatibilidad ATS',
      gaugeStatus: 'Excelente Match',
      readyToApply: '¡Listo para postular!',
      palabras: 'palabras',
      paginas: 'páginas',
      secciones: 'secciones',
      verificando: 'Verificando legibilidad...',
      breakdownTit: 'Desglose de Análisis',
      breakdownContact: 'Información de Contacto',
      breakdownExperience: 'Historial de Experiencia',
      breakdownEducation: 'Nivel de Educación',
      breakdownSkills: 'Habilidades Clave',
      compareTit: '¿Cómo te comparas?',
      btnOptimize: 'Corregir y Optimizar con IA',
      btnNew: 'Nuevo Análisis',
      btnCopy: 'Copiar Guía',
      btnDownload: 'Descargar',
      btnDownloadTxt: 'Descargar Texto (.txt)',
      btnDownloadPdf: 'Imprimir Reporte (.pdf)',
      freeLimit: 'Análisis gratis:',
      confirmNewTitle: '¿Nuevo Análisis?',
      confirmNewDesc: 'Se perderán los resultados del análisis actual. ¿Deseas continuar?',
      confirmCancel: 'Cancelar',
      confirmAccept: 'Confirmar',
      btnDownloadDocx: 'Descargar Word (.docx)',
      btnDownloadJson: 'Descargar JSON (.json)'
    },
    tabs: {
      diagnostico: 'Diagnóstico',
      plan: 'Plan de Acción',
      formato: 'Formato ATS'
    },
    diagnostico: {
      compatibilidadTit: 'Análisis de Compatibilidad',
      compatibilidadLoading: 'Evaluando tu currículum con Inteligencia Artificial...',
      detectedTit: 'Lo que el ATS "vio" en tu CV',
      detectedDesc: 'Así interpreta el software de reclutamiento la información de tu currículum:',
      langQualTit: 'Calidad del Lenguaje',
      langQualDesc: 'Verbos de acción, logros cuantificados y densidad de keywords en tu CV:',
      kwTit: 'Palabras Clave (Keywords)',
      kwDesc: 'Los algoritmos ATS buscan coincidencia de términos exactos. Añade las palabras clave faltantes para mejorar tu score.',
      kwMatched: 'Detectadas en tu CV',
      kwMissing: 'Debes agregar',
      recTit: 'Recomendaciones Rápidas'
    },
    plan: {
      tit: 'Plan de Acción y Cambios Sugeridos',
      desc: 'A continuación se detalla la lista de cambios prioritarios que debes realizar en tu CV para superar con éxito la prueba del robot. Puedes marcar las tareas que vayas completando.',
      progreso: 'Progreso de Optimización',
      completadas: 'Has completado {done} de {total} mejoras recomendadas.'
    },
    formato: {
      tit: 'Auditoría de Formato de Lectura ATS',
      desc: 'Evaluamos la legibilidad de tu currículum frente a los criterios y limitaciones de procesamiento típicos de los softwares de reclutamiento automático.'
    }
  },
  en: {
    header: {
      tit: 'Optimize your CV for <span>ATS Filters</span>',
      desc: 'Upload your resume (PDF or Word). We will tell you the compatibility level with your target role and how to improve step-by-step to pass selection.'
    },
    entry: {
      tit: 'Analyze your Curriculum Vitae',
      fileLabel: 'Upload your existing resume',
      dzTit: 'Drag your file here or click',
      dzSub: 'Supported formats: PDF and Word (.docx) — Up to 4MB',
      progress: 'Uploading file...',
      roleLabel: 'Desired Role or Title',
      rolePl: 'e.g., React Developer, UX Designer...',
      langLabel: 'Report Language',
      langEs: 'Spanish (Latin America)',
      langEn: 'English (US English)',
      btnAnalyze: 'Analyze Compatibility with AI'
    },
    loader: {
      tit: 'Analyzing your resume with AI',
      eta: 'Analyzing · ~15 seconds remaining',
      progress: 'Analysis progress',
      tip: 'Tip',
      cargandoTip: 'Loading tip...'
    },
    results: {
      gaugeTit: 'ATS Compatibility',
      gaugeStatus: 'Excellent Match',
      readyToApply: 'Ready to apply!',
      palabras: 'words',
      paginas: 'pages',
      secciones: 'sections',
      verificando: 'Verifying readability...',
      breakdownTit: 'Analysis Breakdown',
      breakdownContact: 'Contact Information',
      breakdownExperience: 'Work Experience',
      breakdownEducation: 'Education Level',
      breakdownSkills: 'Key Skills',
      compareTit: 'How do you compare?',
      btnOptimize: 'Correct & Optimize with AI',
      btnNew: 'New Analysis',
      btnCopy: 'Copy Guide',
      btnDownload: 'Download',
      btnDownloadTxt: 'Download Text (.txt)',
      btnDownloadPdf: 'Print Report (.pdf)',
      freeLimit: 'Free analyses:',
      confirmNewTitle: 'New Analysis?',
      confirmNewDesc: 'Current analysis results will be lost. Do you want to continue?',
      confirmCancel: 'Cancel',
      confirmAccept: 'Confirm',
      btnDownloadDocx: 'Download Word (.docx)',
      btnDownloadJson: 'Download JSON (.json)'
    },
    tabs: {
      diagnostico: 'Diagnosis',
      plan: 'Action Plan',
      formato: 'ATS Format'
    },
    diagnostico: {
      compatibilidadTit: 'Compatibility Analysis',
      compatibilidadLoading: 'Evaluating your resume with Artificial Intelligence...',
      detectedTit: 'What the ATS "saw" in your CV',
      detectedDesc: 'This is how recruitment software interprets your resume information:',
      langQualTit: 'Language Quality',
      langQualDesc: 'Action verbs, quantified achievements, and keyword density in your resume:',
      kwTit: 'Keywords',
      kwDesc: 'ATS algorithms look for exact term matches. Add missing keywords to improve your score.',
      kwMatched: 'Detected in your CV',
      kwMissing: 'You should add',
      recTit: 'Quick Recommendations'
    },
    plan: {
      tit: 'Action Plan & Suggested Changes',
      desc: 'Below is the list of priority changes you need to make to your CV to successfully pass the robot test. You can check off tasks as you complete them.',
      progreso: 'Optimization Progress',
      completadas: 'You have completed {done} of {total} recommended improvements.'
    },
    formato: {
      tit: 'ATS Reading Format Audit',
      desc: 'We evaluate the readability of your resume against standard automatic recruitment software criteria and processing limitations.'
    }
  }
};
