const mongoose = require('mongoose');

const VerificacionSchema = new mongoose.Schema({
    ID: { type: String, required: true },
    Rol: { type: String, required: true },
    Fecha: { type: Date, default: Date.now },
    RespuestasPrincipales: { type: [String], required: true },
    RespuestasExtras: { type: Object, default: {} }, // Cambiar a objeto
    MensajeID: { type: String, required: true },
    PreguntaExtraID: { type: String }
});

module.exports = mongoose.model('Verificacion', VerificacionSchema);
