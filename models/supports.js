var Op = require("sequelize").Op;
const createModel = (sequelize, DataTypes) => {
  const Supports = sequelize.define(
    "Supports",
    {
      id_support: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      id_request: {
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING,
      },
      content: {
        type: DataTypes.TEXT,
      },
      is_confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      date_created: {
        type: DataTypes.DATE,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      createdAt: "date_created",
      updatedAt: false,
    }
  );
  Supports.associate = function (models) {
    Supports.belongsTo(models.Requests, {
      foreignKey: "id_request",
      as: "request",
    });
    Supports.hasMany(models.Comments, {
      foreignKey: "id_support",
      scope: {
        object_type: 1,
      },
      as: "comments",
    });
    Supports.hasMany(models.Reactions, {
      foreignKey: "id_support",
      scope: {
        object_type: 1,
      },
      as: "reactions",
    });
    Supports.hasMany(models.Images, {
      foreignKey: "id_support",
      scope: {
        object_type: 1,
      },
      as: "images",
    });
  };
  Supports.prototype.deleteCurrentImages = async function (db) {
    let imageIdList = await this.getImages({ attributes: ["id_image"] });
    if (imageIdList.length == 0) return;

    return db.Images.destroy({
      where: {
        id_image: {
          [Op.in]: imageIdList.map((elm) => elm.id_image),
        },
      },
    });
  };
  return Supports;
};
module.exports = createModel;
