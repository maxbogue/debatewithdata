'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable('topic_topics', {
      topic_rev_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
        references: {
          model: 'topic_revs',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sub_topic_id: {
        type: DataTypes.TEXT,
        primaryKey: true,
        references: {
          model: 'topics',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('topic_topics');
  },
};
