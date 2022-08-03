let piedpiper = require('./index')

let definition = {
    kindOfClassmate: {
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
                mandatory: true
            },
        },
        datatable_search_fields: ['name'],
    },
    classmate: {
        operation: {
            all: true
        },
        definition: {
            name: {
                type: 'string',
                mandatory: true
            },
            age: {
                type: 'number',
                mandatory: true
            },
            kind: {
                type: 'oid',
                rel: 'kindOfClassmate'
            },
            moreInfo: {
                type: 'any',
            },
        },
        datatable_search_fields: ['name']
    },
    classRoom: {
        operation: {
            createOne: true,
            createMany: true,
            getMany: true,
            getOneById: true,
            getOneWhere: true,
            findUpdateOrCreate: true,
            findUpdate: true,
            updateById: true,
            findIdAndDelete: true,
        },
        definition: {
            name: {
                type: 'string',
                mandatory: true
            },
            description: {
                type: 'string',
                mandatory: true
            },
            isOpen: {
                type: 'boolean',
            },
            position: {
                type: 'number',
            },

            classmates: {
                type: 'array_oid',
                rel: 'classmate'
            }

        }
    }
}

let acl = {
    Admin: {
        kindOfClassmate: '*',
        classmate: '*',
        classRoom: '*',
    },
    User: {
        kindOfClassmate: {
            getMany: true,
            getOneById: true,
            getOneWhere: true,
            findUpdateOrCreate: true,
            findUpdate: true,
            updateById: true,
            findIdAndDelete: true,
            datatable: true,
        },
        classmate: {
            createOne: true,
            createMany: true,
            getMany: true,
            getOneById: true,
            getOneWhere: true,
        },
        classRoom: {
            getMany: true,
            getOneById: true,
            getOneWhere: true,
        },

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

let microService = new piedpiper(definition, 'mongodb://localhost:27017/test_pied', 3000, {
    db_timestamps: true,
    api_base_uri: '/apiv2/',
    acl: acl,
    activeLogRequest: true
})


microService.constructRoutes()
microService.addCustomRoutes(custom)
microService.activeLoginAndRegister(undefined, undefined,
    {
        activeNewUsers: true,

    }
)
microService.start()
