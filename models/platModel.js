var mongoose = require("mongoose");
 
var PlatSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    nbrPortions: {
        type: Number,
        required: true
    }
});
 
module.exports.PlatModel = mongoose.model("Plat", PlatSchema);