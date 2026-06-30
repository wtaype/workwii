// src/lib/comparar/idiomaComparar.js
// Diccionario de traducción bilingüe para el Módulo de Comparación

export const idiomaComparar = {
  es: {
    hero: {
      badge: "Benchmark Transparente",
      title: "Workwii vs. Los Grandes del Mercado",
      subtitle: "Comparamos de manera honesta nuestras herramientas frente a las plataformas de currículums más conocidas. Descubre por qué ofrecemos la combinación ideal de optimización ATS, accesibilidad y precio justo."
    },
    sec1: {
      title: "1. Comparativa de Funciones y Beneficios",
      desc: "Evaluación detallada de la potencia tecnológica, optimización IA y facilidades para superar filtros ATS de contratación.",
      table: {
        feature: "Característica",
        workwii: "Workwii (Nosotros)",
        rezi: "Rezi",
        resumeio: "Resume.io",
        novoresume: "Novoresume",
        jobscan: "Jobscan",
        features: {
          botwii: {
            title: "Creador & Formateador ATS con IA (Botwii)",
            workwii: "Completo",
            workwii_tip: "Optimización al 100/100 de tus experiencias integrando verbos fuertes y estructura STAR mediante nuestra IA Botwii.",
            rezi: "Limitado",
            rezi_tip: "Ofrece editor y formatos limpios pero la IA se consume mediante tokens premium caros.",
            resumeio: "Básico",
            resumeio_tip: "Enfocado en plantillas visuales genéricas. Sugerencias de IA muy básicas.",
            novoresume: "Manual",
            novoresume_tip: "El formateador es completamente manual. No cuenta con asistentes avanzados de IA.",
            jobscan: "No disponible",
            jobscan_tip: "No es un creador nativo de CVs; está diseñado exclusivamente para evaluar archivos previamente creados."
          },
          diagnosis: {
            title: "Diagnóstico ATS e Informe de Compatibilidad",
            workwii: "Completo",
            workwii_tip: "Escaneo gratuito interactivo en tiempo real con checklist detallada de mejoras.",
            rezi: "Detallado (Pro)",
            rezi_tip: "Puntuación simple de errores, pero los consejos avanzados requieren suscripción.",
            resumeio: "No disponible",
            resumeio_tip: "No escanea compatibilidad contra vacantes ni evalúa filtros ATS de reclutamiento.",
            novoresume: "No disponible",
            novoresume_tip: "Carece de herramientas para escanear y evaluar la legibilidad ATS del currículum.",
            jobscan: "Completo",
            jobscan_tip: "Excelente análisis contra palabras clave de ofertas (Jobscan destaca fuertemente en esta área)."
          },
          pdf: {
            title: "Descargas de PDF Limpio (Sin marcas)",
            workwii: "Ilimitado",
            workwii_tip: "Descarga directa nativa e ilimitada respetando el formato ideal de 2 páginas ATS.",
            rezi: "Limitado",
            rezi_tip: "Requiere suscripción premium o canje de créditos para exportaciones libres de marcas.",
            resumeio: "Pago Requerido",
            resumeio_tip: "Descarga gratuita limitada a archivos de texto plano (.txt) o PDF con branding.",
            novoresume: "Pago Requerido",
            novoresume_tip: "Bloquea la descarga gratuita si el currículum excede 1 página o contiene elementos pro.",
            jobscan: "No disponible",
            jobscan_tip: "No permite la creación o descarga nativa de currículums."
          },
          privacy: {
            title: "Privacidad del Candidato",
            workwii: "Local / Privado",
            workwii_tip: "Tus datos se almacenan en tu navegador de forma local o bajo tu control estricto.",
            rezi: "Servidor",
            rezi_tip: "Tus currículums y datos personales se guardan permanentemente en su base de datos en la nube.",
            resumeio: "Servidor",
            resumeio_tip: "Guarda tus perfiles en sus servidores y puede monetizar tu información mediante ofertas.",
            novoresume: "Servidor",
            novoresume_tip: "Información centralizada en la nube del proveedor con retención de datos estándar.",
            jobscan: "Servidor",
            jobscan_tip: "Conserva tu historial de escaneos y CVs cargados directamente en sus servidores."
          },
          interviews: {
            title: "Simulador de Entrevistas con IA",
            workwii: "Completo",
            workwii_tip: "Simulador interactivo por voz y texto con preguntas adaptadas a tu puesto y feedback de mejora instantáneo.",
            rezi: "No disponible",
            rezi_tip: "No ofrece simulador de entrevistas.",
            resumeio: "No disponible",
            resumeio_tip: "No ofrece simulador de entrevistas.",
            novoresume: "No disponible",
            novoresume_tip: "No ofrece simulador de entrevistas.",
            jobscan: "No disponible",
            jobscan_tip: "No ofrece simulador de entrevistas."
          },
          converter: {
            title: "Conversor de CV a Formato ATS con IA",
            workwii: "Completo",
            workwii_tip: "Sube tu CV en PDF o Word e impórtalo directamente a una estructura compatible con ATS en segundos.",
            rezi: "Básico",
            rezi_tip: "Importa texto pero requiere reestructurar secciones manualmente.",
            resumeio: "Manual",
            resumeio_tip: "Debes copiar y pegar el texto de tu CV viejo campo por campo.",
            novoresume: "Manual",
            novoresume_tip: "Carga básica de datos, requiere reordenar y diseñar manualmente.",
            jobscan: "No disponible",
            jobscan_tip: "No cuenta con creador nativo o conversor de archivos."
          },
          remotes: {
            title: "Buscador de Empleo Remoto Seguro",
            workwii: "Completo",
            workwii_tip: "Acceso a portales de empleo analizados con pros, contras y consejos para evitar estafas online.",
            rezi: "No disponible",
            rezi_tip: "No ofrece base de datos ni buscador de empleo remoto seguro.",
            resumeio: "No disponible",
            resumeio_tip: "No ofrece base de datos ni buscador de empleo remoto seguro.",
            novoresume: "No disponible",
            novoresume_tip: "No ofrece base de datos ni buscador de empleo remoto seguro.",
            jobscan: "No disponible",
            jobscan_tip: "No ofrece base de datos ni buscador de empleo remoto seguro."
          }
        }
      }
    },
    sec2: {
      title: "2. Comparativa de Precios y Licencias",
      desc: "Una estructura de precios sincera y sin letras pequeñas. Compara los costos mensuales promedio de cada servicio.",
      table: {
        platform: "Plataforma",
        basic: "Nivel Básico (Free)",
        pro: "Nivel Profesional (Pro)",
        vip: "Nivel VIP / Premium",
        recurring: "Suscripción Recurrente Obligatoria",
        no: "NO",
        yes: "SÍ",
        workwii: {
          name: "Workwii (Nosotros)",
          basic: "Gratis",
          basic_desc: "Generoso creador básico y herramientas de ATS",
          pro: "$4.99 USD",
          pro_desc: "Al mes (Optimización total con Botwii e IA)",
          vip: "$9.99 USD",
          vip_desc: "Al mes (Simulador de entrevistas ilimitado)",
          rec: "NO (Pagas solo cuando necesitas optimización extra)"
        },
        rezi: {
          name: "Rezi",
          basic: "Gratis",
          basic_desc: "Muy limitado en créditos de IA y descargas",
          pro: "$19.00 USD",
          pro_desc: "Al mes (Acceso básico)",
          vip: "$40.00 USD",
          vip_desc: "Al mes o cobro de créditos de por vida",
          rec: "SÍ (Suscripciones costosas)"
        },
        resumeio: {
          name: "Resume.io",
          basic: "Limitado",
          basic_desc: "Solo descarga en texto plano",
          pro: "$24.95 USD",
          pro_desc: "Al mes (Renovación automática tras prueba)",
          vip: "$24.95 USD",
          vip_desc: "Mismo cobro mensual fijo",
          rec: "SÍ (Prueba de $2.90 de 7 días se auto-renueva a $24.95)"
        },
        novoresume: {
          name: "Novoresume",
          basic: "Limitado",
          basic_desc: "Solo 1 página y sin elementos especiales",
          pro: "$19.99 USD",
          pro_desc: "Al mes (Acceso a plantillas multipágina)",
          vip: "$19.99 USD",
          vip_desc: "Precio plano de suscripción única",
          rec: "SÍ (Requiere pago para descargas complejas)"
        },
        jobscan: {
          name: "Jobscan",
          basic: "Limitado",
          basic_desc: "Solo 5 escaneos básicos mensuales",
          pro: "$49.95 USD",
          pro_desc: "Al mes (Facturación mensual)",
          vip: "$49.95 USD",
          vip_desc: "Escaneos ilimitados para 1 usuario",
          rec: "SÍ (Una de las herramientas más costosas)"
        }
      }
    },
    sec3: {
      title: "3. ¿Por Qué Destacamos y Somos de Confianza?",
      desc: "Nuestros pilares fundamentales garantizan que tu currículum destaque visualmente y sea 100% elegible por las empresas.",
      cards: {
        parsers: {
          tip: "Todos nuestros layouts eliminan tablas complejas, gráficos e iconos innecesarios que confunden a los analizadores de empleo automatizados.",
          title: "Parseadores ATS Optimizados",
          desc: "Diseñamos plantillas limpias estructuradas bajo los estándares que sistemas como Workday, Greenhouse y Taleo pueden procesar y catalogar sin un solo error."
        },
        card: {
          tip: "Crear y probar currículums es libre. Solo adquieres servicios de optimización premium si así lo decides voluntariamente.",
          title: "Sin Tarjeta de Crédito",
          desc: "Prueba nuestras herramientas básicas de inmediato y edita tu CV libremente. Olvídate de cobros recurrentes sorpresa o períodos de prueba engañosos."
        },
        star: {
          tip: "Botwii te asiste para que uses la estructura STAR y apliques métricas reales para cuantificar tu impacto en cada empleo anterior.",
          title: "Enfoque en Logros y Métricas",
          desc: "No creamos párrafos de relleno. Nuestra IA optimiza tus logros con datos, verbos de acción fuertes y resultados tangibles para convencer a los reclutadores."
        },
        privacy: {
          tip: "Tus datos sensibles se mantienen seguros en el almacenamiento local de tu propio navegador. Nadie más tiene acceso.",
          title: "Privacidad Local Primero",
          desc: "Nos tomamos la privacidad en serio. Puedes redactar tu información sabiendo que no será monetizada ni vendida a agencias externas de empleo."
        }
      }
    },
    cta: {
      title: "¿Listo para Superar los Filtros ATS con Éxito?",
      desc: "Crea tu currículum optimizado, analiza su compatibilidad en tiempo real y prepárate para tu próxima entrevista usando nuestras herramientas inteligentes.",
      btn: "Comenzar Ahora Gratis"
    }
  },
  en: {
    hero: {
      badge: "Transparent Benchmark",
      title: "Workwii vs. Market Giants",
      subtitle: "We honestly compare our tools against the most popular resume platforms. Discover why we offer the ideal combination of ATS optimization, accessibility, and fair pricing."
    },
    sec1: {
      title: "1. Feature and Benefit Comparison",
      desc: "Detailed evaluation of technological power, AI optimization, and features to bypass hiring ATS filters.",
      table: {
        feature: "Feature",
        workwii: "Workwii (Us)",
        rezi: "Rezi",
        resumeio: "Resume.io",
        novoresume: "Novoresume",
        jobscan: "Jobscan",
        features: {
          botwii: {
            title: "AI-Powered ATS Builder & Formatter (Botwii)",
            workwii: "Complete",
            workwii_tip: "100/100 optimization of your experiences by integrating strong action verbs and STAR structure using our AI Botwii.",
            rezi: "Limited",
            rezi_tip: "Offers editor and clean formats, but AI is consumed via expensive premium tokens.",
            resumeio: "Basic",
            resumeio_tip: "Focused on generic visual templates. Very basic AI suggestions.",
            novoresume: "Manual",
            novoresume_tip: "The formatter is completely manual. No advanced AI assistants.",
            jobscan: "Not available",
            jobscan_tip: "Not a native resume builder; designed exclusively to evaluate previously created files."
          },
          diagnosis: {
            title: "ATS Diagnosis & Compatibility Report",
            workwii: "Complete",
            workwii_tip: "Free real-time interactive scan with detailed checklist of improvements.",
            rezi: "Detailed (Pro)",
            rezi_tip: "Simple error score, but advanced advice requires a subscription.",
            resumeio: "Not available",
            resumeio_tip: "Does not scan compatibility against jobs or evaluate recruitment ATS filters.",
            novoresume: "Not available",
            novoresume_tip: "Lacks tools to scan and evaluate the ATS legibility of the resume.",
            jobscan: "Complete",
            jobscan_tip: "Excellent analysis against keywords of job postings (Jobscan excels in this area)."
          },
          pdf: {
            title: "Clean PDF Downloads (No watermarks)",
            workwii: "Unlimited",
            workwii_tip: "Direct native and unlimited download respecting the ideal 2-page ATS format.",
            rezi: "Limited",
            rezi_tip: "Requires premium subscription or credit redemption for watermark-free exports.",
            resumeio: "Payment Required",
            resumeio_tip: "Free download limited to plain text (.txt) files or PDFs with branding.",
            novoresume: "Payment Required",
            novoresume_tip: "Blocks free download if the resume exceeds 1 page or contains pro elements.",
            jobscan: "Not available",
            jobscan_tip: "Does not allow native resume creation or downloads."
          },
          privacy: {
            title: "Candidate Privacy",
            workwii: "Local / Private",
            workwii_tip: "Your data is stored locally in your browser or under your strict control.",
            rezi: "Server",
            rezi_tip: "Your resumes and personal data are permanently saved in their cloud database.",
            resumeio: "Server",
            resumeio_tip: "Saves your profiles on their servers and can monetize your information through offers.",
            novoresume: "Server",
            novoresume_tip: "Centralized information in the provider's cloud with standard data retention.",
            jobscan: "Server",
            jobscan_tip: "Retains your scan history and uploaded resumes directly on their servers."
          },
          interviews: {
            title: "AI Interview Simulator",
            workwii: "Complete",
            workwii_tip: "Interactive voice and text simulator with questions tailored to your role and instant improvement feedback.",
            rezi: "Not available",
            rezi_tip: "Does not offer an interview simulator.",
            resumeio: "Not available",
            resumeio_tip: "Does not offer an interview simulator.",
            novoresume: "Not available",
            novoresume_tip: "Does not offer an interview simulator.",
            jobscan: "Not available",
            jobscan_tip: "Does not offer an interview simulator."
          },
          converter: {
            title: "AI CV to ATS Converter",
            workwii: "Complete",
            workwii_tip: "Upload your PDF or Word CV and import it directly into an ATS-compatible structure in seconds.",
            rezi: "Basic",
            rezi_tip: "Imports text but requires manually restructuring sections.",
            resumeio: "Manual",
            resumeio_tip: "You must copy and paste the text of your old CV field by field.",
            novoresume: "Manual",
            novoresume_tip: "Basic data loading, requires manual reordering and styling.",
            jobscan: "Not available",
            jobscan_tip: "Does not have a native builder or file converter."
          },
          remotes: {
            title: "Secure Remote Job Board",
            workwii: "Complete",
            workwii_tip: "Access to job boards analyzed with pros, cons, and tips to avoid online scams.",
            rezi: "Not available",
            rezi_tip: "Does not offer a secure remote job search engine or database.",
            resumeio: "Not available",
            resumeio_tip: "Does not offer a secure remote job search engine or database.",
            novoresume: "Not available",
            novoresume_tip: "Does not offer a secure remote job search engine or database.",
            jobscan: "Not available",
            jobscan_tip: "Does not offer a secure remote job search engine or database."
          }
        }
      }
    },
    sec2: {
      title: "2. Pricing and License Comparison",
      desc: "An honest pricing structure with no fine print. Compare average monthly costs of each service.",
      table: {
        platform: "Platform",
        basic: "Basic Level (Free)",
        pro: "Professional Level (Pro)",
        vip: "VIP / Premium Level",
        recurring: "Mandatory Recurring Subscription",
        no: "NO",
        yes: "YES",
        workwii: {
          name: "Workwii (Us)",
          basic: "Free",
          basic_desc: "Generous basic builder and ATS tools",
          pro: "$4.99 USD",
          pro_desc: "Per month (Full optimization with Botwii & AI)",
          vip: "$9.99 USD",
          vip_desc: "Per month (Unlimited interview simulator)",
          rec: "NO (You only pay when you need extra optimization)"
        },
        rezi: {
          name: "Rezi",
          basic: "Free",
          basic_desc: "Highly limited in AI credits and downloads",
          pro: "$19.00 USD",
          pro_desc: "Per month (Basic access)",
          vip: "$40.00 USD",
          vip_desc: "Per month or lifetime credit purchase",
          rec: "YES (Expensive subscriptions)"
        },
        resumeio: {
          name: "Resume.io",
          basic: "Limited",
          basic_desc: "Plain text download only",
          pro: "$24.95 USD",
          pro_desc: "Per month (Auto-renews after trial)",
          vip: "$24.95 USD",
          vip_desc: "Same fixed monthly charge",
          rec: "YES (7-day $2.90 trial auto-renews to $24.95)"
        },
        novoresume: {
          name: "Novoresume",
          basic: "Limited",
          basic_desc: "1 page only, no special elements",
          pro: "$19.99 USD",
          pro_desc: "Per month (Access to multi-page templates)",
          vip: "$19.99 USD",
          vip_desc: "Flat rate single subscription price",
          rec: "YES (Requires payment for complex downloads)"
        },
        jobscan: {
          name: "Jobscan",
          basic: "Limited",
          basic_desc: "5 basic monthly scans only",
          pro: "$49.95 USD",
          pro_desc: "Per month (Monthly billing)",
          vip: "$49.95 USD",
          vip_desc: "Unlimited scans for 1 user",
          rec: "YES (One of the most expensive tools)"
        }
      }
    },
    sec3: {
      title: "3. Why We Stand Out and Are Trusted",
      desc: "Our key pillars ensure your resume stands out visually and is 100% eligible for hiring companies.",
      cards: {
        parsers: {
          tip: "All our layouts eliminate complex tables, graphics, and unnecessary icons that confuse automated applicant tracking systems.",
          title: "Optimized ATS Parsers",
          desc: "We design clean templates structured under standards that systems like Workday, Greenhouse, and Taleo can process and catalog without a single error."
        },
        card: {
          tip: "Creating and testing resumes is free. You only purchase premium optimization services if you voluntarily choose to.",
          title: "No Credit Card",
          desc: "Try our basic tools immediately and edit your CV freely. Forget about surprise recurring charges or deceptive trial periods."
        },
        star: {
          tip: "Botwii helps you use the STAR structure and apply real metrics to quantify your impact in each previous job.",
          title: "Focus on Achievements & Metrics",
          desc: "We don't create filler paragraphs. Our AI optimizes your achievements with data, strong action verbs, and tangible results to convince recruiters."
        },
        privacy: {
          tip: "Your sensitive data remains secure in your own browser's local storage. No one else has access.",
          title: "Local Privacy First",
          desc: "We take privacy seriously. You can write your details knowing they won't be monetized or sold to external recruitment agencies."
        }
      }
    },
    cta: {
      title: "Ready to Bypass ATS Filters Successfully?",
      desc: "Create your optimized resume, analyze its compatibility in real time, and prepare for your next interview using our smart tools.",
      btn: "Start Now Free"
    }
  }
};
