const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const tesseract = require('tesseract.js');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// إعداد السماح للطلبات من أي جهة (CORS)
app.use(cors());

// إعداد OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// إعداد multer لتخزين الملفات
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// نقطة رفع الملفات
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  try {
    if (!file) {
      return res.status(400).send("لا يوجد ملف.");
    }

    if (file.mimetype.startsWith("image")) {
      const result = await tesseract.recognize(file.path, 'eng+ara');
      return res.json({ type: "image", text: result.data.text });
    }

    if (file.mimetype.startsWith("video")) {
      const audioOutput = `uploads/${Date.now()}.mp3`;
      ffmpeg(file.path)
        .output(audioOutput)
        .noVideo()
        .on('end', async () => {
          return res.json({ type: "video", message: "تم استخراج الصوت. يمكنك استخدام Whisper API هنا." });
        })
        .on('error', err => res.status(500).json({ error: "خطأ في ffmpeg", details: err }))
        .run();
    }

    if (file.mimetype === "application/pdf") {
      return res.json({ type: "pdf", message: "تم استقبال ملف PDF بنجاح." });
    }

    return res.json({ type: "unknown", message: "نوع الملف غير مدعوم حالياً." });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const express = require("express");
const path = require("path");
const multer = require("multer");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const upload = multer({ dest: "uploads/" });

app.use(express.static(__dirname));
app.use(express.json());

app.post("/chat", upload.single("file"), async (req, res) => {
  const userMessage = req.body.message || "";

  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: userMessage }],
    });

    res.json({ reply: chatResponse.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "حدث خطأ أثناء معالجة الرسالة." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
