const express = require('express');
const { CartItem, Product, User } = require('../database/models');
const { verifyToken } = require('../utils/token.js');

const router = express.Router();

/**
 * GET /api/cart/:userId
 * Returnează toate produsele din coșul unui user
 */
router.get('/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        if (isNaN(userId)) {
            return res.status(400).json({ success: false, message: 'User id is not valid', data: {} });
        }

        // doar dacă userul logat este cel cerut
        if (parseInt(userId) !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized', data: {} });
        }

        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [
                { model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }
            ]
        });

        res.status(200).json({ success: true, message: 'Cart retrieved successfully', data: cartItems });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving cart', data: error.message });
    }
});

/**
 * POST /api/cart/:userId
 * Adaugă un produs în coșul userului
 */
router.post('/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const { productId, quantity = 1 } = req.body;

        if (isNaN(userId) || isNaN(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid userId or productId', data: {} });
        }

        if (parseInt(userId) !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized', data: {} });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found', data: {} });
        }

        // Verific dacă produsul e deja în coș
        let item = await CartItem.findOne({ where: { userId, productId } });

        if (item) {
            item.quantity += Number(quantity);
            await item.save();
        } else {
            item = await CartItem.create({
                userId,
                productId,
                quantity,
                priceAtPurchase: product.price
            });
        }

        const newItem = await CartItem.findByPk(item.id, {
            include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }]
        });

        res.status(201).json({ success: true, message: 'Item added to cart', data: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding to cart', data: error.message });
    }
});

/**
 * PUT /api/cart/:userId/:cartItemId
 * Actualizează cantitatea unui produs din coș
 */
router.put('/:userId/:cartItemId', verifyToken, async (req, res) => {
    try {
        const { userId, cartItemId } = req.params;
        const { quantity } = req.body;

        if (parseInt(userId) !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized', data: {} });
        }

        const item = await CartItem.findOne({ where: { id: cartItemId, userId } });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found', data: {} });
        }

        if (quantity <= 0) {
            await item.destroy();
            return res.status(200).json({ success: true, message: 'Item removed', data: {} });
        }

        item.quantity = quantity;
        await item.save();

        const updated = await CartItem.findByPk(item.id, {
            include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'image'] }]
        });

        res.status(200).json({ success: true, message: 'Item updated', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating cart item', data: error.message });
    }
});

/**
 * DELETE /api/cart/:userId/:cartItemId
 * Șterge un produs din coș
 */
router.delete('/:userId/:cartItemId', verifyToken, async (req, res) => {
    try {
        const { userId, cartItemId } = req.params;

        if (parseInt(userId) !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized', data: {} });
        }

        const item = await CartItem.findOne({ where: { id: cartItemId, userId } });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found', data: {} });
        }

        await item.destroy();

        res.status(200).json({ success: true, message: 'Item deleted from cart', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting cart item', data: error.message });
    }
});

/**
 * DELETE /api/cart/:userId
 * Golește tot coșul userului
 */
router.delete('/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        if (parseInt(userId) !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized', data: {} });
        }

        await CartItem.destroy({ where: { userId } });

        res.status(200).json({ success: true, message: 'Cart cleared successfully', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error clearing cart', data: error.message });
    }
});

module.exports = router;
