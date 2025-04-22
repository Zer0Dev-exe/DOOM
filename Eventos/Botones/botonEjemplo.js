module.exports = {
    name: "interactionCreate",
  
    async execute(interaction, client) {
      
      if (interaction.isButton()) {
        
        if (interaction.customId === 'botonEjemplo') {
          interaction.reply({ content: 'Has pulsado el botón de ejemplo', ephemeral: true });
        }
      }
    }
  }