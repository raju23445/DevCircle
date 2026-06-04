const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
const getClient = () => {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};

const getModel = () => {
  return getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });
};


exports.improveText = async (req, res, next) => {
  try {
    const { text, type } = req.body;

    if (!text || text.trim().length < 10)
      return res.status(400).json({ success: false, message: 'Text too short to improve' });

    const prompt = type === 'question'
      ? `You are a technical writing assistant. Improve this developer question to be clearer, more specific and well structured. Return ONLY the improved text, nothing else:\n\n${text}`
      : `You are a developer community assistant. Improve this post to be more engaging and clear for developers. Return ONLY the improved text, nothing else:\n\n${text}`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const improved = result.response.text().trim();

    res.json({ success: true, improved });
  } catch (err) {
    console.error('Gemini improveText error:', err.message);
    res.status(500).json({ success: false, message: 'AI service unavailable. Try again later.' });
  }
};


exports.suggestTags = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 10)
      return res.status(400).json({ success: false, message: 'Text too short' });

    const prompt = `Given this developer post or question, suggest 3 to 5 relevant technical tags like react, mongodb, docker, python etc. Return ONLY a JSON array of lowercase strings with no explanation, no markdown, no backticks. Example: ["react","nodejs","mongodb"]\n\nContent:\n${text}`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    let tags = [];
    try {
      
      const clean = raw.replace(/```json|```/g, '').trim();
      tags = JSON.parse(clean);
    } catch (_) {
      
      tags = raw
        .replace(/[\[\]"]/g, '')
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
    }

    res.json({ success: true, tags: tags.slice(0, 5) });
  } catch (err) {
    console.error('Gemini suggestTags error:', err.message);
    res.status(500).json({ success: false, message: 'AI service unavailable. Try again later.' });
  }
};


exports.validateQuestion = async (req, res, next) => {
  try {
    const { title, body } = req.body;

    if (!title || !body)
      return res.status(400).json({ success: false, message: 'Title and body required' });

    const prompt = `You are a Stack Overflow moderator. Analyze this developer question and return ONLY a JSON object with no markdown, no backticks, no explanation.

Format: {"isGood": boolean, "warning": string or null, "suggestions": [array of strings]}

Question Title: ${title}
Question Body: ${body}`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    let parsed = { isGood: true, warning: null, suggestions: [] };
    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    } catch (_) {}

    res.json({ success: true, ...parsed });
  } catch (err) {
    console.error('Gemini validateQuestion error:', err.message);
    res.status(500).json({ success: false, message: 'AI service unavailable. Try again later.' });
  }
};