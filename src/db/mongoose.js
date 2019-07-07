const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
}, (error) => {
    if (error){
        console.log('Connection Error: ' + error)
    }
})

