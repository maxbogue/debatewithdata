import { map } from 'lodash';
import { ForbiddenError, NotFoundError } from '../api/error';
import { genRevId } from './utils';

export default function (sequelize, DataTypes) {
  const Comment = sequelize.define('comment', {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
      defaultValue: genRevId,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    commentable: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    commentable_id: {
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
      defaultValue: false,
      allowNull: false,
    },
  });

  Comment.associate = function (models) {
    Comment.belongsTo(models.User);
  };

  Comment.postAssociate = function (models) {
    Comment.prototype.toData = function () {
      return {
        id: this.id,
        text: this.text,
        author: this.user.username,
        created: Math.floor(this.created_at.getTime() / 1000),
      };
    };

    Comment.apiAdd = async function (Item, itemId, user, text) {
      let item = await Item.findById(itemId);
      if (!item) {
        throw new NotFoundError(Item.name + ' not found: ' + itemId);
      }
      return await item.createComment({
        user_id: user.id,
        text: text,
      });
    };

    Comment.apiDelete = async function (Item, itemId, user, commentId) {
      let item = await Item.findById(itemId);
      if (!item) {
        throw new NotFoundError(Item.name + ' not found: ' + itemId);
      }
      let comment = await models.Comment.findById(commentId);
      if (!await item.hasComment(comment)) {
        throw new NotFoundError('Comment not found.');
      }
      if (comment.user_id !== user.id) {
        throw new ForbiddenError('Comment is not yours to delete.');
      }
      await comment.update({ deleted: true });
    };

    Comment.apiGet = async function (commentId) {
      let comment = await Comment.findById(commentId, {
        include: [models.User],
      });
      return comment.toData();
    };

    Comment.apiGetAll = async function (Item, itemId) {
      let item = await Item.findById(itemId);
      if (!item) {
        throw new NotFoundError(Item.name + ' not found: ' + itemId);
      }
      let comments = await item.getComments({
        where: { deleted: false },
        order: ['created_at'],
        include: [models.User],
      });
      return map(comments, (c) => c.toData());
    };
  };

  return Comment;
}
