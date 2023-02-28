const axios = require('axios');

async function sendMessage(message) {
  try {
    // Defina sua mensagem como o corpo da solicitação POST
    const requestBody = {
      prompt: message,
      max_tokens: 100,
      n: 1,
      stop: "",
      temperature: 0.5,
    };

    // Envie uma solicitação POST para a API do OpenAI com a mensagem
    const response = await axios.post('https://api.openai.com/v1/engines/text-davinci/jobs', requestBody, {
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
      },
    });

    // Recupere a resposta da API e a retorne
    return response.data.choices[0].text;
  } catch (error) {
    console.error(error);
    return 'Desculpe, houve um erro ao processar sua mensagem.';
  }
}

// Envie uma mensagem de exemplo
const exampleMessage = 'Oi, como você está?';
sendMessage(exampleMessage).then(response => {
  console.log(`Resposta da API: ${response}`);
});
