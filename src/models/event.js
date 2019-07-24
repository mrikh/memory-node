const mongoose = require('mongoose')
const constants = require('../utils/constants')

const eventSchema = new mongoose.Schema({
    eventStatus : {
        type : Number,
        required : [true, constants.params_missing]
    },
    eventName : {
        type : String,
        required : [true, constants.params_missing]
    },
    startDate : {
        type : Date,
        required : [true, constants.params_missing]
    },
    endDate : {
        type : Date,
        required : [true, constants.params_missing]
    },
    addressTitle : {
        type : String,
        required : [true, constants.params_missing]
    },
    addressDetail : {
        type : String,
        required : [true, constants.params_missing]
    },
    nearby : {
        type : String
    },
    lat : {
        type : Number,
        required : [true, constants.params_missing]
    },
    long : {
        type : Number,
        required : [true, constants.params_missing]
    },
    photos : [{
        type : String
    }],
    privacy : {
        type : Number,
        required : [true, constants.params_missing]
    },
    invited : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }],
    otherDetails : {
        type : String
    },
    creator : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    }
}, {
    timestamps : true
})

eventSchema.methods.generateStructure = async function (){

    try{
        await this.populate({
            path : 'creator',
            options : { select : { _id : 1, name : 1, profilePhoto : 1 }}
        }).populate({
            path : 'invited',
            options : { select : { _id : 1, name : 1, profilePhoto : 1, eventsAttending : 1 }} 
        }).execPopulate()

        return this

    }catch(error){
        error.statusCode = 400
        throw error
    }
}

eventSchema.methods.toJSON = function() {

    const eventObject = this.toObject()
    delete eventObject.id
    delete eventObject.__v
    delete eventObject.createdAt
    delete eventObject.updatedAt
    return eventObject
}

const Event = mongoose.model('Event', eventSchema)
module.exports = Event