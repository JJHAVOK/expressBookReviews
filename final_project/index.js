const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    if(req.session.authorization) { // Check if the authorization object exists in the session
        let token = req.session.authorization['accessToken']; // Get the token
        
        jwt.verify(token, "access", (err, user) => { // Verify the token. Assuming "access" is the secret key used when creating the JWT.
            if (!err) {
                req.user = user; // Attach the decoded user payload to the request
                next(); // Proceed to the next middleware/route handler
            } else {
                return res.status(403).json({message: "User not authenticated"})
            }
        });
    } else {
        return res.status(403).json({message: "User not logged in"})
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
