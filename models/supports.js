const createModel = (sequelize, DataTypes) => {
  const Supports = sequelize.define('Supports', {
    id_support: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    id_request: {
      type: DataTypes.INTEGER
    },
    username: {
      type: DataTypes.STRING
    },
    content: {
      type: DataTypes.TEXT
    },
    is_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    date_created: {
      type: DataTypes.DATE
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps:true,
    createdAt: 'date_created',
    updatedAt: false
  })
  Supports.associate = function (models) {
    Supports.belongsTo(models.Requests, { foreignKey: 'id_request', as: 'request' })
  }
  return Supports
}
module.exports = createModel
