# 📖 Estándares y Reglas de Documentación Técnica

Este documento define las normativas obligatorias para la documentación del código, arquitectura y flujos de trabajo en este proyecto. El objetivo es mantener una fuente de verdad clara, concisa y útil para el equipo de desarrollo y los agentes de IA.

---

## 1. Filosofía de Documentación

* **Documenta el "Por Qué", no el "Qué":** El código limpio y bien nombrado ya explica *qué* hace una función. La documentación debe explicar *por qué* se tomó esa decisión, las reglas de negocio detrás de ella o los casos borde ("edge cases") que maneja.
* **Documentación Viva:** La documentación debe actualizarse en el mismo Pull Request (PR) o commit en el que se modifica el código. Código nuevo sin documentación actualizada se considera incompleto.
* **Cero Ambigüedad:** Utiliza un lenguaje técnico, directo y estructurado. Evita suposiciones.

---

## 2. Estructura Obligatoria del Repositorio

Todo proyecto debe contener al menos los siguientes documentos en su raíz:

1. `README.md`: Resumen del proyecto, stack tecnológico, requisitos previos y pasos exactos para levantar el entorno de desarrollo local.
2. `ARCHITECTURE.md`: Diagramas de alto nivel, explicación de la separación de responsabilidades (frontend, backend, base de datos) y patrones de diseño utilizados.
3. `IMPLEMENTATION_PLAN.md` (Opcional pero recomendado): Registro incremental de las fases de desarrollo y tareas por hacer.

---

## 3. Reglas de Documentación en el Código (Inline & Bloques)

### 3.1. Funciones y Métodos
Toda función compleja, servicio o endpoint debe estar documentado usando el estándar del lenguaje (ej. JSDoc para JavaScript/TypeScript, Docstrings para Python).

**Debe incluir:**
* Breve descripción de la lógica de negocio.
* Tipos de datos de entrada (`@param`) y salida (`@returns`).
* Excepciones o errores que puede lanzar (`@throws`).

**Ejemplo (JSDoc):**
```javascript
/**
 * Procesa el pago de una orden y actualiza el inventario.
 * Se eligió ejecutar esto en una transacción para evitar inconsistencias si la pasarela falla.
 * * @param {string} orderId - El identificador único de la orden.
 * @param {number} amount - El monto total a cobrar.
 * @throws {PaymentGatewayError} Si la API externa rechaza el cargo.
 * @returns {Promise<boolean>} True si el proceso fue exitoso.
 */