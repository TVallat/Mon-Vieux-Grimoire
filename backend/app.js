const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());

mongoose.connect('mongodb+srv://Grimoire:GrimGrimoire@cluster0.sdrhx3i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
   {
      useNewUrlParser: true,
      useUnifiedTopology: true
   })
   .then(() => console.log('Connexion à MongoDB réussie !'))
   .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images'))); // Gere la ressources images de façon statique.
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;