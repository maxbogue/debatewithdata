import { ForbiddenError, NotFoundError } from '@/api/error';
import { genRevId } from './utils';
import { map } from 'lodash';

export default function(sequelize, DataTypes) {
  const Comment = sequelize.define('comment', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
    commentable: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    commentableId: {
      field: 'commentable_id',
      type: DataTypes.TEXT,
      allowNull: false,
      references: null,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  Comment.associate = function(models) {
    Comment.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        field: 'user_id',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
  };

  Comment.postAssociate = function(models) {
    Comment.prototype.toData = function() {
      return {
        id: this.id,
        text: this.text,
        author: this.user.username,
        created: this.created_at,
      };
    };

    Comment.apiAdd = async function(Item, itemId, user, text) {
      const item = await Item.findById(itemId);
      if (!item) {
        throw new NotFoundError(Item.name + ' not found: ' + itemId);
      }
      return await item.createComment({
        userId: user.id,
        text: text,
      });
    };

    Comment.apiDelete = async function(Item, itemId, user, commentId) {
      const item = await Item.findById(itemId);
      if (!item) {
        throw new NotFoundError(Item.name + ' not found: ' + itemId);
      }
      const comment = await models.Comment.findById(commentId);
      if (!(await item.hasComment(comment))) {
        throw new NotFoundError('Comment not found.');
      }
      if (comment.userId !== user.id) {
        throw new ForbiddenError('Comment is not yours to delete.');
      }
      await comment.update({ deleted: true });
    };

    Comment.apiGet = async function(commentId) {
      const comment = await Comment.findById(commentId, {
        include: [models.User],
      });
      return comment.toData();
    };

    Comment.apiGetAll = async function(Item, itemId) {
      const item = await Item.findById(itemId);
      if (!item) {
        throw new NotFoundError(Item.name + ' not found: ' + itemId);
      }
      const comments = await item.getComments({
        where: { deleted: false },
        order: ['created_at'],
        include: [models.User],
      });
      return map(comments, c => c.toData());
    };
  };

  return Comment;
}
