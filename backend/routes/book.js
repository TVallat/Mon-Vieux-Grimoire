const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const processImage = require('../middleware/image-processing');

const bookController = require('../controllers/book');

router.get('/', bookController.getAllBooks);
router.post('/', auth, multer, processImage, bookController.createBook);
router.get('/bestrating', bookController.getBestRating); // A placer avant les /:id sinon est converti en objectID et bloque la route.
router.get('/:id', bookController.getOneBook);
router.put('/:id', auth, multer, processImage, bookController.modifyBook);
router.delete('/:id', auth, bookController.deleteBook);
router.post('/:id/rating', auth, bookController.rateBook);


module.exports = router;