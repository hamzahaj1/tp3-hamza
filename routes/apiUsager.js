/*jshint esversion: 6 */
'use strict';

var express = require('express');
var routerApiUsager = express.Router();
var jwt = require('jsonwebtoken');

var url_base = "http://localhost:8090";

//importation des modèles 
var UsagerModel = require('../models/usagerModel').UsagerModel;
var LivreurModel = require('../models/livreurModel').LivreurModel;
var CommandeModel = require('../models/commandeModel').CommandeModel;
var PlatModel = require('../models/platModel').PlatModel;
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

routerApiUsager.route('')
    .post(function (req, res) {
        console.log('Création d\'un usager');

        var nouvelUsager = new UsagerModel(req.body);

        nouvelUsager.save(function (err) {
            if (err) throw err;
            res.header('Content-Type', 'application/json');
            res.location(url_base + '/usagers/' + nouvelUsager.id);
            res.status(201).json(nouvelUsager);
        });
    });

routerApiUsager.route('/:usager_id')
    .get(function (req, res) {

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
                if (jetonDecode.id === req.params.usager_id) {

                    UsagerModel.findById(req.params.usager_id, function (err, usager) {
                        if (err) throw err;
                        console.log('Consultation de l\'usager numero : ' + req.params.usager_id);
                        res.header('Content-Type', 'application/json');
                        res.status(200).json(usager);
                    });

                } else {
                    res.status(403).end();
                }
            }
        });
    });

routerApiUsager.route('/:usager_id/commandes').post(function (req, res) {

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
            if (jetonDecode.id === req.params.usager_id) {

                console.log('Création d\'une commande');

                var commande = new CommandeModel();

                commande.dateArrivee = req.body.dateArrivee;

                UsagerModel.findById(req.params.usager_id, function (err, usager) {
                    if (err) throw err;
                    commande.usager = usager;
                    commande.save(function (err) {
                        if (err) throw err;
                        res.header('Content-Type', 'application/json');
                        res.location(url_base + '/usagers/' + req.params.usager_id + '/commandes/' + commande.id);
                        res.status(201).json(commande);
                    });
                });

                

            } else {
                res.status(403).end();
            }
        }
    });
});

routerApiUsager.route('/:usager_id/commandes/:commande_id')
    .get(function (req, res) {

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
                if (jetonDecode.id === req.params.usager_id) {

                    console.log('Consultation d\'une commande');
                    //1
                    CommandeModel.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;
                        console.log('Consultation de la commande numero : ' + req.params.commande_id);
                        res.header('Content-Type', 'application/json');
                        res.status(200).json(commande);
                    });

                } else {
                    res.status(403).end();
                }
            }
        });
    })
    .put(function (req, res) {
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
                if (jetonDecode.id === req.params.usager_id) {
                    CommandeModel.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;

                        if (commande === null || commande === undefined ) {

                            console.log('Creation de la commande numero : ' + req.params.commande_id);
                            var nouvelleCommande = new CommandeModel();
                            nouvelleCommande.dateArrivee = req.body.dateArrivee;

                            UsagerModel.findById(req.params.usager_id, function (err, usager) {
                                if (err) throw err;
                                nouvelleCommande.usager = usager;
                            });

                            nouvelleCommande.save(function (err) {
                                if (err) throw err;
                                res.header('Content-Type', 'application/json');
                                res.status(201).json(nouvelleCommande);
                            });

                        } else {

                            console.log('Modification de la commande numero : ' + req.params.commande_id);

                            if (req.body.plats === undefined && req.body.livreur === undefined && req.body.usager === undefined) {

                                CommandeModel.findByIdAndUpdate(commande.id, req.body, {
                                    new: true, // Retourne le doc modifié et non pas l'originel
                                    runValidators: true // permet d'éxecuter les validateurs
                                }, function (err, uncommande) {
                                    if (err) throw err;
                                    res.status(200).json(uncommande);
                                });

                            } else {
                                res.status(403).end();
                            }
                        }
                    });

                } else {
                    res.status(403).end();
                }
            }
        });
    })
    .delete(function (req, res) {
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
                if (jetonDecode.id === req.params.usager_id) {

                    console.log('Suppression de la commande numéro :' + req.params.commande_id);

                    CommandeModel.findByIdAndDelete(req.params.commande_id, function (err) {
                        if (err) throw err;
                        res.status(204).end();
                    });

                } else {
                    res.status(403).end();
                }
            }
        });
    });


routerApiUsager.route('/:usager_id/commandes/:commande_id/livreur')
    .put(function (req, res) {
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
                if (jetonDecode.id === req.params.usager_id) {
                    CommandeModel.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;

                        LivreurModel.findById(req.body._id, function (err, livreur) {
                            if (err) throw err;
                            if (commande.livreur === undefined) {

                                commande.livreur = livreur;
                                commande.save(function (err) {
                                    if (err) throw err;
                                    res.header('Content-Type', 'application/json');
                                    res.status(201).json(commande);
                                });

                            } else {
                                commande.livreur = livreur;
                                commande.save(function (err) {
                                    if (err) throw err;
                                    res.header('Content-Type', 'application/json');
                                    res.status(200).json(commande);
                                });
                            }

                        });

                    });

                } else {
                    res.status(403).end();
                }
            }
        });
    });

routerApiUsager.route('/:usager_id/commandes/:commande_id/plats').get(function (req, res) {
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
            if (jetonDecode.id === req.params.usager_id) {

                CommandeModel.findById(req.params.commande_id, function (err, commande) {
                    if (err) throw err;

                    var arrayPlats = [];

                    for (var i = 0; i < commande.plats.length; i++) {
                        arrayPlats.push(commande.plats[i]);
                    }

                    res.header('Content-Type', 'application/json');
                    res.status(200).json(arrayPlats);
                });

            } else {
                res.status(403).end();
            }
        }
    });
});


routerApiUsager.route('/:usager_id/commandes/:commande_id/plats/:plat_id')
    .put(function (req, res) {
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
                if (jetonDecode.id === req.params.usager_id) {
                    CommandeModel.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;


                        PlatModel.findById(req.params.plat_id, function (err, plat) {
                            if (err) throw err;
                            var j = 0;
                            var pasTrouve = true;
                            var code = 201;

                            while (j < commande.plats.length && pasTrouve) {
                                if (commande.plats[j].toString() === plat.id.toString()) {
                                    commande.plats[j] = plat;
                                    pasTrouve = false;
                                    code = 200;
                                }
                                j++;
                            }

                            if (code === 201) {
                                commande.plats.push(plat);
                            }

                            commande.save(function (err) {
                                if (err) throw err;
                                res.header('Content-Type', 'application/json');
                                res.status(code).json(commande);
                            });
                        });

                    });

                } else {
                    res.status(403).end();
                }
            }
        });
    })
    .delete(function (req, res) {
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
                if (jetonDecode.id === req.params.usager_id) {

                    console.log('Suppression d\'un plat numéro :' + req.params.commande_id);

                    CommandeModel.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;

                        var pasTrouve = true;
                        var j = 0;

                        while (j < commande.plats.length && pasTrouve) {
                            if (commande.plats[j].toString() === req.params.plat_id) {

                                commande.plats.splice(j, 1);
                                pasTrouve = false;
                            }
                            j++;
                        }


                        commande.save(function (err) {
                            if (err) throw err;
                            res.header('Content-Type', 'application/json');
                            res.status(204).json(commande);
                        });
                    });

                } else {
                    res.status(403).end();
                }
            }
        });
    });

module.exports = routerApiUsager;