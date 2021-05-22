//ORM Mongoose
var mongoose = require("mongoose");

var LivreurSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    voiture: {
        type: String,
        required: true
    },
    quartier: {
        type: String,
        required: true
    }
});

module.exports.LivreurModel = mongoose.model("Livreur", LivreurSchema);