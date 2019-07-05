const mongoose = require('mongoose')

const retryConnect = () => {
    mongoose.connect('mongodb://127.0.0.1:27017/Memory', {
        useNewUrlParser : true,
        useCreateIndex : true,
        useFindAndModify : false
    }, (error) => {
        if (error){
            console.log('Connection Error: ' + error)
            setTimeout(retryConnect, 5000)
        }
    })
}