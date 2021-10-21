const createModel = (sequelize, DataTypes) => {
  const Requests = sequelize.define('Requests', {
    id_request: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    id_group: {
      type: DataTypes.INTEGER
    },
    username: {
      type: DataTypes.STRING
    },
    content: {
      type: DataTypes.TEXT
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    date_created: {
      type: DataTypes.DATE
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps:true,
    createdAt: 'date_created',
    updatedAt: false
  })
  Requests.associate = function (models) {
    Requests.belongsTo(models.Groups, { foreignKey: 'id_group', as: 'group' })
    Requests.hasMany(models.Supports, {foreignKey: 'id_request', as: 'supports' })
  }
  return Requests
}
module.exports = createModel
