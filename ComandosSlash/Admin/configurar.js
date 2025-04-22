const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const ConfigSchema = require('../../Esquemas/ConfigSchema'); // Asegúrate de que este esquema exista

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setDescription('Configura los roles y el canal de respuestas.')
        .addRoleOption(option =>
            option.setName('rol_creador_admin')
                .setDescription('Selecciona el rol de Creador/Admin')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol_moderador')
                .setDescription('Selecciona el rol de Moderador')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol_desarrollador')
                .setDescription('Selecciona el rol de Desarrollador')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol_aprendiz')
                .setDescription('Selecciona el rol de Aprendiz')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol_admin_postulaciones')
                .setDescription('Selecciona el rol de Administrador de Postulaciones')
                .setRequired(true)) // Nueva opción para el rol de Administrador de postulaciones
        .addChannelOption(option =>
            option.setName('canal_respuestas')
                .setDescription('Selecciona el canal donde se enviarán las respuestas')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('categoria_ticketsverificacion') // Nueva opción para la categoría de tickets
                .setDescription('Selecciona la categoría para tickets de verificación')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory)), // Limita a solo categorías de canal

    async execute(interaction) {
        // Verificar si el usuario tiene permisos de administrador
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'No tienes permisos para usar este comando.', ephemeral: true });
        }

        // Obtener los valores proporcionados por el usuario
        const rolCreadorAdmin = interaction.options.getRole('rol_creador_admin');
        const rolModerador = interaction.options.getRole('rol_moderador');
        const rolDesarrollador = interaction.options.getRole('rol_desarrollador');
        const rolAprendiz = interaction.options.getRole('rol_aprendiz');
        const rolAdminPostulaciones = interaction.options.getRole('rol_admin_postulaciones');
        const canalRespuestas = interaction.options.getChannel('canal_respuestas');
        const categoriaTicketsVerificacion = interaction.options.getChannel('categoria_ticketsverificacion'); // Obtener la categoría de tickets

        // Guardar la configuración en la base de datos
        await ConfigSchema.findOneAndUpdate(
            { guildId: interaction.guild.id }, // Buscar por el ID del servidor
            {
                rolCreadorAdmin: rolCreadorAdmin.id,
                rolModerador: rolModerador.id,
                rolDesarrollador: rolDesarrollador.id,
                rolAprendiz: rolAprendiz.id,
                rolAdminPostulaciones: rolAdminPostulaciones.id,
                canalRespuestas: canalRespuestas.id,
                categoriaTicketsVerificacion: categoriaTicketsVerificacion.id // Guardar la categoría de tickets
            },
            { upsert: true, new: true } // Crear el documento si no existe
        );

        // Responder al usuario
        await interaction.reply({
            content: 'La configuración ha sido actualizada correctamente.',
        });
    }
};
