const errorHandler = function (err, req, res, next) {
    
    if (err.name === 'ValidationError'){
        const errors = err.errors
        var errorMessage = []
        console.log(errors)
        for (var key in errors){
            errorMessage.push(key + ' ' + errors[key].message)
        }

        const string = errorMessage.join(', ')
        res.status(422).send({code : 422, message : string})
    }else{
        const code = err.statusCode ? err.statusCode : 500
        res.status(code).send({code, message : err.message})
    }
}

module.exports = errorHandler
