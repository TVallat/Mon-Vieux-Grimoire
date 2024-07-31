const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié !' }))
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
                        .catch(error => res.status(400).json({ error }));
                })
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        })
};

exports.rateBook = async (req, res, next) => {
    const { userId, rating } = req.body;
    const bookId = req.params.id;

    try {
        const book = await Book.findOne({ _id: bookId });

        if (!book) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }

        const existingRating = book.ratings.find(ratingObj => ratingObj.userId === userId);

        if (existingRating) { // Vérifier si l'utilisateur a déjà noté ce livre
            return res.status(400).json({ error: 'Vous avez déjà noté ce livre' });
        }

        book.ratings.push({ userId, grade: rating }); // Ajout de la note et de l'utilisateur correspondant

        const totalRatings = book.ratings.length;
        const totalGradeSum = book.ratings.reduce((sum, ratingObj) => sum + ratingObj.grade, 0);
        book.averageRating = (totalGradeSum / totalRatings).toFixed(2); // Recalculer la moyenne des notes

        const savedBook = await book.save();

        res.status(201).json({ message: 'Note ajoutée avec succès', book: savedBook });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la note :', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'ajout de la note' });
    }
};

exports.getBestRating = async (req, res, next) => {
    try {
        // Récupérer les 3 livres les mieux notés
        const books = await Book.find()
            .sort({ averageRating: -1 })  // Trier par ordre décroissant de averageRating
            .limit(3);                    // Limiter à 3 résultats

        res.status(200).json(books);
    } catch (error) {
        console.error('Erreur lors de la récupération des livres les mieux notés :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des livres les mieux notés' });
    }
};