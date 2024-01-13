export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.admin) {
        // console.log(req.session);
        // User is authenticated
        next();
    } else {
        // Redirect to the login page if the user is not authenticated
        res.redirect('/login');
    }
};