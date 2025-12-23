"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const messageController = new message_controller_1.MessageController();
router.use(auth_1.authenticate);
router.get('/conversations', messageController.getConversations);
router.get('/conversation/:userId', messageController.getConversationWith);
router.post('/send', messageController.sendMessage);
router.put('/:id/read', messageController.markAsRead);
exports.default = router;
//# sourceMappingURL=message.routes.js.map