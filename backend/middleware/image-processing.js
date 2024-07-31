const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const processImage = async (req, res, next) => {
    if (!req.file) return next();

    const filePath = req.file.path;
    const newFilename = `${req.file.filename.split('.')[0]}.webp`;
    const outputFilePath = path.join(path.dirname(filePath), newFilename);

    try {
        const buffer = await fs.readFile(filePath); // Stocke l'image dans un buffer afin de la convertir et ne pas interragir avec l'image dans le disque.

        await sharp(buffer)
            .webp({ quality: 20 })
            .toFile(outputFilePath);

        // Supprimer le fichier original dans le disque.
        await fs.unlink(filePath);

        // Mettre à jour req.file pour pointer vers le nouveau fichier
        req.file.filename = newFilename;
        req.file.path = outputFilePath;

        next();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = processImage;