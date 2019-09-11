module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        //req.flash('error_msg', 'Bad Path');
        res.redirect('/users/login');
    },
    ensureNotAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            //req.flash('error_msg', 'Bad Request');
            res.redirect('/');
            return;
        }
        next();
    }
};