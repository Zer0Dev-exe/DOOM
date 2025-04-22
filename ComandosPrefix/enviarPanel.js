const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: "verificacionpanel",
    aliases: ["p", "pong"],
    args: false,
    run: async (message, client, args) => {
        if (!message.member.permissions.has('Administrator')) return message.reply({ content: 'No tienes permisos para usar este comando.' });
        const embedImagen = new EmbedBuilder()
        .setColor('#3359ff')
        .setImage('https://media.discordapp.net/attachments/1356264576454496419/1356309005957464266/Verificacion_Staffs_Hispanos.png?ex=67ec18b2&is=67eac732&hm=d6b1eb7325073615362e067b57a490019d99aad1588f23abbc9751ff3d6c38ba&=&format=webp&quality=lossless&width=820&height=187')
        const embed = new EmbedBuilder()
            .setTitle('Verificación Staffs Hispanos')
            .setColor('#3359ff')
            .setDescription('```Para acceder al resto de esta comunidad debes realizar una verificación y ser aceptado.```')
            .setImage('https://media.discordapp.net/attachments/1356264576454496419/1357353645468942520/21313.png?ex=67efe597&is=67ee9417&hm=dc7d3b493c0424ecbabfa4d89a1c85241511319d7e5b5cec1c92f3eb826ece8a&=&format=webp&quality=lossless&width=638&height=6')
            .setFooter({ text: 'Accede al resto de nuestra comunidad verificándote y siendo aceptado.'})

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('rol_seleccion')
            .setPlaceholder('Selecciona tu rol')
            .addOptions([
                {
                    label: 'Creador/Admin',
                    description: 'Selecciona este rol si eres un Creador o Admin.',
                    value: 'creador',
                },
                {
                    label: 'Moderador',
                    description: 'Selecciona este rol si eres Moderador.',
                    value: 'moderador',
                },
                {
                    label: 'Desarrollador',
                    description: 'Selecciona este rol si eres Desarrollador.',
                    value: 'desarrollador',
                },
                {
                    label: 'Aprendiz',
                    description: 'Selecciona este rol si eres Aprendiz.',
                    value: 'aprendiz',
                },
            ]);

        const row = new ActionRowBuilder()
            .addComponents(selectMenu);
        message.delete();
        message.channel.send({ embeds: [embedImagen, embed], components: [row] });
    }
};