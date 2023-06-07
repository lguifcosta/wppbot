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
  //const sender = msg.from.includes("9884233804") ? msg.to : msg.from;
  const sender = msg.from;

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
  const options = {
    prompt: msg.body,
    n: 1,
    size: "1024x1024",
  };

  try {
    const response = await openai.createImage(options);
    const image = new MessageMedia("image/jpeg", response.data.data[0].image, "image.jpg");
    await client.sendMessage(sender, image, { caption: 'image.jpg' });
  } catch (e) {
    msg.reply(`OpenAI retornou um erro: ${e}`);
  }
}

async function gptchat(msg, sender) {
 /* const options = {
    model: "text-davinci-003",
    prompt: msg.body,
    maxTokens: 100,
    temperature: 0.7,
   
  };
  console.log(msg.body)
  try {
    console.log(options)
    console.log(`request= ${configuration}`)
    console.log(`openai=${openai}`)
    const response = await openai.createCompletion(options);
    console.log(response)
    const botResponse = response.data.choices[0].text.trim();
    console.log(botResponse);
    await client.sendMessage(sender, botResponse);
  } catch (e) {
    await msg.reply(`OpenAI retornou um erro: ${e}`);
  }*/
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: msg.body,
    temperature: 0.9,
    max_tokens: 150
  });
  await client.sendMessage(sender, response.data.choices[0].text.trim())
}
