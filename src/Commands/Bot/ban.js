const { MessageActionRow, MessageButton, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageEmbed, Embed, EmbedBuilder } = require('discord.js');

exports.run = async (client, message, args) => {
    // İlk önce banlanacak kullanıcıyı belirleyin
    const user = message.mentions.users.first();
    
    if (!user) {
        return message.reply('Lütfen banlamak istediğiniz bir kullanıcıyı etiketleyin!');
    }

    if (user.id === message.author.id) {
        return message.reply('Kendinizi banlayamazsınız!');
    }

    // Embed oluştur
    const banEmbed = new EmbedBuilder()
        .setDescription(`${user}, bu kullanıcıyı banlamak istiyor musunuz?`)
        .addFields(
            { name: 'Kullanıcı', value: user.toString() },
            { name: 'Banlayan', value: message.author.toString() }
        )
        .setTimestamp();
        

    // Butonu oluştur
    const banButton = new ButtonBuilder()
        .setCustomId('ban_user')
        .setLabel('Ban')
        .setStyle(ButtonStyle.Danger);

    // Butonu içeren bir action row oluştur
    const row = new ActionRowBuilder().addComponents(banButton);

    // Mesajı gönder
    const banMessage = await message.channel.send({ embeds: [banEmbed], components: [row] });

    // Buton fonksiyonu
    const filter = i => i.customId === 'ban_user' && i.user.id === message.author.id;
    const collector = banMessage.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
        // Butona basıldığında yapılacak işlem
        try {
            // Üye banlanmadan önce sebep kontrolü yapılacak
            const banReasonEmbed = new EmbedBuilder()
                .setDescription(`Ban sebebi belirtiniz.`)
                .setTimestamp();

            const banReasonMessage = await message.channel.send({ embeds: [banReasonEmbed] });
            const reasonCollectorFilter = m => m.author.id === message.author.id;
            const reasonCollector = message.channel.createMessageCollector({ filter: reasonCollectorFilter, time: 15000, max: 1 });

            reasonCollector.on('collect', async collected => {
                const banReason = collected.content.trim();
                await collected.delete();
                await banReasonMessage.delete();

                if (!banReason) {
                    return await i.update({ content: 'Ban sebebini belirtmediğiniz için işlem iptal edildi.', components: [] });
                }

                await message.guild.members.ban(user, { reason: banReason });
                await i.update({ content: 'Kullanıcı banlandı!', components: [] });
            });

            reasonCollector.on('end', collected => {
                if (collected.size === 0) {
                    return i.update({ content: 'Belirtilen sürede ban sebebi belirtilmediği için işlem iptal edildi.', components: [] });
                }
            });
        } catch (error) {
            if (error.code === 10013) { // Hata kodu: "Sunucuda böyle bir üye bulunmamaktadır"
                return await i.update({ content: 'Bu sunucuda böyle bir üye bulunmamaktadır.', components: [] });
            } else {
                console.error('Ban işlemi sırasında bir hata oluştu:', error);
                return await i.update({ content: 'Ban işlemi sırasında bir hata oluştu.', components: [] });
            }
        }
    });

    collector.on('end', collected => {
        // Butona belirli bir süre sonra hiç basılmadığında yapılacak işlem
        if (collected.size === 0) {
            banMessage.edit({ content: 'Banlama işlemi iptal edildi.', components: [] });
        }
    });
};

exports.conf = {
    aliases: [],
    guildOnly: true,
};

exports.help = {
    name: 'ban',
    description: 'Belirtilen kullanıcıyı banlar.',
    usage: 'ban <@kullanıcı>',
};
