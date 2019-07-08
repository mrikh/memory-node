const express = require('express')
const User = require('../models/user')
const constants = require('../utils/constants')
const {sendVerificationMail, sendForgotMail} = require('../emails/account')
const auth = require('../middleware/auth')
const bcrypt = require('bcrypt')

const router = new express.Router()

router.post('/users/signUp', async (req, res, next) => {
    try{
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        sendVerificationMail(user.email, user.name)
        res.send({code : 200, message : constants.success_signup, data : {user, token}})
    }catch (error){
        next(error)
    }
})

router.post('/users/resendVerification', async (req, res, next) => {
    try{
        const email = req.body.email
        const user = await User.findOne({email})
        console.log(email)
        if (!user){
            res.send({code : 404, message : constants.user_not_found})
        }else{
            sendVerificationMail(user.email, user.name)
            res.send({code : 200, message : constants.success_signup, data : {user, token}})
        }
    }catch (error){
        next(error)
    }
})

router.get('/users/checkInfo', async (req, res, next) => {

    const username = req.query.username

    try{
        if (username){
            const user = await User.findOne({username})
            if (user){
                const error = new Error(constants.username_exists)
                error.statusCode = 422
                throw error
            }
            res.send({code : 200, message : constants.success})
        }else{
            const error = new Error(constants.params_missing)
            error.statusCode = 422
            throw error
        }
    }catch(error){
        next(error)
    }
})

router.patch('/users/update', auth, async (req, res, next) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'emailVerified', 'profilePhoto']

    const isValid = updates.every((update) => allowedUpdates.includes(update))

    try{
        if (!isValid){
            const error = new Error(constants.invalid_updates)
            error.statusCode = 400
            throw error
        }

        const user = req.user
        updates.forEach((update) => {
            user[update] = req.body[update]
        })
        await user.save()
        if (user.emailVerified){
            res.send({code : 200, message : constants.success_verified_email, data : user})
        }else{
            res.send({code : 203, message : constants.success_unverified_email})
        }
        
    }catch(error){
        next(error)
    }
})

router.post('/users/login', async (req, res, next) => {
    try{
        const params = req.body
        
        if (!params.email || !params.password){
            const error = new Error(constants.params_missing)
            error.statusCode = 422
            throw error
        }
        
        const user = await User.findOne({email : params.email})
        
        if (!user){
            const error = new Error(constants.user_not_found)
            error.statusCode = 404
            throw error
        }

        const isMatch = await bcrypt.compare(params.password, user.password)

        if (isMatch){
            const token = await user.generateAuthToken()
            if (user.emailVerified){
                return res.send({code : 200, message : constants.success, data : {user, token}})
            }else{
                return res.send({code : 203, message : constants.unverified_email})
            }
        }else{
            const error = new Error(constants.params_missing)
            error.statusCode = 404
            throw error
        }

    }catch(error){
        next(error)
    }
})

router.post('/users/forgotPass', async (req, res, next) => {

    try{
        const email = req.body.email
        const user = await User.findOne({email : email})

        if (!user){
            const error = new Error(constants.user_not_found)    
            error.statusCode = 404
            throw error
        }

        sendForgotMail(email)
        res.send({code : 200, message : constants.forgot_success})
    }catch (error){
        next(error)
    }
})

module.exports = router