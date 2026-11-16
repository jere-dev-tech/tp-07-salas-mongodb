const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];

function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  res.locals.salasPermitidas = salasPermitidas;
  next();
}

function validarReserva(req, res, next) {
  const cuerpo = req.body ?? {};
  const estudiante = String(cuerpo.estudiante ?? "").trim();
  const email = String(cuerpo.email ?? "").trim();
  const sala = String(cuerpo.sala ?? "").trim();
  const fecha = String(cuerpo.fecha ?? "").trim();
  const turno = String(cuerpo.turno ?? "").trim();
  const personasTexto = String(cuerpo.personas ?? "").trim();
  const personas = Number(personasTexto);
  const valores = {
    estudiante,
    email,
    sala,
    fecha,
    turno,
    personas: personasTexto,
  };

  let error = null;

  if (!estudiante || !email || !sala || !fecha || !turno || !personasTexto) {
    error = "Todos los campos son obligatorios.";
  } else if (!salasPermitidas.includes(sala)) {
    error = "La sala seleccionada no está permitida.";
  } else if (!["Mañana", "Tarde", "Noche"].includes(turno)) {
    error = "El turno seleccionado no está permitido.";
  } else if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
    error = "La cantidad de personas debe ser un número entero entre 1 y 6.";
  } else if (!email.includes("@")) {
    error = "El email debe contener @.";
  }

  if (error) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reserva",
      salasPermitidas,
      error,
      valores,
    });
  }

  req.reservaValidada = {
    estudiante,
    email,
    sala,
    fecha,
    turno,
    personas,
  };

  next();
}

module.exports = { prepararAreaReservas, validarReserva };
