const { sequelize } = require('../server');
const { DataTypes } = require('sequelize');
const User = require('./User');
const Product = require('./Product');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: {
        args: [1],
        msg: 'Quantity must be at least 1',
      },
      isInt: {
        msg: 'Quantity must be an integer',
      },
    },
  },
  priceAtPurchase: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Price cannot be negative',
      },
    },
  },
}, {
  tableName: 'cart_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// definim relațiile logice pentru Sequelize
CartItem.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = CartItem;
