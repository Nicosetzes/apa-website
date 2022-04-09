/* -------------------- DOTENV -------------------- */

// Utilizo dotenv para aplicar variables de entorno //

const dotenv = require("dotenv").config();

/* -------------------- DATABASE -------------------- */

const mongoose = require("mongoose");

mongoose
  .connect(
    `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-shard-00-00.i6ffr.mongodb.net:27017,cluster0-shard-00-01.i6ffr.mongodb.net:27017,cluster0-shard-00-02.i6ffr.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-vzvty3-shard-0&authSource=admin&retryWrites=true&w=majority`
  )
  .then(() => console.log("Base de datos MongoDB conectada"))
  .catch((err) => console.log(err));

const faceToFaceModel = require("./models/faceToFace.js"); // Modelo mongoose para la carga de partidos

/* -------------------- SERVER -------------------- */

const express = require("express");

const app = express();

/* -------------------- MIDDLEWARES -------------------- */

// const session = require("express-session"); // login session require session support //
// const cookieParser = require("cookie-parser");
// const MongoStore = require("connect-mongo");

// const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// app.use(cookieParser("someSecret")); // ¿ES NECESARIO?
// app.use(
//   session({
//     store: MongoStore.create({
//       //En Atlas connect App :  Make sure to change the node version to 2.2.12:
//       mongoUrl: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-shard-00-00.i6ffr.mongodb.net:27017,cluster0-shard-00-01.i6ffr.mongodb.net:27017,cluster0-shard-00-02.i6ffr.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-vzvty3-shard-0&authSource=admin&retryWrites=true&w=majority`,
//       mongoOptions: advancedOptions,
//     }),
//     secret: `${process.env.MONGO_SECRET}`,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 100000,
//     },
//   })
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* -------------------- PASSPORT -------------------- */

// const passport = require("passport");

// app.use(passport.initialize());
// app.use(passport.session());

// const LocalStrategy = require("passport-local").Strategy;

// const bCrypt = require("bcrypt");

// const createHash = (password) => {
//   return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
// };

// passport.use(
//   "register",
//   new LocalStrategy((username, password, done) => {
//     usersModel
//       .findOne({ username: username })
//       .then((user) => {
//         if (!user) {
//           const newUser = new usersModel({
//             username: username,
//             password: createHash(password),
//           });
//           console.log(newUser);
//           usersModel
//             .create(newUser)
//             .then((user) => {
//               return done(null, user);
//             })
//             .catch((err) => {
//               return done(null, false, { message: err });
//             });
//         } else {
//           return done(null, false, {
//             message: "This user has already been registered",
//           });
//         }
//       })
//       .catch((err) => {
//         return done(null, false, { message: err });
//       });
//   })
// );

// passport.use(
//   "login",
//   new LocalStrategy(
//     {
//       passReqToCallback: true, // Allows for req argument to be present!
//     },
//     (req, username, password, done) => {
//       usersModel
//         .findOne({ username: username })
//         .then((user) => {
//           console.log(user);
//           if (!user)
//             return done(null, false, {
//               message: "The user doesn't exist in the DB",
//             }); // How may I access this object in order to display the message?;
//           bCrypt.compare(password, user.password, (err, success) => {
//             console.log(password, user.password);
//             if (err) throw err;
//             if (success) {
//               req.session.username = user.username;
//               done(null, user);
//             } else {
//               done(null, false, {
//                 message: "User was found in the DB, but passwords don't match",
//               }); // Same as above;
//             }
//           });
//         })
//         .catch((err) => {
//           return done(null, false, { message: err });
//         });

//       passport.serializeUser((user, done) => done(null, user.id));

//       passport.deserializeUser((id, done) => {
//         usersModel.findById(id, (err, user) => {
//           done(err, user);
//         });
//       });
//     }
//   )
// );

/* -------------------- AUTH -------------------- */

const isAuth = (req, res, next) => {
  req.isAuthenticated() ? next() : res.redirect("/login");
};

/* -------------------- EJS -------------------- */

app.set("views", "./public/views");
app.set("view engine", "ejs");

/* -------------------- ROUTES -------------------- */

// HOME

app.get("/", (req, res) => {
  // req.session.cookie.maxAge = 100000;
  // const userEmail = req.session.username;
  res.render("index", {});
  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

// PARA LOGIN Y LOGOUT

app.get("/login", (req, res) => {
  res.render("login", {});
  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

// app.post(
//   "/login",
//   passport.authenticate("login", {
//     failureRedirect: "/login-error",
//     successRedirect: "/",
//   })
// );

app.get("/login-error", (req, res) => {
  res.render("login-error", {});
  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

app.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

// PARA REGISTER:

app.get("/register", (req, res) => {
  res.render("register", {});
  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

// app.post(
//   "/register",
//   passport.authenticate("register", {
//     failureRedirect: "/failregister",
//     successRedirect: "/",
//   })
// );

app.get("/failregister", (req, res) => {
  res.render("register-error", {});
  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

// OTHER ROUTES

app.get("/face-to-face", async (req, res) => {
  try {
    const allMatches = await faceToFaceModel.find();
    // const p1s = allMatches.map((element) => element.playerP1);
    // const p2s = allMatches.map((element) => element.playerP2);
    // const concat = p1s.concat(p2s);
    // const allPlayers = [...new Set(concat)]; // Con Set puedo eliminar valores repetidos //
    // let matchups;
    // allMatches.forEach((element, index) => {
    //   matchups.push(`${element.playerP1} vs ${element.playerP2}`);
    // });
    res.render("face-to-face", { allMatches });
  } catch (err) {
    return res.status(400).send(err);
  }

  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

app.post("/face-to-face", async (req, res) => {
  try {
    let { playerP1, teamP1, scoreP1, playerP2, teamP2, scoreP2 } = req.body;
    let outcome = "draw";
    if (scoreP1 - scoreP2 !== 0) {
      scoreP1 > scoreP2 ? (outcome = playerP1) : (outcome = playerP2);
    }
    if (scoreP1 - scoreP2 !== 0) {
      scoreP1 > scoreP2 ? (outcome = playerP1) : (outcome = playerP2);
    } // Si hubo empate, outcome = draw;
    const objects = [
      { player: playerP1, team: teamP1, score: scoreP1 },
      { player: playerP2, team: teamP2, score: scoreP2 },
    ];
    const orderedObjects = objects.sort();
    const match = {
      playerP1: orderedObjects[0].player,
      teamP1: orderedObjects[0].team,
      scoreP1: orderedObjects[0].score,
      playerP2: orderedObjects[1].player,
      teamP2: orderedObjects[1].team,
      scoreP2: orderedObjects[1].score,
      outcome,
    };

    // AUN NO PUDE ORDENARLOS, REVISAR!!! //

    await faceToFaceModel.create(match);
    res.status(200).send("Partido cargado con éxito");
    // Si falla la validación, se ejecuta el catch //
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = {};

      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });

      return res.status(400).send(errors);
    }
    res.status(500).send("Something went wrong");
  }
});

/* -------------------- PORT -------------------- */

const PORT = process.env.PORT || "8080";

app.listen(PORT, (err) => {
  if (!err) console.log(`Servidor Express escuchando en el puerto ${PORT}`);
  else console.log(`Error al iniciar el servidor Express: ${err}`);
});
