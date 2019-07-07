const express = require('express')
const User = require('../models/user')
const constants = require('../utils/constants')
const {sendVerificationMail} = require('../emails/account')
const auth = require('../middleware/auth')

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
        res.send({code : 200, message : constants.success, data : user})
    }catch(error){
        next(error)
    }
})

module.exports = router