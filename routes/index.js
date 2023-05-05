var express = require("express");
var router = express.Router();
const User = require("../models/userSchema");
const nodemailer = require("nodemailer");

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { title: "Homepage" });
});

/* GET signup page. */
router.get("/signup", function (req, res, next) {
    res.render("signup", { title: "Signup" });
});

/* GET signin page. */
router.get("/signin", function (req, res, next) {
    res.render("signin", { title: "Signin" });
});

/* GET signin page. */
router.get("/signout", function (req, res, next) {
    res.redirect("/signin");
});

/* GET forgetpassword page. */
router.get("/forgetpassword", function (req, res, next) {
    res.render("forget", { title: "Forget Password" });
});

/* GET profile page. */
router.get("/profile/:id", async function (req, res, next) {
    const user = await User.findById(req.params.id);
    res.render("profile", { title: "Profile", user });
});

/* POST signup page. */
router.post("/signupuser", async function (req, res, next) {
    const user = await User.findOne({ username: req.body.username });
    if (user) return res.send("user already exists.");

    User.create(req.body)
        .then(() => {
            res.redirect("/signin");
        })
        .catch((err) => {
            res.send(err);
        });
});

/* POST signin page. */
router.post("/signinuser", async function (req, res, next) {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.send("user not found.");
        const matchPassword = user.password === req.body.password;
        if (!matchPassword) return res.send("wrong credientials");
        res.redirect("/profile/" + user._id);
    } catch (error) {
        res.send(err);
    }
});

/* POST update/:id page. */
router.post("/updateuser/:id", async function (req, res, next) {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/signin");
});

/* POST send-mail page. */
router.post("/send-mail", async function (req, res, next) {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.send("user not found");

    // const mailurl = `${req.protocol}://${req.get("host")}/forgetpassword/${
    //     user._id
    // }`;
    const code = Math.floor(Math.random() * 9000 + 1000);

    // -----Node mailer coding--------------

    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: "rmathur.028@gmail.com",
            pass: "tpjsotuftfyektyu",
        },
    });

    const mailOptions = {
        from: "Rahul Pvt. Ltd.<rmathur.028@gmail.com>",
        to: req.body.email,
        subject: "Password Reset Link",
        text: "Do not share this link to anyone.",
        html: `<p>Do not share this Code to anyone.</p><h1>${code}</h1>`,
    };

    transport.sendMail(mailOptions, async (err, info) => {
        if (err) return res.send(err);
        console.log(info);

        await User.findByIdAndUpdate(user._id, { code });

        // return res.send(
        //     "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
        // );
        res.redirect("/code/" + user._id);
    });
});

/* GET code/id page. */
router.get("/code/:id", async function (req, res, next) {
    res.render("getcode", { title: "Code", id: req.params.id });
});

/* POST code/id page. */
router.post("/code/:id", async function (req, res, next) {
    const user = await User.findById(req.params.id);
    if (user.code == req.body.code) {
        await User.findByIdAndUpdate(user._id, { code: "" });
        res.redirect("/forgetpassword/" + user._id);
    } else {
        res.send("invalid code.");
    }
});

/* GET forgetpassword page. */
router.get("/forgetpassword/:id", async function (req, res, next) {
    res.render("getpassword", { title: "Forget Password", id: req.params.id });
});   

/* POST forgetpassword page. */
router.post("/forgetpassword/:id", async function (req, res, next) {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/signin");
});

module.exports = router;

// https://blog.e-zest.com/basic-commands-for-mongodb
