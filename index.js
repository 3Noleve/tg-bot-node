const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const express = require('express');

// replace the value below with the Telegram token you receive from @BotFather
const token = '5750266826:AAFDXKYVEkBhi7xnCpjytZJpLkmNa3jMFAk';
const webAppUrl = 'https://iridescent-sunburst-b7d8a9.netlify.app';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Сейчас появится кнопка', {
      reply_markup: {
        keyboard: [[{ text: 'Заполните форму', web_app: { url: webAppUrl + '/form' } }]],
      },
    });

    await bot.sendMessage(chatId, 'Received your message', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Заполните форму', web_app: { url: webAppUrl } }]],
      },
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);

      await bot.sendMessage(chatId, 'Спасибо за обратную связь');
      await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
      await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

      setTimeout(async () => {
        await bot.sendMessage(chatId, 'Вся Информация в этом чате, является профессиональной');
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  }
});

app.post('/web_data', async (req, res) => {
  const { queryId, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка!',
      input_message_content: { message_text: 'Вы приобрели товар на сумму ' + totalPrice },
    });
    return res.status(200).json({});
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Не удалось приобрести товар :(',
      input_message_content: { message_text: 'Не удалось приобрести товар :(' + totalPrice },
    });
    return res.status(500).json({});
  }
});

const PORT = 8000;

app.listen(PORT, () => console.log('Server started on port ' + PORT));
