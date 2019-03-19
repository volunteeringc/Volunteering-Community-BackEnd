const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/user');


//sign up
exports.User_SignUp = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(email => {
            if (email) {
                console.log("faild");
                res.status(509).json({ message: "email is exist" })

            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({ error: err });
                    } else {
                        const user = new User({
                            email: req.body.email,
                            password: hash,
                            name: req.body.name

                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({ message: "user created" });
                            }).catch(err => {
                                console.log(err);
                                res.status(500).json({ error: err });
                            });
                    }
                });
            }
        });
}


//user login
exports.User_Login = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user) {
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json({ message: "Auth Failed" });
                    }
                    if (result) {
                        const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id,
                            name: user[0].name
                            //validation of token
                        }, process.env.JWT_KEY, {
                                expiresIn: "1d"
                            });
                        return res.status(200).json({ message: "Auth successful", token: token });
                    }
                    return res.status(401).json({ message: "Auth Failed" });
                })

            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}


//user deleting
exports.User_Deleting = (req, res, next) => {
    User.findOneAndDelete({ _id: req.params.userId })
        .exec()
        .then(() => {
            res.status(200).json({ message: "user deleted" })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
}


//user upadting name
exports.User_Updating_name = (req, res, next) => {
    User.findByIdAndUpdate({ _id: req.params.userId }, req.body.name)
        .then(result => {
            User.findOne({ _id: req.params.userId })
            console.log(result);
            res.status(200).json({ message: "name updated" });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}


//user updating password
exports.User_Updating_password = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: err });
        } else {
            User.findOneAndUpdate({ _id: req.params.userId }, { password: hash })
                .then(result => {
                    User.findOne({ _id: req.params.userId })
                    console.log(result);
                    res.status(200).json({ message: "password updated" });
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                });
        }
    });
}


//user profile
exports.User_profile = (req, res, next) => {
    User.findOne({ _id: req.params.userId })
        .populate("post", 'content likes comment')
        .populate("event", 'name location')
        .then(result => {
            console.log(result);
            res.status(200).json({ result });

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}


// follow section  
exports.User_follow = (req, res, next) => {
    const userA = req.params.auserId;
    const userB = req.params.buserId;
    User.findOne({ _id: userB })
        .then(result => {
            if (result.followers.indexOf(userA) === -1) {
                result.followers.push(userA);
                result.save();
            }
        })
    User.findOne({ _id: userA })
        .then(doc => {
            if (doc.following.indexOf(userB) === -1) {
                doc.following.push(userB);
                doc.save();
            }
            return res.status(200).json({doc})
        })

        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
}


//unfollow section
exports.User_unfollow = (req, res, next) => {
    const userA = req.params.auserId;
    const userB = req.params.buserId;
    User.findOne({ _id: userB })
        .then(result => {
            if (result.followers.indexOf(userA) !== -1) {
                result.followers.remove(userA);
                result.save();
            }
        })
    User.findOne({ _id: userA })
        .then(doc => {
            if (doc.following.indexOf(userB) !== -1) {
                doc.following.remove(userB);
                doc.save();
            }
            return res.status(200).json({doc})
        })

        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
}
