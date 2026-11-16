function crearControladorReservas(servicio) {
  function inicio(req, res) {
    res.render("inicio", {
      titulo: "Reservas de salas de estudio",
      cantidadReservas: servicio.contar(),
    });
  }

  function estado(req, res) {
    res.json({
      servicio: "activo",
      reservas: servicio.contar(),
      solicitudId: res.locals.solicitudId,
    });
  }

  function listar(req, res) {
    res.render("reservas/lista", {
      titulo: "Reservas",
      reservas: servicio.listar(),
    });
  }

  function nueva(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      salasPermitidas: res.locals.salasPermitidas,
      error: null,
      valores: {},
    });
  }

  function detalle(req, res) {
    const id = Number(req.params.id);
    const reserva = servicio.buscarPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva solicitada no existe.",
      });
    }

    res.render("reservas/detalle", {
      titulo: `Reserva de ${reserva.estudiante}`,
      reserva,
    });
  }

  function crear(req, res) {
    servicio.crear(req.reservaValidada);

    res.redirect("/reservas");
  }

  return { inicio, estado, listar, nueva, detalle, crear };
}

module.exports = { crearControladorReservas };
