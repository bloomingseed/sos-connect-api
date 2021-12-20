const createModel = (sequelize, DataTypes) => {
  const Images = sequelize.define(
    "Images",
    {
      id_image: {
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
      object_type: {
        type: DataTypes.INTEGER,
      },
      url: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: true,
      createdAt: false,
      updatedAt: false,
    }
  );
  Images.associate = function (models) {
    Images.belongsTo(models.Requests, {
      foreignKey: "id_request",
      as: "request",
    });
    Images.belongsTo(models.Supports, {
      foreignKey: "id_support",
      as: "support",
    });
  };
  return Images;
};
module.exports = createModel;
