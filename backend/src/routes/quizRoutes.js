const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { requireAdmin } = require('../middleware/authMiddleware');

// ==========================================
// Quizzes API
// ==========================================
// GET /api/quizzes - Retrieve all quizzes with their questions (public)
router.get('/quizzes', quizController.getQuizzes);

// GET /api/quizzes/:id - Retrieve one quiz by ID or slug (public)
router.get('/quizzes/:id', quizController.getQuiz);

// GET /api/quizzes/:id/questions - Retrieve questions for one quiz (public)
router.get('/quizzes/:id/questions', quizController.getQuizQuestions);

// POST /api/quizzes - Create a quiz (admin only)
router.post('/quizzes', requireAdmin, quizController.createQuiz);

// PUT /api/quizzes/:id - Update a quiz (admin only)
router.put('/quizzes/:id', requireAdmin, quizController.updateQuiz);

// DELETE /api/quizzes/:id - Delete a quiz and its questions (admin only)
router.delete('/quizzes/:id', requireAdmin, quizController.deleteQuiz);

// ==========================================
// Quiz Questions API
// ==========================================
// POST /api/quizzes/:id/questions - Add a question to a quiz (admin only)
router.post('/quizzes/:id/questions', requireAdmin, quizController.createQuestion);

// PUT /api/questions/:id - Update a question (admin only)
router.put('/questions/:id', requireAdmin, quizController.updateQuestion);

// DELETE /api/questions/:id - Delete a question (admin only)
router.delete('/questions/:id', requireAdmin, quizController.deleteQuestion);

module.exports = router;
