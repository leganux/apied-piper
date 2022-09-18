let piedpiper = require('./index')

let definition = {
    category: {
        operation: {
            all: true
        },
        definition: {
            name: {
                type: 'string',
                mandatory: true
            },
            active: {
                type: 'boolean',
                mandatory: true,
                default: false
            },
            key: {
                type: 'number',

            },
        },
        datatable_search_fields: ['name'],
    },
    type: {
        operation: {
            all: true
        },
        definition: {
            name: {
                type: 'string',
                mandatory: true
            },
            active: {
                type: 'boolean',
                mandatory: true,
                default: false
            },
            key: {
                type: 'number',

            },
        },
        datatable_search_fields: ['name'],
    },
    product: {
        operation: {
            all: true
        },
        definition: {
            name: {
                type: 'string',
                mandatory: true
            },
            description: {
                type: 'string',

            },
            count: {
                type: 'number',
                mandatory: true,
                default: 0
            },
            type: {
                type: 'oid',
                rel: 'type'
            },
            category: {
                type: 'oid',
                rel: 'category'
            },
            moreInfo: {
                type: 'any',
            },
        },
        datatable_search_fields: ['name']
    },

}

let acl = {
    Admin: {
        category: '*',
        type: '*',
        product: '*',
    }

}


let custom = [
    {
        path: 'custom/route',
        method: 'GET',
        function: async function (req, res) {
            res.status(200).json({OK: 'ok'})
        },
        middleware: false
    },
]

let microService = new piedpiper(definition, 'mongodb://localhost:27017/test_products', 3000, {
    db_timestamps: true,
    api_base_uri: '/apiv2/',
    acl: acl,
    activeLogRequest: true,
    active_cors: true
})


microService.constructRoutes()
microService.addCustomRoutes(custom)
microService.activeLoginAndRegister({user: 'Erick', email: "admin@adim.com", "pass": '12345'}, 'access',
    {
        activeNewUsers: true,
        customFields: {
            name: {
                type: String,
            },
            last_name: {
                type: String,
            },
            phone: {
                type: String,
            },
            country: {
                type: String,
            },
            state: {
                type: String,
            },
            city: {
                type: String,
            },
            address: {
                type: String,
            },
            no_int: {
                type: Number,
            },
            no_ext: {
                type: String,
            },
            zip_code: {
                type: String,
            },
            born_date: {
                type: Date,
            }

        }

    }
)
microService.publishServerStats()
microService.addHooliLogger(undefined, 'name')
microService.start()
