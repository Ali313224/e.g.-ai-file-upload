const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// إعداد CORS لقبول الطلبات من أي مصدر
app.use(cors());
app.use(express.json());

// إعداد مفتاح OpenAI من المتغير البيئي
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// إعداد رفع الملفات باستخدام Multer
const upload = multer({ dest: "uploads/" });

// نقطة التواصل
app.post("/chat", upload.single("file"), async (req, res) => {
  const message = req.body.message || "";
  const file = req.file;

  let fileInfo = "";

  if (file) {
    const fileExt = path.extname(file.originalname).toLowerCase();
    fileInfo = `\n\n(ملاحظة: أرسل المستخدم ملفًا باسم "${file.originalname}" من نوع "${file.mimetype}")`;
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "أنت مساعد ذكي يدعم اللغة العربية ويستطيع تحليل الملفات بناءً على وصف المستخدم.",
        },
        {
          role: "user",
          content: message + fileInfo,
        },
      ],
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error.message);
    res.status(500).json({ error: "فشل الاتصال بالذكاء الاصطناعي" });
  }
});

// بدء التشغيل
app.listen(port, () => {
  console.log(`الخادم يعمل على http://localhost:${port}`);
});
