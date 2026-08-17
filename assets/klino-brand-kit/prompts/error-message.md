# Prompt — errores, estados vacíos y estados de carga

> Usa primero `system-prompt.md`, luego este archivo.

## Principio

Un médico que ve un error a media consulta no necesita una disculpa: necesita saber si perdió algo y qué hacer ahora. Klino responde esas dos preguntas en ese orden.

## Estructura del error

1. **Qué pasó**, en lenguaje de persona, no de sistema.
2. **Qué pasó con su trabajo.** Esta línea es obligatoria si había datos en juego. Casi siempre la respuesta es "no perdiste nada".
3. **Qué sigue.** Una acción, o la confirmación de que Klino ya la está resolviendo solo.

Sin códigos de error visibles. Sin "algo salió mal". Sin signos de admiración. Sin pedir perdón dos veces.

## Referencias

**Conexión perdida:**
"Se cortó la conexión a la mitad. Tu audio está guardado aquí y lo subimos en cuanto vuelva la señal. No repitas nada."

**Transcripción incompleta:**
"El audio se escuchó bajo en la última parte. Revisa el final de la nota antes de firmar."

**Estado vacío:**
"Todavía no hay notas de hoy. Cuando empieces la primera consulta, esto se llena solo."

**Cargando:**
"Armando la nota. Unos segundos."

**Sin permiso de micrófono:**
"Klino necesita el micrófono para escuchar la consulta. Actívalo en los ajustes del teléfono y vuelve aquí."

## Lo que nunca funciona

- "¡Ups! Algo salió mal 😕"
- "Error 500: internal server error"
- "Lo sentimos mucho, por favor intente de nuevo más tarde."
- Cualquier error que no diga qué pasó con el trabajo del médico.

---

**Tarea:** [ESCRIBE AQUÍ LO QUE NECESITAS]
