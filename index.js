const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { Configuration, OpenAIApi } = require("openai");

require('dotenv').config();
const client = new Client();
const configuration = new Configuration({
  apiKey:process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);



client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('O bot subiu para o WhatsApp');
});

client.on('message', async msg => {
  const command = msg.body.split(' ')[0];
  // Coloque seu número sem o 9 onde tem o 9884233804
  const sender = msg.from.includes("9884233804") ? msg.to : msg.from;

  if (command.toLowerCase() === "/sticker") {
    await generateSticker(msg, sender);
  } else if (command.toLowerCase() === "/bot") {
    await gptchat(msg, sender);
  } else if (command.toLowerCase() === "/imagem") {
    await dalle(msg, sender);
  }
});

client.initialize();

async function generateSticker(msg, sender) {
  if (msg.hasMedia) {
    try {
      const media = await msg.downloadMedia();
      const image = new MessageMedia(media.mimetype, media.data, media.filename);
      await client.sendMessage(sender, image, { sendMediaAsSticker: true });
    } catch (e) {
      msg.reply("❌ Erro ao processar a imagem");
      msg.reply(e);
    }
  } else {
    try {
      const url = msg.body.substring(msg.body.indexOf(" ")).trim();
      const { data } = await axios.get(url, { responseType: 'arraybuffer' });
      const returnedB64 = Buffer.from(data).toString('base64');
      const image = new MessageMedia("image/jpeg", returnedB64, "image.jpg");
      await client.sendMessage(sender, image, { sendMediaAsSticker: true });
    } catch (e) {
      msg.reply("❌ Não foi possível gerar um sticker com esse link");
    }
  }
}

async function dalle(msg, sender) {
  try {
    const response = await openai.createImage({
      prompt: msg.body,
      n: 1,
      size: "1024x1024",
    })
    const image = new MessageMedia("image/jpeg", response.data.data[0].image, "image.jpg");
    await client.sendMessage(sender, image, { caption: 'image.jpg' });
  } catch (e) {
    msg.reply(`OpenAI retornou um erro: ${e}`);
  }
}

async function gptchat(msg, sender) {
  try{
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: msg.body,
    temperature: 0.9,
    max_tokens: 150
  });
  await client.sendMessage(sender, response.data.choices[0].text.trim())
}catch(e){
  await msg.reply(`Houve um erro no servidor:${e}`)
}
}
