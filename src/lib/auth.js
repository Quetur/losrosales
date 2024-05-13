module.exports = {    
    isLoggedIn (req, res, next) {
        console.log("autentico");
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/signin');
    }
};