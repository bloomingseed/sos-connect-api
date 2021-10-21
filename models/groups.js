const createModel = (sequelize, DataTypes) => {
  const Groups = sequelize.define('Groups', {
    id_group: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    description: {
      type: DataTypes.TEXT
    },
    name: {
      type: DataTypes.TEXT
    },
    is_deleted: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    date_created: {
      type: DataTypes.DATE
    }
  }, {
    timestamps:true,
    createdAt: 'date_created',
    updatedAt: false
  })
  Groups.associate = function (models) {
    Groups.hasMany(models.Members, { foreignKey: 'id_group', as: 'members' })
    Groups.hasMany(models.Requests, { foreignKey: 'id_group', as: 'requests' })
  }
  return Groups
}
module.exports = createModel
