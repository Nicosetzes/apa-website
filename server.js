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

const usersModel = require("./models/users.js"); // Modelo mongoose para la carga de partidos

/* -------------------- SERVER -------------------- */

const express = require("express");
// const cookieParser = require("cookie-parser"); // Since version 1.5.0, the cookie-parser middleware no longer needs to be used for this module to work.
const session = require("express-session"); // login session require session support //

/* --------------- MONGO-SESSION (ATLAS) --------------- */

const MongoDBStore = require('connect-mongodb-session')(session);

// const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

/* -------------------- MIDDLEWARES -------------------- */

const app = express();

// app.use(cookieParser()); // Since version 1.5.0, the cookie-parser middleware no longer needs to be used for this module to work.

const store = new MongoDBStore({
  //En Atlas connect App :  Make sure to change the node version to 2.2.12:
  uri: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-shard-00-00.i6ffr.mongodb.net:27017,cluster0-shard-00-01.i6ffr.mongodb.net:27017,cluster0-shard-00-02.i6ffr.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-vzvty3-shard-0&authSource=admin&retryWrites=true&w=majority`,
  collection: "mySessions",
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // serverSelectionTimeoutMS: 10000
  }
}, function (error) {
  // Should have gotten an error
});

store.on('error', function (error) {
  // Also get an error here
});

app.use(
  session({
    store: store,
    secret: "sh",
    resave: false,
    saveUninitialized: false, // Dejarlo en false es útil para login, dado que la session no se guarda hasta que no se modifica. 
    cookie: {
      maxAge: 600000, // 10 MINUTOS
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* -------------------- PASSPORT -------------------- */

const passport = require("passport");

app.use(passport.initialize()); // Busca el passport.user attached to the session. Si no lo encuentra (osea que el user no está autenticado aun) lo crea como req.passport.user = {}.
app.use(passport.session()); // Se invoca en todas las req. Busca un serialised object user en la session, y si lo encuentra considera que la req está autenticada.

const LocalStrategy = require("passport-local").Strategy;

const bCrypt = require("bcrypt");

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

passport.use(
  "login",
  new LocalStrategy(
    {
      passReqToCallback: true, // Allows for req argument to be present!
    },
    (req, username, password, done) => { // Chequear el uso de req
      usersModel
        .findOne({ username: username })
        .then((user) => {
          if (!user) return done(null, false, { message: "The user doesn't exist in the DB", }); // How may I access this object in order to display the message?;

          bCrypt.compare(password, user.password, (err, success) => {
            if (err) throw err;
            if (success) {
              req.session.username = user.username; // Necesario?
              done(null, user);
            } else {
              done(null, false, { message: "User was found in the DB, but passwords don't match", }); // Same as above;
            }
          });
        })
        .catch((err) => {
          return done(null, false, { message: err });
        });

      passport.serializeUser(function (user, done) {
        done(null, user.id)
      });

      passport.deserializeUser(function (id, done) {
        usersModel.findById(id, function (err, user) {
          done(err, user);
        });
      });
    }
  )
);

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
  // req.session.cookie.maxAge = 5000; // Defino el tiempo que le queda a la cookie al hacer el request a "/" //
  console.log("req.sessionID: ");
  console.log(req.sessionID);
  console.log("req.session: ")
  console.log(req.session)
  console.log("req.session.cookie.maxAge: ")
  console.log(req.session.cookie.maxAge);
  console.log("req.session.passport.user: ")
  console.log(req.session.passport?.user); // Una vez ejecutado el login, se guarda el ID como propiedad en req.session.passport.user
  console.log("req.user: ")
  console.log(req.user); // Una vez ejecutado el login, se guarda el objeto user (completo) en req.user
  res.render("index", {});
  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

// PARA LOGIN Y LOGOUT

app.get("/login", (req, res) => {
  res.render("login", {});
  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

app.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/login-error",
    successRedirect: "/",
  }), (req, res) => {
    res.render("/");
    console.log(`Ruta: ${req.url}, Método: ${req.method}`);
  }
);

app.get("/login-error", (req, res) => {
  res.render("login-error", {});
  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

app.post("/logout", (req, res) => {
  console.log(req.session)
  req.logout();
  console.log(req.session)
  res.redirect("/");
  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

// PARA REGISTER:

// app.get("/register", (req, res) => {
//   res.render("register", {});
//   console.log(`Ruta: ${req.url}, Método: ${req.method}`);
// });

// app.post(
//   "/register",
//   passport.authenticate("register", {
//     failureRedirect: "/failregister",
//     successRedirect: "/",
//   })
// );

// app.get("/register-error", (req, res) => {
//   res.render("register-error", {});
//   console.log(`Ruta: ${req.url}, Método: ${req.method}`);
// });

// OTHER ROUTES

app.get("/api", isAuth, (req, res) => {

  const teams = [];

  const axios = require('axios');
  const config = {
    method: 'get',
    url: 'https://v3.football.api-sports.io/teams?league=128&season=2022',
    headers: {
      'x-rapidapi-key': 'c6fc4afceaf077867ce47212440002cf',
      'x-rapidapi-host': 'v3.football.api-sports.io'
    }
  };

  axios(config)
    .then(function (response) {
      // console.log("JSON STRINGIFY RESPONSE.DATA")
      // console.log(JSON.stringify(response.data));
      teams.push(response.data);
      const { response: apiResponse } = teams[0]
      // console.log("teams")
      // console.log(teams)
      // console.log("apiResponse")
      // console.log(apiResponse)
      res.render("api", { apiResponse });
    })
    .catch(function (error) {
      console.log(error);
    });
})

app.get("/face-to-face", async (req, res) => {
  let finalMatchups = [];
  try {
    const array = [];
    const allMatches = await faceToFaceModel.find();
    if (allMatches.length === 0) {
      res.render("face-to-face", { finalMatchups, allMatches });
    }
    const allPlayers1 = allMatches.map((match) => match.playerP1);
    const allPlayers2 = allMatches.map((match) => match.playerP2);
    const concat = allPlayers1.concat(allPlayers2);
    const allPlayers = [...new Set(concat)]; // Con Set puedo eliminar valores repetidos //
    const allMatchups = allPlayers.flatMap((v, i) =>
      allPlayers.slice(i + 1).map((w) => {
        return { p1: v, p2: w };
      })
    );

    let itemsProcessed = 0;

    allMatchups.forEach(async (element, index) => {
      array.push(
        await faceToFaceModel.find({
          $or: [
            { $and: [{ playerP1: element.p1 }, { rivalOfP1: element.p2 }] },
            { $and: [{ playerP1: element.p2 }, { rivalOfP1: element.p1 }] },
          ],
        })
      );
      itemsProcessed++;
      if (itemsProcessed === allMatchups.length) {
        const workedMatchups = allMatchups.map((element, index) => {
          return {
            matchup: `${array[index][0]?.playerP1} (J1) vs ${array[index][0]?.rivalOfP1} (J2)`,
            matches: array[index],
            wonByP1: array[index].reduce(
              (acc, cur) =>
                cur.outcome.winner === array[index][0].playerP1 ? ++acc : acc,
              0
            ),
            wonByP2: array[index].reduce(
              (acc, cur) =>
                cur.outcome.winner === array[index][0].playerP2 ? ++acc : acc,
              0
            ),
            draws: array[index].reduce(
              (acc, cur) => (cur.outcome === "draw" ? ++acc : acc),
              0
            ),
          };
        });
        finalMatchups = workedMatchups.filter((element) => {
          return element.matchup !== "undefined (J1) vs undefined (J2)";
        });
        // console.log(finalMatchups);
        res.render("face-to-face", { finalMatchups, allMatches });
      }
    });
  } catch (err) {
    return res.status(400).send(err);
  }

  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

app.post("/face-to-face", isAuth, async (req, res) => {
  try {
    let { playerP1, teamP1, scoreP1, playerP2, teamP2, scoreP2 } = req.body;
    let rivalOfP1 = playerP2;
    let rivalOfP2 = playerP1;
    let outcome = "draw";
    if (scoreP1 - scoreP2 !== 0) {
      scoreP1 > scoreP2
        ? (outcome = { winner: playerP1, teamThatWon: teamP1 })
        : (outcome = { winner: playerP2, teamThatWon: teamP2 });
    }
    if (scoreP1 - scoreP2 !== 0) {
      scoreP1 > scoreP2
        ? (outcome = { winner: playerP1, teamThatWon: teamP1 })
        : (outcome = { winner: playerP2, teamThatWon: teamP2 });
    } // Si hubo empate, outcome = draw;

    const match = {
      playerP1,
      teamP1,
      scoreP1,
      rivalOfP1,
      playerP2,
      teamP2,
      scoreP2,
      rivalOfP2,
      outcome,
    };

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

// app.post("/face-to-face", async (req, res) => {
//   try {
//     let { playerP1, teamP1, scoreP1, playerP2, teamP2, scoreP2 } = req.body;
//     let outcome = "draw";
//     if (scoreP1 - scoreP2 !== 0) {
//       scoreP1 > scoreP2 ? (outcome = playerP1) : (outcome = playerP2);
//     }
//     if (scoreP1 - scoreP2 !== 0) {
//       scoreP1 > scoreP2 ? (outcome = playerP1) : (outcome = playerP2);
//     } // Si hubo empate, outcome = draw;
//     const objects = [
//       { player: playerP1, team: teamP1, score: scoreP1 },
//       { player: playerP2, team: teamP2, score: scoreP2 },
//     ];
//     const orderedObjects = objects.sort();
//     const match = {
//       playerP1: orderedObjects[0].player,
//       teamP1: orderedObjects[0].team,
//       scoreP1: orderedObjects[0].score,
//       playerP2: orderedObjects[1].player,
//       teamP2: orderedObjects[1].team,
//       scoreP2: orderedObjects[1].score,
//       outcome,
//     };

//     // AUN NO PUDE ORDENARLOS, REVISAR!!! //

//     await faceToFaceModel.create(match);
//     res.status(200).send("Partido cargado con éxito");
//     // Si falla la validación, se ejecuta el catch //
//   } catch (err) {
//     if (err.name === "ValidationError") {
//       const errors = {};

//       Object.keys(err.errors).forEach((key) => {
//         errors[key] = err.errors[key].message;
//       });

//       return res.status(400).send(errors);
//     }
//     res.status(500).send("Something went wrong");
//   }
// });

/* -------------------- PORT -------------------- */

const PORT = process.env.PORT || "8080";

app.listen(PORT, (err) => {
  if (!err) console.log(`Servidor Express escuchando en el puerto ${PORT}`);
  else console.log(`Error al iniciar el servidor Express: ${err}`);
});
