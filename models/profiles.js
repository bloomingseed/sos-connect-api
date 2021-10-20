const createModel = (sequelize, DataTypes) => {
  const Profiles = sequelize.define('Profiles', {
    username: {
      primaryKey: true,
      type: DataTypes.STRING
    },
    last_name: {
      type: DataTypes.STRING
    },
    first_name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    gender: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    avatar_url: {
      type: DataTypes.STRING
    },
    date_of_birth: {
      allowNull: false,
      type: DataTypes.DATEONLY
    },
    country: {
      type: DataTypes.STRING
    },
    province: {
      allowNull: false,
      type: DataTypes.STRING
    },
    district: {
      type: DataTypes.STRING
    },
    ward: {
      allowNull: false,
      type: DataTypes.STRING
    },
    street: {
      type: DataTypes.STRING
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING
    },
    phone_number: {
      type: DataTypes.STRING
    },
    is_admin: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    is_deactivated: {
      type: DataTypes.BOOLEAN
    },
    is_deleted: {
      type: DataTypes.BOOLEAN
    },
  }, {
    timestamps:true,
    createdAt: false,
    updatedAt: false
  })
  Profiles.associate = function (models) {
    
  }
  return Profiles
}
module.exports = createModel