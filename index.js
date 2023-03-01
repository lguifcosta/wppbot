const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
//import * as dotenv from 'dotenv'
const { Configuration, OpenAIApi } = require("openai")
const client = new Client({})


const configuration = new Configuration({
    apiKey: "none",
});
const openai = new OpenAIApi(configuration);
/* Chama as variaveis de ambiente 
    * process.env.OPENAI_KEY
    * process.env.ORGANIZATION_ID
    * process.env.MEU_NUMERO
    */

client.on('qr', qr => {
    qrcode.generate(qr, {small: true})
});

client.on('ready', () => {
    console.log('O bot subiu para o whatsapp')
});

/**
 * Aqui vem como default 'message', bora trocar para 'message_create', 
 * dessa forma nós também poderemos dar comandos e não apenas seus 
 * contatos.
 */
client.on('message_create', msg => {
    const command = msg.body.split(' ')[0];
    // Cola seu número onde tem o 84848484, sem o 9
    const sender = msg.from.includes("84233804") ? msg.to : msg.from
    if ( command.toLowerCase() == "/sticker")  generateSticker(msg, sender)
    if (command.toLowerCase() == "/bot") gptchat(msg,sender)
    if (command.toLowerCase()== "/imagem") dalle(msg,sender)
});

client.initialize();

const generateSticker = async (msg, sender) => {
    if(msg.type === "image") {
        try {
            const { data } = await msg.downloadMedia()
            const image = await new MessageMedia("image/jpeg", data, "image.jpg")
            await client.sendMessage(sender, image, { sendMediaAsSticker: true })
        } catch(e) {
            msg.reply("❌ Erro ao processar imagem")
            msg.reply(e)
        }
    } else {
        try {

            const url = msg.body.substring(msg.body.indexOf(" ")).trim()
            const { data } = await axios.get(url, {responseType: 'arraybuffer'})
            const returnedB64 = Buffer.from(data).toString('base64');
            const image = await new MessageMedia("image/jpeg", returnedB64, "image.jpg")
            await client.sendMessage(sender, image, { sendMediaAsSticker: true })
        } catch(e) {
            msg.reply("❌ Não foi possível gerar um sticker com esse link")
        }
    }
}
const dalle = async (msg, sender)=>{
    const options = {
        prompt:msg,
        n:1,
        size:"1024x1024",
    }
    try{
        const response = await openai.createImage(options)
        const image = await new MessageMedia("image/jpeg", response.data.data[0].url, "image.jpg")
        await client.sendMessage(sender, image, 'image.jpg')
    }catch(e){
        msg.reply(`OpenAi retornou um erro ${e}`)
    }
}

const gptchat = async (msg, sender) =>{
    const options ={
        model: "text-danvinci-003",
        prompt: msg,
        temperature: 1,
        max_tokens: 4000
    }
    try {
        const response = await openai.createCompletion(options)
        let botResponse = ""
        response.data.choices.forEach(({text}) =>{
            botResponse = text
        })
        msg.reply(`chat GPT \n\n ${botResponse.trim()}`)
    }catch(e){
        await msg.reply(`OpenAi retornou um erro ${e}`)
    }
}
