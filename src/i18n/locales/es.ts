import type { Translation } from './en'

const es: Translation = {
  nav: {
    tools: 'Herramientas',
    settings: 'Ajustes',
    open_tools: 'Herramientas',
  },
  aria: {
    back: 'Atrás',
    toggle_theme: 'Cambiar tema',
    select_language: 'Seleccionar idioma',
    prev_period: 'Período anterior',
    next_period: 'Período siguiente',
    how_to_use: 'Cómo usarlo',
    remove_item: 'Eliminar',
    delete_card: 'Eliminar tarjeta',
    add_card: 'Agregar',
    tool_settings: 'Ajustes de la herramienta',
    open_tools_drawer: 'Abrir menú de herramientas',
    close_tools_drawer: 'Cerrar menú de herramientas',
    open_speed_dial: 'Acceso rápido',
    close_speed_dial: 'Cerrar acceso rápido',
    collapse_sidebar: 'Contraer barra lateral',
    expand_sidebar: 'Expandir barra lateral',
  },

  common: {
    saved: 'Guardado',
  },

  welcome: {
    headline: 'El kit de journaling que se queda en tu dispositivo.',
    subheadline: 'Herramientas respaldadas por la ciencia, de los mejores libros de desarrollo personal. Privado por diseño — tus datos nunca salen de tu dispositivo.',
    cta_get_started: 'Comenzar',
    cta_unlock: 'Desbloquear',
    section_tools: 'Qué incluye',
    section_tools_sub: 'Tres herramientas para empezar. La biblioteca seguirá creciendo.',
    section_privacy: 'Privado por diseño',
    privacy_body: 'Todos los diarios se cifran con AES-256-GCM antes de guardarse. Tu contraseña nunca sale de tu dispositivo. Funciona sin conexión — sin cuenta, sin sincronización, sin nube.',
    already_setup: '¿Ya tienes cuenta?',
    link_unlock: 'Desbloquear →',
  },

  lock: {
    app_name: 'Kit de Journaling',
    subtitle_setup: 'Elige una contraseña para proteger tus diarios',
    subtitle_unlock: 'Ingresa tu contraseña para desbloquear',
    label_passphrase: 'Contraseña',
    label_confirm: 'Confirmar contraseña',
    placeholder_choose: 'Elige una contraseña…',
    placeholder_enter: 'Ingresa tu contraseña…',
    placeholder_repeat: 'Repite la contraseña…',
    btn_create: 'Crear y desbloquear',
    btn_unlock: 'Desbloquear',
    btn_loading: 'Desbloqueando…',
    footer: 'Tus datos nunca salen de este dispositivo. Todos los diarios están cifrados localmente.',
    err_too_short: 'La contraseña debe tener al menos 4 caracteres.',
    err_mismatch: 'Las contraseñas no coinciden.',
    err_wrong: 'Contraseña incorrecta. Inténtalo de nuevo.',
    err_generic: 'Algo salió mal. Inténtalo de nuevo.',
  },

  home: {
    intro: 'Herramientas de journaling de los mejores libros de desarrollo personal. Toca una herramienta para comenzar.',
    btn_open: 'Abrir',
    status_logged: 'Registrado en este período',
    status_not_logged: 'Aún sin registrar',
    saved_toast: '¡{{name}} completado!',
    how_to_use_title: 'Cómo usar {{name}}',
  },

  periodicity: {
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
    yearly: 'Anual',
    ongoing: 'Continuo',
  },

  gratitude: {
    placeholder: 'Agradezco…',
    add_another: 'Agregar otro',
    btn_save: 'Guardar',
    past_entries: 'Entradas anteriores',
  },

  daily: {
    placeholder: '¿Qué tienes en mente hoy?',
    btn_save: 'Guardar',
    past_entries: 'Entradas anteriores',
    empty_entry: 'Entrada vacía',
    no_content: 'Sin contenido',
  },

  pmn: {
    col_plus: 'Positivo',
    col_minus: 'Negativo',
    col_next: 'Siguiente',
    card_placeholder: 'Agregar tarjeta…',
    card_empty_hint: 'Agrega tu primera tarjeta…',
  },

  // ── Wealth Quiz ──────────────────────────────────────────────────────
  wealth_quiz: {
    cat_time: 'Tiempo',
    cat_social: 'Social',
    cat_mental: 'Mental',
    cat_physical: 'Físico',
    cat_financial: 'Financiero',
    strongly_disagree: 'Muy en desacuerdo',
    disagree: 'En desacuerdo',
    neutral: 'Neutral',
    agree: 'De acuerdo',
    strongly_agree: 'Muy de acuerdo',
    next_section: 'Siguiente sección →',
    see_results: 'Ver mis resultados',
    back: 'Atrás',
    your_results: 'Tu puntaje de riqueza',
    retake: 'Tomar el test de nuevo',
    overall: 'Promedio',
    history: 'Resultados anteriores',
    last_result: 'Último puntaje de riqueza',
    start_title: 'Quiz: 5 tipos de riqueza',
    start_body: '25 preguntas en 5 dimensiones. Toma aproximadamente 3 minutos.',
    start_btn: 'Comenzar',
    q_t1: 'Tengo control sobre mi calendario y mis prioridades.',
    q_t2: 'Tengo claridad sobre las 2–3 prioridades más importantes de mi vida personal y profesional.',
    q_t3: 'Soy capaz de dirigir consistentemente mi atención y enfoque hacia las prioridades importantes que he identificado.',
    q_t4: 'Rara vez me siento demasiado ocupado o disperso para dedicar tiempo a las prioridades más importantes.',
    q_t5: 'Tengo una profunda conciencia de la naturaleza finita e impermanente de mi tiempo y su importancia como mi activo más preciado.',
    q_s1: 'Tengo un conjunto central de relaciones profundas, amorosas y de apoyo.',
    q_s2: 'Soy capaz de ser consistentemente el compañero, padre, familiar y amigo que me gustaría tener.',
    q_s3: 'Tengo una red de relaciones más amplias de las que puedo aprender y en las que puedo crecer.',
    q_s4: 'Tengo un profundo sentido de conexión con una comunidad (local, regional, nacional, espiritual, etc.) o con algo más grande que yo mismo.',
    q_s5: 'No intento lograr estatus, respeto o admiración a través de compras materiales.',
    q_m1: 'Abrazo regularmente una curiosidad infantil.',
    q_m2: 'Tengo un propósito claro que me da significado diario y orienta mis decisiones a corto y largo plazo.',
    q_m3: 'Busco el crecimiento y persigo consistentemente mi máximo potencial.',
    q_m4: 'Tengo la creencia fundamental de que soy capaz de cambiar, desarrollarme y adaptarme continuamente.',
    q_m5: 'Tengo rituales regulares que me permiten crear espacio para pensar, resetearme, reflexionar y recargarme.',
    q_p1: 'Me siento fuerte, sano y vital para mi edad.',
    q_p2: 'Muevo mi cuerpo regularmente mediante una rutina estructurada y tengo un estilo de vida activo.',
    q_p3: 'Como principalmente alimentos integrales y sin procesar.',
    q_p4: 'Duermo 7 o más horas por noche de forma regular y me siento descansado y recuperado.',
    q_p5: 'Tengo un plan claro para prosperar físicamente en mis años más avanzados.',
    q_f1: 'Tengo una definición clara de lo que significa tener suficiente dinero.',
    q_f2: 'Tengo ingresos que crecen constantemente junto con mis habilidades y experiencia.',
    q_f3: 'Gestiono mis gastos mensuales para que estén de forma confiable por debajo de mis ingresos.',
    q_f4: 'Tengo un proceso claro para invertir el exceso de ingresos mensuales para el crecimiento a largo plazo.',
    q_f5: 'Uso mi riqueza financiera como herramienta para construir otros tipos de riqueza.',
  },

  settings: {
    section_app: 'Aplicación',
    btn_install: 'Instalar app',
    btn_get_updates: 'Obtener actualizaciones',
    section_favorites: 'Herramientas favoritas',
    favorites_hint: 'Selecciona hasta 3 herramientas para mostrar en el botón de acceso rápido.',
    section_export: 'Exportar e importar',
    btn_export_plain: 'Exportar sin cifrar',
    btn_export_encrypted: 'Exportar cifrado',
    btn_import: 'Importar',
    section_security: 'Seguridad',
    section_about: 'Acerca de',
    about_text: 'Todos los datos se almacenan localmente y se cifran con AES-256-GCM. Tu contraseña nunca sale de este dispositivo.',
    btn_lock: 'Bloquear app',
    change_passphrase_title: 'Cambiar contraseña',
    placeholder_current: 'Contraseña actual',
    placeholder_new: 'Nueva contraseña',
    placeholder_confirm: 'Confirmar nueva contraseña',
    btn_change: 'Cambiar contraseña',
    btn_changing: 'Cambiando…',
    success_changed: 'Contraseña cambiada correctamente.',
    success_exported: '¡Exportado!',
    success_imported: 'Importado. Recarga la herramienta para ver los cambios.',
    err_wrong_tool: 'Archivo incorrecto para esta herramienta.',
    err_not_unlocked: 'La app no está desbloqueada.',
    err_import_failed: 'Error al importar. Verifica el archivo.',
    err_too_short: 'La nueva contraseña debe tener al menos 4 caracteres.',
    err_mismatch: 'Las nuevas contraseñas no coinciden.',
    err_wrong_current: 'La contraseña actual es incorrecta.',
    err_generic: 'Algo salió mal.',
  },

  pwa: {
    update_available: 'Nueva versión disponible',
    btn_update: 'Actualizar ahora',
  },

  tools: {
    gratitude: {
      name: 'Diario de Gratitud',
      summary: 'Escribe 3 a 5 cosas por las que estés agradecido cada día.',
      howToUse: `## Diario de Gratitud

El diario de gratitud es uno de los hábitos más respaldados por la psicología positiva. Desarrollado por **Robert Emmons** (UC Davis) y **Sonja Lyubomirsky**, los estudios muestran de forma consistente que mejora el sueño, reduce el estrés y aumenta la felicidad a largo plazo.

### Cómo usarlo

1. Abre el diario cada día — por la mañana o por la noche, cuando más te convenga.
2. Escribe **3 a 5 cosas** por las que estés genuinamente agradecido.
3. Sé específico: *"el saludo de mi perro al llegar a casa"* es mejor que *"mi perro".*
4. Busca momentos nuevos cada día — no repitas siempre las mismas cosas.

### Consejos

- **La especificidad importa.** La gratitud vaga es menos efectiva que la gratitud detallada y vívida.
- **Las cosas pequeñas cuentan.** Un buen café, un mensaje amable, una ventana soleada — todo vale.
- **La constancia supera a la intensidad.** 3 cosas cada día es mejor que 20 una vez a la semana.

### La ciencia

Emmons y McCullough (2003) demostraron que los participantes que escribían listas de gratitud semanales reportaron mejor salud física, más optimismo y mayor progreso hacia sus metas personales.

### Fuente

*Thanks! How the New Science of Gratitude Can Make You Happier* de Robert A. Emmons (2007). El estudio original fue publicado en el *Journal of Personality and Social Psychology* en 2003.`,
    },

    daily: {
      name: 'Diario Personal',
      summary: 'Escritura libre diaria para procesar pensamientos y reflexionar.',
      howToUse: `## Diario Personal

La escritura libre diaria es una de las herramientas más poderosas para alcanzar claridad, creatividad y autoconocimiento. No requiere estructura — solo tú y la página.

### Cómo usarlo

1. Abre el diario cada día — por la mañana funciona bien para fijar intenciones; por la noche, para reflexionar.
2. Escribe lo que te venga a la mente. Sin formato, sin reglas.
3. Se guarda automáticamente cuando dejas de escribir.

### Puntos de partida

- ¿Qué tengo en mente ahora mismo?
- ¿Qué quiero conseguir hoy?
- ¿Qué pasó ayer que sigo pensando?
- ¿Qué haría que hoy fuera un éxito?
- ¿Qué estoy evitando?

### Consejos

- **No te edites mientras escribes.** Deja que los pensamientos fluyan sin juicio.
- **La constancia supera a la extensión.** Tres frases cada día es mejor que una página una vez a la semana.
- **Relee de vez en cuando.** Los patrones emergen cuando miras hacia atrás.

### Fuente

La escritura libre es una práctica fundamental en muchas tradiciones — desde las *Meditaciones* de Marco Aurelio hasta las *Morning Pages* de Julia Cameron en *El camino del artista*.`,
    },

    pmn: {
      name: 'Más Menos Siguiente',
      summary: 'Un tablero semanal de 3 columnas: qué salió bien, qué no, y qué sigue.',
      howToUse: `## Más / Menos / Siguiente

Una revisión semanal de cinco minutos en tres columnas. Creada por **Anne-Laure Le Cunff** de Ness Labs como parte del marco de *Pequeños Experimentos* para vivir de forma intencional.

### Las tres columnas

| Columna | Símbolo | Pregunta |
|---------|---------|----------|
| Positivo | ➕ | ¿Qué salió bien? ¿Qué te hizo feliz? |
| Negativo | ➖ | ¿Qué no salió bien? ¿Dónde fallaste? |
| Siguiente | ➡️ | ¿Qué quieres hacer o intentar la próxima semana? |

### Cómo usarlo

1. Al final de cada semana — el domingo por la noche o el lunes por la mañana funciona bien.
2. Agrega algunas tarjetas a cada columna. Puntos breves, no ensayos.
3. Incluso 2 o 3 tarjetas por columna es valioso. No le des demasiadas vueltas.
4. Antes de llenar **Siguiente**, echa un vistazo a la columna de la semana pasada — ¿lo cumpliste?

### Consejos

- **Sé honesto en Negativo.** Es la columna más valiosa para crecer.
- **Que Siguiente sea accionable.** *"Correr 3 veces esta semana"* es mejor que *"estar más sano".*
- **La revisión dura ~5 minutos.** La rapidez es una característica, no una limitación.

### Fuente

De *Tiny Experiments* de Anne-Laure Le Cunff (Ness Labs). El método trata cada semana como un pequeño experimento de bajo riesgo — observar, ajustar, repetir.`,
    },

    wealth_quiz: {
      name: '5 Tipos de Riqueza',
      summary: 'Evalúate en 5 dimensiones de riqueza: Tiempo, Social, Mental, Físico, Financiero.',
      howToUse: `## Quiz: 5 Tipos de Riqueza

Una autoevaluación de 25 preguntas basada en *The 5 Types of Wealth* de Sahil Bloom. Mide tu riqueza en cinco dimensiones más allá del dinero.

### Las cinco dimensiones

| Tipo | Qué mide |
|------|----------|
| Tiempo | Control sobre tu agenda, enfoque y conciencia del valor del tiempo |
| Social | Profundidad de relaciones, comunidad y libertad del status material |
| Mental | Curiosidad, propósito, mentalidad de crecimiento y rituales de reflexión |
| Físico | Salud, movimiento, nutrición, sueño y vitalidad a largo plazo |
| Financiero | Crecimiento de ingresos, gastos, inversión y uso del dinero para construir otras riquezas |

### Cómo usarlo

1. Responde las 25 afirmaciones honestamente usando la escala del 1 al 5.
2. Al finalizar verás tu gráfico de diamante — cinco ejes, uno por tipo de riqueza.
3. Repite periódicamente (mensual o trimestralmente) para rastrear tu progreso.

### Consejos

- **Sé honesto, no aspiracional.** Evalúa dónde estás hoy, no dónde quieres estar.
- **Los puntajes bajos son un regalo.** Te dicen exactamente en qué enfocarte.
- **La forma importa más que el total.** Un diamante asimétrico revela desequilibrio.

### Fuente

Basado en el quiz de [wealthscorequiz.com](https://www.wealthscorequiz.com), compañero de *The 5 Types of Wealth* de Sahil Bloom.`,
    },
  },
}

export default es
