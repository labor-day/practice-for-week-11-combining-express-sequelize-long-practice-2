'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('InsectTrees', {
      insectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: 'Insects'},
        onDelete: 'cascade'
      },
      treeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Trees',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('InsectTrees');
  }
};
