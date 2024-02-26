const { ActionRowBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');

let reklamFiltreAktif = false;
const reklamFiltreKelimeleri = ["reklam1", "reklam2", "reklam3"]; // Reklam filtrenizdeki yasaklı kelimelerin listesi

let kufurFiltreAktif = false;
const kufurFiltreKelimeleri = ["küfür1", "küfür2", "küfür3"]; // Küfür filtrenizdeki yasaklı kelimelerin listesi

exports.run = async (client, message, args) => {
    // StringSelectMenu oluşturma
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('panel_select')
        .setPlaceholder('Menüden bir seçenek seçin');

    // Menü seçeneklerini ayarlama
    selectMenu.addOptions([
        {
            label: 'Reklam Engeli',
            description: 'Reklam engelleme özelliğini etkinleştirir veya devre dışı bırakır.',
            value: 'ad_block'
        },
        {
            label: 'Küfür Engeli',
            description: 'Küfür engelleme özelliğini etkinleştirir veya devre dışı bırakır.',
            value: 'swear_filter'
        }
    ]);

    // ActionRow oluşturma ve select menu ekleyerek
    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Mesajı gönderme
    const sentMessage = await message.channel.send({ content: 'Aşağıdaki menüden bir seçenek seçin:', components: [row] });

    // Collector oluşturma
    const filter = interaction => interaction.user.id === message.author.id && interaction.isSelectMenu();
    const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async interaction => {
        const user = interaction.user;
        const selectedValue = interaction.values[0];

        switch (selectedValue) {
            case 'ad_block':
                // Reklam engeli aktifleştirme işlemi buraya gelecek
                reklamFiltreAktif = true;
                await interaction.reply('Reklam engeli başarıyla etkinleştirildi.');
                // Reklam filtresini aktif hale getirme
                activateReklamFiltre();
                break;
            case 'swear_filter':
                // Küfür engeli aktifleştirme işlemi buraya gelecek
                kufurFiltreAktif = true;
                await interaction.reply('Küfür engeli başarıyla etkinleştirildi.');
                // Küfür filtresini aktif hale getirme
                activateKufurFiltre();
                break;
            // Diğer durumlar için gerekli işlemler buraya eklenebilir
        }
    });

    collector.on('end', () => {
        // Collector zaman aşımına uğradığında yapılacak işlemler buraya gelecek
    });

    async function activateReklamFiltre() {
        // Reklam filtresi aktifse ve mesajları kontrol eder
        client.on('messageCreate', async (msg) => {
            if (reklamFiltreAktif && reklamFiltreKelimeleri.some(kelime => msg.content.toLowerCase().includes(kelime.toLowerCase()))) {
                // Yasaklı kelimeyi içeren mesajı silme
                await msg.delete();
                // Kullanıcıyı uyarı mesajı ile bilgilendirme
                await message.channel.send('Reklam yapmak yasaktır! Lütfen kurallara uyun.');
            }
        });
    }

    async function activateKufurFiltre() {
        // Küfür filtresi aktifse ve mesajları kontrol eder
        client.on('messageCreate', async (msg) => {
            if (kufurFiltreAktif && kufurFiltreKelimeleri.some(kelime => msg.content.toLowerCase().includes(kelime.toLowerCase()))) {
                // Yasaklı kelimeyi içeren mesajı silme
                await msg.delete();
                // Kullanıcıyı uyarı mesajı ile bilgilendirme
                await message.channel.send('Küfür etmek yasaktır! Lütfen kurallara uyun.');
            }
        });
    }
};

exports.conf = {
    aliases: [],
    guildOnly: true,
};

exports.help = {
    name: 'panel',
    description: 'Paneli görüntüler.',
    usage: 'panel',
};
