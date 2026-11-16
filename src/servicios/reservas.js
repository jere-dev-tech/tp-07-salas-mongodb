function crearServicioReservas(datosIniciales) {
  const reservas = datosIniciales;

  function listar() {
    return reservas;
  }

  function buscarPorId(id) {
    return reservas.find((reserva) => reserva.id === id);
  }

  function contar() {
    return reservas.length;
  }

  function crear(datosValidados) {
    const nuevoId =
      reservas.length > 0
        ? Math.max(...reservas.map((reserva) => reserva.id)) + 1
        : 1;

    const reserva = {
      id: nuevoId,
      ...datosValidados,
    };

    reservas.push(reserva);
    return reserva;
  }

  return { listar, buscarPorId, contar, crear };
}

module.exports = { crearServicioReservas };
