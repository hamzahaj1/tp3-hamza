'use strict';

var express = require('express');
var routerApiLivreur = express.Router();
var jwt = require('jsonwebtoken');

var url_base = "http://localhost:8090";

//importation de modèle Livreur
var LivreurModel = require('../models/livreurModel').LivreurModel;

//ORM Mongoose
var mongoose = require('mongoose');
// Connexion à MongoDB avec Mongoose

mongoose.connect('mongodb://localhost:27017/tp3', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

function verifierAuthentification(req, callback) {
    // Récupération du jeton JWT dans l'en-tête HTTP "Authorization".
    var auth = req.headers.authorization;
    if (!auth) {
        // Pas de jeton donc pas connecté.
        callback(false, null);
    } else {
        // Pour le déboggae.
        console.log("Authorization : " + auth);
        // Structure de l'en-tête "Authorization" : "Bearer jeton-jwt"
        var authArray = auth.split(' ');
        if (authArray.length !== 2) {
            // Mauvaise structure pour l'en-tête "Authorization".
            callback(false, null);
        } else {
            // Le jeton est après l'espace suivant "Bearer".
            var jetonEndode = authArray[1];
            // Vérification du jeton.
            jwt.verify(jetonEndode, req.app.get('jwt-secret'), function (err, jetonDecode) {
                if (err) {
                    // Jeton invalide.
                    callback(false, null);
                } else {
                    // Jeton valide.
                    callback(true, jetonDecode);
                }
            });
        }
    }
}

routerApiLivreur.use(function (req, res, next) {
    verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
        if (!estAuthentifie) {
            // Utilisateur NON authentifié.
            res.status(401).end();
        } else {
            // Utilisateur authentifié.
            // Sauvegarde du jeton décodé dans la requête pour usage ultérieur.
            req.jeton = jetonDecode;
            // Pour le déboggage.
            console.log("Jeton : " + JSON.stringify(jetonDecode));
            // Poursuite du traitement de la requête.
            next();
        }
    });
});



routerApiLivreur.route('')
    .post(function (req, res) {
        //on doit créer un Livreur
        console.log('création du Livreur');
        //création du modèle à partir du body de la requête
        var livreur = new LivreurModel(req.body);
        //on sauvegarde dans la BD
        livreur.save(function (err) {
            if (err) throw err;
            res.header('Content-Type', 'application/json');
            res.setHeader("Location", url_base + "/livreurs/" + livreur._id.toString());
            res.status(201).json(livreur);
        });
    });


routerApiLivreur.route('/:livreur_id')
    .get(function (req, res) {
        LivreurModel.findById(req.params.livreur_id, function (err, livreur) {
            if (err) throw err;
            res.header('Content-Type', 'application/json');
            res.status(200).json(livreur);
        });
    })
    .delete(function (req, res) {
        console.log('Suppression du livreur numéro :' + req.params.livreur_id);
        LivreurModel.findByIdAndDelete(req.params.livreur_id, function (err) {
            if (err) throw err;
            res.status(204).end();
        });
    });

module.exports = routerApiLivreur;