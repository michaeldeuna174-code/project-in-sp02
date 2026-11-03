const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { requireAdmin } = require('../middleware/authMiddleware');

// ==========================================
// Modules API
// ==========================================
// GET /api/modules - Retrieve all modules (public)
router.get('/modules', contentController.getModules);

// GET /api/modules/:id - Retrieve one module by ID or slug (public)
router.get('/modules/:id', contentController.getModule);

// POST /api/modules - Create a module (admin only)
router.post('/modules', requireAdmin, contentController.createModule);

// PUT /api/modules/:id - Update a module (admin only)
router.put('/modules/:id', requireAdmin, contentController.updateModule);

// DELETE /api/modules/:id - Delete a module (admin only)
router.delete('/modules/:id', requireAdmin, contentController.deleteModule);

// ==========================================
// Lessons API
// ==========================================
// GET /api/lessons - Retrieve all lessons (public)
router.get('/lessons', contentController.getLessons);

// GET /api/lessons/:id - Retrieve one lesson by ID or slug (public)
router.get('/lessons/:id', contentController.getLesson);

// GET /api/modules/:id/lessons - Retrieve lessons under a module (public)
router.get('/modules/:id/lessons', contentController.getModuleLessons);

// POST /api/lessons - Create a lesson (admin only)
router.post('/lessons', requireAdmin, contentController.createLesson);

// PUT /api/lessons/:id - Update a lesson (admin only)
router.put('/lessons/:id', requireAdmin, contentController.updateLesson);

// DELETE /api/lessons/:id - Delete a lesson (admin only)
router.delete('/lessons/:id', requireAdmin, contentController.deleteLesson);

// ==========================================
// Dashboard Stats API
// ==========================================
// GET /api/dashboard/stats - Retrieve module/lesson counts and recent updates (admin only)
router.get('/dashboard/stats', requireAdmin, contentController.getDashboardStats);

module.exports = router;
