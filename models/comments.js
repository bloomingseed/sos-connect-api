const createModel = (sequelize, DataTypes) => {
  const Comments = sequelize.define(
    "Comments",
    {
      id_comment: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      id_request: {
        type: DataTypes.INTEGER,
      },
      id_support: {
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING,
      },
      object_type: {
        type: DataTypes.INTEGER,
      },
      content: {
        type: DataTypes.TEXT,
      },
      is_deleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      date_created: {
        type: DataTypes.DATE,
      },
    },
    {
      timestamps: true,
      createdAt: "date_created",
      updatedAt: false,
    }
  );
  Comments.associate = function (models) {
    Comments.belongsTo(models.Profiles, { foreignKey: "username", as: "user" });
    Comments.belongsTo(models.Requests, {
      foreignKey: "id_request",
      as: "request",
    });
    Comments.belongsTo(models.Supports, {
      foreignKey: "id_support",
      as: "support",
    });
  };
  return Comments;
};
module.exports = createModel;
