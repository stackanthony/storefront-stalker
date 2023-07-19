const User = require('./User');
const Seller = require('./Seller');

//Sets up One-To-Many Relationship
Seller.hasMany(User, { foreignKey: "usersTracking", sourceKey: "discordUserID" });
User.belongsTo(Seller, { foreignKey: "usersTracking", targetKey: "discordUserID" });

module.exports = { User, Seller };