const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const authenticateUser = require('../middlewares/auth');

// Importation d'un modèle Sequelize dans une vue.
// Par défaut, require ira chercher le fichier index.js
const { Product } = require('../models');
const { Tag } = require('../models');

router.get('/', async (req, res) => {
    try {
        // paramètres de pagination
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const offset = (page - 1) * pageSize;

        // récupération des produits
        let products = "";
        if (req.query.tags) {
            // Si des tags sont spécifiés, filtrez les produits avec
            const tags = req.query.tags.split(',');

            products = await Product.findAndCountAll({
                where: {
                    stock: {
                        [Op.gt]: 0 // affiche uniquement les produits en stock
                    }
                },
                include: [
                    {
                        model: Tag,
                        where: {
                            name: {
                                [Op.in]: tags
                            }
                        }
                    }
                ],
                offset: offset,
                limit: pageSize,
            });
        } else {
            // Si aucun tag n'est spécifié, récupérez tous les produits
            products = await Product.findAndCountAll({
                where: {
                    stock: {
                        [Op.gt]: 0 // affiche uniquement les produits en stock
                    }
                },
                offset: offset,
                limit: pageSize,
            });
        }

        // calcul du nombre de pages total
        const totalPages = Math.ceil(products.count / pageSize);

        // envoi de la réponse
        res.json({
            products: products.rows,
            totalProducts: products.count,
            totalPages: totalPages,
            currentPage: page,
        });
    } catch (err) {
        // si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
});


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
        // Si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
})

router.post('/',authenticateUser, async (req, res) => {
    try {
        // Vérifiez si l'utilisateur est connecté et qu'il est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès interdit. Vous n\'avez pas les autorisations nécessaires.' });
        }
        // Récupérez les paramètres de la requête
        const { title, price, description, stock, tags } = req.body;

        // Vérifiez si les champs obligatoires sont présents dans la requête
        if (!title || !price || !description || !stock || !tags) {
            return res.status(400).json({ error: 'Les champs obligatoires ne sont pas fournis.' });
        }

        // Récupérez les tags existants dans la base de données
        const existingTags = await Tag.findAll({ where: { name: tags } });

        // Vérifiez si tous les tags de la requête existent
        const missingTags = tags.filter(tag => !existingTags.find(existingTag => existingTag.name === tag));
        if (missingTags.length > 0) {
            return res.status(400).json({ error: `Les tags suivants n'existent pas : ${missingTags.join(', ')}` });
        }

        // Créez le produit avec lesinformations fournies
        const product = await Product.create({
            title,
            price,
            description,
            stock,
        });

        // Associez les tags valides au produit
        await product.addTags(existingTags);

        // Renvoyer une réponse JSON avec les détails du produit créé, y compris les tags
        const productWithTags = await Product.findByPk(product.id, {
            include: [{ model: Tag, attributes: ['id', 'name'] }],
        });

        res.status(201).json({ success: true, product: productWithTags });
    } catch (err) {
        // Si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
});

router.patch('/:id',authenticateUser, async (req, res) => {
    try {
        // Vérifiez si l'utilisateur est connecté et qu'il est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès interdit. Vous n\'avez pas les autorisations nécessaires.' });
        }
        // récupération du produit
        const product = await Product.findByPk(req.params.id);
        // Vérifiez si le produit existe
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        // récupération des paramètres
        const { title, price, description, stock, tags } = req.body;
        // mise à jour du produit
        if (title) {
            product.title = title;
        }
        if (price) {
            product.price = price;
        }
        if (description) {
            product.description = description;
        }
        if (stock) {
            product.stock = stock;
        }
        if (tags) {
            // Récupération des tags existants dans la base de données
            const existingTags = await Tag.findAll({ where: { name: tags } });

            // Vérification des tags
            const missingTags = tags.filter(tag => !existingTags.find(existingTag => existingTag.name === tag));
            if (missingTags.length > 0) {
                return res.status(400).json({ error: `Les tags suivants n'existent pas : ${missingTags.join(', ')}` });
            }

            // Associer les tags au produit
            await product.setTags(existingTags);
        }

        await product.save();

        res.json(product);
    }
    catch(err) {
        // si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
})

router.delete('/:id',authenticateUser, async (req, res) => {
    try {
        // Vérifiez si l'utilisateur est connecté et qu'il est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès interdit. Vous n\'avez pas les autorisations nécessaires.' });
        }
        // récupération du produit
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        // suppression du produit
        await product.destroy();

        res.json({ success: true });
    }
    catch(err) {
        // si une erreur survient, on la log et on renvoie un code 500
        console.log(err);
        res.status(500).json(err);
    }
})

module.exports = router;