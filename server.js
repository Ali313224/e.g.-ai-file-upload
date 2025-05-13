const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  try {
    const chat = await openai.chat.completions.create({
      messages: [{ role: 'user', content: userMessage }],
      model: 'gpt-4',
    });
    res.json({ reply: chat.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(3000, () => console.log('Server is running on port 3000'));
