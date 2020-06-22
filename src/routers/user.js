const express = require('express')
const User = require('../models/user')
const constants = require('../utils/constants')
const {sendVerificationMail, sendForgotMail} = require('../emails/account')
const auth = require('../middleware/auth')
const bcrypt = require('bcrypt')
const speakeasy = require('speakeasy')
const otpHandler = require('../utils/otp')

const router = new express.Router()

router.post('/users/signUp', async (req, res, next) => {
    try{
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        sendVerificationMail(user)
        res.send({code : 200, message : constants.success_signup, data : {user, token}})
    }catch (error){
        next(error)
    }
})

router.post('/users/resendVerification', auth, async (req, res, next) => {
    try{
        const user = req.user
        if (!user){
            res.send({code : 404, message : constants.user_not_found})
        }else{
            sendVerificationMail(user)
            res.send({code : 200, message : constants.success_signup})
        }
    }catch (error){
        next(error)
    }
})

router.post('/users/verifyEmail', auth, async (req, res, next) => {
    try{
        const user = req.user

        if (!user){
            res.send({code : 404, message : constants.user_not_found})
        }else{
    
            const tokenValidates = otpHandler.verifyOtp(user, req.body.otp)

            try{
                if (tokenValidates){
                    user.emailVerified = true
                    await user.save()
                    res.send({code : 200, message: constants.verification_success, data : {user}})
                }else{
                    res.send({code : 404, message : constants.verification_failed})
                }
            }catch(error){
                next(error)
            }
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
    const allowedUpdates = ['name', 'emailVerified', 'profilePhoto', 'phoneNumber']

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
            return res.send({code : 200, message : constants.success, data : {user, token}})
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

router.post('/users/sendOTP', auth, async (req, res, next) => {

    const token = otpHandler.generateOtp(req.user)
    const phoneNumber = req.body.phoneNumber

    try{
        res.send({code : 200, message : constants.success, data: {otp : token}})  
    }catch(error){
        next(error)
    }
})

router.post('/users/verifyOTP', auth, async (req, res, next) => {
    
    const tokenValidates = otpHandler.tokenValidates(req.user, req.body.token)
    const user = req.user
    
    try{
        if (tokenValidates){
            user.phoneVerified = true
            await user.save()
            res.send({code : 200, message: constants.verification_success, data : {user}})
        }else{
            res.send({code : 404, message : constants.verification_failed})
        }
    }catch(error){
        next(error)
    }
})

module.exports = router