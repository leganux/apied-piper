const fs = require('fs');
const http = require('http');
const https = require('https');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const express = require('express');
const bodyParser = require('body-parser');
const getId = require('docker-container-id');
let apiato = require('apiato');
const morgan = require('morgan');
const moment = require('moment');
let osu = require('node-os-utils')
let hooli = require("hooli-logger-client")
let dataTables = require('mongoose-datatables-fork')
let path = require('path')

const {v4: uuidv4} = require('uuid');

let apied_pipper = function (jsonDefinition, mongoDBUri, port = 3000, options = {}, ssl_config = {}) {

    console.log(`
    v3.1.6
Welcome to 
                                                                                                                         
       db         88888888ba   88                       88            88888888ba   88                                       
      d88b        88      "8b  88                       88            88      "8b  ""                                       
     d8'\`8b       88      ,8P  88                       88            88      ,8P                                           
    d8'  \`8b      88aaaaaa8P'  88   ,adPPYba,   ,adPPYb,88            88aaaaaa8P'  88  8b,dPPYba,    ,adPPYba,  8b,dPPYba,  
   d8YaaaaY8b     88""""""'    88  a8P_____88  a8"    \`Y88  aaaaaaaa  88""""""'    88  88P'    "8a  a8P_____88  88P'   "Y8  
  d8""""""""8b    88           88  8PP"""""""  8b       88  """"""""  88           88  88       d8  8PP"""""""  88          
 d8'        \`8b   88           88  "8b,   ,aa  "8a,   ,d88            88           88  88b,   ,a8"  "8b,   ,aa  88          
d8'          \`8b  88           88   \`"Ybbd8"'   \`"8bbdP"Y8            88           88  88\`YbbdP"'    \`"Ybbd8"'  88          
                                                                                       88                                   
                                                                                       88      
                                                                                                  This is a project made by leganux.net (c) 2021-2022  
                                            ______________________________________
                                Read the docs at https://www.npmjs.com/package/apied-piper
                                
                                                                                                                            
`)
    try {
        this.mongoose = require("mongoose");
        this.nodemailer = {}
        this.transporter = false
        if (!jsonDefinition) {
            throw new Error('You must to add the json definition')
        }
        if (!mongoDBUri) {
            throw new Error('You must to add the mongo db URI')
        }
        this.app = express()
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(bodyParser.json());
        this.credentials = false
        this.allowedRoutes = {}
        this.acl = false
        this.acl_custom = false
        this.schemas_object = {}
        this.validations_object = {}
        this.models_object = {}
        this.populations_object = {}
        this.customRoutes = []
        this.activeLogRequest = false
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
        this.internalUser = {}
        this.internalUserSchema = {}
        this.adminProfileName = "Admin"
        if (options.api_base_uri) {
            this.api_base_uri = options.api_base_uri
        }
        if (options.activeLogRequest) {
            this.activeLogRequest = options.activeLogRequest
        }
        if (options?.active_cors) {
            this.app.use((_req, res, next) => {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
                res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
                res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
                next();
            });
        }
        let ACL_ = false
        if (options.acl && typeof options.acl == 'object') {
            this.acl = options.acl
            ACL_ = this.acl
            console.log('ACL', this.acl)
        }
        if (options.acl_custom && typeof options.acl_custom == 'object') {
            this.acl_custom = options.acl_custom
        }
        let el__ = this
        this.middleware = [async function (req, res, next) {

            try {
                let metod = req.method
                let uri = req.originalUrl
                let compareUri = metod.toUpperCase() + '$' + uri
                let arrOfValidUris = []

                if (ACL_) {
                    console.log('ACL_', ACL_)
                    if (ACL_['*'] || ACL_['PUBLIC']) {
                        let public = ACL_['*'] || ACL_['PUBLIC']
                        console.log('public', public)
                        for (let [key, value] of Object.entries(public)) {

                            if (value.createOne || value == '*') {
                                arrOfValidUris.push('*POST$' + el__.api_base_uri + key + '')
                            }
                            if (value.createMany || value == '*') {
                                arrOfValidUris.push('*POST$' + el__.api_base_uri + key + '/many')
                            }
                            if (value.getMany || value == '*') {
                                arrOfValidUris.push('*GET$' + el__.api_base_uri + key + '')
                            }
                            if (value.getOneById || value == '*') {
                                arrOfValidUris.push('*GET$' + el__.api_base_uri + key + '/:id')
                            }
                            if (value.getOneWhere || value == '*') {
                                arrOfValidUris.push('*GET$' + el__.api_base_uri + key + '/one')
                            }
                            if (value.findUpdateOrCreate || value == '*') {
                                arrOfValidUris.push('*PUT$' + el__.api_base_uri + key + '/find_update_or_create')
                            }
                            if (value.findUpdate || value == '*') {
                                arrOfValidUris.push('*PUT$' + el__.api_base_uri + key + '/find_where_and_update')

                            }
                            if (value.updateById || value == '*') {
                                arrOfValidUris.push('*PUT$' + el__.api_base_uri + key + '/:id')
                            }
                            if (value.findIdAndDelete || value == '*') {
                                arrOfValidUris.push('*DELETE$' + el__.api_base_uri + key + '/:id')
                            }
                            if (value.datatable || value == '*') {
                                arrOfValidUris.push('*POST$' + el__.api_base_uri + key + '/datatable')
                            }
                            if (value.datatable_aggregate || value == '*') {
                                arrOfValidUris.push('*POST$' + el__.api_base_uri + key + '/dt_agr')
                            }
                        }

                        if (compareUri.includes('?')) {
                            compareUri = compareUri.split('?')[0]
                        }
                        if (compareUri.endsWith('/')) {
                            compareUri = compareUri.slice(0, -1)
                        }
                        console.log('ACCESS   ', arrOfValidUris, compareUri)
                        if (arrOfValidUris.includes(compareUri) || arrOfValidUris.includes('*' + compareUri)) {
                            next()
                            return
                        }

                        let oArr = []
                        for (let item of arrOfValidUris) {
                            if (item.includes(':')) {
                                let cUri = compareUri.split('/')
                                let citem = item.split('/')
                                let newer = []

                                for (let i = 0; i < citem.length; i++) {
                                    let ytem = citem[i]
                                    if (ytem.includes(':')) {
                                        newer.push(cUri[i])
                                    } else {
                                        newer.push(ytem)
                                    }
                                }
                                newer = newer.join('/')
                                oArr.push(newer)
                            }
                        }
                        console.log(oArr)
                        if (oArr.includes(compareUri) || oArr.includes('*' + compareUri)) {
                            next()
                            return
                        }

                    }

                    /*si hay session*/
                    arrOfValidUris = []
                    let token = req?.headers?.authorization
                    if (token?.includes('Bearer')) {
                        token = token.replace('Bearer', '')
                    }
                    token = token?.trim() || ''

                    if (!token || token == '' || token == 'NONE') {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            type: 1,
                            error: 'No token present',
                            message: '',
                        })
                        return;
                    }
                    console.log('token', token)

                    let decoded = jwt.verify(token, el__.JWTPASSWORD);
                    if (!decoded) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            type: 1,
                            error: 'Access error',
                            message: '',
                        })
                        return;
                    }
                    let finduser = await el__.internalUser.findOne({
                        user: decoded.data.user,
                        profile: decoded.data.profile,
                        active: true
                    })
                    if (!finduser) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            type: 1,
                            error: 'Access error',
                            message: '',
                        })
                        return;
                    }
                    if (!ACL_ || !ACL_[finduser.profile]) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            type: 1,
                            error: 'Access error x',
                            message: '',
                        })
                        return;
                    }

                    for (let [key, value] of Object.entries(ACL_[finduser.profile])) {
                        if (value == '*') {
                            arrOfValidUris.push('POST$' + el__.api_base_uri + key + '')
                            arrOfValidUris.push('POST$' + el__.api_base_uri + key + '/many')
                            arrOfValidUris.push('GET$' + el__.api_base_uri + key + '')
                            arrOfValidUris.push('GET$' + el__.api_base_uri + key + '/:id')
                            arrOfValidUris.push('GET$' + el__.api_base_uri + key + '/one')
                            arrOfValidUris.push('PUT$' + el__.api_base_uri + key + '/find_update_or_create')
                            arrOfValidUris.push('PUT$' + el__.api_base_uri + key + '/find_where_and_update')
                            arrOfValidUris.push('PUT$' + el__.api_base_uri + key + '/:id')
                            arrOfValidUris.push('DELETE$' + el__.api_base_uri + key + '/:id')
                            arrOfValidUris.push('POST$' + el__.api_base_uri + key + '/datatable')
                            arrOfValidUris.push('POST$' + el__.api_base_uri + key + '/dt_agr')
                        } else {
                            if (value.createOne) {
                                arrOfValidUris.push('POST$' + el__.api_base_uri + key + '')
                            }
                            if (value.createMany) {
                                arrOfValidUris.push('POST$' + el__.api_base_uri + key + '/many')
                            }
                            if (value.getMany) {
                                arrOfValidUris.push('GET$' + el__.api_base_uri + key + '')
                            }
                            if (value.getOneById) {
                                arrOfValidUris.push('GET$' + el__.api_base_uri + key + '/:id')
                            }
                            if (value.getOneWhere) {
                                arrOfValidUris.push('GET$' + el__.api_base_uri + key + '/one')
                            }
                            if (value.findUpdateOrCreate) {
                                arrOfValidUris.push('PUT$' + el__.api_base_uri + key + '/find_update_or_create')
                            }
                            if (value.findUpdate) {
                                arrOfValidUris.push('PUT$' + el__.api_base_uri + key + '/find_where_and_update')

                            }
                            if (value.updateById) {
                                arrOfValidUris.push('PUT$' + el__.api_base_uri + key + '/:id')
                            }
                            if (value.findIdAndDelete) {
                                arrOfValidUris.push('DELETE$' + el__.api_base_uri + key + '/:id')
                            }
                            if (value.datatable) {
                                arrOfValidUris.push('POST$' + el__.api_base_uri + key + '/datatable')
                            }
                            if (value.datatable_aggregate) {
                                arrOfValidUris.push('POST$' + el__.api_base_uri + key + '/dt_agr')
                            }
                        }
                    }
                    //crea el mapa de verificación para las custom URL
                    if (el__.acl_custom && Array.isArray(el__.acl_custom)) {
                        for (let item of el__.acl_custom[finduser.profile]) {
                            if (item.path && item.method) {
                                arrOfValidUris.push(item.method.toUpperCase() + '$' + el__.api_base_uri + item.path)
                            }
                        }
                    }

                    if (compareUri.includes('?')) {
                        compareUri = compareUri.split('?')[0]
                    }
                    if (compareUri.endsWith('/')) {
                        compareUri = compareUri.slice(0, -1)
                    }
                    console.log('ACCESS   ', arrOfValidUris, compareUri)
                    if (arrOfValidUris.includes(compareUri) || arrOfValidUris.includes('*' + compareUri)) {
                        next()
                        return
                    }
                    let oArr = []
                    for (let item of arrOfValidUris) {
                        if (item.includes(':')) {
                            let cUri = compareUri.split('/')
                            let citem = item.split('/')
                            let newer = []

                            for (let i = 0; i < citem.length; i++) {
                                let ytem = citem[i]
                                if (ytem.includes(':')) {
                                    newer.push(cUri[i])
                                } else {
                                    newer.push(ytem)
                                }
                            }
                            newer = newer.join('/')
                            oArr.push(newer)
                        }
                    }

                    if (oArr.includes(compareUri) || oArr.includes('*' + compareUri)) {
                        next()
                        return
                    }
                    res.status(403).json({
                        success: false,
                        code: 403,
                        error: 'Unauthorized',
                        type: 2,
                        message: '',
                    })
                    return
                } else {
                    next();
                    return
                }
            } catch (e) {
                console.error(e)
                res.status(403).json({
                    success: false,
                    code: 403,
                    error: e,
                    message: 'middleware or acl error',

                })
                return
            }
        }]


        if (options.middleware && typeof options.middleware == 'function') {
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
            return {
                mongooseInstance: this.mongoose,
                schema: this.schemas_object,
                model: this.models_object
            }
        }
        let Schema = this.mongoose.Schema;
        this.schemas_object = {}
        this.models_object = {}
        this.validations_object = {}
        this.populations_object = {}
        this.JWTPASSWORD = ''
        this.constructRoutes = function () {
            let el = this
            if (el.activeLogRequest) {
                el.app.use(morgan(function (tokens, req, res) {
                    return [
                        moment().format('YYYY-MM-DD hh:mm:ss'),
                        tokens.method(req, res),
                        tokens.url(req, res),
                        tokens.status(req, res),
                        tokens['response-time'](req, res), 'ms'
                    ].join('  ');
                }))
            }
            el.app.get('/', async function (_req, res) {
                res.status(200).json({
                    success: true,
                    code: 200,
                    error: '',
                    message: 'APIed Piper has been successful started',
                    container_id: await getId()
                })
            })
            // consturct models and schema objects
            el.ms = new apiato();
            for (let [key1, value1] of Object.entries(jsonDefinition)) {
                if (!value1 || !value1.definition || !value1.operation) {
                    throw new Error('There are a missing parameter in definition object')
                }
                // run the definition objectss


                el.schemas_object[key1] = {}
                el.validations_object[key1] = {}
                el.models_object[key1] = {}
                el.populations_object[key1] = {}


                for (var [key_, value_] of Object.entries(value1.definition)) {
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
                            cadValidation = cadValidation + 'string'
                            break;
                        case 'number':
                            cadValidation = cadValidation + 'number'
                            break;
                        case 'boolean':
                            cadValidation = cadValidation + 'boolean'
                            break;
                        case 'date':
                            cadValidation = cadValidation + 'date'
                            break;
                        case 'oid':
                            if (value_.rel == '_ACL_') {
                                this.populations_object[key1][key_] = el.internalUser
                            } else {
                                this.populations_object[key1][key_] = this.models_object[value_.rel]
                            }
                            break;
                        case 'array_oid':
                            cadValidation = cadValidation + 'array'
                            if (value_.rel == '_ACL_') {
                                this.populations_object[key1][key_] = el.internalUser
                            } else {
                                this.populations_object[key1][key_] = this.models_object[value_.rel]
                            }
                            break;
                        default:
                            break;
                    }
                    cadValidation = cadValidation + (value_.mandatory && !value_.default_function ? ',mandatory' : '')
                    el.validations_object[key1][key_] = cadValidation

                    let realReference = (value_.rel && el.models_object[value_.rel] ? el.models_object[value_.rel] : undefined)

                    if (value_.rel == '_ACL_') {
                        realReference = el.internalUser
                    }

                    if (value_.type.toLowerCase().includes('array')) {
                        el.schemas_object[key1][key_] = [{
                            type: type,
                            required: value_.mandatory ? value_.mandatory : false,
                            default: value_.default_function ? value_.default_function() : undefined,
                            ref: realReference,
                        }]
                    } else {
                        el.schemas_object[key1][key_] = {
                            type: type,
                            required: value_.mandatory ? value_.mandatory : false,
                            default: value_.default_function ? value_.default_function() : undefined,
                            ref: realReference,
                        }
                        if (!el.schemas_object[key1][key_].ref) {
                            delete el.schemas_object[key1][key_].ref
                        }
                    }
                }

                el.schemas_object[key1] = new Schema(el.schemas_object[key1], {timestamps: el.db_timestamps})
                el.schemas_object[key1].plugin(dataTables)
                el.models_object[key1] = el.mongoose.model(key1, el.schemas_object[key1]);


                if (!el.populations_object[key1]) {
                    delete el.populations_object[key1]
                }
            }

            for (var [key, value] of Object.entries(jsonDefinition)) {
                el.allowedRoutes[key] = []
                if (value && value.operation && (value.operation.all || value.operation.createOne)) {
                    el.app.post(el.api_base_uri + key, el.middleware, el.ms.createOne(el.models_object[key], el.validations_object[key], (el.populations_object[key] ? el.populations_object[key] : false), {}))
                    el.allowedRoutes[key].push('POST:/-createOne')
                }
                if (value && value.operation && (value.operation.all || value.operation.createMany)) {
                    el.app.post(el.api_base_uri + key + '/many', el.middleware, el.ms.createMany(el.models_object[key], el.validations_object[key], (el.populations_object[key] ? el.populations_object[key] : false), {}))
                    el.allowedRoutes[key].push('POST:/many-createMany')
                }
                if (value && value.operation && (value.operation.all || value.operation.getMany)) {
                    el.app.get(el.api_base_uri + key, el.middleware, el.ms.getMany(el.models_object[key], (el.populations_object[key] ? el.populations_object[key] : false), {}))
                    el.allowedRoutes[key].push('GET:/-getMany')
                }

                if (value && value.operation && (value.operation.all || value.operation.getOneWhere)) {
                    el.app.get(el.api_base_uri + key + '/one', el.middleware, el.ms.getOneWhere(el.models_object[key], (el.populations_object[key] ? el.populations_object[key] : false), {}))
                    el.allowedRoutes[key].push('GET:/one-getOneWhere')
                }
                if (value && value.operation && (value.operation.all || value.operation.findUpdateOrCreate)) {
                    el.app.put(el.api_base_uri + key + '/find_update_or_create', el.middleware, el.ms.findUpdateOrCreate(el.models_object[key], el.validations_object[key], (el.populations_object[key] ? el.populations_object[key] : false), {}))
                    el.allowedRoutes[key].push('PUT:/find_update_or_create-findUpdateOrCreate')
                }
                if (value && value.operation && (value.operation.all || value.operation.findUpdate)) {
                    el.app.put(el.api_base_uri + key + '/find_where_and_update', el.middleware, el.ms.findUpdate(el.models_object[key], el.validations_object[key], (el.populations_object[key] ? el.populations_object[key] : false), {}))
                    el.allowedRoutes[key].push('PUT:/find_where_and_update-findUpdate')
                }

                if (value && value.operation && (value.operation.all || value.operation.datatable)) {
                    el.app.post(el.api_base_uri + key + '/datatable', el.middleware, el.ms.datatable(el.models_object[key], (el.populations_object[key] ? el.populations_object[key] : false), (value.datatable_search_fields ? value.datatable_search_fields : undefined)))
                    el.allowedRoutes[key].push('POST:/datatable-datatable')
                }
                if (value && value.operation && (value.operation.all || value.operation.datatable_aggregate)) {
                    el.app.post(el.api_base_uri + key + '/dt_agr', el.middleware, el.ms.datatable_aggregate(el.models_object[key],[], (value.datatable_search_fields ? value.datatable_search_fields : undefined)))
                    el.allowedRoutes[key].push('POST:/dt_agr')
                }
                if (value && value.operation && (value.operation.all || value.operation.updateById)) {
                    el.app.put(el.api_base_uri + key + '/:id', el.middleware, el.ms.updateById(el.models_object[key], el.validations_object[key], (el.populations_object[key] ? el.populations_object[key] : false), {}))
                    el.allowedRoutes[key].push('PUT:/<id> - updateById')
                }
                if (value && value.operation && (value.operation.all || value.operation.findIdAndDelete)) {
                    el.app.delete(el.api_base_uri + key + '/:id', el.middleware, el.ms.findIdAndDelete(el.models_object[key], {}))
                    el.allowedRoutes[key].push('DELETE:/<id>-findIdAndDelete')
                }
                if (value && value.operation && (value.operation.all || value.operation.getOneById)) {
                    el.app.get(el.api_base_uri + key + '/:id', el.middleware, el.ms.getOneById(el.models_object[key], (el.populations_object[key] ? el.populations_object[key] : false), {}))
                    el.allowedRoutes[key].push('GET:/<id>-getOneById')
                }
            }

// ACL ROUTES
            let key_ACL = '_ACL_'
            el.allowedRoutes[key_ACL] = []

            el.app.post(el.api_base_uri + key_ACL, el.middleware, el.ms.createOne(el.internalUser, {}, {}))
            el.allowedRoutes[key_ACL].push('POST:/-createOne')


            el.app.post(el.api_base_uri + key_ACL + '/many', el.middleware, el.ms.createMany(el.internalUser, {}, {}))
            el.allowedRoutes[key_ACL].push('POST:/many-createMany')


            el.app.get(el.api_base_uri + key_ACL, el.middleware, el.ms.getMany(el.internalUser, {}))
            el.allowedRoutes[key_ACL].push('GET:/-getMany')


            el.app.get(el.api_base_uri + key_ACL + '/:id', el.middleware, el.ms.getOneById(el.internalUser, {}))
            el.allowedRoutes[key_ACL].push('GET:/<id>-getOneById')


            el.app.get(el.api_base_uri + key_ACL + '/one', el.middleware, el.ms.getOneWhere(el.internalUser, {},))
            el.allowedRoutes[key_ACL].push('GET:/one-getOneWhere')


            el.app.put(el.api_base_uri + key_ACL + '/find_update_or_create', el.middleware, el.ms.findUpdateOrCreate(el.internalUser, {}, {}))
            el.allowedRoutes[key_ACL].push('PUT:/find_update_or_create-findUpdateOrCreate')


            el.app.put(el.api_base_uri + key_ACL + '/find_where_and_update', el.middleware, el.ms.findUpdate(el.internalUser, {}, {}))
            el.allowedRoutes[key_ACL].push('PUT:/find_where_and_update-findUpdate')


            el.app.put(el.api_base_uri + key_ACL + '/:id', el.middleware, el.ms.updateById(el.internalUser, {}, {}))
            el.allowedRoutes[key_ACL].push('PUT:/<id> - updateById')


            el.app.delete(el.api_base_uri + key_ACL + '/:id', el.middleware, el.ms.findIdAndDelete(el.internalUser, {}))
            el.allowedRoutes[key_ACL].push('DELETE:/<id>-findIdAndDelete')


            el.app.post(el.api_base_uri + key_ACL + '/datatable', el.middleware, el.ms.datatable(el.internalUser, {}, 'name,mail'))
            el.allowedRoutes[key_ACL].push('POST:/datatable-datatable')

            el.app.post(el.api_base_uri + key_ACL + '/dt_agr', el.middleware, el.ms.datatable_aggregate(el.internalUser, [], 'name,mail'))
            el.allowedRoutes[key_ACL].push('POST:/dt_agr')


            let registered_routes = el.allowedRoutes
            el.app.get(el.api_base_uri, async function (_req, res) {
                res.status(200).json({
                    success: true,
                    code: 200,
                    error: '',
                    message: 'APIED-PIPPER API base Route. Please read the docs https://www.npmjs.com/package/apied-piper. You can easy create consume this API using CODE-RAG-SDK ',
                    data: {},
                    container_id: await getId()
                })
            })
            el.app.post(el.api_base_uri, async function (_req, res) {
                let data = {}
                data = {
                    routes: registered_routes,
                    acl: el.acl
                }
                res.status(200).json({
                    success: true,
                    code: 200,
                    error: '',
                    message: 'Apied-pipper API base Route. Please read the docs https://www.npmjs.com/package/apied-piper. You can easy create consume this API using CODE-RAG-SDK ',
                    data: data,
                    container_id: await getId()
                })
            })

        }
        this.addCustomRoutes = async function (custom = [], middleware) {
            let el = this
            el.customRoutes = custom
            let tempMiddleware = async function (_req, _res, next) {
                next()
            }
            if (middleware && typeof middleware == 'function') {
                el.middleware.push(middleware)
            }
            for (let route of el.customRoutes) {
                if (route.path && route.method && (route.function && typeof route.function == 'function')) {
                    let midd = tempMiddleware
                    if (route.middleware === true) {
                        midd = el.middleware
                    }
                    switch (route.method.toUpperCase()) {
                        case 'POST' :
                            el.app.post(el.api_base_uri + route.path, midd, route.function)
                            break;
                        case 'GET' :
                            el.app.get(el.api_base_uri + route.path, midd, route.function)
                            break;
                        case 'PUT' :
                            el.app.put(el.api_base_uri + route.path, midd, route.function)
                            break;
                        case 'DELETE' :
                            el.app.delete(el.api_base_uri + route.path, midd, route.function)
                            break;
                        case 'PATCH' :
                            el.app.patch(el.api_base_uri + route.path, midd, route.function)
                            break;
                        case 'OPTIONS' :
                            el.app.options(el.api_base_uri + route.path, midd, route.function)
                            break;
                    }
                }
            }
        }
        this.configureMailer = async function (transportConfig = {}, nodemailer) {
            let el = this
            if (!nodemailer) {
                el.nodemailer = require("nodemailer");
            }

            try {
                el.transporter = this.nodemailer.createTransport(transportConfig)
                let resp = el.transporter.verify()
                return {verify: resp, transporter: el.transporter}
            } catch (e) {
                console.error('An error occurred trying to connect mail', e)
                throw e
            }

        }
        this.sendMail = async function (message = {}) {

            if (!message) {
                message = {
                    from: "sender@server.com",
                    to: "apied-piper@leganux.com",
                    subject: "Default mail from Apied Piper",
                    html: "<p>Default mail from Apied Piper</p>",
                    attachments: [
                        {
                            filename: 'text3.txt',
                            path: '/path/to/file.txt'
                        }

                    ]
                }

                console.error('A message object is mandatory')
                throw  new Error('A message object is mandatory' + JSON.stringify(message))
                return

            }
            let el = this
            if (!el.transporter) {
                console.error("You must to define transporter first")
                throw  new Error('You must to configure mail')
                return
            }
            try {

                return await el.transporter.sendMail(message)
            } catch (e) {
                console.error('We can´t send mail')
                return false
            }


        }
        this.activeLoginAndRegister = async function (defaultUser = {}, collection = 'signature-box', options_ = {}) {
            let el = this
            let user = 'Jared'
            let email = 'Jared@piedpiper.com'
            let JWTPASSWORD = 'bachmanityinsanity'

            let pass = 'Meinertzhagens-Haversack'
            if (options_.adminProfileName) {
                el.adminProfileName = options_.adminProfileName
            }
            if (defaultUser && defaultUser.user) {
                user = defaultUser.user
            }
            if (defaultUser && defaultUser.email) {
                email = defaultUser.email
            }
            if (defaultUser && defaultUser.pass) {
                pass = defaultUser.pass
            }

            if (!options_?.sendConfirmMail) {
                options_.sendConfirmMail = false
            }
            if (!options_?.fAfterRegister) {
                options_.fAfterRegister = false
            }
            if (!options_?.durationToken) {
                options_.durationToken = 60
            }
            if (options_?.JWTPASSWORD && options_?.JWTPASSWORD !== '') {
                JWTPASSWORD = options_.JWTPASSWORD
            }

            let definition_user_acl = {
                user: {type: String, required: true, unique: true},
                pass: {type: String, required: true, select: false},
                email: {type: String, required: true, unique: true},
                profile: {type: String, required: true},
                active: {type: Boolean, default: false},
                token_code: {type: String, default: false, select: false},
                active_code: {type: String, default: false, select: false},
                active_date: {type: Date, default: Date.now(), select: false},
            }
            if (options_?.customFields && typeof options_.customFields == 'object') {
                for (let [key, val] of Object.entries(options_.customFields)) {
                    definition_user_acl[key] = val
                }
            }

            el.JWTPASSWORD = JWTPASSWORD

            let hash = bcrypt.hashSync(pass, saltRounds);
            let userSchema = new Schema(definition_user_acl, {
                timestamps: true
            });

            userSchema.plugin(dataTables)
            let User = this.mongoose.model(collection, userSchema, collection);

            el.internalUser = User
            el.internalUserSchema = userSchema
            let user_ = await User.findOne({
                user: user,
                profile: el.adminProfileName
            })
            if (!user_) {
                console.info('Making default user   ' + user + ':' + pass + ' with mail : ' + email + ' Collection: ' + collection + ' Profile: ' + el.adminProfileName)
                user_ = new User({
                    user: user,
                    email: email,
                    profile: el.adminProfileName,
                    pass: hash,
                    active: true
                })
                await user_.save()
            }

            this.app.get(this.api_base_uri + 'activate/:uid', async function (req, res) {
                try {
                    let {x, z} = req.query
                    let {uid} = req.params
                    let findUser = await el.internalUser.findOne({active_code: x})
                        .select({
                            active_code: 1,
                            active_date: 1,
                        })
                    if (!findUser || z !== String(findUser._id)) {
                        res.status(404).send('<center>' +
                            (options_.message_used_link || '<h1>This code has been used or is invalid </h1>') +
                            '</center>')
                        return
                    }

                    let a = moment(findUser.active_date)
                    let b = moment()
                    let diff = a.diff(b, 'minutes')
                    if (Math.abs(diff) > 5) {
                        res.status(404).send('<center>' +
                            (options_.message_expired_link || '<h1>This code has been expired </h1>') +
                            '</center>')
                        return
                    }
                    findUser.active_date = moment()
                    findUser.active_code = uuidv4()
                    findUser.active = true
                    findUser = await findUser.save()
                    res.status(200).send('<center>' +
                        (options_.message_active_ok || '<h1>Activation success </h1>') +
                        '</center>')
                } catch (e) {
                    console.error(e)
                    res.status(500).send('<center>' +
                        (options_.message_error_link || '<h1>Were sorry but has been occurred an error, please contact the admin</h1>') +
                        '</center>')
                }
            })
            this.app.post(this.api_base_uri + 'forgotPassword', async function (req, res) {

                try {

                    if (!options_?.sendResetPasswordMail) {

                        res.status(500).json({
                            success: false,
                            code: 500,
                            error: 'Mail not configured, contact the adminitrator',
                            message: 'Mail not configured, contact the adminitrator',
                            container_id: await getId()
                        })
                        return
                    }

                    let {email} = req.body
                    let findUser = await el.internalUser.findOne({email: email})

                    if (!findUser) {
                        res.status(404).json({
                            success: false,
                            code: 404,
                            error: 'User not found',
                            message: 'User not found',
                            container_id: await getId()
                        })
                        return
                    }


                    findUser.active_date = moment()
                    findUser.active_code = uuidv4()

                    findUser = await findUser.save()

                    let activation_link = req.protocol + '://' + req.get('host') + el.api_base_uri + 'new_password/' + uuidv4() + '?x=' + findUser.active_code + '&w=' + uuidv4() + Math.random() + '&type=public'

                    await el.sendMail({
                        from: options_?.sendResetPasswordMail?.from || 'password@apied-pipperjs.com',
                        to: email,
                        subject: options_?.sendResetPasswordMail?.subject || "Reset your password",
                        html: options_?.sendResetPasswordMail?.html.replace(/{{link}}/g, activation_link) || "Please change ypur paswword in the next link: <br> <a href='{{link}}'>{{link}}</a>".replace(/{{link}}/g, activation_link),
                    })


                    res.status(200).json({
                        success: true,
                        code: 200,
                        message: 'Send Email correct',
                        data: {}
                    })

                } catch (e) {
                    console.error(e)
                    res.status(500).send('<center>' +
                        (options_.message_error_link || '<h1>Were sorry but has been occurred an error, please contact the admin</h1>') +
                        '</center>')
                }

            })
            this.app.get(this.api_base_uri + 'new_password/:uid', async function (req, res) {

                try {
                    let {x} = req.query
                    let findUser = await el.internalUser.findOne({active_code: x})
                        .select({
                            active_code: 1,
                            active_date: 1,
                            token_code: 1,
                            email: 1,
                            pass: 1,
                        })

                    if (!findUser) {
                        res.status(404).send('<center>' +
                            (options_.message_not_user_found || '<h1>This user was not found</h1>') +
                            '</center>')
                        return
                    }

                    let a = moment(findUser.active_date)
                    let b = moment()

                    let diff = a.diff(b, 'minutes')

                    let file = 'mailReset.html'

                    if (options_.html_change_password) {
                        file = path.join(options_.html_change_password)
                    } else {
                        file = path.join(__dirname, file)
                    }
                    let data = fs.readFileSync(file, 'utf8');

                    if (Math.abs(diff) > 5) {
                        res.status(404).send('<center>' +
                            (options_.message_expired_link || '<h1>This code has been expired </h1>') +
                            '</center>')
                        return
                    }

                    findUser.active_date = moment()
                    let cod = uuidv4()
                    findUser.active_code = cod

                    findUser = await findUser.save()
                    findUser = await el.internalUser.findById(findUser._id)


                    data = data.replace('___MAIL___', findUser.email)
                    data = data.replace('___CODE___', cod)

                    res.status(200).send(data)

                } catch (e) {
                    console.error(e)
                    res.status(500).send('<center>' +
                        (options_.message_error_link || '<h1>Were sorry but has been occurred an error, please contact the admin</h1>') +
                        '</center>')
                }

            })
            this.app.post(this.api_base_uri + 'new_password/:uid', async function (req, res) {

                try {
                    let {email, password, password2, code} = req.body
                    if (password2 !== password) {
                        res.status(200).json({
                            success: false,
                            error: "Passwords doesn´t match ",
                            message: "Passwords doesn´t match "

                        })
                        return
                    }

                    let findUser = await el.internalUser.findOne({active_code: code, email})
                        .select({
                            active_code: 1,
                            active_date: 1,
                            token_code: 1,
                            email: 1,
                            pass: 1,
                        })
                    console.log(findUser)
                    if (!findUser) {
                        res.status(200).json({
                            success: false,
                            error: "We can't change password",
                            message: "We can't change password"

                        })
                        return
                    }

                    let a = moment(findUser.active_date)
                    let b = moment()
                    let diff = a.diff(b, 'minutes')
                    if (Math.abs(diff) > 5) {
                        res.status(200).json({
                            success: false,
                            error: "Change password expired",
                            message: "Change password expired"

                        })
                        return
                    }

                    findUser.active_date = moment()
                    findUser.active_code = uuidv4()

                    hash = bcrypt.hashSync(password, saltRounds);

                    findUser.pass = hash
                    findUser = await findUser.save()

                    res.status(200).json({
                        success: true,
                        message: "User updated"

                    })
                    return

                } catch (e) {
                    console.error(e)
                    res.status(500).send('<center>' +
                        (options_.message_error_link || '<h1>Were sorry but has been occurred an error, please contact the admin</h1>') +
                        '</center>')
                }

            })
            this.app.post(this.api_base_uri + 'register/:profile', async function (req, res) {
                try {
                    let user__ = req.body.user
                    let pass__ = req.body.pass
                    let email__ = req.body.email
                    let {profile} = req.params
                    let body = req.body
                    let newUser = await User.findOne({
                        $or: [
                            {user: user__},
                            {email: email__}
                        ],
                        profile: profile
                    })
                    if (newUser) {
                        res.status(200).json({
                            success: true,
                            code: 200,
                            message: 'User or email already exists',
                        })
                        return
                    }
                    if (!newUser) {
                        hash = bcrypt.hashSync(pass__, saltRounds);
                        newUser = new User({
                            user: user__,
                            email: email__,
                            profile: profile,
                            active: false,
                            pass: hash,
                            active_code: uuidv4(),
                            active_date: moment()
                        })

                    }

                    delete body.pass
                    delete body.email
                    delete body.user

                    for (let [key, val] of Object.entries(body)) {
                        newUser[key] = val
                    }

                    newUser = await newUser.save()

                    if (options_?.fAfterRegister && typeof options_.fAfterRegister == 'function') {
                        newUser = await options_.fAfterRegister(newUser)
                    }


                    if (options_?.sendConfirmMail) {

                        let activation_link = req.protocol + '://' + req.get('host') + el.api_base_uri + 'activate/' + uuidv4() + '?x=' + newUser.active_code + '&w=' + uuidv4() + Math.random() + '&z=' + newUser._id + '&type=public'


                        await el.sendMail({
                            from: options_?.sendConfirmMail?.from || 'activate@apied-pipperjs.com',
                            to: email__,
                            subject: options_?.sendConfirmMail?.subject || "Please activate account",
                            html: options_?.sendConfirmMail?.html.replace(/{{link}}/g, activation_link) || "Please activate account, open next link: <br> <a href='{{link}}'>{{link}}</a>".replace(/{{link}}/g, activation_link),
                        })

                    }


                    res.status(200).json({
                        success: true,
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
                    let user__ = req.body.user
                    let pass__ = req.body.pass
                    let newUser = await el.internalUser.findOne({
                        $or: [
                            {
                                user: user__
                            },
                            {
                                email: user__

                            }],
                        active: true
                    }).select({
                        active_code: 1,
                        pass: 1,
                    })

                    if (!newUser) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            error: 'Login error',
                            message: 'Error login',
                        })
                        return 0
                    }
                    let validate = bcrypt.compareSync(pass__, newUser.pass)
                    if (!validate) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            error: 'Login error',
                            message: 'Error login',
                        })
                        return 0
                    }
                    newUser.token_code = uuidv4();
                    newUser = await newUser.save()

                    newUser = await el.internalUser.findById(newUser._id).lean()
                    newUser = JSON.parse(JSON.stringify(newUser))


                    let token = await jwt.sign({
                        exp: Math.floor(Date.now() / 1000) + (60 * options_.durationToken),
                        data: newUser
                    }, JWTPASSWORD);

                    res.status(200).json({
                        success: true,
                        code: 200,
                        message: 'Login success',
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
            this.app.post(this.api_base_uri + 'verify', async function (req, res) {
                try {
                    let token = req.body.token

                    let tokenData = await jwt.verify(token, JWTPASSWORD);

                    let elUser = await User.findOne({
                        user: tokenData.user,
                        active: true,
                        token_code: tokenData.token_code,
                        profile: tokenData.profile
                    }).lean()

                    if (!elUser) {
                        res.status(403).json({
                            success: false,
                            code: 403,
                            error: 'Login error',
                            message: 'Error login',
                        })
                        return 0
                    }

                    delete tokenData.token_code
                    res.status(200).json({
                        success: true,
                        code: 200,
                        message: 'Login success',
                        data: {user: tokenData, token: token}
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

            return {
                Schema_: userSchema,
                Model_: User,

            }
        }
        this.addHooliLogger = async function (host = "http://localhost:3333", AppName = 'APIed-Piper') {
            let el = this
            let logger = new hooli(host, AppName, await getId() || 'API-REST')
            const _privateLog = console.log;
            const _privateError = console.error;
            const _privateInfo = console.info;
            const _privateWarn = console.warn;
            const _privateDebug = console.debug;

            console.log = async function (message) {
                _privateLog.apply(console, arguments);
                logger.log(arguments)
            };
            console.error = async function (message) {
                _privateError.apply(console, arguments);
                logger.error(arguments)
            };
            console.info = async function (message) {
                _privateInfo.apply(console, arguments);
                logger.info(arguments)
            };
            console.warn = async function (message) {
                _privateWarn.apply(console, arguments);
                logger.warn(arguments)
            };
            console.debug = async function (message) {
                _privateDebug.apply(console, arguments);
                logger.debug(arguments)
            };
            el.app.use(morgan(function (tokens, req, res) {
                /*  Implement request logger  */
                logger.request(JSON.stringify({
                    method: tokens.method(req, res),
                    url: tokens.url(req, res),
                    status: tokens.status(req, res),
                    body: req.body,
                    query: req.query,
                    params: req.params,
                }))
                return '';
            }));
        }
        this.publishServerStats = async function () {
            let el = this
            let {cpu, drive, osCmd, mem, netstat, os} = osu
            el.app.get(el.api_base_uri + 'STATS', async function (_req, res) {
                try {
                    let obj_counts = []
                    for (let [key, value] of Object.entries(el.models_object)) {
                        obj_counts.push({
                            name: key,
                            count: await value.count()
                        })
                    }
                    res.status(200).json({
                        success: true,
                        code: 200,
                        error: '',
                        message: 'APIed-Piper server statistics',
                        data: {
                            model_counts: obj_counts,
                            cpu_usage: await cpu.usage(),
                            cpu_average: await cpu.average(),
                            cpu_free: await cpu.free(),
                            cpu_count: await cpu.count(),
                            osCmd_whoami: await osCmd.whoami(),
                            drive_info: await drive.info(),
                            drive_free: await drive.free(),
                            drive_used: await drive.used(),
                            mem_used: await mem.used(),
                            mem_free: await mem.free(),

                            netstat_inout: await netstat.inOut(),
                            os_info: await os.oos(),
                            os_uptime: await os.uptime(),
                            os_platform: await os.platform(),
                            os_ip: await os.ip(),
                            os_hostname: await os.hostname(),
                            os_arch: await os.arch(),
                        },
                        container_id: await getId()
                    })
                } catch (e) {
                    console.error(e)
                    res.status(500).json({
                        success: false,
                        code: 500,
                        error: 'Internal server error',
                        message: e.message,
                    })
                }
            })
        }
        this.start = async function () {
            /*this.app.get('*', async function (_req, res) {
                res.status(404).json({
                    success: false,
                    code: 404,
                    error: 'Resource not found',
                    message: 'APIed Piper has been successful started',
                    container_id: await getId()
                })
            })*/
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
        console.error(e)
        throw e
    }
}
module.exports = apied_pipper
