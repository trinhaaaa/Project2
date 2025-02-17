const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const app = express();
const userRoutes = require("./routes/userRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
// const helmet = require("helmet");

// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: ["'self'"],
//             fontSrc: ["'self'", "https://fonts.googleapis.com"],
//         },
//     })
// );


app.use(cors());
app.use(express.json());

app.use("/api", productRoutes);
app.use("/api", userRoutes);
app.use("/api", orderRoutes);

require('./websocket');




// app.get('/profile', (req, res) => {
//   if (req.session.user) {
//     res.render('profile', { user: req.session.user });
//   } else {
//     res.redirect('/login');
//   }
// });

const PORT = 8801;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
