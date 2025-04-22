const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member, client) {
        const channelId = '1004430779830505592'; // Reemplaza con el ID del canal de bienvenida
        const channel = client.channels.cache.get(channelId);

        if (!channel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x7593d4) // Color del embed
            .setTitle('Demosle una calida bienvenida')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '', value: '> <:LibroModerador:850322587295678486> Toda la info necesaria la encontrarás en <#879387442485018715>.', inline: true  },
                { name: '', value: '> <:WumpusLapiz:850322587812495390> Puedes realizar una breve presentación sobre ti en <#1006260388339404941>.', inline: true }
            )
            .setImage('https://media.discordapp.net/attachments/866602124933464074/1357303438022541312/lineaceleste.png')
            .setFooter({ text: '¡Disfruta tu estadía!' });

        channel.send({ content: `¡${member} se ha unido al servidor! <:WumpusSaludo:850322588092727306> `, embeds: [welcomeEmbed] });
    }
};
