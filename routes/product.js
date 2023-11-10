const express = require('express');
const router = express.Router();

// Importation d'un modèle Sequelize dans une vue.
// Par défaut, require ira chercher le fichier index.js
const { Product } = require('../models');

router.get('/', async (req, res) => {
    try {
        // paramètres de pagination
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const offset = (page - 1) * pageSize;

        // récupération des produits
        const { count, rows } = await Product.findAndCountAll({
            offset: offset,
            limit: pageSize,
        });

        // calcul du nombre de pages total
        const totalPages = Math.ceil(count / pageSize);

        // envoi de la réponse
        res.json({
            products: rows,
            totalProducts: count,
            totalPages: totalPages,
            currentPage: page,
        });
    }
    catch(err) {
        // si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
})

router.post('/', async (req, res) => {
    try {
        // on crée un nouveau produit
        const product = await Product.create(req.body);
        res.json(product);
    }
    catch(err) {
        // si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
})

module.exports = router;