# Plan de Implementación: Klino App v2

## 1. Visión General y Objetivos
Transformar la aplicación móvil Klino en su versión 2.0 cumpliendo estrictamente con la especificación de diseño (`assets/klino-brand-kit`) y la arquitectura funcional de 16 pantallas (`assets/Klino_App_v2.pdf`).

### Principios Rectores:
* **Cumplimiento Normativo:** Estructuración clínica bajo la NOM-004-SSA3-2012 y validación médica explícita ("La IA propone, el médico aprueba").
* **Identidad Visual Estricta:** Cero sombras, cero degradados, esquinas vivas (`0px`), paleta oficial (Papel, Papel Hondo, Tinta, Verde Consulta, Ámbar Revisión) y tipografías *Familjen Grotesk* (Display) y *Spectral* (Texto Clínico).
* **Ausencia de Fricción:** Acceso al dictado desde cualquier pantalla ("Asa en el borde"), aprobación por gesto continuo de 1 segundo y navegación de 4 módulos (**Panel**, **Expedientes**, **Agenda**, **Cuenta**).
* **Desarrollo Incremental:** Avance módulo por módulo, validando cada etapa.

---

## 2. Diagrama de Arquitectura de la Aplicación

```
+-----------------------------------------------------------------------------------+
|                                KLINO APP v2                                       |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Autenticación & Biometría ] --> Login / Acceso NOM-004 / Huella dactilar       |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | NAVEGACIÓN PRINCIPAL (4 Tabs) + ASA GLOBAL DE DICTADO                       |  |
|  +-----------------------------------------------------------------------------+  |
|  |                                                                             |  |
|  |  1. PANEL                   2. EXPEDIENTES       3. AGENDA      4. CUENTA   |  |
|  |     - Pendientes de aprobar    - Modos: Consultorio/  - Citas del  - Perfil     |  |
|  |     - Escanear documento         Hospital/Todos         día        - Tiempo     |  |
|  |     - Próxima cita             - 7 pestañas clínicas  - Estados       devuelto  |  |
|  |     - Aprobadas hoy            - Bloqueo biométrico                  - Ajustes  |  |
|  |                                                                      asa/banda  |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  [ ASA LATERAL DE DICTADO ] --> Tipo de documento (Historia/Nota/Receta)          |
|                                      |                                            |
|                                      v                                            |
|                             [ CONSULTA EN VIVO ]                                  |
|                             - 4 bloques SOAP reactivos                            |
|                             - Medidor de audio en tiempo real                     |
|                                      |                                            |
|                                      v                                            |
|                          [ REVISIÓN Y APROBACIÓN ]                                |
|                          - Edición directa en pantalla                            |
|                          - Gesto: Mantener presionado 1s                          |
|                          - Sello, folio y bloqueo legal                           |
|                                                                                   |
|  [ ESCANEO DE PAPEL ] --> Tipo -> Captura guías ámbar -> Asignación / Formatos    |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Fases de Ejecución Detalladas

### **Fase 1: Cimientos del Sistema de Diseño y Tokens**
* **Objetivo:** Establecer la infraestructura visual completa conforme al Brand Kit v1.0.
* **Tareas:**
  1. Cargar fuentes oficiales: *Familjen Grotesk* (SemiBold 600) y *Spectral* (Regular 400, Medium 500).
  2. Configurar `src/constants/theme.ts` y actualizar `tailwind.config.js` con tokens oficiales:
     * `papel`: `#F4F1EA`
     * `papelHondo`: `#EDE8DE`
     * `tinta`: `#16191B`
     * `verde`: `#1F5F4B`
     * `ambar`: `#E0913A`
     * `ambarTinta`: `#8A5311`
     * `gris`: `#63635B`
     * `error` / `alergia`: `#B0311F`
  3. Crear componentes base reutilizables con esquinas vivas (`0px`) y sin sombras:
     * `KlinoText`: Componente tipográfico con jerarquía exacta (H1, H2, H3, Subtitle, Body, Small, Label).
     * `KlinoButton`: Botones primarios, secundarios, de acento y destructivos.
     * `KlinoHeader`: Cabecera de navegación institucional.
     * `KlinoBadge`: Indicador de estado y pendientes.
     * `KlinoInput`: Campo de texto sobrio y accesible.
* **Archivos a crear/modificar:**
  * `src/constants/theme.ts`
  * `src/components/common/KlinoText.tsx`
  * `src/components/common/KlinoButton.tsx`
  * `src/components/common/KlinoHeader.tsx`
  * `src/components/common/KlinoBadge.tsx`
  * `src/components/common/KlinoInput.tsx`
  * `tailwind.config.js`

---

### **Fase 2: Arquitectura de Navegación y Componente Global "Asa de Dictado"**
* **Objetivo:** Reestructurar los tabs principales y colocar el acceso universal al dictado.
* **Tareas:**
  1. Reestructurar rutas en `app/(tabs)/_layout.tsx`:
     * Tab 1: **Panel** (`app/(tabs)/index.tsx`)
     * Tab 2: **Expedientes** (`app/(tabs)/records.tsx`)
     * Tab 3: **Agenda** (`app/(tabs)/agenda.tsx`)
     * Tab 4: **Cuenta** (`app/(tabs)/profile.tsx`)
     * *Remover ruta y referencias a `devices.tsx`.*
  2. Implementar `DictationHandle` (Asa lateral fija en el borde derecho a la altura del pulgar).
  3. Implementar modal/bottom sheet "¿Qué vas a dictar?" con las 3 opciones normativas:
     * *Historia clínica* (primera vez, interrogatorio y exploración).
     * *Nota de evolución* (seguimiento SOAP sobre paciente existente).
     * *Receta* (medicamentos, dosis y duración con validación de alergias).
* **Archivos a crear/modificar:**
  * `app/(tabs)/_layout.tsx`
  * `app/(tabs)/agenda.tsx`
  * `src/components/dictation/DictationHandle.tsx`
  * `src/components/dictation/DictationTypeModal.tsx`

---

### **Fase 3: Módulo de Acceso y Autenticación**
* **Objetivo:** Implementar la pantalla de inicio de sesión sobria y orientada a cumplimiento normativo.
* **Tareas:**
  1. Rediseñar `LoginScreen.tsx` conforme a la Pantalla 3 de la especificación:
     * Titular: *"Tú atiendes. La historia clínica se escribe sola."*
     * Campos limpios: Correo o identificador médico + Contraseña.
     * Botón de entrar en Verde Consulta.
     * Acceso biométrico (Huella o FaceID) integrado al mismo nivel jerárquico.
     * Metadatos legales en el pie: Cumplimiento NOM-004-SSA3-2012 y Cifrado AES-256 en tránsito y reposo.
  2. Conexión y validación con Supabase Auth y `expo-local-authentication`.
* **Archivos a modificar:**
  * `src/screens/LoginScreen.tsx`
  * `app/index.tsx`

---

### **Fase 4: Módulo Panel (Dashboard Principal de Consultorio)**
* **Objetivo:** Mostrar de forma inmediata lo que espera la atención del médico.
* **Tareas:**
  1. Rediseñar `app/(tabs)/index.tsx` y `HomeScreen`:
     * Barra superior con logo Klino, búsqueda y acción rápida "Escanear documento".
     * Saludo personalizado y conteo de consultas.
     * Tarjeta de pendientes con badge ámbar: *"3 documentos sin aprobar"*, listando paciente y tipo de documento (Historia clínica, Nota de evolución, Receta).
     * Botón primario: *"Revisar y Aprobar"*.
     * Sección *"Sigue en tu agenda"* con horario, paciente y motivo.
     * Conteo diario *"Aprobadas hoy"*.
* **Archivos a modificar:**
  * `app/(tabs)/index.tsx`
  * `src/screens/HomeScreen.tsx` (o modularización correspondiente)
  * `src/components/panel/PendingApprovalCard.tsx`
  * `src/components/panel/UpcomingAppointmentCard.tsx`

---

### **Fase 5: Motor de Dictado en Vivo, Revisión y Aprobación Deliberada**
* **Objetivo:** Construir el flujo central: Dictar $\rightarrow$ Revisar $\rightarrow$ Aprobar.
* **Tareas:**
  1. Pantalla de Consulta en Vivo (`LiveConsultationScreen`):
     * Visualizador de tiempo y medidor de ondas de voz.
     * Indicadores dinámicos para los 4 bloques SOAP: Subjetivo, Objetivo, Análisis, Plan (*Completa*, *Escuchando ahora*, *Sin dictar*).
     * Controles: Pausar, Marcar Momento, Terminar y Armar.
  2. Pantalla de Revisión de Documento (`NoteReviewScreen`):
     * Edición en línea directa sobre el texto clínico (tipografía *Spectral*).
     * Indicador ámbar de estado "Sin Aprobar".
     * Sección de receta dictada asociada.
     * Botón de aprobación con gesto deliberado: mantener presionado 1 segundo con feedback háptico.
     * Estado post-aprobación: inyección de sello, folio, cédula médica y bloqueo contra modificaciones accidentales.
* **Archivos a crear/modificar:**
  * `src/screens/LiveConsultationScreen.tsx`
  * `src/screens/NoteReviewScreen.tsx`
  * `src/components/dictation/SoapProgressTracker.tsx`
  * `src/components/dictation/HoldToApproveButton.tsx`

---

### **Fase 6: Expediente Clínico de 7 Pestañas y Seguridad Biométrica**
* **Objetivo:** Organizar el expediente integral por paciente con estructura de pestañas y protección NOM-004.
* **Tareas:**
  1. Lista de Expedientes (`RecordsScreen.tsx`):
     * Pestañas planas de filtro: *Consultorio*, *Hospital*, *Todos*.
     * Acciones: "Ver formatos", "Agregar formato", "Escanear".
     * Lista de pacientes con iniciales y punto ámbar para aquellos con documentos sin aprobar.
  2. Detalle de Expediente (`PatientRecordDetailScreen.tsx`):
     * Navegación por **7 pestañas**:
       1. **Resumen:** Alergias destacadas en rojo en la parte superior, signos vitales (Presión, Glucosa, Peso/IMC, HbA1c), diagnósticos activos y tratamiento actual.
       2. **Historia clínica:** Nueve apartados normativos. Bloqueada por default. Botón de lápiz que solicita huella dactilar para habilitar edición y registra cambios en bitácora.
       3. **Notas de evolución:** Lista cronológica de consultas.
       4. **Labs e imagen:** Resultados y estudios.
       5. **Indicaciones:** Indicaciones médicas vigentes.
       6. **Referencia:** Documentos de traslado o interconsulta.
       7. **Recetas:** Historial de recetas emitidas.
* **Archivos a crear/modificar:**
  * `src/screens/RecordsScreen.tsx`
  * `src/screens/PatientRecordDetailScreen.tsx`
  * `src/components/records/PatientSummaryTab.tsx`
  * `src/components/records/ClinicalHistoryTab.tsx`
  * `src/components/records/BiometricUnlockModal.tsx`

---

### **Fase 7: Módulo de Escaneo y Reconocimiento de Papel**
* **Objetivo:** Permitir la digitalización de documentos físicos de consultorio en 3 pasos.
* **Tareas:**
  1. Flujo de 3 pasos (`ScanDocumentScreen.tsx`):
     * Paso 1: Selección de tipo (Historia clínica, Nota de evolución, Receta, Laboratorios, Imagen, Referencia).
     * Paso 2: Cámara con marco y guías ámbar para encuadre.
     * Paso 3: Asignación a paciente (coincidencia detectada por OCR, búsqueda o creación de nuevo paciente).
  2. Módulo de Formatos por Modo (`ModesAndFormatsScreen.tsx`):
     * Detección de apartados de plantillas propias del médico con resaltado ámbar en campos dudosos para edición puntual.
* **Archivos a crear/modificar:**
  * `src/screens/ScanDocumentScreen.tsx`
  * `src/screens/FormatEditorScreen.tsx`
  * `src/components/scan/CameraScannerOverlay.tsx`
  * `src/components/scan/ScannedFieldEditor.tsx`

---

### **Fase 8: Agenda, Métricas ("El Tiempo Devuelto") y Ajustes de Cuenta**
* **Objetivo:** Centralizar la gestión de citas y el reporte de productividad fuera del panel operativo.
* **Tareas:**
  1. Pantalla de Agenda (`AgendaScreen.tsx`):
     * Lista de citas diarias con estados (Confirmada, En espera, Atendida).
  2. Pantalla de Cuenta y Estadísticas (`ProfileScreen.tsx` / `StatisticsScreen.tsx`):
     * Datos del médico (Dra. Andrea Solís, Cédula, Especialidad).
     * Sección destacada "El tiempo devuelto": horas ahorradas en la semana, documentos dictados, promedio de tiempo de aprobación y gráfica de barras por día.
     * Configuración del acceso al dictado: Asa en el borde vs. Banda sobre la barra de navegación.
     * Opciones de notificación y respaldo.
* **Archivos a crear/modificar:**
  * `src/screens/AgendaScreen.tsx`
  * `src/screens/ProfileScreen.tsx`
  * `src/screens/StatisticsScreen.tsx`
  * `src/components/profile/TimeSavedCard.tsx`
  * `src/components/profile/DictationPlacementSetting.tsx`

---

### **Fase 9: Optimización, Manejo de Errores y Validación Integral**
* **Objetivo:** Asegurar la robustez técnica, desempeño y cumplimiento de los principios de código limpio.
* **Tareas:**
  1. Pruebas de navegación fluida entre los 16 estados/pantallas.
  2. Validación de estados vacíos, errores de conexión y persistencia local ante interrupciones.
  3. Verificación de cero advertencias tipográficas y fidelidad de los tokens de color.
  4. Revisión de comentarios técnicos en inglés y código limpio (DRY, SOLID).

---

## 4. Estructuras de Datos Principales

```typescript
// Tipos de documento normativos
export type ClinicalDocumentType = 
  | 'clinical_history' 
  | 'evolution_note' 
  | 'prescription'
  | 'lab_results'
  | 'imaging_study'
  | 'reference_note';

// Estado de aprobación
export type ApprovalStatus = 'pending' | 'approved';

// Estructura SOAP para consulta en vivo
export interface SoapSectionState {
  subjective: { text: string; status: 'empty' | 'listening' | 'completed' };
  objective: { text: string; status: 'empty' | 'listening' | 'completed' };
  analysis: { text: string; status: 'empty' | 'listening' | 'completed' };
  plan: { text: string; status: 'empty' | 'listening' | 'completed' };
}

// Resumen clínico del expediente
export interface PatientSummaryData {
  id: string;
  fullName: string;
  age: number;
  gender: 'M' | 'F';
  recordNumber: string;
  mode: 'consultorio' | 'hospital';
  hasPendingApproval: boolean;
  allergies: string[];
  vitals: {
    bloodPressure: string;
    glucose: number;
    weightKg: number;
    bmi: number;
    hba1c?: string;
  };
  activeDiagnoses: { id: string; name: string; since: string }[];
  currentTreatment: { id: string; medication: string; instructions: string }[];
}
```
