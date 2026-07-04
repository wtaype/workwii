// src/lib/todos/ccat/preguntas/banco.js
// Banco de 60 enunciados del test CCAT (20 Verbal, 20 Numérico, 20 Espacial)
// Mantiene únicamente las estructuras públicas de las preguntas sin claves de respuestas

export const bancoPreguntas = [
  // ==========================================
  // VERBAL REASONING (1 - 20)
  // ==========================================
  {
    id: 1,
    categoria: "verbal",
    es: {
      pregunta: "PINTOR es a PINCEL como ESCRITOR es a...",
      opciones: ["Libro", "Pluma", "Papel", "Novela", "Tinta"]
    },
    en: {
      pregunta: "PAINTER is to BRUSH as WRITER is to...",
      opciones: ["Book", "Pen", "Paper", "Novel", "Ink"]
    }
  },
  {
    id: 2,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea OPUESTA a: PROLONGAR",
      opciones: ["Acortar", "Extender", "Demorar", "Elongar", "Mantener"]
    },
    en: {
      pregunta: "Choose the word that is OPPOSITE to: LENGTHEN",
      opciones: ["Shorten", "Extend", "Delay", "Elongate", "Maintain"]
    }
  },
  {
    id: 3,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea más SIMILAR a: PRECISO",
      opciones: ["Vago", "Estimado", "Rápido", "Exacto", "General"]
    },
    en: {
      pregunta: "Choose the word that is MOST SIMILAR to: ACCURATE",
      opciones: ["Vague", "Estimated", "Fast", "Exact", "General"]
    }
  },
  {
    id: 4,
    categoria: "verbal",
    es: {
      pregunta: "Complete la oración: El comité decidió ________ la votación hasta la próxima semana para revisar las propuestas.",
      opciones: ["acelerar", "cancelar", "posponer", "ejecutar", "olvidar"]
    },
    en: {
      pregunta: "Complete the sentence: The committee decided to ________ the vote until next week to review the proposals.",
      opciones: ["accelerate", "cancel", "postpone", "execute", "forget"]
    }
  },
  {
    id: 5,
    categoria: "verbal",
    es: {
      pregunta: "LEÓN es a MANADA como PEZ es a...",
      opciones: ["Agua", "Río", "Red", "Océano", "Cardumen"]
    },
    en: {
      pregunta: "LION is to PRIDE as FISH is to...",
      opciones: ["Water", "River", "Net", "Ocean", "School"]
    }
  },
  {
    id: 6,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea más SIMILAR a: INCOMPRENSIBLE",
      opciones: ["Ininteligible", "Fácil", "Lógico", "Aburrido", "Extranjero"]
    },
    en: {
      pregunta: "Choose the word that is MOST SIMILAR to: INCOMPREHENSIBLE",
      opciones: ["Unintelligible", "Easy", "Logical", "Boring", "Foreign"]
    }
  },
  {
    id: 7,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea OPUESTA a: TRANSPARENTE",
      opciones: ["Claro", "Limpio", "Brillante", "Opaco", "Traslúcido"]
    },
    en: {
      pregunta: "Choose the word that is OPPOSITE to: TRANSPARENT",
      opciones: ["Clear", "Clean", "Bright", "Opaque", "Translucent"]
    }
  },
  {
    id: 8,
    categoria: "verbal",
    es: {
      pregunta: "Complete la oración: A pesar de estar muy ________, el equipo de rescate continuó buscando sobrevivientes toda la noche.",
      opciones: ["contento", "preparado", "agotado", "distraído", "seguro"]
    },
    en: {
      pregunta: "Complete the sentence: Despite being extremely ________, the rescue team kept searching for survivors all night.",
      opciones: ["happy", "prepared", "exhausted", "distracted", "confident"]
    }
  },
  {
    id: 9,
    categoria: "verbal",
    es: {
      pregunta: "TERMÓMETRO es a TEMPERATURA como BÁSCULA es a...",
      opciones: ["Distancia", "Peso", "Tiempo", "Velocidad", "Volumen"]
    },
    en: {
      pregunta: "THERMOMETER is to TEMPERATURE as SCALE is to...",
      opciones: ["Distance", "Weight", "Time", "Speed", "Volume"]
    }
  },
  {
    id: 10,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea OPUESTA a: BENÉVOLO",
      opciones: ["Amable", "Generoso", "Justo", "Malévolo", "Pasivo"]
    },
    en: {
      pregunta: "Choose the word that is OPPOSITE to: BENEVOLENT",
      opciones: ["Kind", "Generous", "Fair", "Malevolent", "Passive"]
    }
  },
  {
    id: 11,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea más SIMILAR a: ABSURDO",
      opciones: ["Inteligente", "Serio", "Ilógico", "Común", "Moderno"]
    },
    en: {
      pregunta: "Choose the word that is MOST SIMILAR to: ABSURD",
      opciones: ["Smart", "Serious", "Illogical", "Common", "Modern"]
    }
  },
  {
    id: 12,
    categoria: "verbal",
    es: {
      pregunta: "GALAXIA es a ESTRELLA como ARCHIPIÉLAGO es a...",
      opciones: ["Isla", "Océano", "Arena", "Continente", "Pez"]
    },
    en: {
      pregunta: "GALAXY is to STAR as ARCHIPELAGO is to...",
      opciones: ["Island", "Ocean", "Sand", "Continent", "Fish"]
    }
  },
  {
    id: 13,
    categoria: "verbal",
    es: {
      pregunta: "Complete la oración: La nueva actualización de software fue diseñada para ________ el rendimiento del sistema.",
      opciones: ["limitar", "dañar", "ignorar", "optimizar", "reducir"]
    },
    en: {
      pregunta: "Complete the sentence: The new software update was designed to ________ system performance.",
      opciones: ["limit", "damage", "ignore", "optimize", "reduce"]
    }
  },
  {
    id: 14,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea OPUESTA a: ESPORÁDICO",
      opciones: ["Raro", "Frecuente", "Aislado", "Inusual", "Lento"]
    },
    en: {
      pregunta: "Choose the word that is OPPOSITE to: SPORADIC",
      opciones: ["Rare", "Frequent", "Isolated", "Unusual", "Slow"]
    }
  },
  {
    id: 15,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea más SIMILAR a: HONESTO",
      opciones: ["Tímido", "Falso", "Astuto", "Rápido", "Sincero"]
    },
    en: {
      pregunta: "Choose the word that is MOST SIMILAR to: HONEST",
      opciones: ["Shy", "False", "Sly", "Fast", "Sincere"]
    }
  },
  {
    id: 16,
    categoria: "verbal",
    es: {
      pregunta: "TECLAS son a PIANO como CUERDAS son a...",
      opciones: ["Tambor", "Flauta", "Guitarra", "Trompeta", "Silbato"]
    },
    en: {
      pregunta: "KEYS are to PIANO as STRINGS are to...",
      opciones: ["Drum", "Flute", "Guitar", "Trumpet", "Whistle"]
    }
  },
  {
    id: 17,
    categoria: "verbal",
    es: {
      pregunta: "Complete la oración: Debido a las intensas lluvias, es muy ________ que el vuelo sufra un retraso.",
      opciones: ["imposible", "probable", "malo", "extraño", "seguro"]
    },
    en: {
      pregunta: "Complete the sentence: Due to heavy rains, it is highly ________ that the flight will be delayed.",
      opciones: ["impossible", "probable", "bad", "strange", "certain"]
    }
  },
  {
    id: 18,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea OPUESTA a: ABUNDANTE",
      opciones: ["Rico", "Grande", "Suficiente", "Escaso", "Lleno"]
    },
    en: {
      pregunta: "Choose the word that is OPPOSITE to: PLENTIFUL",
      opciones: ["Rich", "Large", "Sufficient", "Scarce", "Full"]
    }
  },
  {
    id: 19,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea más SIMILAR a: VIGILANTE",
      opciones: ["Atento", "Dormido", "Cansado", "Rápido", "Indiferente"]
    },
    en: {
      pregunta: "Choose the word that is MOST SIMILAR to: VIGILANT",
      opciones: ["Watchful", "Asleep", "Tired", "Fast", "Indifferent"]
    }
  },
  {
    id: 20,
    categoria: "verbal",
    es: {
      pregunta: "PLUMA es a PÁJARO como ESCAMA es a...",
      opciones: ["Piel", "Perro", "Oso", "León", "Pez"]
    },
    en: {
      pregunta: "FEATHER is to BIRD as SCALE is to...",
      opciones: ["Skin", "Dog", "Bear", "Lion", "Fish"]
    }
  },

  // ==========================================
  // NUMERICAL REASONING (21 - 40)
  // ==========================================
  {
    id: 21,
    categoria: "numerical",
    es: {
      pregunta: "Si 5 bolígrafos cuestan $15, ¿cuánto costarán 8 bolígrafos?",
      opciones: ["$20", "$22", "$24", "$26", "$28"]
    },
    en: {
      pregunta: "If 5 pens cost $15, how much will 8 pens cost?",
      opciones: ["$20", "$22", "$24", "$26", "$28"]
    }
  },
  {
    id: 22,
    categoria: "numerical",
    es: {
      pregunta: "Complete la serie numérica: 2, 4, 8, 16, 32, ...",
      opciones: ["48", "50", "60", "64", "72"]
    },
    en: {
      pregunta: "Complete the number series: 2, 4, 8, 16, 32, ...",
      opciones: ["48", "50", "60", "64", "72"]
    }
  },
  {
    id: 23,
    categoria: "numerical",
    es: {
      pregunta: "¿Cuál es el promedio (media) de 12, 16 y 20?",
      opciones: ["15", "16", "17", "18", "19"]
    },
    en: {
      pregunta: "What is the average (mean) of 12, 16, and 20?",
      opciones: ["15", "16", "17", "18", "19"]
    }
  },
  {
    id: 24,
    categoria: "numerical",
    es: {
      pregunta: "¿Cuánto es el 25% (un cuarto) de 120?",
      opciones: ["30", "40", "50", "60", "70"]
    },
    en: {
      pregunta: "What is 25% (one quarter) of 120?",
      opciones: ["30", "40", "50", "60", "70"]
    }
  },
  {
    id: 25,
    categoria: "numerical",
    es: {
      pregunta: "Una tienda vende una laptop con 10% de descuento. Si el precio original es $500, ¿cuál es el precio con descuento?",
      opciones: ["$400", "$430", "$450", "$470", "$490"]
    },
    en: {
      pregunta: "A store sells a laptop with a 10% discount. If the original price is $500, what is the discounted price?",
      opciones: ["$400", "$430", "$450", "$470", "$490"]
    }
  },
  {
    id: 26,
    categoria: "numerical",
    es: {
      pregunta: "Complete la serie numérica: 5, 10, 15, 20, ...",
      opciones: ["21", "23", "25", "27", "30"]
    },
    en: {
      pregunta: "Complete the number series: 5, 10, 15, 20, ...",
      opciones: ["21", "23", "25", "27", "30"]
    }
  },
  {
    id: 27,
    categoria: "numerical",
    es: {
      pregunta: "Un auto recorre 150 km en 3 horas. ¿Cuál es su velocidad promedio en km/h?",
      opciones: ["45 km/h", "50 km/h", "55 km/h", "60 km/h", "65 km/h"]
    },
    en: {
      pregunta: "A car travels 150 km in 3 hours. What is its average speed in km/h?",
      opciones: ["45 km/h", "50 km/h", "55 km/h", "60 km/h", "65 km/h"]
    }
  },
  {
    id: 28,
    categoria: "numerical",
    es: {
      pregunta: "El promedio de edad de 4 personas es 25 años. Tres de ellas tienen 22, 28 y 24 años. ¿Qué edad tiene la cuarta persona?",
      opciones: ["23 años", "24 años", "25 años", "26 años", "27 años"]
    },
    en: {
      pregunta: "The average age of 4 people is 25. Three of them are 22, 28, and 24 years old. How old is the fourth person?",
      opciones: ["23 years", "24 years", "25 years", "26 years", "27 years"]
    }
  },
  {
    id: 29,
    categoria: "numerical",
    es: {
      pregunta: "¿Qué fracción es mayor?",
      opciones: ["3/4", "5/8", "1/2", "3/8", "7/16"]
    },
    en: {
      pregunta: "Which fraction is the largest?",
      opciones: ["3/4", "5/8", "1/2", "3/8", "7/16"]
    }
  },
  {
    id: 30,
    categoria: "numerical",
    es: {
      pregunta: "Complete la serie numérica: 3, 9, 27, 81, ...",
      opciones: ["162", "200", "220", "243", "280"]
    },
    en: {
      pregunta: "Complete the number series: 3, 9, 27, 81, ...",
      options: ["162", "200", "220", "243", "280"],
      opciones: ["162", "200", "220", "243", "280"]
    }
  },
  {
    id: 31,
    categoria: "numerical",
    es: {
      pregunta: "Un atleta corre 400 metros en 80 segundos. ¿Cuál es su velocidad en metros por segundo?",
      opciones: ["5 m/s", "6 m/s", "7 m/s", "8 m/s", "10 m/s"]
    },
    en: {
      pregunta: "A runner completes 400 meters in 80 seconds. What is their speed in meters per second?",
      opciones: ["5 m/s", "6 m/s", "7 m/s", "8 m/s", "10 m/s"]
    }
  },
  {
    id: 32,
    categoria: "numerical",
    es: {
      pregunta: "¿Cuánto es el 15% de 200?",
      opciones: ["20", "30", "40", "45", "50"]
    },
    en: {
      pregunta: "What is 15% of 200?",
      opciones: ["20", "30", "40", "45", "50"]
    }
  },
  {
    id: 33,
    categoria: "numerical",
    es: {
      pregunta: "Un tanque tiene 100 litros de agua. Si pierde 4 litros por hora, ¿cuántas horas tardará en vaciarse por completo?",
      opciones: ["20 horas", "22 horas", "25 horas", "30 horas", "33 horas"]
    },
    en: {
      pregunta: "A tank contains 100 liters of water. If it leaks 4 liters per hour, how many hours will it take to empty completely?",
      opciones: ["20 hours", "22 hours", "25 hours", "30 hours", "33 hours"]
    }
  },
  {
    id: 34,
    categoria: "numerical",
    es: {
      pregunta: "Complete la serie numérica: 100, 90, 81, 73, ...",
      opciones: ["64", "65", "66", "67", "68"]
    },
    en: {
      pregunta: "Complete the number series: 100, 90, 81, 73, ...",
      opciones: ["64", "65", "66", "67", "68"]
    }
  },
  {
    id: 35,
    categoria: "numerical",
    es: {
      pregunta: "El promedio de peso de 5 cajas es 10 kg. Si agregamos una sexta caja que pesa 16 kg, ¿cuál es el nuevo promedio?",
      opciones: ["10.5 kg", "10.8 kg", "11.0 kg", "11.2 kg", "11.5 kg"]
    },
    en: {
      pregunta: "The average weight of 5 boxes is 10 kg. If we add a sixth box weighing 16 kg, what is the new average?",
      opciones: ["10.5 kg", "10.8 kg", "11.0 kg", "11.2 kg", "11.5 kg"]
    }
  },
  {
    id: 36,
    categoria: "numerical",
    es: {
      pregunta: "Una tienda incrementa el precio de una chaqueta de $40 en un 25%. ¿Cuál es el nuevo precio?",
      opciones: ["$45", "$48", "$50", "$52", "$55"]
    },
    en: {
      pregunta: "A store increases the price of a $40 jacket by 25%. What is the new price?",
      opciones: ["$45", "$48", "$50", "$52", "$55"]
    }
  },
  {
    id: 37,
    categoria: "numerical",
    es: {
      pregunta: "¿Cuánto es 2/5 de 50?",
      opciones: ["15", "20", "25", "30", "35"]
    },
    en: {
      pregunta: "What is 2/5 of 50?",
      opciones: ["15", "20", "25", "30", "35"]
    }
  },
  {
    id: 38,
    categoria: "numerical",
    es: {
      pregunta: "Complete la serie numérica: 1, 2, 4, 7, 11, ...",
      opciones: ["13", "14", "15", "16", "17"]
    },
    en: {
      pregunta: "Complete the number series: 1, 2, 4, 7, 11, ...",
      opciones: ["13", "14", "15", "16", "17"]
    }
  },
  {
    id: 39,
    categoria: "numerical",
    es: {
      pregunta: "Juan tiene el doble de la edad de María. Si María tiene 12 años, ¿cuántos años tendrá Juan dentro de 5 años?",
      opciones: ["24 años", "25 años", "27 años", "28 años", "29 años"]
    },
    en: {
      pregunta: "John is twice as old as Mary. If Mary is 12 years old, how old will John be in 5 years?",
      opciones: ["24 years", "25 years", "27 years", "28 years", "29 years"]
    }
  },
  {
    id: 40,
    categoria: "numerical",
    es: {
      pregunta: "Una camisa se reduce de $20 a $15. ¿Cuál es el porcentaje de descuento?",
      opciones: ["20%", "25%", "30%", "33%", "35%"]
    },
    en: {
      pregunta: "A shirt is reduced from $20 to $15. What is the percentage discount?",
      opciones: ["20%", "25%", "30%", "33%", "35%"]
    }
  },

  // ==========================================
  // SPATIAL / ABSTRACT REASONING (41 - 60)
  // ==========================================
  {
    id: 41,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1 -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="35" y1="10" x2="35" y2="60" stroke="var(--tx)" stroke-width="3"/>
      </g>
      <!-- Panel 2 -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="35" y1="10" x2="35" y2="60" stroke="var(--tx)" stroke-width="3"/>
        <line x1="10" y1="35" x2="60" y2="35" stroke="var(--tx)" stroke-width="3"/>
      </g>
      <!-- Panel 3 -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="35" y1="10" x2="35" y2="60" stroke="var(--tx)" stroke-width="3"/>
        <line x1="10" y1="35" x2="60" y2="35" stroke="var(--tx)" stroke-width="3"/>
        <line x1="10" y1="10" x2="60" y2="60" stroke="var(--tx)" stroke-width="3"/>
      </g>
      <!-- Panel 4 (Incógnita) -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué figura sigue la secuencia? (Panel 1: 1 línea, Panel 2: 2 líneas cruzadas, Panel 3: 3 líneas cruzadas)",
      opciones: ["Una sola línea horizontal", "Dos líneas paralelas", "Cuatro líneas cruzadas en estrella", "Un círculo vacío", "Ninguna línea"]
    },
    en: {
      pregunta: "Which figure completes the sequence? (Panel 1: 1 line, Panel 2: 2 crossed lines, Panel 3: 3 crossed lines)",
      opciones: ["A single horizontal line", "Two parallel lines", "Four lines crossed in a star", "An empty circle", "No lines"]
    }
  },
  {
    id: 42,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: Arriba -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <path d="M 35,60 L 35,15 M 35,15 L 20,30 M 35,15 L 50,30" stroke="var(--tx)" stroke-width="3" fill="none"/>
      </g>
      <!-- Panel 2: Derecha -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <path d="M 10,35 L 55,35 M 55,35 L 40,20 M 55,35 L 40,50" stroke="var(--tx)" stroke-width="3" fill="none"/>
      </g>
      <!-- Panel 3: Abajo -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <path d="M 35,10 L 35,55 M 35,55 L 20,40 M 35,55 L 50,40" stroke="var(--tx)" stroke-width="3" fill="none"/>
      </g>
      <!-- Panel 4 (Incógnita) -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué figura sigue en la rotación? (Una flecha rotando 90 grados en sentido de las agujas del reloj: Arriba, Derecha, Abajo...)",
      opciones: ["Flecha apuntando a la Izquierda", "Flecha apuntando hacia Arriba", "Flecha en diagonal", "Flecha apuntando a la Derecha", "Ninguna de las anteriores"]
    },
    en: {
      pregunta: "Which figure completes the rotation? (An arrow rotating 90 degrees clockwise: Up, Right, Down...)",
      opciones: ["Arrow pointing Left", "Arrow pointing Up", "Arrow pointing diagonally", "Arrow pointing Right", "None of the above"]
    }
  },
  {
    id: 43,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: Triángulo dentro de círculo -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="35" cy="35" r="25" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <polygon points="35,18 20,48 50,48" fill="var(--mco)" opacity="0.6"/>
      </g>
      <!-- Panel 2: Cuadrado dentro de círculo -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="35" cy="35" r="25" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <rect x="22" y="22" width="26" height="26" fill="var(--mco)" opacity="0.6"/>
      </g>
      <!-- Panel 3: Pentágono dentro de círculo -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="35" cy="35" r="25" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <polygon points="35,16 52,28 45,49 25,49 18,28" fill="var(--mco)" opacity="0.6"/>
      </g>
      <!-- Panel 4 -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué figura sigue en la secuencia lógica de formas internas?",
      opciones: ["Círculo con un triángulo", "Círculo con un hexágono", "Círculo con una línea cruzada", "Círculo vacío", "Un cuadrado solo"]
    },
    en: {
      pregunta: "Which figure completes the sequence based on the inner shapes?",
      opciones: ["Circle with a triangle", "Circle with a hexagon", "Circle with a cross line", "Empty circle", "A single square"]
    }
  },
  {
    id: 44,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: Sombreado arriba-izquierda -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <rect x="0" y="0" width="35" height="35" fill="var(--tx)" opacity="0.7"/>
      </g>
      <!-- Panel 2: Sombreado arriba-derecha -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <rect x="35" y="0" width="35" height="35" fill="var(--tx)" opacity="0.7"/>
      </g>
      <!-- Panel 3: Sombreado abajo-derecha -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <rect x="35" y="35" width="35" height="35" fill="var(--tx)" opacity="0.7"/>
      </g>
      <!-- Panel 4 -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué panel sigue el patrón de rotación del cuadrante sombreado?",
      opciones: ["Sombreado arriba-derecha", "Sombreado arriba-izquierda", "Sombreado abajo-derecha", "Sombreado abajo-izquierda", "Todo sombreado"]
    },
    en: {
      pregunta: "Which panel follows the rotation pattern of the shaded quadrant?",
      opciones: ["Shaded top-right", "Shaded top-left", "Shaded bottom-right", "Shaded bottom-left", "Fully shaded"]
    }
  },
  {
    id: 45,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: 1 Punto en centro -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="35" cy="35" r="6" fill="var(--mco)"/>
      </g>
      <!-- Panel 2: 2 Puntos -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="20" cy="35" r="6" fill="var(--mco)"/>
        <circle cx="50" cy="35" r="6" fill="var(--mco)"/>
      </g>
      <!-- Panel 3: 3 Puntos -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="20" cy="20" r="6" fill="var(--mco)"/>
        <circle cx="50" cy="20" r="6" fill="var(--mco)"/>
        <circle cx="35" cy="50" r="6" fill="var(--mco)"/>
      </g>
      <!-- Panel 4 -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué sigue la lógica en la cantidad de puntos internos?",
      opciones: ["Una figura con 3 puntos", "Una figura con 4 puntos", "Una figura con 5 puntos", "Una figura vacía", "Un solo círculo gigante"]
    },
    en: {
      pregunta: "Which figure follows the logic of the internal dots?",
      opciones: ["A shape with 3 dots", "A shape with 4 dots", "A shape with 5 dots", "An empty shape", "A single giant circle"]
    }
  },
  {
    id: 46,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: Línea cruzando de esquina a esquina (Diagonal principal) -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="0" y1="0" x2="70" y2="70" stroke="var(--tx)" stroke-width="3"/>
      </g>
      <!-- Panel 2: Diagonal secundaria -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="70" y1="0" x2="0" y2="70" stroke="var(--tx)" stroke-width="3"/>
      </g>
      <!-- Panel 3: Diagonal principal de nuevo -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="0" y1="0" x2="70" y2="70" stroke="var(--tx)" stroke-width="3"/>
      </g>
      <!-- Panel 4 -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué figura sigue en la secuencia alternante?",
      opciones: ["Una cruz", "Línea diagonal de esquina superior izquierda a inferior derecha", "Línea diagonal de esquina superior derecha a inferior izquierda", "Una línea horizontal", "Una línea vertical"]
    },
    en: {
      pregunta: "Which shape follows the alternating sequence?",
      opciones: ["A cross", "Diagonal line from top-left to bottom-right", "Diagonal line from top-right to bottom-left", "A horizontal line", "A vertical line"]
    }
  },
  {
    id: 47,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: Círculo grande -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="35" cy="35" r="28" fill="none" stroke="var(--tx)" stroke-width="2"/>
      </g>
      <!-- Panel 2: Círculo mediano -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="35" cy="35" r="18" fill="none" stroke="var(--tx)" stroke-width="2"/>
      </g>
      <!-- Panel 3: Círculo pequeño -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="35" cy="35" r="8" fill="none" stroke="var(--tx)" stroke-width="2"/>
      </g>
      <!-- Panel 4 -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué figura sigue en la secuencia de tamaño decreciente?",
      opciones: ["Círculo gigante", "Círculo mediano", "Cuadrado pequeño", "Triángulo pequeño", "Un punto en el centro (círculo minúsculo)"]
    },
    en: {
      pregunta: "Which shape follows the decreasing size sequence?",
      opciones: ["Giant circle", "Medium circle", "Small square", "Small triangle", "A dot in the center (tiny circle)"]
    }
  },
  {
    id: 48,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: Cruz -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="35" y1="10" x2="35" y2="60" stroke="var(--tx)" stroke-width="2"/>
        <line x1="10" y1="35" x2="60" y2="35" stroke="var(--tx)" stroke-width="2"/>
      </g>
      <!-- Panel 2: Cruz + x en esquinas -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="35" y1="10" x2="35" y2="60" stroke="var(--tx)" stroke-width="2"/>
        <line x1="10" y1="35" x2="60" y2="35" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="15" cy="15" r="4" fill="var(--mco)"/>
      </g>
      <!-- Panel 3: Cruz + 2 x en esquinas -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="35" y1="10" x2="35" y2="60" stroke="var(--tx)" stroke-width="2"/>
        <line x1="10" y1="35" x2="60" y2="35" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="15" cy="15" r="4" fill="var(--mco)"/>
        <circle cx="55" cy="15" r="4" fill="var(--mco)"/>
      </g>
      <!-- Panel 4 -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué figura sigue en el patrón de adición de puntos en las esquinas?",
      opciones: ["Una cruz con 3 puntos en las esquinas", "Una cruz con 4 puntos en las esquinas", "Una cruz sin puntos", "Un cuadrado con puntos", "Solo 3 puntos en triángulo"]
    },
    en: {
      pregunta: "Which shape completes the corner-dot addition sequence?",
      opciones: ["A cross with 3 corner dots", "A cross with 4 corner dots", "A cross with no dots", "A square with dots", "Only 3 dots in a triangle"]
    }
  },
  {
    id: 49,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: Línea vertical izquierda -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="15" y1="10" x2="15" y2="60" stroke="var(--mco)" stroke-width="3"/>
      </g>
      <!-- Panel 2: Línea vertical centro -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="35" y1="10" x2="35" y2="60" stroke="var(--mco)" stroke-width="3"/>
      </g>
      <!-- Panel 3: Línea vertical derecha -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="55" y1="10" x2="55" y2="60" stroke="var(--mco)" stroke-width="3"/>
      </g>
      <!-- Panel 4 -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué figura representa la siguiente posición lógica de la barra vertical?",
      opciones: ["Línea en el centro", "Línea a la izquierda", "Línea horizontal", "Línea en diagonal", "No hay línea"]
    },
    en: {
      pregunta: "Which figure represents the next logical position of the vertical bar?",
      opciones: ["Bar in the center", "Bar to the left", "Horizontal bar", "Diagonal bar", "No bar"]
    }
  },
  {
    id: 50,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: Cuadrado vacio -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <rect x="20" y="20" width="30" height="30" fill="none" stroke="var(--tx)" stroke-width="2"/>
      </g>
      <!-- Panel 2: Cuadrado con linea cruzando -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <rect x="20" y="20" width="30" height="30" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="20" y1="20" x2="50" y2="50" stroke="var(--tx)" stroke-width="2"/>
      </g>
      <!-- Panel 3: Cuadrado con cruz -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <rect x="20" y="20" width="30" height="30" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="20" y1="20" x2="50" y2="50" stroke="var(--tx)" stroke-width="2"/>
        <line x1="50" y1="20" x2="20" y2="50" stroke="var(--tx)" stroke-width="2"/>
      </g>
      <!-- Panel 4 -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué figura sigue en la progresión de detalles internos del cuadrado central?",
      opciones: ["El cuadrado desaparece", "Un cuadrado con un círculo adentro", "Un cuadrado relleno de color", "Un cuadrado con cruz y un círculo en su centro", "Un cuadrado vacío nuevamente"]
    },
    en: {
      pregunta: "Which figure follows the progression of internal details in the central square?",
      opciones: ["The square disappears", "A square with an inner circle", "A fully filled square", "A square with cross diagonals and a center circle", "An empty square again"]
    }
  },

  // ==========================================
  // ADITIONAL QUESTIONS TO REACH 60 (51 - 60)
  // ==========================================
  {
    id: 51,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea más SIMILAR a: CAUTO",
      opciones: ["Audaz", "Prudente", "Desafiante", "Rápido", "Tonto"]
    },
    en: {
      pregunta: "Choose the word that is MOST SIMILAR to: CAUTIOUS",
      opciones: ["Bold", "Prudent", "Daring", "Fast", "Foolish"]
    }
  },
  {
    id: 52,
    categoria: "verbal",
    es: {
      pregunta: "Elija la palabra que sea OPUESTA a: EFÍMERO",
      opciones: ["Corto", "Pasajero", "Rápido", "Duradero", "Fácil"]
    },
    en: {
      pregunta: "Choose the word that is OPPOSITE to: EPHEMERAL",
      opciones: ["Short", "Fleeting", "Fast", "Lasting", "Easy"]
    }
  },
  {
    id: 53,
    categoria: "verbal",
    es: {
      pregunta: "Complete la oración: La falta de presupuesto obligó a ________ la investigación científica temporalmente.",
      opciones: ["suspender", "expandir", "fomentar", "publicar", "completar"]
    },
    en: {
      pregunta: "Complete the sentence: The lack of budget forced the team to ________ the scientific research temporarily.",
      opciones: ["suspend", "expand", "encourage", "publish", "complete"]
    }
  },
  {
    id: 54,
    categoria: "verbal",
    es: {
      pregunta: "LUNA es a NOCHE como SOL es a...",
      opciones: ["Estrella", "Nube", "Planeta", "Cielo", "Día"]
    },
    en: {
      pregunta: "MOON is to NIGHT as SUN is to...",
      opciones: ["Star", "Cloud", "Planet", "Sky", "Day"]
    }
  },
  {
    id: 55,
    categoria: "numerical",
    es: {
      pregunta: "Un granjero tiene 24 ovejas y 18 vacas. ¿Cuál es la proporción (relación) simplificada de ovejas a vacas?",
      opciones: ["3:2", "3:4", "4:3", "5:3", "2:3"]
    },
    en: {
      pregunta: "A farmer has 24 sheep and 18 cows. What is the simplified ratio of sheep to cows?",
      opciones: ["3:2", "3:4", "4:3", "5:3", "2:3"]
    }
  },
  {
    id: 56,
    categoria: "numerical",
    es: {
      pregunta: "Complete la serie numérica: 4, 9, 16, 25, ...",
      opciones: ["30", "32", "35", "36", "40"]
    },
    en: {
      pregunta: "Complete the number series: 4, 9, 16, 25, ...",
      opciones: ["30", "32", "35", "36", "40"]
    }
  },
  {
    id: 57,
    categoria: "numerical",
    es: {
      pregunta: "Si el precio de una acción sube de $80 a $88. ¿Cuál es el incremento porcentual?",
      opciones: ["10%", "12%", "8%", "15%", "5%"]
    },
    en: {
      pregunta: "If a stock price goes up from $80 to $88. What is the percentage increase?",
      opciones: ["10%", "12%", "8%", "15%", "5%"]
    }
  },
  {
    id: 58,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: Círculo arriba-derecha -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="55" cy="15" r="8" fill="var(--mco)"/>
      </g>
      <!-- Panel 2: Círculo abajo-derecha -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="55" cy="55" r="8" fill="var(--mco)"/>
      </g>
      <!-- Panel 3: Círculo abajo-izquierda -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <circle cx="15" cy="55" r="8" fill="var(--mco)"/>
      </g>
      <!-- Panel 4 -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué posición del círculo interno sigue la secuencia horaria en las esquinas?",
      opciones: ["Círculo abajo-derecha", "Círculo arriba-izquierda", "Círculo arriba-derecha", "Círculo en el centro", "Sin círculo"]
    },
    en: {
      pregunta: "Which position of the inner circle follows the clockwise corner sequence?",
      opciones: ["Circle bottom-right", "Circle top-left", "Circle top-right", "Circle in the center", "No circle"]
    }
  },
  {
    id: 59,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: 1 Barra horizontal en parte superior -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <rect x="5" y="10" width="60" height="8" fill="var(--tx)" opacity="0.8"/>
      </g>
      <!-- Panel 2: 2 Barras horizontales -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <rect x="5" y="10" width="60" height="8" fill="var(--tx)" opacity="0.8"/>
        <rect x="5" y="25" width="60" height="8" fill="var(--tx)" opacity="0.8"/>
      </g>
      <!-- Panel 3: 3 Barras horizontales -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <rect x="5" y="10" width="60" height="8" fill="var(--tx)" opacity="0.8"/>
        <rect x="5" y="25" width="60" height="8" fill="var(--tx)" opacity="0.8"/>
        <rect x="5" y="40" width="60" height="8" fill="var(--tx)" opacity="0.8"/>
      </g>
      <!-- Panel 4 -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué figura sigue en el patrón de apilado de barras?",
      opciones: ["Dos barras horizontales", "Tres barras horizontales", "Ninguna barra", "Cuatro barras horizontales apiladas", "Dos barras verticales"]
    },
    en: {
      pregunta: "Which shape completes the bar stacking pattern?",
      opciones: ["Two horizontal bars", "Three horizontal bars", "No bars", "Four stacked horizontal bars", "Two vertical bars"]
    }
  },
  {
    id: 60,
    categoria: "spatial",
    svg: `<svg viewBox="0 0 400 100" class="ccat_spatial_svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Panel 1: Cruz simple -->
      <g transform="translate(10, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="35" y1="10" x2="35" y2="60" stroke="var(--tx)" stroke-width="2"/>
        <line x1="10" y1="35" x2="60" y2="35" stroke="var(--tx)" stroke-width="2"/>
      </g>
      <!-- Panel 2: Equis simple (cruz rotada 45deg) -->
      <g transform="translate(110, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="15" y1="15" x2="55" y2="55" stroke="var(--tx)" stroke-width="2"/>
        <line x1="55" y1="15" x2="15" y2="55" stroke="var(--tx)" stroke-width="2"/>
      </g>
      <!-- Panel 3: Cruz simple de nuevo -->
      <g transform="translate(210, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2"/>
        <line x1="35" y1="10" x2="35" y2="60" stroke="var(--tx)" stroke-width="2"/>
        <line x1="10" y1="35" x2="60" y2="35" stroke="var(--tx)" stroke-width="2"/>
      </g>
      <!-- Panel 4 -->
      <g transform="translate(310, 10)">
        <rect width="70" height="70" fill="none" stroke="var(--tx)" stroke-width="2" stroke-dasharray="4"/>
        <text x="35" y="45" font-size="30" font-weight="bold" fill="var(--mco)" text-anchor="middle">?</text>
      </g>
    </svg>`,
    es: {
      pregunta: "¿Qué figura sigue en el patrón de rotación alternante de 45 grados?",
      opciones: ["Una línea horizontal", "Una cruz simple (+)", "Una equis (x)", "Un círculo", "Un cuadrado"]
    },
    en: {
      pregunta: "Which shape completes the 45-degree alternating rotation sequence?",
      opciones: ["A horizontal line", "A simple cross (+)", "An X shape (x)", "A circle", "A square"]
    }
  }
];
