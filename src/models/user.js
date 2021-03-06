const mongoose = require('mongoose')
const validator = require('validator')
const constants = require('../utils/constants')
const bcrypt = require('bcrypt')
var uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, constants.invalid_name],
        trim : true,
        validate(value){
            if (!value || '' === value){
                throw new Error(constants.invalid_name)
            }
        }
    },
    username : {
        type : String,
        required : [true, constants.invalid_username],
        trim : true,
        lowercase : true,
        unique : true,
        validate(value){
            if (!value || '' === value){
                throw new Error(constants.invalid_username)
            }
        }
    },
    email : {
        type : String,
        required : [true, constants.invalid_email],
        trim : true,
        lowercase : true,
        unique : true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error(constants.invalid_email)
            }
        }
    },
    password : {
        type : String,
        required : [true, constants.invalid_password],
        validator(value){
            if (!value || '' === value){
                throw new Error(constants.invalid_password)
            }
        }
    },
    distance : {
        type : Number,
        default : 1000
    },
    phoneNumber : {
        type : String
    },
    token : {
        type : String,
        required : true
    },
    emailVerified :{
        type : Boolean,
        default: false
    },
    phoneVerified : {
        type : Boolean,
        default : false
    },
    profilePhoto:{
        type : String,
        default : ''
    }
},{
    timestamps : true
})

userSchema.methods.generateAuthToken = async function (){

    try{
        const token = jwt.sign({_id : this._id.toString()}, process.env.JWT_SECRET)
        this.token = token
        await this.save()
        return token
    }catch(error){
        error.statusCode = 400
        throw error
    }
}

userSchema.methods.toJSON = function() {
    const userObject = this.toObject()
    delete userObject.token
    delete userObject.password
    delete userObject.__v
    delete userObject.createdAt
    delete userObject.updatedAt
    return userObject
}

userSchema.pre('save', async function (next){

    if (this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

userSchema.plugin(uniqueValidator, {message : '{VALUE} already exists'})
const User = mongoose.model('User', userSchema)

module.exports = User