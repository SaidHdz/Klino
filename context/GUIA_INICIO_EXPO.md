# 🚀 Guía Maestra: Creación y Optimización de Apps con Expo

Esta guía detalla el flujo de trabajo estándar para iniciar, desarrollar y compilar aplicaciones móviles de alto rendimiento con Expo, garantizando builds exitosas y estabilidad en producción.

---

## 1. Inicialización y Entorno

### A. Creación del Proyecto
Utiliza siempre la versión más reciente con TypeScript para asegurar robustez.
```bash
npx create-expo-app@latest MiApp --template tabs
```

### B. Evitar Errores de "Path Too Long" (Windows)
Antes de empezar a compilar, configura Gradle para usar una ruta corta. Crea una carpeta en `C:\b` y modifica `android/build.gradle`:
```gradle
allprojects {
    buildDir = "C:/b/${rootProject.name}/${project.name}"
}
```

---

## 2. Arquitectura de Carpetas Recomendada
Mantén una estructura limpia para facilitar el mantenimiento y el escalado:
```text
/app             # Expo Router (Rutas y Navegación)
/src
  /components    # Componentes atómicos y reutilizables
  /screens       # Lógica real de las pantallas
  /context       # Proveedores de estado (Auth, Perfil, etc.)
  /services      # Llamadas a API, Firebase, Supabase
  /utils         # Funciones de ayuda y constantes
/assets          # Imágenes, fuentes y animaciones Lottie
```

---

## 3. Optimización de Assets y Rendimiento

### A. Imágenes
Nunca uses imágenes sin procesar. Pásalas por `expo-optimize`:
```bash
npx expo-optimize
```
*   Usa formatos **WebP** siempre que sea posible.
*   Usa `expo-image` para un renderizado y cacheo superior a la etiqueta `<Image>` estándar.

### B. Animaciones
*   Para animaciones de 60fps, prefiere `moti` o `react-native-reanimated`.
*   Evita el uso excesivo de `setState` en bucles de animación; usa `SharedValues`.

---

## 4. Gestión de Llaves y Firmado (Sin Android Studio)

Para que las builds de producción siempre funcionen desde la terminal, automatiza el firmado:

1.  **Genera la Keystore (una sola vez):**
    ```bash
    keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
    ```

2.  **Configura `android/gradle.properties`:**
    ```properties
    MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
    MYAPP_RELEASE_KEY_ALIAS=my-key-alias
    MYAPP_RELEASE_STORE_PASSWORD=tu_password
    MYAPP_RELEASE_KEY_PASSWORD=tu_password
    ```

3.  **Vincula en `android/app/build.gradle`:**
    ```gradle
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    ```

---

## 5. Proceso de Build y Release

### A. Limpieza Profunda (Si algo falla)
```bash
watchman watch-del-all && rm -rf node_modules && npm install && npx expo start -c
```

### B. Generación de APK/AAB firmado
Para generar el ejecutable de producción localmente:
```bash
# Vía Expo (Recomendado)
npx expo run:android --variant release

# Vía Gradle directo
cd android && ./gradlew assembleRelease
```

---

## 6. Checklist de "Pre-Vuelo" para Producción
- [ ] **Versión:** Incrementa `version` y `versionCode` en `app.json`.
- [ ] **Permisos:** Revisa `app.json` para no pedir permisos innecesarios (Cámara, GPS, etc).
- [ ] **Splash Screen:** Asegúrate de que las imágenes de splash cumplan con las dimensiones de Expo para evitar estiramientos.
- [ ] **Sentry/Bugsnag:** Configura un sistema de reporte de errores para monitorear crashes en dispositivos reales.

---
*Documento generado para el ecosistema SOMA / Klino.*
