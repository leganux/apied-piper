let piedpiper = require('./index')

let dateFunction = function () {
    return new Date()
}

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
            createdAt: {
                type: 'date',
                mandatory: true,
                default_function: dateFunction
            },
        }
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
        }
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
            createdAt: {
                type: 'date',
                mandatory: true,
                default_function: dateFunction
            },
            classmates: {
                type: 'array_oid',
                rel: 'classmate'
            }

        }
    }
}


let microService = new piedpiper(definition, 'mongodb://localhost:27017/piedpipper', 3000)
microService.start()
