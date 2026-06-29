import express from 'express';
import {
  getRoadmaps,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  getRoadmapById
} from '../controllers/roadmapController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { sanitizeInput } from '../../middleware/securityMiddleware.js';
import { validate, createRoadmapSchema, updateRoadmapSchema } from '../validations/validators.js';

const router = express.Router();

// All roadmap routes require authentication
router.use(protect);

// GET    /api/roadmap         — list all roadmaps (filterable)
router.get('/', getRoadmaps);

// POST   /api/roadmap         — create a new roadmap
router.post('/', sanitizeInput, validate(createRoadmapSchema), createRoadmap);

// GET    /api/roadmap/:id     — get single roadmap
router.get('/:id', getRoadmapById);

// PUT    /api/roadmap/:id     — update roadmap / toggle milestone
router.put('/:id', sanitizeInput, validate(updateRoadmapSchema), updateRoadmap);

// DELETE /api/roadmap/:id     — delete roadmap
router.delete('/:id', deleteRoadmap);

export default router;
