import { Router } from 'express';
import { getBooks } from '../controllers/books.controller.js';

const router = Router();

router.get('/', getBooks);

export default router;