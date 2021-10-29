const createModel = (sequelize, DataTypes) => {
  const Members = sequelize.define('Members', {
    username: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    id_group: {
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    as_role: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    is_admin_invited:{
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN
    },
    date_created: {
      type: DataTypes.DATE
    }
  }, {
    timestamps:true,
    createdAt: 'date_created',
    updatedAt: false
  })
  Members.associate = function (models) {
    Members.belongsTo(models.Groups, { foreignKey: 'id_group', as: 'group' })
  }
  return Members
}
module.exports = createModel
