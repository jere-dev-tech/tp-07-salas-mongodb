const { crearApp } = require("./app");
const { crearServicioReservas } = require("./servicios/reservas");
const { leerConfiguracion } = require("./config/entorno");

let configuracion;

try {
  configuracion = leerConfiguracion();
} catch (error) {
  console.error(`Error de configuración: ${error.message}`);
  process.exit(1);
}

const datosIniciales = [
  {
    id: 1,
    estudiante: "Lucía Fernández",
    email: "lucia.fernandez@universidad.edu.ar",
    sala: "Sala Norte",
    fecha: "2026-10-13",
    turno: "Mañana",
    personas: 3,
  },
  {
    id: 2,
    estudiante: "Mateo Ramírez",
    email: "mateo.ramirez@universidad.edu.ar",
    sala: "Sala Multimedia",
    fecha: "2026-10-14",
    turno: "Tarde",
    personas: 5,
  },
  {
    id: 3,
    estudiante: "Sofía Benítez",
    email: "sofia.benitez@universidad.edu.ar",
    sala: "Sala Sur",
    fecha: "2026-10-16",
    turno: "Noche",
    personas: 2,
  },
  {
    id: 4,
    estudiante: "Tomás Acosta",
    email: "tomas.acosta@universidad.edu.ar",
    sala: "Sala Norte",
    fecha: "2026-10-19",
    turno: "Tarde",
    personas: 4,
  },
];

const servicioReservas = crearServicioReservas(datosIniciales);
const app = crearApp(servicioReservas, configuracion);

app.listen(configuracion.puerto, () => {
  console.log(
    `Servidor disponible en http://localhost:${configuracion.puerto}`,
  );
});
