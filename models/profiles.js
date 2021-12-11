const { HOSTNAME } = require("../config");
let { seedImage, THUMBNAIL_SIZE } = require("../helpers/seed-image");

const createModel = (sequelize, DataTypes) => {
  const Profiles = sequelize.define(
    "Profiles",
    {
      username: {
        primaryKey: true,
        type: DataTypes.STRING,
      },
      last_name: {
        type: DataTypes.STRING,
      },
      first_name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      gender: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      avatar_url: {
        type: DataTypes.STRING,
      },
      date_of_birth: {
        allowNull: false,
        type: DataTypes.DATEONLY,
      },
      country: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      province: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      district: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      ward: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      street: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      phone_number: {
        type: DataTypes.STRING,
      },
      is_deactivated: {
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      is_deleted: {
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
    },
    {
      timestamps: true,
      createdAt: false,
      updatedAt: false,
    }
  );
  Profiles.associate = function (models) {};
  Profiles.afterCreate(async (profile, options) => {
    if (profile.avatar_url == null) {
      let url = `uploads/${profile.username.replace("@", "-")}.png`;
      seedImage(profile.username[0], "public/" + url, THUMBNAIL_SIZE, false);
      profile.avatar_url = `${HOSTNAME}/` + url;
    }
    await profile.save();
  });
  return Profiles;
};
module.exports = createModel;
