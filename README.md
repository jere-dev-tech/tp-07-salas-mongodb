# Trabajo práctico 07 — Persistencia inicial de reservas de salas

Laboratorio de persistencia con Node.js, Mongoose y MongoDB Atlas, desarrollado sobre una copia funcional del TP 06. La aplicación Express conserva sus reservas en memoria; los programas de terminal trabajan con MongoDB.

Referencia principal: documento oficial `unidad-07-trabajo-practico-07.pdf`, especialmente los apartados 4 a 11. Los resultados de este README proceden de las etapas de desarrollo y de la prueba manual identificada expresamente; no se volvieron a ejecutar durante esta actualización documental.

## Punto de partida y entorno

La carpeta y el paquete se llaman `tp-07-salas-mongodb`. Se partió del TP 06 propio, `tp-06-salas-modular`, sin copiar `node_modules`, `.git` ni credenciales. En la comprobación inicial, los 22 archivos de la copia coincidieron por SHA-256 con el original. La instalación y las pruebas HTTP confirmaron una base funcional, sin reparaciones. El TP 06 original se conservó intacto.

Se mantiene CommonJS (`require` y `module.exports`).

| Componente | Versión utilizada o estado |
| --- | --- |
| Node.js | v24.19.0 |
| npm | 11.17.0 |
| Mongoose | 9.12.1 |
| Express | 5.2.1 |
| Prettier | 3.9.10 |
| ESLint / @eslint/js | 10.14.0 / 10.0.1 |
| MongoDB | Atlas; base individual `reservas_salas_u7` |
| Nivel del clúster | MongoDB Atlas Free (M0), confirmado visualmente en Cluster0. Evidencia: [captura del clúster Free](evidencias/mongodb-atlas-cluster-free.png). |
| Versión del servidor MongoDB | No relevada; no se infiere a partir de la versión de Mongoose. |

## Instalación desde una descarga nueva

Se requiere una versión de Node.js compatible con las dependencias y con `--env-file`. El entorno indicado arriba fue el utilizado durante el desarrollo.

Desde la raíz:

```powershell
npm ci
Copy-Item .env.example .env
```

`npm ci` instala lo registrado en `package-lock.json`, incluidas las herramientas de desarrollo. La instalación inicial del TP 06 copiado terminó con código 0 e instaló 153 paquetes; la incorporación posterior de Mongoose agregó 17 paquetes. No se registra como ejecutada una nueva instalación limpia del lockfile final.

Completar el archivo privado `.env` con los datos reales de Atlas, sin publicarlo. La plantilla versionable conserva exclusivamente marcadores:

```dotenv
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u7?retryWrites=true&w=majority
```

La cadena anterior es ficticia. Reemplazar usuario, contraseña y host; conservar las opciones de la URI ofrecida por Atlas y seleccionar la base `reservas_salas_u7`. No dejar los delimitadores de los marcadores. Los caracteres reservados de usuario o contraseña deben estar codificados para una URI.

`PORT` admite enteros entre 1 y 65535 y tiene valor predeterminado 3000. `NODE_ENV` vale `development` por defecto; `production` selecciona Morgan `combined`, y los demás entornos usan `dev`.

Los programas MongoDB requieren `MONGODB_URI`; Express no la requiere. `npm start` no carga automáticamente `.env`. Los comandos MongoDB de este README sí lo cargan mediante `--env-file=.env`. Si una variable ya está definida en la terminal, tiene prioridad sobre el archivo: revisar ese caso antes de diagnosticar una conexión o ejecutar pruebas negativas.

## Preparación de MongoDB Atlas

1. Crear o seleccionar un clúster gratuito **Free (M0)**. Puede reutilizarse el de las clases, conservando las bases de productos y caminatas.
2. Crear un usuario de base de datos con permisos de lectura y escritura para la base de la práctica. Las credenciales de ese usuario se usan en la URI; no deben confundirse con el acceso a la cuenta de Atlas.
3. Permitir en la configuración de acceso de red la IP pública desde la que se conectará Node.js. No publicar esa IP en documentación ni evidencias.
4. Obtener la cadena de conexión para Node.js y completar sus datos únicamente en el `.env` privado. Usar `reservas_salas_u7` como nombre de base.
5. Ejecutar la comprobación de conexión. No crear ni borrar documentos para diagnosticar el acceso.

La evidencia de este TP se obtiene con Atlas, no con una instalación local de MongoDB. El listado no crea automáticamente una colección vacía; la escritura válida puede crearla si todavía no existe.

## Estructura y responsabilidades

```text
tp-07-salas-mongodb/
├── src/
│   ├── config/
│   │   ├── entorno.js
│   │   └── base-datos.js
│   ├── modelos/reserva.js
│   ├── index.js
│   ├── app.js
│   ├── rutas/reservas.js
│   ├── controladores/reservas.js
│   ├── servicios/reservas.js
│   └── middleware/
│       ├── reservas.js
│       └── solicitudes.js
├── scripts/
│   ├── comprobar-conexion.js
│   ├── crear-reserva.js
│   └── listar-reservas.js
├── views/
├── public/css/estilos.css
├── evidencias/mongodb-atlas-reserva-guardada.png
├── .env.example
├── .gitignore
├── .gitattributes
├── eslint.config.js
├── package.json
├── package-lock.json
└── README.md
```

| Archivo o grupo | Responsabilidad |
| --- | --- |
| `src/config/entorno.js` | Conserva `leerConfiguracion()` para HTTP y agrega `leerMongoUri()`, que exige una URI no vacía con prefijo MongoDB válido. La configuración HTTP no invoca el lector MongoDB. |
| `src/config/base-datos.js` | Centraliza DNS, conexión Mongoose esperada, cierre y diagnóstico seguro. Importa `./entorno`. |
| `src/modelos/reserva.js` | Define el esquema y exporta el modelo `Reserva`, vinculado explícitamente con `reservas`. Desactiva creación automática de colección e índices al consultar. |
| `scripts/comprobar-conexion.js` | Confirma éxito después de conectar y cierra recursos sin crear reservas. |
| `scripts/crear-reserva.js` | Conecta y espera `Reserva.create()` para una reserva ficticia por ejecución; muestra el `_id` solo después de confirmar la escritura. |
| `scripts/listar-reservas.js` | Conecta, espera `Reserva.find()`, muestra campos, `_id` y cantidad; no crea, modifica, borra ni carga semillas. |
| Los tres programas | Reutilizan el módulo de conexión; cierran en `finally` y fijan salida distinta de cero ante fallos. Los programas de creación y listado importan el modelo. |
| `src/index.js`, `src/app.js` | Arranque y composición de Express. La importación de configuración apunta a `config/entorno`. |
| Rutas, controladores y servicio | Mantienen los contratos HTTP y el arreglo de reservas del TP 06. |
| Middleware, vistas y CSS | Conservan validaciones HTTP, registros de solicitudes, presentación y recursos anteriores. |
| `eslint.config.js` | Aplica las reglas recomendadas existentes a JavaScript de `src` y `scripts`, con CommonJS. |
| `package.json` y lockfile | Identidad del paquete, dependencias, comandos y versiones reproducibles. |
| `.env.example`, `.gitignore` | Plantilla pública sin secretos y exclusión de archivos locales. |

La antigua `src/configuracion.js` se retiró después de actualizar sus importaciones.

## Esquema, modelo y colección

El **esquema** declara campos y validaciones de Mongoose. El **modelo** `Reserva` permite construir, guardar y consultar documentos. La **colección** `reservas` es el conjunto persistente en la base `reservas_salas_u7`; su nombre se declara explícitamente al compilar el modelo.

| Campo | Tipo | Validación |
| --- | --- | --- |
| `estudiante` | String | `required` y `trim`; rechaza vacío o solo espacios. |
| `email` | String | `required`, `trim` y `match: /@/`. |
| `sala` | String | `required`, `trim` y `enum`: Sala Norte, Sala Sur, Sala Multimedia. |
| `fecha` | String | `required` y `trim`; no se convierte a Date. |
| `turno` | String | `required`, `trim` y `enum`: Mañana, Tarde, Noche. |
| `personas` | Number | `required`, `min: 1`, `max: 6` y `validate` con `Number.isInteger`. |

Se utilizan datos ficticios. El correo solo comprueba presencia de `@`; no hay validación completa de email, calendario, fecha futura, solapamientos, cupos compartidos ni duplicados. No se define índice único. Mongoose intenta convertir números; texto no numérico debe producir un error de conversión sin escritura.

MongoDB utiliza `_id` ObjectId, convertido a texto solo para mostrarlo. Mongoose puede asignar un `_id` al construir un objeto antes de guardarlo: verlo no demuestra persistencia. La evidencia válida requiere esperar la escritura y recuperar ese mismo identificador desde otro proceso.

Cada ejecución válida de creación puede agregar otro documento aunque repita todos los campos. No hay deduplicación ni borrado automático.

## Comandos desde la raíz

```powershell
node --env-file=.env scripts/comprobar-conexion.js
node --env-file=.env scripts/crear-reserva.js
node --env-file=.env scripts/listar-reservas.js
npm run format
npm run check
npm start
```

Ejecutar creación únicamente cuando se quiera agregar una reserva. El listado vacío informa cantidad 0 y es un resultado válido. Detener el servidor web con `Ctrl+C`.

Comandos adicionales de calidad:

```powershell
npm run format:check
npm run lint
```

Los comandos reales usan el patrón conjunto `"{src,scripts}/**/*.js"`: Prettier aplica o comprueba formato y ESLint analiza JavaScript de ambas carpetas. Se adoptó para permitir que `scripts` estuviera vacía durante la preparación, sin archivos de relleno ni reglas desactivadas. `npm run check` ejecuta formato sin escritura y luego lint; `npm run format` sí escribe. Las vistas y el CSS quedan fuera de estos comandos.

## Conexión y diagnóstico seguro

`base-datos.js` lee la URI con `leerMongoUri()`, configura `dns.setServers(["8.8.8.8", "1.1.1.1"])` antes de conectar y usa tiempos de espera de 10 segundos para conexión y selección del servidor.

La configuración DNS está centralizada y afecta la resolución de Node.js; no modifica los resolutores del sistema operativo ni reemplaza la autenticación o la lista de IPs de Atlas. No se registró un fallo DNS durante las pruebas. Si una red requiere otros resolutores o los predeterminados, el ajuste debe acordarse con el docente y documentarse; no se cambió la red automáticamente para resolver errores.

La comprobación real terminó con código 0 y los mensajes:

```text
Conexión con MongoDB confirmada. No se crearon reservas.
Recursos de MongoDB cerrados.
```

Durante la preparación se rechazaron configuraciones de URI inválidas y se observaron fallos de conexión, sin confirmar escritura. Esos intentos iniciales no se contabilizan como pruebas controladas. Posteriormente se completaron y aprobaron los ensayos de variable vacía y contraseña incorrecta descritos en la matriz, usando el entorno del proceso sin modificar .env.

Los diagnósticos muestran únicamente tipos, códigos y operaciones reconocidos; no imprimen URI, usuario, contraseña, mensajes completos ni stacks. La creación informa `ValidationError` y los campos a revisar sin volcar sus valores. Un error nunca debe interpretarse como una escritura confirmada.

## Evidencia real de persistencia entre procesos

Ensayo de la etapa 5 en `reservas_salas_u7`, colección `reservas`. Cada comando terminó antes de comenzar el siguiente y cada ejecución utilizó un proceso nuevo de Node.js. La creación se ejecutó una sola vez.

| Ejecución | Comando con prefijo `node --env-file=.env` | Resultado observado | Cantidad | Salida |
| --- | --- | --- | --- | --- |
| 1 | `scripts/listar-reservas.js` | Colección vacía, sin error. | 0 | 0 |
| 2 | `scripts/crear-reserva.js` | Escritura confirmada; devolvió el identificador indicado debajo. | 0 → 1 | 0 |
| 3 | `scripts/listar-reservas.js` | Recuperó el mismo identificador desde otro proceso. | 1 | 0 |
| 4 | `scripts/listar-reservas.js` | Recuperó el documento sin cambiar la cantidad. | 1 | 0 |

Identificador confirmado: **`6afb4497e196a3978a1e1e3a`**.

Transcripción de los resultados principales, separada por ejecución:

```text
[1 — listado inicial]
Cantidad de reservas recuperadas: 0

[2 — única creación]
Reserva guardada. _id confirmado: 6afb4497e196a3978a1e1e3a

[3 — listado en otro proceso]
_id: 6afb4497e196a3978a1e1e3a
Cantidad de reservas recuperadas: 1

[4 — segundo listado, sin escrituras intermedias]
_id: 6afb4497e196a3978a1e1e3a
Cantidad de reservas recuperadas: 1
```

Las líneas de `_id` de los listados resumen la tabla de terminal original. El documento de esa prueba contiene datos ficticios: Estudiante de ejemplo, `estudiante@example.invalid`, Sala Norte, fecha `2026-11-23`, turno Mañana y 3 personas.

La captura de Data Explorer muestra la base, la colección, un documento y ese mismo ObjectId:

![Reserva persistida en MongoDB Atlas: base reservas_salas_u7, colección reservas y el identificador de la prueba](evidencias/mongodb-atlas-reserva-guardada.png)

![Clúster de MongoDB Atlas: nivel Free confirmado en la pantalla Overview](evidencias/mongodb-atlas-cluster-free.png)

No se borraron ni modificaron registros existentes para obtener la evidencia.

## Matriz mínima del PDF

**Observado** corresponde a ejecuciones registradas durante el desarrollo. **Manual informado** identifica evidencia comunicada por el autor. **Pendiente** no significa aprobado. Las validaciones locales del modelo no sustituyen las pruebas negativas con conteos reales en Atlas.

| Caso del PDF | Resultado real disponible | Cantidad antes → después / estado |
| --- | --- | --- |
| Conexión válida | Tras los fallos de configuración y autenticación, un proceso con la configuración original confirmó conexión, cerró recursos y terminó con salida 0. | 1 → 1. Observado. |
| Fallo DNS, si ocurrió | No se registró un fallo DNS. Se utilizaron los resolutores indicados. | No aplica ensayo de reparación DNS. |
| Variable vacía | MONGODB_URI vacía solo en el entorno del proceso: rechazo de configuración, salida 1, sin éxito y con cierre de recursos. .env no se modificó. | 1 → 1. Observado. |
| Prefijo de URI incorrecto (adicional) | Prefijo no MongoDB solo en el entorno del proceso: rechazo de configuración, salida 1, sin éxito y con cierre de recursos. | 1 → 1. Observado. |
| Contraseña incorrecta temporal | Contraseña incorrecta solo en el entorno del proceso: autenticación rechazada, salida 1, sin éxito y con cierre de recursos. No se modificaron .env ni las credenciales en Atlas. Un proceso posterior confirmó conexión válida con salida 0. Se usó esta variante segura en lugar de editar .env. | 1 → 1. Observado. |
| Colección vacía | Primer listado de la etapa 5: cantidad 0, salida 0. No se borraron datos. | 0 → 0. Observado. |
| Reserva válida | Una escritura confirmada en la etapa 5 con `_id 6afb4497e196a3978a1e1e3a`. No se repitió en los ensayos negativos. | 0 → 1. Observado. |
| Consulta desde proceso nuevo | Recuperó ese mismo `_id`, salida 0. | 1 → 1. Observado. |
| Segunda consulta | Recuperó el documento sin agregar registros, salida 0. | 1 → 1. Observado. |
| Estudiante vacío | Prueba manual informada por el autor: rechazo con `ValidationError`, sin alta. No se atribuye al agente ni se inventa un código de salida. | 1 → 1. Manual informado. |
| Email sin `@` | Única variación: email sin arroba. crear-reserva.js rechazó con ValidationError en email y salida 1, sin confirmar escritura. | 1 → 1. Observado en Atlas antes y después. |
| Sala no permitida | Única variación: Sala Este. Rechazo con ValidationError en sala y salida 1. | 1 → 1. Observado en Atlas antes y después. |
| Turno no permitido | Única variación: Madrugada. Rechazo con ValidationError en turno y salida 1. | 1 → 1. Observado en Atlas antes y después. |
| Fecha vacía | Única variación: fecha como cadena vacía. Rechazo con ValidationError en fecha y salida 1. | 1 → 1. Observado en Atlas antes y después. |
| Personas 0 | Ensayo separado, única variación: personas 0. Rechazo con ValidationError en personas y salida 1. | 1 → 1. Observado en Atlas antes y después. |
| Personas 7 | Ensayo separado, única variación: personas 7. Rechazo con ValidationError en personas y salida 1. | 1 → 1. Observado en Atlas antes y después. |
| Personas 2.5 | Ensayo separado, única variación: personas 2.5. Rechazo con ValidationError en personas y salida 1. | 1 → 1. Observado en Atlas antes y después. |
| Personas con texto no numérico | Única variación: texto abc. El programa rechazó con ValidationError en personas y salida 1; la validación local previa identificó CastError en ese campo. | 1 → 1. Observado en Atlas antes y después. |
| Integridad y restauración | Ocho ensayos de datos con un solo campo inválido cada vez. crear-reserva.js se restauró a sus bytes originales tras cada ensayo y al terminar; no se ejecutó con el ejemplo válido. Los listados verificaron el documento original. .env conservó sus bytes originales. No se borraron ni modificaron documentos existentes. | Cantidad final: 1. Observado. |

En la etapa 4 se comprobaron localmente 15 casos inválidos del modelo, la normalización con `trim` y los límites válidos 1 y 6. Se utilizó `validate()` sin abrir conexión ni guardar documentos. Una primera comprobación con `validateSync()` emitió un aviso de obsolescencia de Mongoose; se repitió usando `validate()`, sin ese aviso. El código de los programas no utiliza `validateSync()`.

Todas las pruebas negativas obligatorias fueron completadas y aprobadas según los resultados de la matriz. El caso de estudiante vacío corresponde a la prueba manual informada por el autor; los demás ensayos reales se registraron durante el desarrollo. Se cambió un solo campo por ensayo de datos y se restauró el ejemplo válido al terminar, sin borrar documentos. La cantidad final comprobada de reservas en Atlas permanece en **1**. La evidencia de persistencia está en [la captura de Data Explorer](evidencias/mongodb-atlas-reserva-guardada.png).

La prueba de autenticación preservó la URI válida de forma privada y sustituyó temporalmente solo la contraseña en el entorno de un proceso. Se comprobó el rechazo sin mensaje de éxito y, después, la conexión válida en otro proceso con la configuración original. No se modificaron .env ni la contraseña del usuario en Atlas. La matriz registra cantidades 1 → 1 y los códigos de salida observados. Esta corrección documental no volvió a ejecutar los ensayos.

## Continuidad HTTP y separación de almacenamientos

Express continúa en memoria porque este TP incorpora un laboratorio de terminal, sin migrar todavía el servicio HTTP a MongoDB ni transformar los controladores para trabajar con promesas. El sitio conserva cuatro reservas iniciales y sus IDs numéricos; las altas web desaparecen al reiniciar. MongoDB mantiene sus documentos y ObjectId entre procesos, independientemente del sitio.

Una reserva creada desde terminal no tiene por qué aparecer en las vistas. El listado de MongoDB no consulta el arreglo del servicio web. La integración de la persistencia con el servicio HTTP corresponde a la continuidad prevista para la unidad 8; no se adelantó en este trabajo.

Resultados HTTP registrados en etapas anteriores:

| Comprobación | Resultado observado |
| --- | --- |
| `GET /` y `GET /estado` | 200; total inicial de 4 reservas. |
| `GET /reservas` | 200; cuatro tarjetas iniciales. |
| `GET /reservas/nueva` | 200; formulario con seis campos. |
| `GET /reservas/1` / ID inexistente | 200 / 404. |
| POST válido | 302 hacia `/reservas`; total 4 → 5. |
| 16 POST inválidos | 400 en todos; total 4 → 4 en cada intento. |
| Listado y detalle del alta temporal | 200; cinco tarjetas y detalle del ID 5. |
| Reinicio | Cuatro reservas originales; el ID temporal 5 respondió 404. |
| CSS / URL inexistente | 200 con `text/css` / 404 HTML. |
| Arranque posterior sin `MONGODB_URI` | Correcto; inicio y estado devolvieron 200 con cuatro reservas. |

La regresión completa corresponde a la etapa 1. Las etapas 2 y 3 volvieron a comprobar el arranque, inicio y estado sin URI; no se presentan como una repetición completa de todos los casos después de cada cambio. Los servidores utilizados en esas pruebas quedaron detenidos.

## Calidad, seguridad y pendientes

`npm run format` y `npm run check` aprobaron durante las etapas de implementación, incluida la incorporación del modelo y los dos programas. Son resultados históricos; esta actualización del README no ejecutó formato, lint, servidores ni escrituras.

La auditoría de dependencias de la etapa 1 informó tres alertas moderadas de desarrollo en ESLint/minimatch y cero vulnerabilidades de producción. La instalación de Mongoose también informó tres alertas moderadas. No se ejecutó `npm audit fix`; no se presenta ese informe como una auditoría actual ni como garantía de ausencia de vulnerabilidades.

`.gitignore` excluye `node_modules/` y `.env`; Git reconoció expresamente la exclusión de `.env` durante la preparación. Se deben incluir `.env.example`, `package-lock.json` y la evidencia, sin secretos. No se publican credenciales, URI reales, IPs ni datos personales en este README. Los datos del documento de prueba son ficticios.

La evidencia visual de Cluster0 confirma Atlas Free (M0), y las pruebas negativas obligatorias ya están completas. Ambas capturas están enlazadas en este README. Para la publicación y el seguimiento quedan estas tareas:

- Si se exige una comprobación final desde descarga nueva, registrar una instalación limpia con el lockfile actual; no dar por realizada la del TP 06 como prueba del árbol final.
- Mantener identificadas las alertas de dependencias históricas y revisar su estado cuando se autorice.
- Publicar, con autorización, el repositorio individual de GitHub y verificar que la URL sea correcta y accesible al docente; comprobar antes que no incluya secretos ni `node_modules`.

La documentación no inicializó Git ni publicó cambios.
