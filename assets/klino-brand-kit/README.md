# Klino — brand kit v1.0

Todo lo necesario para producir trabajo on-brand de Klino, con o sin diseñador.

```
klino-brand-kit/
├── brand.md                  ← la especificación completa. Empieza aquí.
├── brand-guidelines.pdf      ← el manual visual de 15 páginas
├── README.md
├── logo/
│   ├── symbol/               símbolo suelto (la k calada en la caja achaflanada)
│   ├── wordmark/             KLINO en contornos vectoriales
│   ├── lockup/horizontal/    símbolo + wordmark en línea
│   ├── lockup/stacked/       símbolo sobre wordmark
│   └── favicon/              tamaños listos para web y app
├── icons/                    12 iconos de interfaz en SVG
├── fonts/                    Familjen Grotesk y Spectral, licencia OFL
├── tokens/                   CSS, JSON y snippet de Tailwind
└── prompts/                  prompts de IA para copy y fotografía
```

## Empieza por aquí

**Si vas a escribir algo:** pega `prompts/system-prompt.md` al inicio de tu hilo de Claude o GPT, y luego el prompt específico de la tarea (`tweet.md`, `email.md`, `landing-hero.md`, `error-message.md`). Ya traen las restricciones de voz incorporadas.

**Si vas a generar imágenes:** usa `prompts/photography.md`. Trae la plantilla maestra, la lista de clichés prohibidos y el guardarraíl de "sin texto", que es el que evita que el modelo hornee letreros falsos.

**Si vas a programar:** copia `tokens/tokens.css` a tu `:root`, o pega `tokens/tailwind.config.snippet.js` en tu config. Los nombres de token corresponden uno a uno con los nombres de color de `brand.md`.

**Si vas a diseñar:** abre `brand-guidelines.pdf` completo, instala las fuentes de `fonts/` y usa la carpeta `logo/`.

## Qué archivo de logo usar

| Necesitas | Archivo |
|---|---|
| Favicon del sitio | `logo/favicon/favicon-32.png` |
| Ícono de app iOS/Android | `logo/favicon/app-icon-1024.png` |
| Ícono de Apple touch | `logo/favicon/apple-touch-icon-180.png` |
| Avatar de redes sociales | `logo/symbol/symbol-papel.png` sobre círculo Verde Consulta |
| Header de sitio web | `logo/lockup/horizontal/lockup-h-verde.svg` |
| Header sobre fondo oscuro o verde | `logo/lockup/horizontal/lockup-h-papel.svg` |
| Impresión y papelería | cualquier `.pdf` de `logo/` (son vectoriales) |
| Presentaciones y slides | `logo/lockup/stacked/lockup-s-papel.png` |
| Marca de agua o sello pequeño | `logo/symbol/symbol-micro-verde.svg` |
| Cualquier uso a 24 px o menos | las variantes `symbol-micro-*` |

**Los PNG tienen fondo transparente y el calado de la `k` es transparencia real**, así que el símbolo toma el color de lo que tenga detrás. Si lo pones sobre una foto con mucho detalle, usa un recuadro sólido de color debajo.

## Fuentes

Están en `fonts/` con su licencia. Instálalas con doble clic, o cárgalas desde Google Fonts:

- Familjen Grotesk — https://fonts.google.com/specimen/Familjen+Grotesk
- Spectral — https://fonts.google.com/specimen/Spectral

El wordmark ya está convertido a contornos, así que los archivos de logo funcionan aunque no tengas las fuentes instaladas.

## Iconos

Los 12 SVG usan `stroke="currentColor"`, así que heredan el color del contexto. No los recolorees a mano: cambia el `color` del contenedor.

Para iconos fuera del set, usa **Lucide** con trazo 1.75 px y terminales rectas. Nunca mezcles dos librerías en una misma pantalla.

## Las tres reglas que no se rompen

1. **Klino nunca diagnostica.** Ni en copy, ni en una captura, ni en un chiste de redes. Es regulatorio.
2. **Ámbar significa "algo espera tu revisión".** No es color decorativo. Y nunca va como texto pequeño: para eso está Ámbar Tinta `#8A5311`.
3. **Nada de texto de lectura encima de una foto.** El titular va en banda sólida.

---

Klino · Ravyn Studio · TecNM campus Reynosa · v1.0, 2026
