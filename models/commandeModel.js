'use strict';

var mongoose = require("mongoose");
 
var CommandeSchema = new mongoose.Schema({
    dateArrivee: {
        type: Date,
        required:true
    },
    livreur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Livreur',
        required:false
    },
    usager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usager',
        required:false
    },
    plats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plat',
        required:false
    }],
});
 
module.exports.CommandeModel = mongoose.model("Commande", CommandeSchema);