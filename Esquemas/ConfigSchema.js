const { model, Schema } = require('mongoose');

const ConfigSchema = new Schema({
    guildId: { type: String, required: true }, // ID del servidor
    rolCreadorAdmin: { type: String, required: true },
    rolModerador: { type: String, required: true },
    rolDesarrollador: { type: String, required: true },
    rolAprendiz: { type: String, required: true },
    rolAdminPostulaciones: { type: String, required: true }, // Nuevo campo para el rol de Administrador de Postulaciones
    canalRespuestas: { type: String, required: true },
    categoriaTicketsVerificacion: { type: String, required: true } // Nuevo campo para la categoría de tickets de verificación
});

module.exports = model('Config', ConfigSchema);
