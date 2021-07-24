var fs = require('fs');
var http = require('http');
var https = require('https');

var express = require('express');
const bodyParser = require('body-parser');
const getId = require('docker-container-id');

let apiato = require('apiato')


let apied_pipper = function (jsonDefinition, mongoDBUri, port, options, ssl_config) {
    try {
        this.mongoose = require("mongoose");
        if (!jsonDefinition) {
            throw 'You must to add the json definition'
        }
        if (!mongoDBUri) {
            throw 'You must to add the mongo db URI'
        }
        this.app = express()
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(bodyParser.json());
        this.credentials = false

        if (ssl_config && ssl_config.private && ssl_config.cert && ssl_config.port) {
            this.privateKey = fs.readFileSync(ssl_config.private, 'utf8');
            this.certificate = fs.readFileSync(ssl_config.cert, 'utf8');
            this.credentials = {key: this.privateKey, cert: this.certificate};
            this.httpsServer = https.createServer(this.credentials, this.app);
        }

        this.httpServer = http.createServer(this.app);
        this.mongoose.connect(mongoDBUri, {useUnifiedTopology: true, useNewUrlParser: true});
        this.db = this.mongoose.connection;

        if (options?.active_cors) {
            this.app.use((req, res, next) => {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
                res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
                res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
                next();
            });
        }



        this.app.get('/', function (req, res) {
            res.status(200).json({
                success: true,
                code: 200,
                message: 'APIed Piper has been successful started',
            })
        })

        // consturct models and schema objects

        this.ms = new apiato();
        let Schema = this.mongoose.Schema;
        this.schemas_object = {}
        this.models_object = {}
        this.validations_object = {}
        this.populations_object = {}

        for (var [key, value] of Object.entries(jsonDefinition)) {
            if (!value || !value.definition || !value.operation) {
                throw new Error('There are a missing parameter in definition object')
            }
            // run the definition objects
            this.schemas_object[key] = {}
            this.validations_object[key] = {}
            this.models_object[key] = {}
            this.populations_object[key] = {}

            for (var [key_, value_] of Object.entries(value.definition)) {
                if (!value_ || typeof value_ != 'object') {
                    throw new Error('definition must be an object')
                }
                if (!value_.type) {
                    throw new Error('Type must be defined')
                }

                let type = Schema.Types.Mixed

                let cadValidation = ''
                switch (value_.type.toLowerCase()) {
                    case 'string':
                        type: String
                        cadValidation = cadValidation + 'string'
                        break;
                    case 'number':
                        type: Number
                        cadValidation = cadValidation + 'number'
                        break;
                    case 'boolean':
                        type: Boolean
                        cadValidation = cadValidation + 'boolean'
                        break;
                    case 'date':
                        type: Date
                        cadValidation = cadValidation + 'date'
                        break;
                    case 'oid':
                        type: Schema.Types.ObjectId
                        this.populations_object[key][key_] = this.models_object[value_.rel]
                        break;
                    case 'array_oid':
                        type: Schema.Types.ObjectId
                        cadValidation = cadValidation + 'array'
                        this.populations_object[key][key_] = this.models_object[value_.rel]
                        break;
                    default:
                        type: Schema.Types.Mixed
                        break;
                }

                cadValidation = cadValidation + (value_.mandatory && !value_.default_function ? ',mandatory' : '')
                this.validations_object[key][key_] = cadValidation

                if (value_.type.toLowerCase().includes('array')) {
                    this.schemas_object[key][key_] = [{
                        type: type,
                        required: value_.mandatory ? value_.mandatory : false,
                        default: value_.default_function ? value_.default_function() : undefined,
                        ref: value_.rel && this.models_object[value_.rel] ? this.models_object[value_.rel] : undefined,
                    }]
                } else {
                    this.schemas_object[key][key_] = {
                        type: type,
                        required: value_.mandatory ? value_.mandatory : false,
                        default: value_.default_function ? value_.default_function() : undefined,
                        ref: value_.rel && this.models_object[value_.rel] ? this.models_object[value_.rel] : false,
                    }
                    if (!this.schemas_object[key][key_].ref) {
                        delete this.schemas_object[key][key_].ref
                    }
                }
            }
            this.models_object[key] = this.mongoose.model(key, this.schemas_object[key]);
            if (!this.populations_object[key]) {
                delete this.populations_object[key]
            }
        }


        for (var [key, value] of Object.entries(jsonDefinition)) {
            if (value && value.operation && (value.operation.all || value.operation.createOne)) {
                this.app.post('/api/' + key, this.ms.createOne(this.models_object[key], this.validations_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
            }
            if (value && value.operation && (value.operation.all || value.operation.createMany)) {
                this.app.post('/api/' + key + '/many', this.ms.createMany(this.models_object[key], this.validations_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
            }
            if (value && value.operation && (value.operation.all || value.operation.getMany)) {
                this.app.get('/api/' + key, this.ms.getMany(this.models_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
            }
            if (value && value.operation && (value.operation.all || value.operation.getOneById)) {
                this.app.get('/api/' + key + '/:id', this.ms.getOneById(this.models_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
            }
            if (value && value.operation && (value.operation.all || value.operation.getOneWhere)) {
                this.app.get('/api/' + key + '/one', this.ms.getOneWhere(this.models_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
            }
            if (value && value.operation && (value.operation.all || value.operation.findUpdateOrCreate)) {
                this.app.put('/api/' + key + '/find_update_or_create', this.ms.findUpdateOrCreate(this.models_object[key], this.validations_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
            }
            if (value && value.operation && (value.operation.all || value.operation.findUpdate)) {
                this.app.put('/api/' + key + '/find_where_and_update', this.ms.findUpdate(this.models_object[key], this.validations_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
            }
            if (value && value.operation && (value.operation.all || value.operation.updateById)) {
                this.app.put('/api/' + key + '/:id', this.ms.updateById(this.models_object[key], this.validations_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
            }
            if (value && value.operation && (value.operation.all || value.operation.findIdAndDelete)) {
                this.app.delete('/api/' + key + '/:id', this.ms.findIdAndDelete(this.models_object[key], {}))
            }

        }


        this.app.get('/', async function (req, res) {
            res.status(200).json({
                success: true,
                code: 200,
                error: '',
                message: 'APIed Piper has been successful started',
                container_id: await getId()
            })
        })

        this.app.get('*', async function (req, res) {
            res.status(404).json({
                success: false,
                code: 404,
                error: 'Resource not found',
                message: 'APIed Piper has been successful started',
                container_id: await getId()
            })
        })


        this.start = async function () {
            if (ssl_config && ssl_config.private && ssl_config.cert && ssl_config.port) {
                this.httpsServer.listen(ssl_config.port, () => {
                    console.log("https server start al port", ssl_config.port);
                });
            }
            this.httpServer.listen(port ? port : 3000, () => {
                console.log("http server start al port", port ? port : 3000);
            });
            this.db.once("open", function () {
                console.log("MongoDB database connection established successfully", mongoDBUri);
            });
            return true
        }
    } catch (e) {
        throw e
    }
}

module.exports = apied_pipper
