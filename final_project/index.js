const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
// The paths are corrected here to include the 'router/' subdirectory
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general; 

const app = express();

app.use(express.json());

// Session middleware setup
app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// AUTHENTICATION MIDDLEWARE
app.use("/customer/auth/*", function auth(req,res,next){
    if(req.session.authorization) { // Check if the authorization object exists in the session
        let token = req.session.authorization['accessToken']; // Get the token
        
        // Assuming the secret key is 'access' as used in auth_users.js
        jwt.verify(token, "access", (err, user) => { 
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
 
// Use the port provided by the environment (for hosting), or default to 5000 for local development.
const PORT = process.env.PORT || 5000;

// Mount public routes first, including the root '/'
app.use("/", genl_routes);

// Mount authenticated customer routes under /customer
app.use("/customer", customer_routes);

app.listen(PORT,()=>console.log("Server is running on port " + PORT));