const dbService = require('../services/dbService');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function cleanOptions(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((option) => (typeof option === 'string' ? option.trim() : ''))
    .filter(Boolean);
}

function validateQuestion(body) {
  if (!isNonEmptyString(body.question_text)) {
    return 'Question text is required.';
  }

  const options = cleanOptions(body.options);
  if (options.length < 2) {
    return 'At least two answer choices are required.';
  }
  if (options.length > 6) {
    return 'A question can have at most six answer choices.';
  }

  const correct = Number(body.correct_index);
  if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) {
    return 'Select a valid correct answer.';
  }

  return null;
}

function handleWriteError(err, res, next) {
  if (err.code === '23505' || /duplicate key|already exists/i.test(err.message || '')) {
    return res.status(409).json({
      success: false,
      error: 'A quiz with that title or slug already exists. Please use a different title.'
    });
  }
  return next(err);
}

// --- QUIZZES ---

async function getQuizzes(req, res, next) {
  try {
    const quizzes = await dbService.getAllQuizzes();
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (err) {
    next(err);
  }
}

async function getQuiz(req, res, next) {
  try {
    const quiz = await dbService.getQuizById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: `Quiz with ID or slug "${req.params.id}" not found.`
      });
    }

    res.status(200).json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
}

async function createQuiz(req, res, next) {
  try {
    const { title, description, category, module_id, order_index, is_published, slug } = req.body;

    if (!isNonEmptyString(title)) {
      return res.status(400).json({ success: false, error: 'Quiz title is required.' });
    }

    if (!isNonEmptyString(description)) {
      return res.status(400).json({ success: false, error: 'Quiz description is required.' });
    }

    let nextOrder = Number(order_index);
    if (!Number.isFinite(nextOrder)) {
      const existing = await dbService.getAllQuizzes();
      nextOrder = existing.reduce(
        (max, quiz) => Math.max(max, Number(quiz.order_index) || 0),
        0
      ) + 1;
    }

    const quiz = await dbService.createQuiz({
      title: title.trim(),
      description: description.trim(),
      category: isNonEmptyString(category) ? category.trim() : 'General',
      module_id: module_id || null,
      order_index: nextOrder,
      is_published: is_published !== false,
      slug: isNonEmptyString(slug) ? slug.trim() : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully.',
      data: quiz
    });
  } catch (err) {
    handleWriteError(err, res, next);
  }
}

async function updateQuiz(req, res, next) {
  try {
    const existing = await dbService.getQuizById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Quiz with ID or slug "${req.params.id}" not found.`
      });
    }

    const { title, description, category, module_id, order_index, is_published } = req.body;

    if (title !== undefined && !isNonEmptyString(title)) {
      return res.status(400).json({ success: false, error: 'Quiz title cannot be empty.' });
    }

    if (description !== undefined && !isNonEmptyString(description)) {
      return res.status(400).json({ success: false, error: 'Quiz description cannot be empty.' });
    }

    const updated = await dbService.updateQuiz(existing.id, {
      title: title !== undefined ? title.trim() : undefined,
      description: description !== undefined ? description.trim() : undefined,
      category: category !== undefined ? category.trim() : undefined,
      module_id,
      order_index: order_index !== undefined ? Number(order_index) : undefined,
      is_published
    });

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully.',
      data: updated
    });
  } catch (err) {
    handleWriteError(err, res, next);
  }
}

async function deleteQuiz(req, res, next) {
  try {
    const existing = await dbService.getQuizById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Quiz with ID or slug "${req.params.id}" not found.`
      });
    }

    await dbService.deleteQuiz(existing.id);

    res.status(200).json({
      success: true,
      message: `Quiz "${existing.title}" deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
}

// --- QUIZ QUESTIONS ---

async function getQuizQuestions(req, res, next) {
  try {
    const quiz = await dbService.getQuizById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: `Quiz with ID or slug "${req.params.id}" not found.`
      });
    }

    const questions = await dbService.getQuestionsByQuizId(quiz.id);

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    next(err);
  }
}

async function createQuestion(req, res, next) {
  try {
    const quiz = await dbService.getQuizById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: `Quiz with ID or slug "${req.params.id}" not found.`
      });
    }

    const error = validateQuestion(req.body);
    if (error) {
      return res.status(400).json({ success: false, error });
    }

    const question = await dbService.createQuestion(quiz.id, {
      question_text: req.body.question_text.trim(),
      options: cleanOptions(req.body.options),
      correct_index: Number(req.body.correct_index),
      explanation: isNonEmptyString(req.body.explanation) ? req.body.explanation.trim() : '',
      order_index: req.body.order_index !== undefined ? Number(req.body.order_index) : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Quiz question created successfully.',
      data: question
    });
  } catch (err) {
    next(err);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const existing = await dbService.getQuestionById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Quiz question with ID "${req.params.id}" not found.`
      });
    }

    const options = req.body.options !== undefined
      ? cleanOptions(req.body.options)
      : (Array.isArray(existing.options) ? existing.options : []);

    if (req.body.options !== undefined && options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least two answer choices are required.'
      });
    }

    if (req.body.options !== undefined && options.length > 6) {
      return res.status(400).json({
        success: false,
        error: 'A question can have at most six answer choices.'
      });
    }

    if (req.body.question_text !== undefined && !isNonEmptyString(req.body.question_text)) {
      return res.status(400).json({
        success: false,
        error: 'Question text cannot be empty.'
      });
    }

    const correct = req.body.correct_index !== undefined
      ? Number(req.body.correct_index)
      : Number(existing.correct_index);

    if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) {
      return res.status(400).json({
        success: false,
        error: 'Select a valid correct answer.'
      });
    }

    const updated = await dbService.updateQuestion(existing.id, {
      question_text: req.body.question_text !== undefined ? req.body.question_text.trim() : undefined,
      options: req.body.options !== undefined ? options : undefined,
      correct_index: req.body.correct_index !== undefined ? correct : undefined,
      explanation: req.body.explanation !== undefined
        ? String(req.body.explanation || '').trim()
        : undefined,
      order_index: req.body.order_index !== undefined ? Number(req.body.order_index) : undefined
    });

    res.status(200).json({
      success: true,
      message: 'Quiz question updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const existing = await dbService.getQuestionById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Quiz question with ID "${req.params.id}" not found.`
      });
    }

    await dbService.deleteQuestion(existing.id);

    res.status(200).json({
      success: true,
      message: 'Quiz question deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
