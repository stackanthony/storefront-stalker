const db = require("../index.js");
const { Model, DataTypes } = require("sequelize");
const signale = require("signale");

class Seller extends Model {
    static associate() { }
}

Seller.init(
    {
        sellerID: {
            type: DataTypes.STRING,
            unique: true,
        },
        asinCount: {
            type: DataTypes.INTEGER,
            unique: true,
        },
        sellerASINS: {
            type: DataTypes.ARRAY
        },
        usersTracking: {
            type: DataTypes.ARRAY,
            allowNull: false,
        }
        
    },
    { paranoid: true, sequelize: db, modelName: "User" }
);

signale.success("User Model Initalized");

module.exports = Seller;