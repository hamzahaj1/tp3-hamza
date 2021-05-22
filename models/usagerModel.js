'use strict';

//ORM Mongoose
var mongoose = require("mongoose");

var UsagerSchema = new mongoose.Schema({

    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    pseudo: {
        type: String,
        required: true
    },
    motDePasse: {
        type: String,
        required: true
    }
});

module.exports.UsagerModel = mongoose.model("Usager", UsagerSchema);