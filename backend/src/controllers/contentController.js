const dbService = require('../services/dbService');

// --- MODULES CONTROLLERS ---

async function getModules(req, res, next) {
  try {
    const modules = await dbService.getAllModules();
    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules
    });
  } catch (err) {
    next(err);
  }
}

async function getModule(req, res, next) {
  try {
    const { id } = req.params;
    const moduleItem = await dbService.getModuleById(id);

    if (!moduleItem) {
      return res.status(404).json({
        success: false,
        error: `Module with ID or slug "${id}" not found.`
      });
    }

    // Attach lessons for this module
    const lessons = await dbService.getLessonsByModuleId(moduleItem.id);

    res.status(200).json({
      success: true,
      data: {
        ...moduleItem,
        lessons
      }
    });
  } catch (err) {
    next(err);
  }
}

async function createModule(req, res, next) {
  try {
    const { title, description, category, order_index, points, slug } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Module title is required.'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Module description is required.'
      });
    }

    // Parse points if string
    let parsedPoints = points;
    if (typeof points === 'string') {
      parsedPoints = points.split('\n').map(p => p.trim()).filter(Boolean);
    }

    const newModule = await dbService.createModule({
      title: title.trim(),
      description: description.trim(),
      category: category ? category.trim() : 'Foundations',
      order_index: Number(order_index) || 0,
      points: Array.isArray(parsedPoints) ? parsedPoints : [],
      slug: slug ? slug.trim() : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Module created successfully.',
      data: newModule
    });
  } catch (err) {
    next(err);
  }
}

async function updateModule(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, category, order_index, points } = req.body;

    const existing = await dbService.getModuleById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Module with ID or slug "${id}" not found.`
      });
    }

    let parsedPoints = points;
    if (typeof points === 'string') {
      parsedPoints = points.split('\n').map(p => p.trim()).filter(Boolean);
    }

    const updated = await dbService.updateModule(existing.id, {
      title: title !== undefined ? title.trim() : undefined,
      description: description !== undefined ? description.trim() : undefined,
      category: category !== undefined ? category.trim() : undefined,
      order_index: order_index !== undefined ? Number(order_index) : undefined,
      points: Array.isArray(parsedPoints) ? parsedPoints : undefined
    });

    res.status(200).json({
      success: true,
      message: 'Module updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

async function deleteModule(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await dbService.getModuleById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Module with ID or slug "${id}" not found.`
      });
    }

    await dbService.deleteModule(existing.id);

    res.status(200).json({
      success: true,
      message: `Module "${existing.title}" deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
}

// --- LESSONS CONTROLLERS ---

async function getLessons(req, res, next) {
  try {
    const lessons = await dbService.getAllLessons();
    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (err) {
    next(err);
  }
}

async function getLesson(req, res, next) {
  try {
    const { id } = req.params;
    const lesson = await dbService.getLessonById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: `Lesson with ID or slug "${id}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (err) {
    next(err);
  }
}

async function getModuleLessons(req, res, next) {
  try {
    const { id } = req.params;
    const lessons = await dbService.getLessonsByModuleId(id);

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (err) {
    next(err);
  }
}

async function createLesson(req, res, next) {
  try {
    const { title, description, content, module_id, category, order_index, points, slug } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Lesson title is required.'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Lesson description is required.'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Full lesson content is required.'
      });
    }

    let parsedPoints = points;
    if (typeof points === 'string') {
      parsedPoints = points.split('\n').map(p => p.trim()).filter(Boolean);
    }

    const newLesson = await dbService.createLesson({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      module_id: module_id || null,
      category: category ? category.trim() : 'Accounts',
      order_index: Number(order_index) || 0,
      points: Array.isArray(parsedPoints) ? parsedPoints : [],
      slug: slug ? slug.trim() : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully.',
      data: newLesson
    });
  } catch (err) {
    next(err);
  }
}

async function updateLesson(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, content, module_id, category, order_index, points } = req.body;

    const existing = await dbService.getLessonById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Lesson with ID or slug "${id}" not found.`
      });
    }

    let parsedPoints = points;
    if (typeof points === 'string') {
      parsedPoints = points.split('\n').map(p => p.trim()).filter(Boolean);
    }

    const updated = await dbService.updateLesson(existing.id, {
      title: title !== undefined ? title.trim() : undefined,
      description: description !== undefined ? description.trim() : undefined,
      content: content !== undefined ? content.trim() : undefined,
      module_id: module_id !== undefined ? module_id : undefined,
      category: category !== undefined ? category.trim() : undefined,
      order_index: order_index !== undefined ? Number(order_index) : undefined,
      points: Array.isArray(parsedPoints) ? parsedPoints : undefined
    });

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

async function deleteLesson(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await dbService.getLessonById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Lesson with ID or slug "${id}" not found.`
      });
    }

    await dbService.deleteLesson(existing.id);

    res.status(200).json({
      success: true,
      message: `Lesson "${existing.title}" deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
}

// --- DASHBOARD STATS CONTROLLER ---

async function getDashboardStats(req, res, next) {
  try {
    const stats = await dbService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  getLessons,
  getLesson,
  getModuleLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getDashboardStats
};
