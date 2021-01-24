const router = require("express").Router();
const User = require("./../models/user-model");
const auth = require("./../middleware/auth");

//login route
router.post("/login", async(req, res) => {
    try{
        //findByCredentials will work on User collection as a whole, that's why it's a static method
        const user = await User.findByCredentials(req.body.email, req.body.password);
        
        //generateAuthToken will work on a particular user record
        const token = await user.generateAuthToken();

        res.status(200).send({user, token});
    }catch(err){
        res.status(400).send();
    }
})

//signup route
router.post("/", async(req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(200).send({user, token});
    } catch(err) {
        res.status(500).send("Failed to save user");
    }
})

//logout route - here we are only deleting the token which the user has used
router.post("/logout", auth, async(req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        });
        await req.user.save();

        res.status(200).send()
    } catch (err) {
        res.status(500).send()
    }
})

//logout route - here we are deleting all the tokens, this will logout the user from all devices 
router.post("/logoutAll", auth, async(req, res) => {
    try{
        req.user.tokens = []
        await req.user.save();

        res.status(200).send()
    } catch (err) {
        res.status(500).send()
    }
})

router.get("/", auth, (req, res) => {
    User.find().then((users) => {
        res.status(200).send(users);
    }).catch(err => {
        res.status(500).send("Failed to fetch users");
    });
})

router.get("/me", auth, async(req, res) => {
    res.status(200).send(req.user);
});

router.get("/:id", auth, (req, res) => {
    User.findById(req.params.id).then(user => {
        if (!user) {
            res.status(404).send();
        }
        res.status(200).send(user);
    }).catch(err => {
        res.status(500).send("Failed to fetch user by ID");
    })
})

// we don't need this route since we are fetching user details by /me
// router.patch("/:id", auth, async(req, res) => {
//     const updates = Object.keys(req.body);
//     const allowedUpdates = ["name", "email", "password", "age"]

//     const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

//     if (!isValidUpdate) {
//         res.status(400).send({error: "Invalid update"});
//     }

//     try {
//         const user = await User.findById(req.params.id);
        
//         // commented this because we have added a mongoose middleware for pre save which doesn't get called in case of findByIdAndUpdate
//         //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true, useFindAndModify: false});

//         if (!user) {
//             return res.status(400).send();  
//         }

//         updates.forEach(update => user[update] = req.body[update]);

//         await user.save()

//         res.status(200).send(user);
//     } catch(err){
//         res.status(400).send(err);
//     }
// });

router.delete("/:id", auth, async(req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user){
            return res.status(404).send();
        }

        res.status(200).send(user)
    }catch(err) {
        res.status(500).send()
    }
});

module.exports = router;