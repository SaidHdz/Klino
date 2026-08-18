# 🛠️ Documentación Técnica - Proyecto Klino

Este documento proporciona una visión profunda de la arquitectura, flujos de datos y decisiones técnicas que sostienen la aplicación Klino.

---

## 1. Arquitectura del Sistema

### 1.1. Patrón de Diseño
La aplicación utiliza un patrón de **Estado Global Centralizado** mediante React Context API (`ProfileContext.tsx`). 
- **Provider:** Envuelve la raíz de la aplicación para proveer datos de usuario, configuraciones y registros clínicos.
- **Persistencia:** Implementa una estrategia de "Local-First" usando `AsyncStorage` para carga instantánea, sincronizándose de forma asíncrona con **Supabase** mediante el método `syncWithCloud`.

### 1.2. Estructura de Navegación (Expo Router)
Se utiliza navegación basada en archivos dentro de la carpeta `/app`:
- `index.tsx`: Punto de entrada que gestiona la redirección basada en la sesión (Auth Guard).
- `(tabs)/`: Contiene las pantallas principales accesibles vía Tab Bar (Dashboard, Expedientes, Perfil).
- `signup.tsx`, `modal.tsx`, etc.: Pantallas de flujo secundario y modales globales.

---

## 2. Stack Tecnológico

| Tecnología | Propósito |
| :--- | :--- |
| **React Native (Expo)** | Framework principal para desarrollo cross-platform. |
| **Supabase** | Backend-as-a-Service (Autenticación, Base de Datos PostgreSQL). |
| **NativeWind (Tailwind)** | Sistema de estilos basado en utilidades para UI consistente. |
| **Moti / Reanimated** | Motor de animaciones de alto rendimiento (60fps). |
| **Expo AV** | Gestión de grabación y monitoreo de niveles de audio (metering). |
| **Lucide React Native** | Set de iconografía consistente. |

---

## 3. Flujos Críticos de Datos

### 3.1. Ciclo de Vida de la Nota Clínica (AI Flow)
1. **Captura:** El médico inicia la grabación en el "Modal Simbionte". Se monitorea el `metering` para feedback visual.
2. **Transmisión:** El audio se envía via Webhook a **n8n** incluyendo metadatos del médico y folder.
3. **Procesamiento:** La IA procesa el audio -> Transcripción -> Estructuración SOAP (Subjetivo, Objetivo, Análisis, Plan).
4. **Validación:** La app recibe el JSON, parsea el nombre del paciente y la nota limpia, y solicita confirmación al médico.
5. **Persistencia:** Una vez confirmada, se guarda en la tabla `clinical_records` de Supabase y en el estado local.

### 3.2. Estrategia de Sincronización
- **Pull:** Al iniciar la app, `syncWithCloud` descarga los registros más recientes de Supabase.
- **Push:** Cada acción de escritura (añadir, editar o confirmar nota) dispara una actualización optimista en el estado local y una petición persistente a la API de Supabase.

---

## 4. Estándares de UI/UX

### 4.1. Sistema de Diseño (Clinical Look & Feel)
- **Colores Primarios:**
  - Azul Cobalto (`#1B4F9B`): Confianza y profesionalismo.
  - Verde Salvia (`#2A7D6F`): Salud y calma.
- **Feedback:**
  - **Háptico:** Uso de `expo-haptics` en cada interacción táctil (impacto ligero para navegación, éxito para guardado).
  - **Visual:** Skeletons para estados de carga y transiciones `spring` para evitar rigidez.

---

## 5. Seguridad y Privacidad

- **Autenticación Biométrica:** Integración con `expo-local-authentication` para acceso rápido y seguro.
- **Manejo de Sesión:** Tokens JWT gestionados por Supabase Auth, almacenados de forma segura.
- **Privacidad de Datos:** La lógica de negocio está diseñada para minimizar la exposición de PII (Personally Identifiable Information) fuera de los flujos de procesamiento necesarios.

---

## 6. Integración IoT (Hardware)

La aplicación está preparada para conectarse con el **Klino Device** mediante Bluetooth Low Energy (BLE).
- **Servicio:** `src/utils/bluetooth.ts`.
- **Estado:** Actualmente simula una "Ilusión de Conectividad" para pruebas de UX, con hooks preparados para la integración nativa con `react-native-ble-plx`.

---
*Documento generado por el Agente de IA - Junio 2026*
