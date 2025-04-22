const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const VerificacionSchema = require('../../Esquemas/VerificacionSchema');
const ConfigSchema = require('../../Esquemas/ConfigSchema'); // Suponiendo que tienes un esquema para la configuración

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        const config = await ConfigSchema.findOne({ guildId: interaction.guild.id });

        // Si no se encuentra la configuración, terminamos la ejecución
        if (!config) {
            console.error('Configuración no encontrada');
            return;
        }

        const preguntasPorRol = {
            creador: {
                principales: [
                    '¿Cuántos años de experiencia tienes?',
                    '¿Has administrado comunidades grandes?',
                    '¿Qué comunidad administras ahora?',
                    '¿Formas parte de Discord Admins?',
                    '¿Qué comunidades has creado o gestionado?'
                ],
                extras: [
                    'Miembros, enlace y tiempo en el cargo.',
                ]
            },
            moderador: {
                principales: [
                    '¿Cuántos años de experiencia tienes?',
                    '¿Has moderado comunidades grandes?',
                    '¿En qué comunidad moderas ahora?',
                    '¿Formas parte de Discord Admins?',
                    '¿Algo que desees añadir?'
                ],
                extras: [
                    'Miembros, enlace y tiempo en el cargo.',
                ]
            },
            aprendiz: {
                principales: [
                    '¿De dónde nos conoces?',
                    '¿Qué área deseas aprender?',
                    '¿Por qué aprender en nuestra comunidad?',
                    '¿Algo más que añadir?'
                ],
                extras: [
                    'Define entre Creador, Admin, Mod, Dev o Ayudante.'
                ]
            },
            desarrollador: {
                principales: [
                    '¿Cuántos años de experiencia tienes?',
                    '¿Qué lenguajes de programación dominas?',
                    '¿Has trabajado en proyectos grandes?',
                    '¿Qué tipo de proyectos te interesan?',
                    '¿Qué esperas aprender o compartir aquí?'
                ],
                extras: [
                    'Añade link de GitHub o portafolio.'
                ]
            }
        };

        if (interaction.isSelectMenu() && interaction.customId === "rol_seleccion") {
            const selectedRole = interaction.values[0];

            // Comprobar si el usuario ya tiene un rol en la base de datos
            const existingForm = await VerificacionSchema.findOne({ ID: interaction.user.id, Rol: selectedRole });

            if (existingForm) {
                return interaction.reply({ content: 'Ya tienes un formulario abierto para este rol. Por favor, espera a que sea revisado.', ephemeral: true });
            }

            // Verificar si el usuario tiene el rol ya asignado en su perfil
            const userRoles = interaction.member.roles.cache;
            const roleId = config[`rol${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`];

            if (userRoles.has(roleId)) {
                return interaction.reply({ content: `Ya tienes el rol de ${selectedRole.replace('_', ' ')}. No puedes postularte nuevamente.`, ephemeral: true });
            }

            // Si no tiene el rol, proceder a mostrar el formulario
            if (!preguntasPorRol[selectedRole]) {
                return interaction.reply({ content: 'No has seleccionado una opción válida.', ephemeral: true });
            }

            const modal = new ModalBuilder()
                .setCustomId(`modal_${selectedRole}`)
                .setTitle(`Formulario para ${selectedRole.replace('_', ' ').toUpperCase()}`);

            const preguntasPrincipales = preguntasPorRol[selectedRole].principales;
            const componentes = preguntasPrincipales.map((pregunta, index) =>
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`pregunta_${index + 1}`)
                        .setLabel(pregunta)
                        .setStyle(index === 0 ? TextInputStyle.Short : TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );

            modal.addComponents(...componentes);
            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_')) {
            const rol = interaction.customId.replace('modal_', '');
            const preguntasPrincipales = preguntasPorRol[rol]?.principales || [];
            const respuestas = preguntasPrincipales.map((_, index) => interaction.fields.getTextInputValue(`pregunta_${index + 1}`)).filter(Boolean);
            const preguntasExtras = preguntasPorRol[rol]?.extras || [];

            const embed = new EmbedBuilder()
                .setTitle('Formulario Completado (Pendiente de preguntas extra)')
                .setDescription(`**Usuario:** ${interaction.user.tag} (${interaction.user.id})\n**Rol:** ${rol.replace('_', ' ').toUpperCase()}`)
                .setColor('Blue')
                .addFields(
                    ...respuestas.map((respuesta, index) => ({ name: preguntasPrincipales[index], value: respuesta, inline: false }))
                )
                .setTimestamp();

            const botones = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('aceptar')
                    .setLabel('Aceptar')
                    .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                    .setCustomId('denegar')
                    .setLabel('Denegar')
                    .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                    .setCustomId('preguntar')
                    .setLabel('Preguntar')
                    .setStyle(ButtonStyle.Secondary)
                );

            const canal = client.channels.cache.get(config.canalRespuestas);
            if (!canal) {
                return interaction.reply({ content: 'No se pudo encontrar el canal para enviar las respuestas.', ephemeral: true });
            }

            const mensaje = await canal.send({ embeds: [embed], components: [botones] });
            const formulario = await VerificacionSchema.create({
                ID: interaction.user.id,
                Rol: rol,
                Fecha: new Date(),
                RespuestasPrincipales: respuestas,
                RespuestasExtras: {},
                MensajeID: mensaje.id
            });
            await VerificacionSchema.updateOne({ _id: formulario._id }, { MensajeID: mensaje.id });

            const botonesExtras = preguntasExtras.map((preguntaExtra, index) =>
                new ButtonBuilder()
                    .setCustomId(`extra_${rol}_${index + 1}`)
                    .setLabel(`${preguntaExtra}`)
                    .setStyle(ButtonStyle.Primary)
            );

            if (botonesExtras.length > 0) {
                const actionRow = new ActionRowBuilder().addComponents(...botonesExtras);
                const msg = await interaction.reply({ content: 'Responde las preguntas adicionales:', components: [actionRow], ephemeral: true });
                await VerificacionSchema.updateOne({ _id: formulario._id }, { PreguntaExtraID: msg.id });
            } else {
                await interaction.reply({ content: 'Formulario enviado correctamente.', ephemeral: true });
            }
        }

        // Lógica de manejo de preguntas extras
        if (interaction.isButton() && interaction.customId.startsWith('extra_')) {
            const parts = interaction.customId.split('_');
            if (parts.length < 3) {
                return interaction.reply({ content: 'Error en el formato del botón.', ephemeral: true });
            }

            const rol = parts[1];
            const extraIndex = parseInt(parts[2], 10) - 1;

            const preguntasExtras = {
                creador: [
                    'Miembros, enlace y tiempo en el cargo.',
                ],
                moderador: [
                    'Miembros, enlace y tiempo en el cargo.',
                ],
                aprendiz: [
                    'Creador, Admin, Mod, Dev o Ayudante.'
                ],
                desarrollador: [
                    'Añade link de GitHub o portafolio.'
                ]
            };

            const rolData = await VerificacionSchema.findOne({ ID: interaction.user.id, Rol: rol });

            if (!rolData) {
                return interaction.reply({ content: 'No se encontró el formulario pendiente.', ephemeral: true });
            }

            const respuestaKey = `respuesta${extraIndex + 1}`;
            if (rolData.RespuestasExtras[respuestaKey]) {
                return interaction.reply({ content: 'Ya has respondido a esta pregunta extra.', ephemeral: true });
            }

            const preguntaExtra = preguntasExtras[rol][extraIndex];

            const modal = new ModalBuilder()
                .setCustomId(`pregunta_extra_${rol}_${extraIndex}`)
                .setTitle('Pregunta Adicional')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId(`respuesta_extra_${extraIndex}`)
                            .setLabel(`${preguntaExtra}`)
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith('pregunta_extra_')) {
            await interaction.deferReply({ ephemeral: true });

            const parts = interaction.customId.split('_');
            if (parts.length < 4) {
                return interaction.editReply({ content: 'Error en el formato del modal.' });
            }

            const rol = parts[2];
            const extraIndex = parseInt(parts[3]);

            const respuestaExtra = interaction.fields.getTextInputValue(`respuesta_extra_${extraIndex}`);

            const respuestaKey = `respuesta${extraIndex + 1}`;
            try {
                await VerificacionSchema.updateOne(
                    { ID: interaction.user.id },
                    { $set: { [`RespuestasExtras.${respuestaKey}`]: respuestaExtra } }
                );
            } catch (error) {
                console.error(`Error al actualizar la base de datos: ${error}`);
                return interaction.editReply({ content: 'Hubo un error al guardar la respuesta.' });
            }

            const rolData = await VerificacionSchema.findOne({ ID: interaction.user.id, Rol: rol });
            const preguntasExtras = preguntasPorRol[rol].extras;

            const canal = client.channels.cache.get(config.canalRespuestas);
            const mensaje = await canal?.messages?.fetch(rolData.MensajeID).catch(() => null);

            if (mensaje) {
                const embed = mensaje.embeds[0];
                const newEmbed = EmbedBuilder.from(embed);

                newEmbed.addFields({
                    name: String(preguntasExtras[extraIndex]),
                    value: String(respuestaExtra),
                    inline: false
                });
                newEmbed.setTitle('Formulario Completado (Pendiente de revisión)');

                try {
                    await mensaje.edit({ embeds: [newEmbed] });
                } catch (error) {
                    console.error(`Error al actualizar el mensaje original: ${error}`);
                }
            }

            // Comprobamos si ya están todas las respuestas
            const respuestasExtras = rolData.RespuestasExtras;
            const allAnswered = Object.keys(respuestasExtras).every(key => respuestasExtras[key]);

            if (allAnswered) {
                await interaction.editReply({ content: 'Has completado todas las preguntas adicionales. ¡Formulario completado!', components: [] });
            } else {
                // Encuentra la siguiente pregunta no respondida
                const nextQuestionIndex = Object.keys(respuestasExtras).findIndex(key => !respuestasExtras[key]);

                if (nextQuestionIndex !== -1) {
                    const actionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`extra_${rol}_${nextQuestionIndex + 1}`)
                            .setLabel('Responder siguiente pregunta')
                            .setStyle(ButtonStyle.Primary)
                    );

                    await interaction.editReply({ content: 'Respuesta adicional guardada correctamente.', components: [actionRow] });
                }
            }
        }
    }
};
