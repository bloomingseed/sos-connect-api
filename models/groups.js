const { HOSTNAME } = require("../config");
const {
  seedImage,
  THUMBNAIL_SIZE,
  COVER_SIZE,
} = require("../helpers/seed-image");

const createModel = (sequelize, DataTypes) => {
  const IMAGE_FIELDS = [];
  const Groups = sequelize.define(
    "Groups",
    {
      id_group: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      description: {
        type: DataTypes.TEXT,
      },
      name: {
        type: DataTypes.TEXT,
      },
      thumbnail_image_url: {
        type: DataTypes.TEXT,
      },
      cover_image_url: {
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
  Groups.associate = function (models) {
    Groups.hasMany(models.Members, { foreignKey: "id_group", as: "members" });
    Groups.hasMany(models.Requests, { foreignKey: "id_group", as: "requests" });
  };
  Groups.afterCreate(async (group, options) => {
    if (group.thumbnail_image_url == null) {
      let url = `uploads/g${group.id_group}-thumbnail.png`;
      seedImage(`G${group.id_group}`, url, THUMBNAIL_SIZE, false);
      group.thumbnail_image_url = `${HOSTNAME}/` + url;
    }
    if (group.cover_image_url == null) {
      let url = `uploads/g${group.id_group}-cover.png`;
      seedImage(group.name, url, COVER_SIZE, true);
      group.cover_image_url = `${HOSTNAME}/` + url;
    }
    await group.save();
  });
  Groups.imageFields = () => IMAGE_FIELDS;
  return Groups;
};
module.exports = createModel;
