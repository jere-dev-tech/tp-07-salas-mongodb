const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
  {
    estudiante: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, match: /@/ },
    sala: {
      type: String,
      required: true,
      trim: true,
      enum: ["Sala Norte", "Sala Sur", "Sala Multimedia"],
    },
    fecha: { type: String, required: true, trim: true },
    turno: {
      type: String,
      required: true,
      trim: true,
      enum: ["Mañana", "Tarde", "Noche"],
    },
    personas: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
      validate: {
        validator: Number.isInteger,
        message: "La cantidad de personas debe ser un número entero.",
      },
    },
  },
  // Consultar una colección vacía no debe crear colecciones ni índices.
  { autoCreate: false, autoIndex: false },
);

module.exports = mongoose.model("Reserva", reservaSchema, "reservas");
