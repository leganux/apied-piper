const fs = require('fs');
const http = require('http');
const https = require('https');
const bcrypt = require('bcrypt-updated');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

const express = require('express');
const bodyParser = require('body-parser');
const getId = require('docker-container-id');

let apiato = require('apiato');


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
        this.allowedRoutes = {}
        if (!options) {
            options = {}
        }

        if (ssl_config && ssl_config.private && ssl_config.cert && ssl_config.port) {
            this.privateKey = fs.readFileSync(ssl_config.private, 'utf8');
            this.certificate = fs.readFileSync(ssl_config.cert, 'utf8');
            this.credentials = {key: this.privateKey, cert: this.certificate};
            this.httpsServer = https.createServer(this.credentials, this.app);
        }

        this.httpServer = http.createServer(this.app);
        this.mongoose.connect(mongoDBUri, {useUnifiedTopology: true, useNewUrlParser: true});
        this.db = this.mongoose.connection;
        this.api_base_uri = '/api/';

        if (options.api_base_uri) {
            this.api_base_uri = options.api_base_uri
        }

        if (options?.active_cors) {
            this.app.use((req, res, next) => {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
                res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
                res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
                next();
            });
        }

        this.acl = options?.acl ? options.acl : ''

        this.middleware = [async function (req, res, next) {
            try {
                if (this.acl && typeof this.acl == 'object') {
                    let token = req?.headers?.authorization
                    if (!token) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            error: 'No token present',
                            message: '',
                        })
                        return;
                    }

                    if (token.includes('Bearer')) {
                        token = token.replace('Bearer', '')
                    }
                    token = token.trim()

                    let decoded = jwt.verify(token, this.passForJwt);

                    if (!decoded) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            error: 'Access error',
                            message: '',
                        })
                        return;
                    }

                    let finduser = await this.internalUser.findOne({
                        user: decoded.user,
                        profile: decoded.profile,
                        active: true
                    })
                    if (!finduser) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            error: 'Access error',
                            message: '',
                        })
                        return;
                    }

                    if (!this.acl || !this.acl[finduser.profile]) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            error: 'Access error',
                            message: '',
                        })
                        return;
                    }

                    let metod = req.method
                    let uri = req.originalUrl

                    let compareUri = metod.toUpperCase() + ':' + uri

                    let arrOfValidUris = []
                    for (let [key, value] of Object.entries(this.acl[finduser.profile])) {
                        if (value == '*') {
                            arrOfValidUris.push('POST:' + this.api_base_uri + key + '')
                            arrOfValidUris.push('POST:' + this.api_base_uri + key + '/many')
                            arrOfValidUris.push('GET:' + this.api_base_uri + key + '/')
                            arrOfValidUris.push('GET:' + this.api_base_uri + key + '/:id')
                            arrOfValidUris.push('GET:' + this.api_base_uri + key + '/one')
                            arrOfValidUris.push('PUT:' + this.api_base_uri + key + '/find_update_or_create')
                            arrOfValidUris.push('PUT:' + this.api_base_uri + key + '/find_where_and_update')
                            arrOfValidUris.push('PUT:' + this.api_base_uri + key + '/:id')
                            arrOfValidUris.push('DELETE:' + this.api_base_uri + key + '/:id')
                            arrOfValidUris.push('POST:' + this.api_base_uri + key + '/datatable')
                        } else {
                            if (value.createOne) {
                                arrOfValidUris.push('POST:' + this.api_base_uri + key + '')
                            }
                            if (value.createMany) {
                                arrOfValidUris.push('POST:' + this.api_base_uri + key + '/many')
                            }
                            if (value.getMany) {
                                arrOfValidUris.push('GET:' + this.api_base_uri + key + '/')
                            }
                            if (value.getOneById) {
                                arrOfValidUris.push('GET:' + this.api_base_uri + key + '/:id')
                            }
                            if (value.getOneWhere) {
                                arrOfValidUris.push('GET:' + this.api_base_uri + key + '/one')
                            }
                            if (value.findUpdateOrCreate) {
                                arrOfValidUris.push('PUT:' + this.api_base_uri + key + '/find_update_or_create')
                            }
                            if (value.findUpdate) {
                                arrOfValidUris.push('PUT:' + this.api_base_uri + key + '/find_where_and_update')

                            }
                            if (value.updateById) {
                                arrOfValidUris.push('PUT:' + this.api_base_uri + key + '/:id')
                            }
                            if (value.findIdAndDelete) {
                                arrOfValidUris.push('DELETE:' + this.api_base_uri + key + '/:id')
                            }
                            if (value.datatable) {
                                arrOfValidUris.push('POST:' + this.api_base_uri + key + '/datatable')
                            }

                        }

                    }
                    if(arrOfValidUris.includes(compareUri)){
                        next()
                    }

                    res.status(403).json({
                        success: false,
                        code: 403,
                        error: 'Unauthorized',
                        message: '',
                    })

                } else {
                    next();
                    return
                }
                res.status(403).json({
                    success: false,
                    code: 403,
                    error: 'middleware or acl error',
                    message: '',
                })
            } catch (e) {
                console.error(e)
                res.status(403).json({
                    success: false,
                    code: 403,
                    error: e,
                    message: 'middleware or acl error',

                })
            }

        }]

        if (options.middleware && typeof options.middleware == 'function' || Array.isArray(options.middleware)) {
            this.middleware.push(options.middleware)
        }

        this.db_timestamps = false
        if (options.db_timestamps) {
            this.db_timestamps = options.db_timestamps
        }


        this.getExpressInstanceApp = function () {
            return this.app
        }
        this.getMongooseInstanceApp = function () {
            return this.mongoose
        }

        let Schema = this.mongoose.Schema;
        this.schemas_object = {}
        this.models_object = {}
        this.validations_object = {}
        this.populations_object = {}


        this.constructRoutes = function () {
            this.app.get('/', async function (req, res) {
                res.status(200).json({
                    success: true,
                    code: 200,
                    error: '',
                    message: 'APIed Piper has been successful started',
                    container_id: await getId()
                })
            })

            // consturct models and schema objects
            this.ms = new apiato();


            for (let [key, value] of Object.entries(jsonDefinition)) {
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

                this.schemas_object[key] = new Schema(this.schemas_object[key], {timestamps: this.db_timestamps})

                this.models_object[key] = this.mongoose.model(key, this.schemas_object[key]);
                if (!this.populations_object[key]) {
                    delete this.populations_object[key]
                }
            }


            // Routes generator using apiato.js
            for (var [key, value] of Object.entries(jsonDefinition)) {

                this.allowedRoutes[key] = []

                if (value && value.operation && (value.operation.all || value.operation.createOne)) {
                    this.app.post(this.api_base_uri + key, this.middleware, this.ms.createOne(this.models_object[key], this.validations_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
                    this.allowedRoutes[key].push('POST:/-createOne')
                }
                if (value && value.operation && (value.operation.all || value.operation.createMany)) {
                    this.app.post(this.api_base_uri + key + '/many', this.middleware, this.ms.createMany(this.models_object[key], this.validations_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
                    this.allowedRoutes[key].push('POST:/many-createMany')
                }
                if (value && value.operation && (value.operation.all || value.operation.getMany)) {
                    this.app.get(this.api_base_uri + key, this.middleware, this.ms.getMany(this.models_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
                    this.allowedRoutes[key].push('GET:/-getMany')
                }
                if (value && value.operation && (value.operation.all || value.operation.getOneById)) {
                    this.app.get(this.api_base_uri + key + '/:id', this.middleware, this.ms.getOneById(this.models_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
                    this.allowedRoutes[key].push('GET:/<id>-getOneById')
                }
                if (value && value.operation && (value.operation.all || value.operation.getOneWhere)) {
                    this.app.get(this.api_base_uri + key + '/one', this.middleware, this.ms.getOneWhere(this.models_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
                    this.allowedRoutes[key].push('GET:/one-getOneWhere')
                }
                if (value && value.operation && (value.operation.all || value.operation.findUpdateOrCreate)) {
                    this.app.put(this.api_base_uri + key + '/find_update_or_create', this.middleware, this.ms.findUpdateOrCreate(this.models_object[key], this.validations_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
                    this.allowedRoutes[key].push('PUT:/find_update_or_create-findUpdateOrCreate')
                }
                if (value && value.operation && (value.operation.all || value.operation.findUpdate)) {
                    this.app.put(this.api_base_uri + key + '/find_where_and_update', this.middleware, this.ms.findUpdate(this.models_object[key], this.validations_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
                    this.allowedRoutes[key].push('PUT:/find_where_and_update-findUpdate')
                }
                if (value && value.operation && (value.operation.all || value.operation.updateById)) {
                    this.app.put(this.api_base_uri + key + '/:id', this.middleware, this.ms.updateById(this.models_object[key], this.validations_object[key], (this.populations_object[key] ? this.populations_object[key] : false), {}))
                    this.allowedRoutes[key].push('PUT:/<id> - updateById')
                }
                if (value && value.operation && (value.operation.all || value.operation.findIdAndDelete)) {
                    this.app.delete(this.api_base_uri + key + '/:id', this.middleware, this.ms.findIdAndDelete(this.models_object[key], {}))
                    this.allowedRoutes[key].push('DELETE:/<id>-findIdAndDelete')
                }
                if (value && value.operation && (value.operation.all || value.operation.datatable)) {
                    this.app.post(this.api_base_uri + key + '/datatable', this.middleware, this.ms.datatable(this.models_object[key], (this.populations_object[key] ? this.populations_object[key] : false), (value.datatable_search_fields ? value.datatable_search_fields : undefined)))
                    this.allowedRoutes[key].push('POST:/datatable-datatable')
                }

            }

            let registered_routes = this.allowedRoutes

            this.app.get(this.api_base_uri, async function (req, res) {
                res.status(200).json({
                    success: true,
                    code: 200,
                    error: '',
                    message: 'Welcome to the API base Route. Please read the docs https://www.npmjs.com/package/apied-piper. You can use this base url to easy create a basic crud system using CODE-RAG generator, and now you can integrate BigHead-middleware  to complement this project ',
                    data: {registered_routes},
                    container_id: await getId()
                })
            })


        }


        this.activeLoginAndRegister = async function (defaultUser, collection, options_) {
            let user = 'Jared'
            let pass = 'Meinertzhagens-Haversack'
            if (!options_) {
                options_ = {}
            }

            if (defaultUser && defaultUser.user) {
                user = defaultUser.user
            }
            if (defaultUser && defaultUser.pass) {
                pass = defaultUser.pass
            }

            if (!options_?.activeNewUsers) {
                options_.activeNewUsers = false
            }

            if (!options_?.fAfterRegister) {
                options_.fAfterRegister = false
            }
            if (!options_?.durationToken) {
                options_.durationToken = 60
            }

            if (!options_?.passForJwt) {
                options_.passForJwt = 'bachmanityinsanity'
            }

            this.passForJwt = options_.passForJwt

            collection = collection ? collection : 'signature-box'

            let hash = bcrypt.hashSync(pass, saltRounds);

            let userSchema = new Schema({
                user: String,
                pass: String,
                profile: String,
                active: Boolean,
            }, {
                timestamps: true
            });
            let User = this.mongoose.model(collection, userSchema, collection);
            this.internalUser = User

            let user_ = await User.findOne({user: user, profile: 'Admin'})
            if (!user_) {
                console.info('Making default user Admin ' + user + ':' + pass + ' Collection: ' + collection + ' Profile: Admin')
                user_ = new User({
                    user: user,
                    profile: 'Admin',
                    pass: hash,
                    active: true
                })
                await user_.save()
            }

            this.app.post(this.api_base_uri + 'register/:profile', async function (req, res) {
                try {
                    let {user, pass} = req.body
                    let {profile} = req.params

                    let newUser = await User.findOne({user: user, profile: profile})
                    if (!newUser) {
                        hash = bcrypt.hashSync(pass, saltRounds);
                        newUser = new User({
                            user: user,
                            profile: profile,
                            active: options_.activeNewUsers,
                            pass: hash
                        })
                        newUser = await newUser.save()
                    }

                    if (options_.fAfterRegister && typeof options_.fAfterRegister == 'function') {
                        options_.fAfterRegister(newUser)
                    }

                    res.status(200).json({
                        success: false,
                        code: 200,
                        message: 'Register success',
                        data: {user: newUser}
                    })
                } catch (e) {
                    console.error(e)
                    res.status(500).json({
                        success: false,
                        code: 500,
                        error: e,
                        stack: e?.stack,
                        message: 'Internal server error',
                        container_id: await getId()
                    })
                }
            })

            this.app.post(this.api_base_uri + 'login', async function (req, res) {
                try {
                    let {user, pass} = req.body


                    let newUser = await User.findOne({user: user, active: true}).lean()
                    if (!newUser) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            error: 'Login error',
                            message: 'Error login',
                        })
                        return 0
                    }
                    let validate = bcrypt.compareSync(pass, newUser.pass)
                    if (!validate) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            error: 'Login error',
                            message: 'Error login',
                        })
                        return 0
                    }
                    delete newUser.pass
                    let token = jwt.sign({
                        data: newUser,
                        exp: Math.floor(Date.now() / 1000) + (60 * options_.durationToken),
                    }, options.passForJwt);

                    res.status(200).json({
                        success: false,
                        code: 200,
                        message: 'Register success',
                        data: {user: newUser, token: token}
                    })
                } catch (e) {
                    console.error(e)
                    res.status(500).json({
                        success: false,
                        code: 500,
                        error: e,
                        stack: e?.stack,
                        message: 'Internal server error',
                        container_id: await getId()
                    })
                }
            })


        }
        this.start = async function () {
            this.app.get('*', async function (req, res) {
                res.status(404).json({
                    success: false,
                    code: 404,
                    error: 'Resource not found',
                    message: 'APIed Piper has been successful started',
                    container_id: await getId()
                })
            })

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
