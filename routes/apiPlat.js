/*jshint esversion: 6 */
'use strict';

var express = require('express');
var routerApiPlat = express.Router();
var jwt = require('jsonwebtoken');
var cors = require('cors');

var url_base = "https://tp3-hamza.herokuapp.com";

//importation de modèle Livreur
var PlatModel = require('../models/platModel').PlatModel;

//ORM Mongoose
var mongoose = require('mongoose');
// Connexion à MongoDB avec Mongoose

mongoose.connect('mongodb+srv://hamzahaj:rimouham2001@cluster0.kao7g.mongodb.net/tp3', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

routerApiPlat.use(function (req, res, next) {
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


const whitelist = ['https://www.delirescalade.com', 'https://www.chess.com', 'https://cegepgarneau.omnivox.ca'];
const corsSites = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};

const options = {
    origin: true,
    methods: ["GET"],
    preflightContinue: false,
    optionsSuccessStatus: 200
};
//cors(corsOptions) ,
routerApiPlat.route('')
    .post(function (req, res) {
        //on doit créer un Livreur
        console.log('création du PLat ');
        //création du modèle à partir du body de la requête
        var plat = new PlatModel(req.body);
        //on sauvegarde dans la BD
        plat.save(function (err) {
            if (err) throw err;
            res.header('Content-Type', 'application/json');
            res.location(url_base + "/plats/" + plat._id.toString());
            res.status(201);
            res.json(plat, [{
                    rel: "self",
                    method: "GET",
                    href: url_base + "/plats/" + plat._id.toString()
                },
                {
                    rel: "delete",
                    method: "DELETE",
                    href: url_base + "/plats/" + plat._id.toString()
                }
            ]);
            
        });
    })
    .get(cors(corsSites),function (req, res) {
        PlatModel.find({}, function (err, plats) {
            var resBody = [];

            plats.forEach(plat => {
                var links = [{
                        rel: "self",
                        method: "GET",
                        href: url_base + "/plats/" + plat._id.toString()
                    },
                    {
                        rel: "delete",
                        method: "DELETE",
                        href: url_base + "/plats/" + plat._id.toString()
                    }
                ];
                var platToJson = plat.toJSON();
                var platsAvecLink = {
                    //*
                    plat: platToJson,
                    links: links
                };
                resBody.push(platsAvecLink);
            });
            if (err) throw err;
            res.status(200).json(resBody);
        });
    }).options(cors(options));

routerApiPlat.route('/:plat_id')
    .get(function (req, res) {
        PlatModel.findById(req.params.plat_id, function (err, plat) {
            if (err) throw err;
            console.log('Consultation du plat numéro' + req.params.plat_id);
            res.header('Content-Type', 'application/json');
            res.status(200).json(plat, [{
                    rel: "self",
                    method: "GET",
                    href: url_base + "/plats/" + plat._id.toString()
                },
                {
                    rel: "delete",
                    method: "DELETE",
                    href: url_base + "/plats/" + plat._id.toString()
                }
            ]);
        });
    })
    .delete(function (req, res) {
        console.log('Suppression du plat numéro :' + req.params.plat_id);
        PlatModel.findByIdAndDelete(req.params.plat_id, function (err) {
            if (err) throw err;
            res.status(204).end();
        });
    });

module.exports = routerApiPlat;