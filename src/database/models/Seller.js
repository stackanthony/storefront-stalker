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
            type: DataTypes.In,
            unique: true,
        }
    },
    { paranoid: true, sequelize: db, modelName: "User" }
);

signale.success("User Model Initalized");

module.exports = Seller;