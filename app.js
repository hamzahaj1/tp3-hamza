'use strict';
var express = require('express');
var app = express();
var hateoasLinker = require('express-hateoas-links');

// replace standard express res.json with the new version
app.use(hateoasLinker);

//Permet de récupérer du JSON dans le corps de la requête
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Module pour JWT.
var jwt = require('jsonwebtoken');

 var swaggerUi = require('swagger-ui-express'),
     swaggerDocument = require('./swagger.json');

var routerApiLivreur = require('./routes/apiLivreur.js');
var routerApiPlats = require('./routes/apiPlat.js');
var routerApiUsager = require('./routes/apiUsager.js');


var UsagerModel = require('./models/usagerModel').UsagerModel;

var config = require('./config');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.set('jwt-secret', config.secret);

app.post('/connexion', function (req, res) {

    UsagerModel.find({
        pseudo: req.body.pseudo,
        motDePasse: req.body.motDePasse
    }, function (err, ressource) {
        if (err) throw err;
        if (ressource[0] !== undefined) {
            var payload = {
                user: ressource[0].pseudo,
                id: ressource[0].id
            };
            var jwtToken = jwt.sign(payload, app.get('jwt-secret'), {
                // Expiration en secondes (24 heures).
                expiresIn: 86400

                // Permet de vérifier que le jeton expire très rapidement.
                //expiresIn: 10
            });
            res.header('Content-Type', 'application/json');
            res.status(201).json({
                "token": jwtToken
            });
            
        } else {
            res.status(400).end();
        }
    });
});

app.use('/livreurs', routerApiLivreur);
app.use('/plats', routerApiPlats);
app.use('/usagers', routerApiUsager);

// Gestion de l'erreur 404.
app.all('*', function (req, res) {
    res.setHeader('Content-Type', ';text/plain; charset=utf-8');
    res.status(404).send('Erreur 404 : Ressource inexistante !');
});

// Démarrage du serveur.
app.listen(8090, function () {
    console.log('Serveur sur port ' + this.address().port);
});