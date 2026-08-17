# Fuentes de Klino

| Archivo | Familia | Uso | Pesos |
|---|---|---|---|
| `FamiljenGrotesk-Variable.ttf` | Familjen Grotesk | Display: títulos, etiquetas, wordmark | variable 400–700, la marca usa 600 |
| `Spectral-Regular.ttf` | Spectral | Cuerpo de texto | 400 |
| `Spectral-Medium.ttf` | Spectral | Énfasis dentro del cuerpo | 500 |

## Instalación

**Mac:** doble clic en cada archivo y presiona "Instalar fuente".
**Windows:** clic derecho y "Instalar para todos los usuarios".
**Web:** cárgalas desde Google Fonts o autoaloja los TTF con `@font-face`.

```css
@font-face {
  font-family: 'Familjen Grotesk';
  src: url('/fonts/FamiljenGrotesk-Variable.ttf') format('truetype');
  font-weight: 400 700;
  font-display: swap;
}
@font-face {
  font-family: 'Spectral';
  src: url('/fonts/Spectral-Regular.ttf') format('truetype');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Spectral';
  src: url('/fonts/Spectral-Medium.ttf') format('truetype');
  font-weight: 500;
  font-display: swap;
}
```

## Google Fonts

- Familjen Grotesk — https://fonts.google.com/specimen/Familjen+Grotesk
- Spectral — https://fonts.google.com/specimen/Spectral

## Licencia

Ambas familias se distribuyen bajo la **SIL Open Font License 1.1** (`OFL.txt`). La OFL permite usarlas, modificarlas y redistribuirlas, incluso comercialmente, siempre que no se vendan por sí solas y que los trabajos derivados conserven la licencia. Puedes incluirlas en tu app, en tu sitio y en este kit sin pagar nada.

## Regla de uso

Familjen Grotesk nunca para párrafos. Spectral nunca para etiquetas.
