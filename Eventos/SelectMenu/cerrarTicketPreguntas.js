const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const configuracion = require('../../Esquemas/ConfigSchema');

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    // Verificar si es una interacción con un botón
    if (interaction.isButton()) {
      // Obtener la configuración del servidor
      const config = await configuracion.findOne({ guildId: interaction.guild.id });

      // Verificar si el usuario tiene el rol adecuado para usar el botón

      // Comprobar si el customId del botón es 'cerrar_ticket'
      if (interaction.customId === 'cerrar_ticket') {
        if (!interaction.member.roles.cache.has(config.rolAdminPostulaciones)) {
          return interaction.reply({ content: 'No tienes permisos para usar este botón.', ephemeral: true });
        }
        // Crear un embed de confirmación
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('¿Estás seguro de que quieres cerrar este ticket?')
          .setDescription('Haz clic en **Confirmar** para cerrar el ticket o en **Cancelar** para dejarlo abierto.');

        // Crear los botones de confirmación
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('confirmar_cerrar')
            .setLabel('Confirmar')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancelar_cerrar')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary)
        );

        // Enviar el mensaje de confirmación
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
      }

      // Comprobar si el usuario hizo clic en "Confirmar"
      if (interaction.customId === 'confirmar_cerrar') {
        if (!interaction.member.roles.cache.has(config.rolAdminPostulaciones)) {
          return interaction.reply({ content: 'No tienes permisos para usar este botón.', ephemeral: true });
        }
        // Verificar si el canal es un ticket
        const ticketChannel = interaction.channel;
          // Enviar mensaje de confirmación que el ticket se cerrará
          await interaction.update({ content: 'Este ticket se cerrará y eliminará en breve.', components: [], ephemeral: true });

          // Enviar un mensaje de cierre en el canal
          const embedClose = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Ticket cerrado')
            .setDescription('Este ticket ha sido cerrado y será eliminado.');

          await ticketChannel.send({ embeds: [embedClose] });

          // Eliminar el canal después de un retraso para que el mensaje sea visible
          setTimeout(async () => {
            try {
              await ticketChannel.delete();
              console.log("Canal de ticket eliminado.");
            } catch (error) {
              console.error("Hubo un error al intentar eliminar el canal:", error);
            }
          }, 5000); // Espera 5 segundos antes de eliminar el canal

      // Comprobar si el usuario hizo clic en "Cancelar"
      if (interaction.customId === 'cancelar_cerrar') {
        if (!interaction.member.roles.cache.has(config.rolAdminPostulaciones)) {
          return interaction.reply({ content: 'No tienes permisos para usar este botón.', ephemeral: true });
        }
        // Responder que el cierre ha sido cancelado
        await interaction.update({ content: 'El cierre del ticket ha sido cancelado.', components: [], ephemeral: true });
      }
    }
  }
}
}
