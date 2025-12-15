// ============================================
// 📄 FILENAME: message.routes.ts
// 📍 PATH: backend/src/routes/message.routes.ts
// ============================================

import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const messageController = new MessageController();

router.use(authenticate);

router.get('/conversations', messageController.getConversations);
router.get('/conversation/:userId', messageController.getConversationWith);
router.post('/send', messageController.sendMessage);
router.put('/:id/read', messageController.markAsRead);

export default router;
