const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

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
            where : {
                stock: {
                    [Op.gt]: 0 // affiche uniquement les produits en stock
            }},
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

router.get('/:id', async (req, res) => {
    try {
        // récupération du produit
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        res.json(product);
    }
    catch(err) {
        // si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
})

router.post('/', async (req, res) => {
    try {
        const { title, price, description, stock } = req.body;

        // Vérifiez si les champs obligatoires sont présents dans la requête
        if (!title || !price || !description || !stock) {
            return res.status(400).json({ error: 'Les champs obligatoires ne sont pas fournis.' });
        }

        // Création du produit
        const product = await Product.create({
            title,
            price,
            description,
            stock
        });
        res.json(product);
    }
    catch(err) {
        // si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
})

module.exports = router;