const { ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageEmbed, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

exports.run = async (client, message, args) => {
    // Kayıt butonu oluşturma
    const registerButton = new ButtonBuilder()
        .setCustomId('register')
        .setLabel('Kayıt Ol')
        .setEmoji('<:1177358700013441034:1180533501813080094>')
        .setStyle(ButtonStyle.Danger);

    // Kayıt bilgi mesajı oluşturma
    const registerEmbed = new EmbedBuilder()
    .setTitle('Kayıt Sistemi 👤')
    .setDescription(`Kayıt isteği göndermek için aşağıdaki **Kayıt Ol** butonuna tıklayarak göndere bilirsiniz.`)

    // Mesajı gönderme
    const registerMessage = await message.channel.send({ embeds: [registerEmbed], components: [new ActionRowBuilder().addComponents(registerButton)] });

    // Buton tıklama olaylarını dinleme
    const filter = interaction => interaction.user.id === message.author.id;
    const collector = registerMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async interaction => {
        // Kayıt butonuna tıklanırsa
        if (interaction.customId === 'register') {
            // Kayıt log kanalına mesaj gönderme
            const registerLogChannel = message.guild.channels.cache.get(config.kayıtLogKanalıID);
            if (!registerLogChannel) {
                console.error('Kayıt log kanalı bulunamadı.');
                return;
            }

            const registerLogEmbed = new EmbedBuilder()
                .setTitle('Kayıt İsteği')
                .setDescription(`${message.author} kullanıcısı kayıt olmak istiyor. Onaylıyor musunuz?`)
                .setTimestamp();

            const registerLogMessage = await registerLogChannel.send({ embeds: [registerLogEmbed], components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('approve').setLabel('Onayla').setEmoji('<:emote_true:1187707955072733184>').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('reject').setLabel('Reddet').setEmoji('<:emote_false:1187707956930809917>').setStyle(ButtonStyle.Danger)
                )
            ] });

            // Buton tıklama olaylarını dinleme
            const registerFilter = i => i.user.id === message.author.id && (i.customId === 'approve' || i.customId === 'reject');
            const registerCollector = registerLogMessage.createMessageComponentCollector({ filter: registerFilter, time: 60000 });

            registerCollector.on('collect', async i => {
                if (i.customId === 'approve') {
                    // Kullanıcıya kayıt rolü verme
                    const guild = interaction.guild;
                    const roleID = config.kayıtRolüID;
                    const member = guild.members.cache.get(message.author.id);
                    const role = guild.roles.cache.get(roleID);

                    if (!role) {
                        console.error('Kayıt rolü bulunamadı.');
                        return;
                    }

                    try {
                        await member.roles.add(role);
                        i.reply({ content: 'Kaydınız başarıyla tamamlandı!', ephemeral: true });
                        registerMessage.delete();
                    } catch (error) {
                        console.error('Rol verme işlemi başarısız oldu:', error);
                        i.reply({ content: 'Kayıt işlemi sırasında bir hata oluştu.', ephemeral: true });
                    }
                } else if (i.customId === 'reject') {
                    i.reply({ content: 'Kayıt talebi reddedildi.', ephemeral: true });
                    registerMessage.delete();
                }
            });

            // Kayıt olma isteği gönderildi bildirimi
            interaction.reply({ content: 'Kayıt olma isteğiniz başarılı bir şekilde log kanalına gönderildi.', ephemeral: true });
        }
    });
};

exports.conf = {
    aliases: [],
    guildOnly: true,
};

exports.help = {
    name: 'kayıt',
    description: 'Kayıt olmak için kullanılır.',
    usage: 'kayıt',
};
