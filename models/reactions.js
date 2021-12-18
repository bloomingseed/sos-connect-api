const createModel = (sequelize, DataTypes) => {
  const Comments = sequelize.define(
    "Reactions",
    {
      id_reaction: {
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
    },
    {
      timestamps: true,
      createdAt: false,
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
