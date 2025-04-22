const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({
          content: "Este comando tiene errores de nivel alto, comprueba la consola para ver los errores",
        });
      }

      if (command.admin) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription(':warning: | Este comando es solo para administradores')
            ],
            ephemeral: true
          });
        }
      }

      // Si pasa todas las verificaciones, ejecuta el comando
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        interaction.reply({
          content: "Hubo un error al ejecutar este comando.",
          ephemeral: true,
        });
      }
    }
  },
};