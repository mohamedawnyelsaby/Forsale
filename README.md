# Forsale
منصة عقارات عالمية بعملة Pi: بحث وفلاتر، شراء وإدراج بالدفع عبر Pi، ومساعد ذكاء اصطناعي.

## تشغيل
```
cp .env.example .env   # ضع PI_API_KEY و ANTHROPIC_API_KEY
npm install && npm start
```
## ربط Pi
1. في Pi Developer Portal أنشئ تطبيق وضع رابط الاستضافة.
2. ضع Validation Key في `public/validation-key.txt`.
3. جرّب في Sandbox ثم غيّر `sandbox:false` في `public/index.html`.
