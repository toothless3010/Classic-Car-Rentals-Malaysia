const requireAdmin = (req, res, next) => {
  if (req.session?.isAdmin) {
    next();
    return;
  }
  req.flash("error", "You need to sign in to view that page.");
  res.redirect("/admin/login");
};

export default requireAdmin;
