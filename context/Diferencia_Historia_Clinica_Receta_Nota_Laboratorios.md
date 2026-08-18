# Historia clínica, nota de evolución, receta y laboratorios — con peras y manzanas

Para armar bien la separación en la app, piensa en un **expediente de cliente de un vivero/huerto** (así, con peras y manzanas de verdad):

- **Historia clínica = la carpeta completa del huerto.** Es el documento base: se llena la primera vez que el paciente llega ("¿qué árboles tiene, de qué tamaño es el terreno, a qué es alérgico el suelo, qué enfermedades ha tenido antes?") y **se actualiza**, pero no se vuelve a llenar de cero en cada visita. Es el contenedor de todo.
- **Nota de evolución = la libreta de visitas.** Cada vez que el ingeniero agrónomo (el médico) vuelve al huerto, anota: "hoy encontré esto, until hoy el árbol iba así, decidí hacer esto otro". Es una foto de **ese momento puntual**, y se van acumulando una tras otra en el tiempo.
- **Receta = el vale de compra que le entregas al cliente.** No es una nota clínica, es una **orden dirigida a un tercero** (la farmacia) para que surta algo específico: "3 costales de fertilizante X, aplicar así, por tantos días". El cliente se la lleva y la usa fuera del huerto.
- **Laboratorios = el reporte que manda el laboratorio de análisis de tierra.** No lo escribe el ingeniero agrónomo, lo genera **otro proveedor externo** (el laboratorio), y llega para pegarse/anexarse al expediente como evidencia de apoyo al diagnóstico.

En resumen: la historia clínica es el árbol completo, la nota de evolución es cada fruto que va dando con el tiempo, la receta es el pedido que se lleva a otro lado, y el laboratorio es el reporte que entra de fuera.

En México todo esto está regulado por la **NOM-004-SSA3-2012, "Del expediente clínico"** (Secretaría de Salud, DOF 15/oct/2012), que es la norma oficial que rige el expediente clínico en clínicas, consultorios y hospitales — pública y privada. No se usa el término "SOAP" en la norma ni en la práctica cotidiana mexicana; la norma tiene su propio lenguaje y apartados, que detallo abajo.

---

## 1. Historia clínica (numeral 8 y 8.5 de la NOM-004)

Es el documento **inicial y acumulativo**. Se abre la primera vez que el paciente es atendido y sus apartados obligatorios son:

1. **Ficha de identificación** — nombre completo, sexo, edad o fecha de nacimiento, domicilio, datos de contacto, lugar de origen, nacionalidad, y datos de la institución/consultorio.
2. **Antecedentes heredofamiliares** — enfermedades relevantes en padres, hermanos, abuelos (diabetes, hipertensión, cáncer, etc.).
3. **Antecedentes personales patológicos** — enfermedades previas, cirugías, alergias (deben resaltarse), transfusiones, adicciones.
4. **Antecedentes personales no patológicos** — vivienda, ocupación, alimentación, actividad física, hábitos.
5. **Padecimiento actual** — descripción cronológica de por qué viene el paciente hoy: inicio, evolución y síntomas.
6. **Interrogatorio por aparatos y sistemas** — revisión sistemática (cardiovascular, respiratorio, digestivo, etc.).
7. **Exploración física** — signos vitales (temperatura, frecuencia cardiaca, frecuencia respiratoria, tensión arterial), peso, talla, habitus exterior, exploración por regiones.
8. **Resultados previos y actuales de estudios** — laboratorio/gabinete relevantes al caso.
9. **Diagnósticos o problemas clínicos** — lista de diagnósticos identificados.
10. **Pronóstico**.
11. **Indicación terapéutica / plan de tratamiento** — el punto de partida del tratamiento (que luego se refina en cada nota de evolución).

Cada entrada debe llevar **fecha, hora, nombre y firma** de quien la elabora.

## 2. Nota de evolución (consulta subsecuente)

Es la nota que se genera en **cada visita posterior**, no reemplaza la historia clínica sino que se va acumulando sobre ella. Debe registrar como mínimo:

- Evolución y actualización de los síntomas desde la última consulta.
- Signos vitales, cuando estén clínicamente indicados.
- Resultados relevantes de estudios auxiliares de diagnóstico recibidos desde la última nota.
- Diagnósticos o problemas clínicos actualizados.
- Pronóstico.
- Tratamiento e indicaciones médicas, especificando **dosis, vía de administración y periodicidad**.
- Fecha, hora, nombre y firma del médico.

Esta es la nota que se repite una y otra vez en el expediente conforme el paciente regresa a consulta.

## 3. Receta médica

A diferencia de la historia clínica y la nota de evolución, la receta **no es una nota clínica interna**: es un documento dirigido a un tercero (la farmacia) y su regulación específica viene del **Reglamento de Insumos para la Salud** (arts. 28-31) más lo que exige la propia NOM-004 de consistencia con el expediente. Debe incluir:

- Nombre completo del médico, dirección del consultorio/establecimiento y **número de cédula profesional**, impresos.
- Fecha de expedición.
- Firma autógrafa (manuscrita) del médico — una firma digitalizada/impresa no es válida.
- Nombre del paciente (y edad, recomendable).
- **Denominación genérica del medicamento** (obligatoria) y, opcionalmente, el nombre comercial.
- Presentación, dosis, vía de administración, frecuencia y duración del tratamiento.
- Idealmente un folio que la vincule a la consulta/nota correspondiente, para que sea consistente con lo anotado en la nota de evolución (esto es justo lo que revisan en auditorías o quejas).

## 4. Resultados de laboratorio (y gabinete)

Este documento lo **genera un tercero** (el laboratorio o el servicio de imagenología), no el médico tratante, y se integra al expediente como evidencia de apoyo. Debe incluir:

- Fecha y hora en que se realizó el estudio.
- Identificación del médico que lo solicitó.
- Nombre del estudio e indicación clínica por la que se solicitó.
- Resultados e interpretación.
- Cualquier incidente o accidente ocurrido durante la toma de la muestra o el estudio.
- Nombre y firma del profesional que emite el reporte.

En la app, este resultado normalmente se **adjunta o referencia** dentro del expediente y puede citarse tanto en la historia clínica (como antecedente) como en una nota de evolución posterior (como parte de la valoración de esa consulta).

---

### La diferencia clave para la arquitectura de Klino

| Documento | ¿Quién lo genera? | ¿Cuándo se genera? | ¿Es acumulativo o puntual? |
|---|---|---|---|
| Historia clínica | Médico tratante | Una vez, al inicio (con actualizaciones) | Base que se actualiza |
| Nota de evolución | Médico tratante | En cada consulta subsecuente | Se acumula, una por visita |
| Receta | Médico tratante | Al final de cada consulta que lo requiera | Documento de salida (para el paciente/farmacia) |
| Resultados de laboratorio | Laboratorio/gabinete externo | Cuando se completa el estudio | Documento de entrada (se anexa al expediente) |

Fuente normativa: Secretaría de Salud, **NOM-004-SSA3-2012, "Del expediente clínico"**, Diario Oficial de la Federación, 15 de octubre de 2012.
