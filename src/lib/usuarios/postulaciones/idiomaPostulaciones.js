// src/lib/usuarios/postulaciones/idiomaPostulaciones.js
// Diccionario descentralizado de traducciones para el modulo de Postulaciones (ES/EN)

export const idiomaPostulaciones = {
  es: {
    // Header principal
    'post.titulo': 'Postulaciones',
    'post.subtitulo': 'Coach de Entrevistas',
    'post.desc': 'Prepara tus candidaturas y simula entrevistas reales con la ayuda de Coach Wii.',
    'post.nueva': 'Nueva Postulación',
    'post.sinPostulaciones': 'Aún no tienes postulaciones registradas.',
    'post.sinPostulacionesSub': 'Registra una postulación para comenzar a prepararte con Coach Wii.',
    'post.crearPrimera': 'Registrar primera postulación',

    // Selector y estado
    'post.seleccionar': 'Selecciona una postulación...',
    'post.estado': 'Estado de la postulación',
    'post.estados.postulado': 'Postulado',
    'post.estados.entrevista': 'En Entrevista',
    'post.estados.rechazado': 'Rechazado',
    'post.estados.oferta': 'Oferta Recibida',
    'post.eliminar': 'Eliminar postulación',
    'post.confirmarEliminar': '¿Estás seguro de que deseas eliminar esta postulación? Se borrarán sus datos y el historial de chat de forma permanente.',
    'post.eliminado': 'Postulación eliminada con éxito.',

    // Modal nueva postulación
    'post.modalTitulo': 'Nueva Postulación',
    'post.modalNombre': 'Nombre descriptivo (ej: Google - Frontend)',
    'post.modalNombrePl': 'Ej: Google - Frontend Dev',
    'post.modalEmpresa': 'Empresa',
    'post.modalEmpresaPl': 'Ej: Google',
    'post.modalCargo': 'Cargo / Vacante',
    'post.modalCargoPl': 'Ej: Frontend Developer',
    'post.modalIdioma': 'Idioma de preparación',
    'post.modalGuardar': 'Crear candidatura',
    'post.modalCancelar': 'Cancelar',

    // Panel izquierdo (Chat)
    'post.chatHeader': 'Coach Wii',
    'post.chatEstado': 'Coach de Entrevistas · Activo',
    'post.chatLimpiar': 'Limpiar chat',
    'post.chatPlaceholder': 'Pregúntale al Coach Wii (ej: "Simula una entrevista", "Dame tips para este puesto")...',
    'post.chatDisclaimer': 'La IA puede cometer errores. Considera verificar la información importante.',

    // Panel derecho (CV Preview)
    'post.previewHeader': 'Vista del Currículum',
    'post.subirCV': 'Subir CV',
    'post.subirCVHelp': 'Carga tu CV actual para que el coach lo use de contexto.',
    'post.ofertaLabel': 'Descripción de la vacante / Requisitos',
    'post.ofertaPlaceholder': 'Pega aquí la descripción del puesto de trabajo, responsabilidades y habilidades requeridas...',
    'post.ofertaGuardar': 'Guardar vacante',
    'post.previewVacio': 'No hay ningún CV subido para esta candidatura.',
    'post.previewVacioSub': 'Sube tu CV en PDF o Word para visualizarlo aquí y permitir que el coach lo audite.',
    'post.procesando': 'Analizando CV...',
    'post.cvCargado': 'CV analizado e integrado correctamente.',
    'post.cvError': 'Error al procesar el archivo. Intenta con un formato válido.',
    'post.notasGuardadas': 'Descripción de la vacante guardada.',
    'post.nombreLabel': 'Nombre de la postulación',
    'post.guardarNombre': 'Guardar'
  },
  en: {
    // Header principal
    'post.titulo': 'Applications',
    'post.subtitulo': 'Interview Coach',
    'post.desc': 'Prepare your job applications and simulate real interviews with Coach Wii.',
    'post.nueva': 'New Application',
    'post.sinPostulaciones': 'No job applications registered yet.',
    'post.sinPostulacionesSub': 'Register a job application to start preparing with Coach Wii.',
    'post.crearPrimera': 'Register first application',

    // Selector y estado
    'post.seleccionar': 'Select an application...',
    'post.estado': 'Application Status',
    'post.estados.postulado': 'Applied',
    'post.estados.entrevista': 'Interviewing',
    'post.estados.rechazado': 'Rejected',
    'post.estados.oferta': 'Offer Received',
    'post.eliminar': 'Delete application',
    'post.confirmarEliminar': 'Are you sure you want to delete this application? Its data and chat history will be permanently deleted.',
    'post.eliminado': 'Application successfully deleted.',

    // Modal nueva postulación
    'post.modalTitulo': 'New Application',
    'post.modalNombre': 'Descriptive Name (e.g. Google - Frontend)',
    'post.modalNombrePl': 'E.g. Google - Frontend Dev',
    'post.modalEmpresa': 'Company',
    'post.modalEmpresaPl': 'E.g. Google',
    'post.modalCargo': 'Role / Job Position',
    'post.modalCargoPl': 'E.g. Frontend Developer',
    'post.modalIdioma': 'Preparation Language',
    'post.modalGuardar': 'Create candidacy',
    'post.modalCancelar': 'Cancel',

    // Panel izquierdo (Chat)
    'post.chatHeader': 'Coach Wii',
    'post.chatEstado': 'Interview Coach · Online',
    'post.chatLimpiar': 'Clear Chat',
    'post.chatPlaceholder': 'Ask Coach Wii (e.g. "Simulate an interview", "Give me tips for this role")...',
    'post.chatDisclaimer': 'AI can make mistakes. Consider verifying important information.',

    // Panel derecho (CV Preview)
    'post.previewHeader': 'Resume Preview',
    'post.subirCV': 'Upload CV (PDF / Word)',
    'post.subirCVHelp': 'Upload your current resume so the coach can use it as context.',
    'post.ofertaLabel': 'Job Description / Requirements',
    'post.ofertaPlaceholder': 'Paste here the job description, responsibilities, and required skills...',
    'post.ofertaGuardar': 'Save Description',
    'post.previewVacio': 'No resume uploaded for this candidacy.',
    'post.previewVacioSub': 'Upload your resume in PDF or Word to preview it here and let the coach analyze it.',
    'post.procesando': 'Analyzing Resume...',
    'post.cvCargado': 'Resume analyzed and integrated successfully.',
    'post.cvError': 'Error processing the file. Please try a valid format.',
    'post.notasGuardadas': 'Job description saved.',
    'post.nombreLabel': 'Application descriptive name',
    'post.guardarNombre': 'Save'
  }
};
