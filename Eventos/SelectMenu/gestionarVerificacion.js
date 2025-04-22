const { EmbedBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const VerificacionSchema = require('../../Esquemas/VerificacionSchema');
const ConfiguracionSchema = require('../../Esquemas/ConfigSchema');

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    if (interaction.isButton()) {
      const [accion, userId] = interaction.customId.split('_'); // Separar la acción y el ID del usuario
      const configuracion = await ConfiguracionSchema.findOne({ guildId: interaction.guild.id });

      // Verificar si el botón pertenece a este sistema
      if (!['aceptar', 'denegar', 'preguntar'].includes(accion)) return;

      if (accion === 'aceptar') {
        // Todo el código dentro de la acción 'aceptar'

        // Deferir la respuesta para evitar el timeout
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.roles.cache.has(configuracion.rolAdminPostulaciones)) {
          return interaction.editReply({ content: 'No tienes permisos para usar este botón.', ephemeral: true });
        }

        // Buscar el formulario en la base de datos
        const formulario = await VerificacionSchema.findOne({ MensajeID: interaction.message.id });
        if (!formulario) {
          return interaction.editReply({ content: 'No se encontró el formulario asociado.' });
        }

        // Obtener el mensaje original
        const canal = interaction.channel;
        const mensaje = await canal.messages.fetch(formulario.MensajeID);

        if (!mensaje) {
          return interaction.editReply({ content: 'No se pudo encontrar el mensaje original.' });
        }

        // Editar el embed según la acción
        const embed = EmbedBuilder.from(mensaje.embeds[0]); // Clonar el embed original
        let estado = '✅ **Aceptado**';
        let color = 'Green';

        // Añadir el rol al usuario
        try {
          const miembro = await interaction.guild.members.fetch(formulario.ID);

          if (!miembro) {
            return interaction.editReply({ content: 'El miembro ya no está en el servidor, no se puede agregar el rol.' });
          }

          const rolId = formulario.Rol === 'creador' ? configuracion.rolCreadorAdmin
            : formulario.Rol === 'moderador' ? configuracion.rolModerador
            : formulario.Rol === 'desarrollador' ? configuracion.rolDesarrollador
            : formulario.Rol === 'aprendiz' ? configuracion.rolAprendiz
            : null;

          if (rolId) {
            await miembro.roles.add([rolId, '1305890351554363432', '1334211030620045312']);
          }

          // Intentar enviar MD al usuario
          try {
            const usuario = await client.users.fetch(formulario.ID);
            if (usuario) {
              const rolNombre = formulario.Rol.charAt(0).toUpperCase() + formulario.Rol.slice(1);
              await usuario.send(`Tu formulario al certificado de **${rolNombre} ha sido aceptado**. ¡Felicidades!`);
            }
          } catch (error) {
            console.error('No se pudo enviar MD al usuario:', error);
            await interaction.editReply({ content: 'No se pudo enviar un mensaje directo al usuario porque tiene los DM cerrados.' });
          }

        } catch (error) {
          console.error('Error al obtener el miembro:', error);
          return interaction.editReply({ content: 'Hubo un error al intentar agregar el rol al usuario.' });
        }

        // Añadir quién realizó la acción al embed
        embed.setColor(color)
          .addFields(
            { name: 'Estado', value: estado },
            { name: 'Acción realizada por', value: `${interaction.user.tag} (${interaction.user.id})` }
          );

        // Editar el mensaje original
        await mensaje.edit({ embeds: [embed], components: [] });

        // Eliminar el formulario de la base de datos si se aceptó
        //await VerificacionSchema.deleteOne({ ID: userId });

        // Responder al moderador
        await interaction.editReply({ content: `El formulario ha sido marcado como: ${estado}` });

      } else if (accion === 'denegar') {
        // Todo el código dentro de la acción 'denegar'

        // Deferir la respuesta para evitar el timeout
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.roles.cache.has(configuracion.rolAdminPostulaciones)) {
          return interaction.editReply({ content: 'No tienes permisos para usar este botón.', ephemeral: true });
        }

        // Buscar el formulario en la base de datos
        const formulario = await VerificacionSchema.findOne({ MensajeID: interaction.message.id });
        if (!formulario) {
          return interaction.editReply({ content: 'No se encontró el formulario asociado.' });
        }

        // Obtener el mensaje original
        const canal = interaction.channel;
        const mensaje = await canal.messages.fetch(formulario.MensajeID);

        if (!mensaje) {
          return interaction.editReply({ content: 'No se pudo encontrar el mensaje original.' });
        }

        // Editar el embed según la acción
        const embed = EmbedBuilder.from(mensaje.embeds[0]); // Clonar el embed original
        let estado = '❌ **Denegado**';
        let color = 'Red';

        // Intentar enviar MD al usuario
        try {
          const usuario = await client.users.fetch(formulario.ID);
          if (usuario) {
            const rolNombre = formulario.Rol.charAt(0).toUpperCase() + formulario.Rol.slice(1);
            await usuario.send(`Tu formulario al certificado de **${rolNombre} ha sido denegado**. Intentalo denuevo más tarde cuando creas ser apto o contacta con un director.`);
          }
        } catch (error) {
          console.error('No se pudo enviar MD al usuario:', error);
          await interaction.editReply({ content: 'No se pudo enviar un mensaje directo al usuario porque tiene los DM cerrados.' });
        }

        // Añadir quién realizó la acción al embed
        embed.setColor(color)
          .addFields(
            { name: 'Estado', value: estado },
            { name: 'Acción realizada por', value: `${interaction.user.tag} (${interaction.user.id})` }
          );

        // Editar el mensaje original
        await mensaje.edit({ embeds: [embed], components: [] });

        // Eliminar el formulario de la base de datos si se denegó
        //await VerificacionSchema.deleteOne({ ID: userId });

        // Responder al moderador
        await interaction.editReply({ content: `El formulario ha sido marcado como: ${estado}` });

      } else if (accion === 'preguntar') {
        // Todo el código dentro de la acción 'preguntar'

        // Deferir la respuesta para evitar el timeout
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.roles.cache.has(configuracion.rolAdminPostulaciones)) {
          return interaction.editReply({ content: 'No tienes permisos para usar este botón.', ephemeral: true });
        }

        // Buscar el formulario en la base de datos
        const formulario = await VerificacionSchema.findOne({ MensajeID: interaction.message.id });
        if (!formulario) {
          return interaction.editReply({ content: 'No se encontró el formulario asociado.' });
        }

        // Obtener el mensaje original
        const canal = interaction.channel;
        const mensaje = await canal.messages.fetch(formulario.MensajeID);

        if (!mensaje) {
          return interaction.editReply({ content: 'No se pudo encontrar el mensaje original.' });
        }

        // Editar el embed según la acción
        const embed = EmbedBuilder.from(mensaje.embeds[0]); // Clonar el embed original
        let estado = '❓ **Se requiere más información**';
        let color = 'Yellow';

        // Crear un canal en la categoría configurada
        try {
          // Crear el canal de texto
          const canal = await interaction.guild.channels.create({
            name: `preguntas-${formulario.ID}`,
            type: ChannelType.GuildText, // Asegúrate de que el tipo sea GuildText
            parent: configuracion.categoriaTicketsVerificacion, // Asigna la categoría al canal
            topic: `Canal para discutir más detalles sobre el formulario de ${formulario.ID}`,
            permissionOverwrites: [
              {
                id: interaction.guild.id, // El resto de los miembros
                deny: [PermissionsBitField.Flags.ViewChannel], // Aseguramos que el canal esté oculto para todos
              },
              {
                id: formulario.ID, // El usuario asociado al formulario
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Permitir ver y enviar mensajes
              },
              {
                id: configuracion.rolAdminPostulaciones, // Moderadores
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Permitir ver y enviar mensajes
              },
            ],
          });

          const botones = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('cerrar_ticket')
                .setLabel('Cerrar Ticket')
                .setStyle(ButtonStyle.Danger)
            );

          // Enviar mensaje inicial en el canal
          const msg = await canal.send({ content: `Hola <@${formulario.ID}>, un director ha solicitado más información sobre tu formulario. Por favor, responde con los detalles necesarios.`, components: [botones] });

          // Editar el embed original
          embed.setColor(color)
            .addFields(
              { name: 'Estado', value: estado },
              { name: 'Acción realizada por', value: `${interaction.user.tag} (${interaction.user.id})` }
            );

          // Editar el mensaje original
          await mensaje.edit({ embeds: [embed]});

        } catch (error) {
          console.error('Error al crear el canal:', error);
          return interaction.editReply({ content: 'Hubo un error al crear el canal para preguntas.' });
        }

        // Responder al moderador
        await interaction.editReply({ content: 'Se ha creado un canal para solicitar más información al usuario.' });
      }
    }
  },
};
