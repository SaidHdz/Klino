# Estado del Proyecto: Klino App

**Fecha de Generación:** 15 de Mayo de 2026
**Versión Actual:** 1.0.0 (Release)
**Plataforma Objetivo:** Android (vía Expo Prebuild / Gradle)

---

## 1. Resumen Ejecutivo
Klino es una aplicación médica móvil diseñada para optimizar el flujo de trabajo clínico mediante la grabación de consultas, transcripción inteligente y generación automática de notas SOAP utilizando Inteligencia Artificial. La aplicación actúa como un puente entre el médico, el hardware de escucha (Klino Device) y los servidores de IA (n8n/OpenAI).

## 2. Arquitectura Tecnológica
*   **Framework Principal:** React Native con Expo (Managed Workflow con módulos nativos vía Prebuild).
*   **Enrutamiento:** Expo Router (Navegación basada en archivos con estructura de Tabs).
*   **Estilos:** NativeWind (Tailwind CSS adaptado para React Native).
*   **Animaciones:** `moti` y `react-native-reanimated` para interacciones fluidas de 60fps.
*   **Base de Datos / Autenticación:** Supabase (PostgreSQL, Auth).
*   **Multimedia:** `expo-av` para grabación y medición de audio en tiempo real.
*   **Documentos:** `expo-print` y `expo-sharing` para generación y exportación de PDFs médicos.
*   **Gráficos Vectoriales:** `react-native-svg` utilizado para el trazado de firmas digitales de alta precisión.

## 3. Funcionalidades Principales

### A. Autenticación y Seguridad
*   **Login Robusto:** Autenticación mediante ID Médico (correo) y contraseña contra Supabase.
*   **Biometría:** Acceso seguro mediante huella dactilar / FaceID usando `expo-local-authentication`.
*   **Registro (Sign Up):** Pantalla dedicada para solicitar/crear nuevas cuentas médicas.

### B. Gestión de Expedientes (Dashboard)
*   **Carpetas de Especialidad:** Organización de notas en Medicina General, Cirugía y Pediatría.
*   **Flujo Inteligente (Sin fantasmas):** Reordenamiento automático de la lista al borrar elementos, sin dejar espacios vacíos, manejado por `AnimatePresence`.
*   **Sincronización de Hardware:** Modal para vincular y refrescar la conexión con dispositivos IoT médicos.

### C. Motor de Grabación e Inteligencia Artificial
*   **Modal Simbionte:** Interfaz de grabación que se expande orgánicamente desde el botón flotante (FAB).
*   **Ondas de Sonido Dinámicas:** Animaciones que reaccionan en tiempo real al volumen de la voz del médico (`metering` a 80ms).
*   **Inyección de Datos (AI Flow):** Envío de audios a un Webhook en `n8n` vía `multipart/form-data` incluyendo metadatos (`profileId`, `folder`, `agentId`).
*   **Parser Dual Universal:** Algoritmo capaz de extraer datos directos de un `payload` o escarbar en estructuras anidadas de Markdown para encontrar el nombre del paciente y la `nota_limpia`.
*   **Confirmación de Paciente:** La app detecta el nombre del paciente desde la IA y pide confirmación antes de guardar.

### D. Detalles de Nota y Firma Digital
*   **Firma de Alta Fidelidad:** Modal de trazado táctil que utiliza **Curvas de Bezier cuadráticas** para lograr firmas suaves, orgánicas y profesionales (sin trazos cuadrados).
*   **Persistencia de Firma:** Posibilidad de guardar la firma del médico localmente y reusarla con un solo toque en futuras notas.
*   **Exportación Legal:** Inyección milimétrica de la firma vectorial en una plantilla HTML y conversión a documento PDF descargable.
*   **Edición en Tiempo Real:** El contenido de la nota IA es editable manualmente sin perder el foco del teclado.

### E. Perfil y Suscripciones
*   **Planes Médicos:** Carrusel cilíndrico 3D de planes de suscripción (Personal $250, Empresarial - Próximamente). Scroll sincronizado automáticamente con el plan activo.
*   **Gestión de Pago:** Tarjeta de crédito interactiva en 3D para visualizar el método de pago.
*   **Cierre de Sesión:** Desvinculación segura conectada al Auth de Supabase.

## 4. Identidad Visual y UI/UX
*   La aplicación ha adoptado una paleta de colores estrictamente clínica para transmitir confianza y precisión:
    *   **Primario:** Azul Cobalto (`#1B4F9B`)
    *   **Secundario / Éxito:** Verde Salvia (`#2A7D6F`)
    *   **Acento / Alertas:** Naranja Ámbar (`#E8820C`)
    *   **Fondos:** Blanco Clínico (`#F4F7FB`) y Blanco Puro (`#FFFFFF`)
*   **Física de Animaciones:** Transiciones ajustadas con `springify`, `damping: 20` y masa baja para evitar rebotes infantiles, logrando una sensación de solidez de software de grado médico.
*   **Feedback Háptico:** Integrado en todas las interacciones clave (tocar botones, cambiar pestañas, confirmaciones, alertas).

## 5. Estado de Compilación y Distribución
*   El proyecto ha sido compilado exitosamente para **Android (Release)**.
*   Se generó una llave de firma (`my-release-key.keystore`).
*   El tamaño del APK fue reducido dramáticamente (de ~190MB en Debug a **~91MB** en Release) mediante optimización de recursos y minificación de código.
*   **Ruta del APK final:** `android/app/build/outputs/apk/release/app-release.apk`

---
*Fin del reporte.*
