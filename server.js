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

/* -------------- MODELS FOR MONGOOSE -------------- */

const tournamentsModel = require("./models/tournaments.js"); // Modelo mongoose para la carga de torneos!

const matchesModel = require("./models/matches.js"); // Modelo mongoose para la carga de los mano a mano!

const usersModel = require("./models/users.js"); // Modelo mongoose para la carga de usuarios!

const playersModel = require("./models/players.js"); // Modelo mongoose para la carga de información de jugadores humanos!

/* -------------------- SERVER -------------------- */

const express = require("express");
// const cookieParser = require("cookie-parser"); // Since version 1.5.0, the cookie-parser middleware no longer needs to be used for this module to work.
const session = require("express-session"); // login session require session support //

/* --------------- MONGO-SESSION (ATLAS) --------------- */

const MongoDBStore = require("connect-mongodb-session")(session);

// const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

/* -------------------- MIDDLEWARES -------------------- */

// Method override allows for input requests to be modified! Useful for PUT and DELETE //

const methodOverride = require("method-override");

const app = express();

// app.use(cookieParser()); // Since version 1.5.0, the cookie-parser middleware no longer needs to be used for this module to work.

const store = new MongoDBStore(
  {
    //En Atlas connect App :  Make sure to change the node version to 2.2.12:
    uri: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-shard-00-00.i6ffr.mongodb.net:27017,cluster0-shard-00-01.i6ffr.mongodb.net:27017,cluster0-shard-00-02.i6ffr.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-vzvty3-shard-0&authSource=admin&retryWrites=true&w=majority`,
    collection: "mySessions",
    connectionOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // serverSelectionTimeoutMS: 10000
    },
  },
  function (error) {
    // Should have gotten an error
  }
);

store.on("error", function (error) {
  // Also get an error here
});

app.use(
  session({
    store: store,
    secret: "sh",
    resave: false,
    saveUninitialized: false, // Dejarlo en false es útil para login, dado que la session no se guarda hasta que no se modifica.
    cookie: {
      maxAge: 3600000, // 2 HORAS
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
    (req, username, password, done) => {
      // Chequear el uso de req
      usersModel
        .findOne({ username: username })
        .then((user) => {
          if (!user)
            return done(null, false, {
              message: "The user doesn't exist in the DB",
            }); // How may I access this object in order to display the message?;

          bCrypt.compare(password, user.password, (err, success) => {
            if (err) throw err;
            if (success) {
              req.session.username = user.username; // Necesario?
              done(null, user);
            } else {
              done(null, false, {
                message: "User was found in the DB, but passwords don't match",
              }); // Same as above;
            }
          });
        })
        .catch((err) => {
          return done(null, false, { message: err });
        });

      passport.serializeUser(function (user, done) {
        done(null, user.id);
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
  console.log("req.session: ");
  console.log(req.session);
  console.log("req.session.cookie.maxAge: ");
  console.log(req.session.cookie.maxAge);
  console.log("req.session.passport.user: ");
  console.log(req.session.passport?.user); // Una vez ejecutado el login, se guarda el ID como propiedad en req.session.passport.user
  console.log("req.user: ");
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
    failureRedirect: "./login-error",
    successRedirect: "/",
  }),
  (req, res) => {
    res.render("/");
    console.log(`Ruta: ${req.url}, Método: ${req.method}`);
  }
);

app.get("/login-error", (req, res) => {
  res.render("./errors/login-error", {});
  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

app.post("/logout", (req, res) => {
  console.log(req.session);
  req.logout();
  console.log(req.session);
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
//     failureRedirect: "/register-error",
//     successRedirect: "/",
//   })
// );

// app.get("/register-error", (req, res) => {
//   res.render("register-error", {});
//   console.log(`Ruta: ${req.url}, Método: ${req.method}`);
// });

// OTHER ROUTES

// app.get("/api", async (req, res) => {
//   const teams = [];

//   const axios = require('axios');
//   const config = {
//     method: 'get',
//     url: 'https://v3.football.api-sports.io/teams?league=40&season=2022',
//     headers: {
//       'x-rapidapi-key': 'c6fc4afceaf077867ce47212440002cf',
//       'x-rapidapi-host': 'v3.football.api-sports.io'
//     }
//   };

//   axios(config)
//     .then(function (response) {
//       // console.log("JSON STRINGIFY RESPONSE.DATA")
//       // console.log(JSON.stringify(response.data));
//       teams.push(response.data);
//       const { response: apiResponse } = teams[0];
//       // console.log("teams")
//       // console.log(teams)
//       // console.log("apiResponse")
//       // console.log(apiResponse)
//       // console.log(apiResponse);
//       res.send(apiResponse)
//       // res.render("api", { apiResponse });
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// });

// app.get("/api", async (req, res) => {

// const allMatches = await matchesModel.find({}, "playerP1 teamP1 scoreP1 playerP2 teamP2 scoreP2 outcome");

// console.log(allMatches.length)

// const allOutcomes = allMatches.map((element) => {
//   if (element.outcome.playerThatWon === element.playerP1) {
//     return {
//       id: element.id,
//       outcome: {
//         playerThatWon: element.outcome.playerThatWon,
//         teamThatWon: element.outcome.teamThatWon,
//         scoreFromTeamThatWon: element.scoreP1,
//         playerThatLost: element.playerP2,
//         teamThatLost: element.teamP2,
//         scoreFromTeamThatLost: element.scoreP2,
//         draw: element.outcome.draw,
//         scoringDifference: element.outcome.scoringDifference
//       }
//     }
//   }
//   else if (element.outcome.playerThatWon === element.playerP2) {
//     return {
//       id: element.id,
//       outcome: {
//         playerThatWon: element.outcome.playerThatWon,
//         teamThatWon: element.outcome.teamThatWon,
//         scoreFromTeamThatWon: element.scoreP2,
//         playerThatLost: element.playerP1,
//         teamThatLost: element.teamP1,
//         scoreFromTeamThatLost: element.scoreP1,
//         draw: element.outcome.draw,
//         scoringDifference: element.outcome.scoringDifference
//       }
//     }
//   }
//   else {
//     return {
//       id: element.id,
//       outcome: {
//         playerThatWon: element.outcome.playerThatWon,
//         teamThatWon: element.outcome.teamThatWon,
//         scoreFromTeamThatWon: "none",
//         playerThatLost: "none",
//         teamThatLost: "none",
//         scoreFromTeamThatLost: "none",
//         draw: element.outcome.draw,
//         scoringDifference: element.outcome.scoringDifference
//       }
//     }
//   }
// })

// console.log(allOutcomes)

// allOutcomes.forEach(async (element) => {
//   await matchesModel.findByIdAndUpdate(element.id, { outcome: element.outcome })
// })

//   const teams = [];

//   const axios = require('axios');
//   const config = {
//     method: 'get',
//     url: 'https://v3.football.api-sports.io/teams?league=128&season=2022',
//     headers: {
//       'x-rapidapi-key': 'c6fc4afceaf077867ce47212440002cf',
//       'x-rapidapi-host': 'v3.football.api-sports.io'
//     }
//   };

//   axios(config)
//     .then(function (response) {
//       // console.log("JSON STRINGIFY RESPONSE.DATA")
//       // console.log(JSON.stringify(response.data));
//       teams.push(response.data);
//       const { response: apiResponse } = teams[0]
//       // console.log("teams")
//       // console.log(teams)
//       // console.log("apiResponse")
//       // console.log(apiResponse)
//       res.render("api", { apiResponse });
//     })
//     .catch(function (error) {
//       console.log(error);
//     });

// const axios = require('axios');

// const config = {
//   method: 'get',
//   url: `https://v3.football.api-sports.io/teams?league=119&season=2021`,
//   headers: {
//     'x-rapidapi-key': 'c6fc4afceaf077867ce47212440002cf',
//     'x-rapidapi-host': 'v3.football.api-sports.io'
//   }
// };

// axios(config)
//   .then(function (response) {
//     console.log(JSON.stringify(response.data));
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

// })

app.get("/records", async (req, res) => {
  const playerQuery = req.query.player;

  if (
    (playerQuery && playerQuery === "Leo") ||
    playerQuery === "Max" ||
    playerQuery === "Nico" ||
    playerQuery === "Santi" ||
    playerQuery === "Lucho"
  ) {
    try {
      const allPlayerLongestWinningStreak = await playersModel
        .find({}, "name longestWinningStreak")
        .sort({
          longestWinningStreak: -1,
          longestDrawStreak: -1,
          longestLosingStreak: 1,
        });
      const allPlayerLongestDrawStreak = await playersModel
        .find({}, "name longestDrawStreak")
        .sort({ longestDrawStreak: -1 });
      const allPlayerLongestLosingStreak = await playersModel
        .find({}, "name longestLosingStreak")
        .sort({
          longestLosingStreak: -1,
          longestWinningStreak: -1,
          longestDrawStreak: -1,
        });

      const rankingForPlayerInWins =
        allPlayerLongestWinningStreak.findIndex(
          (element) => element.name === playerQuery
        ) + 1;
      const rankingForPlayerInDraws =
        allPlayerLongestDrawStreak.findIndex(
          (element) => element.name === playerQuery
        ) + 1;
      const rankingForPlayerInLoses =
        allPlayerLongestLosingStreak.findIndex(
          (element) => element.name === playerQuery
        ) + 1;

      const playerProfile = await playersModel.findOne({ name: playerQuery });

      const recentMatchesFromPlayer = await matchesModel
        .find({ $or: [{ playerP1: playerQuery }, { playerP2: playerQuery }] })
        .limit(10)
        .sort({ _id: -1 });

      const matchesWonByPlayer = await matchesModel.find(
        { "outcome.playerThatWon": playerQuery, "outcome.draw": false },
        "outcome"
      );

      const arrayOfTeams = [];

      matchesWonByPlayer.forEach((element, index) => {
        if (index === 0) {
          // Primer caso
          arrayOfTeams.push({
            team: element.outcome.teamThatWon,
            victories: 1,
          });
        } else {
          let indexOfElement = arrayOfTeams.findIndex(
            (object) => object.team === element.outcome.teamThatWon
          );
          indexOfElement === -1
            ? arrayOfTeams.push({
                team: element.outcome.teamThatWon,
                victories: 1,
              })
            : arrayOfTeams[indexOfElement].victories++;
        }
      });

      const arrayOfTeamsWithWins = [];

      arrayOfTeams.forEach(async (element) => {
        let amountOfMatches = await matchesModel.countDocuments({
          $or: [
            {
              $and: [{ playerP1: playerQuery }, { teamP1: element.team }],
            },
            {
              $and: [{ playerP2: playerQuery }, { teamP2: element.team }],
            },
          ],
        });
        arrayOfTeamsWithWins.push({
          team: element.team,
          matches: amountOfMatches,
          victories: element.victories,
          winRate: (element.victories / amountOfMatches) * 100,
        });
      }); // Lo dejo ejecutandose de manera asíncrona y sigo con lo otro! CHEQUEAR

      const allTournaments = await tournamentsModel.find({}, "name");

      const arrayOfMatchesByTournament = [];

      let itemsProcessed = 0;

      allTournaments.forEach(async (element, index) => {
        arrayOfMatchesByTournament.push({
          tournament: element.name,
          amount: await matchesModel.countDocuments({
            "tournament.id": element.id,
            $or: [{ playerP1: playerQuery }, { playerP2: playerQuery }],
          }),
          victories: await matchesModel.countDocuments({
            "tournament.id": element.id,
            "outcome.playerThatWon": playerQuery,
            "outcome.draw": false,
          }),
        });
        itemsProcessed++;
        if (itemsProcessed === allTournaments.length) {
          res.render("records-id", {
            playerProfile,
            rankingForPlayerInWins,
            rankingForPlayerInDraws,
            rankingForPlayerInLoses,
            recentMatchesFromPlayer,
            playerQuery,
            arrayOfTeamsWithWins,
            arrayOfMatchesByTournament,
          });
        }
      });
    } catch (err) {
      return res.status(500).send("Something went wrong!" + err);
    }
  } else {
    try {
      const amountOfMatchesByLeo = await matchesModel.countDocuments({
        $or: [{ playerP1: "Leo" }, { playerP2: "Leo" }],
      });

      const winsByTeamByLeo = await matchesModel.find(
        { "outcome.playerThatWon": "Leo", "outcome.draw": false },
        "outcome.teamThatWon"
      );

      const teamsThatWonByLeo = winsByTeamByLeo
        .map((element) => element.outcome.teamThatWon)
        .reduce((acc, curr) => {
          return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
        }, {});

      const sortableByLeo = Object.entries(teamsThatWonByLeo)
        .sort(([, b], [, a]) => a - b)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

      const winsByLeo = await matchesModel.countDocuments({
        "outcome.playerThatWon": "Leo",
        "outcome.draw": false,
      });

      const losesByLeo = await matchesModel.countDocuments({
        $and: [
          { $or: [{ playerP1: "Leo" }, { playerP2: "Leo" }] },
          {
            $nor: [
              { "outcome.playerThatWon": "Leo" },
              { "outcome.draw": true },
            ],
          },
        ],
      });

      const drawsByLeo = amountOfMatchesByLeo - winsByLeo - losesByLeo;

      const averageWinsByLeo = winsByLeo / amountOfMatchesByLeo; // Promedio de victorias por partido

      const averageLosesByLeo = losesByLeo / amountOfMatchesByLeo; // Promedio de derrotas por partido

      const averageDrawsByLeo = 1 - averageWinsByLeo - averageLosesByLeo; // Promedio de empates por partido

      const averagePointsByLeo = (winsByLeo * 3) / amountOfMatchesByLeo; // Promedio de puntos por partido

      const amountOfMatchesByMax = await matchesModel.countDocuments({
        $or: [{ playerP1: "Max" }, { playerP2: "Max" }],
      });

      const winsByTeamByMax = await matchesModel.find(
        { "outcome.playerThatWon": "Max", "outcome.draw": false },
        "outcome.teamThatWon"
      );

      const teamsThatWonByMax = winsByTeamByMax
        .map((element) => element.outcome.teamThatWon)
        .reduce((acc, curr) => {
          return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
        }, {});

      const sortableByMax = Object.entries(teamsThatWonByMax)
        .sort(([, b], [, a]) => a - b)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

      const winsByMax = await matchesModel.countDocuments({
        "outcome.playerThatWon": "Max",
        "outcome.draw": false,
      });

      const losesByMax = await matchesModel.countDocuments({
        $and: [
          { $or: [{ playerP1: "Max" }, { playerP2: "Max" }] },
          {
            $nor: [
              { "outcome.playerThatWon": "Max" },
              { "outcome.draw": true },
            ],
          },
        ],
      });

      const drawsByMax = amountOfMatchesByMax - winsByMax - losesByMax;

      const averageWinsByMax = winsByMax / amountOfMatchesByMax; // Promedio de victorias por partido

      const averageLosesByMax = losesByMax / amountOfMatchesByMax; // Promedio de derrotas por partido

      const averageDrawsByMax = 1 - averageWinsByMax - averageLosesByMax; // Promedio de empates por partido

      const averagePointsByMax = (winsByMax * 3) / amountOfMatchesByMax; // Promedio de puntos por partido

      const amountOfMatchesByNico = await matchesModel.countDocuments({
        $or: [{ playerP1: "Nico" }, { playerP2: "Nico" }],
      });

      const winsByTeamByNico = await matchesModel.find(
        { "outcome.playerThatWon": "Nico", "outcome.draw": false },
        "outcome.teamThatWon"
      );

      const teamsThatWonByNico = winsByTeamByNico
        .map((element) => element.outcome.teamThatWon)
        .reduce((acc, curr) => {
          return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
        }, {});

      const sortableByNico = Object.entries(teamsThatWonByNico)
        .sort(([, b], [, a]) => a - b)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

      const winsByNico = await matchesModel.countDocuments({
        "outcome.playerThatWon": "Nico",
        "outcome.draw": false,
      });

      const losesByNico = await matchesModel.countDocuments({
        $and: [
          { $or: [{ playerP1: "Nico" }, { playerP2: "Nico" }] },
          {
            $nor: [
              { "outcome.playerThatWon": "Nico" },
              { "outcome.draw": true },
            ],
          },
        ],
      });

      const drawsByNico = amountOfMatchesByNico - winsByNico - losesByNico;

      const averageWinsByNico = winsByNico / amountOfMatchesByNico; // Promedio de victorias por partido

      const averageLosesByNico = losesByNico / amountOfMatchesByNico; // Promedio de derrotas por partido

      const averageDrawsByNico = 1 - averageWinsByNico - averageLosesByNico; // Promedio de empates por partido

      const averagePointsByNico = (winsByNico * 3) / amountOfMatchesByNico; // Promedio de puntos por partido

      const amountOfMatchesBySanti = await matchesModel.countDocuments({
        $or: [{ playerP1: "Santi" }, { playerP2: "Santi" }],
      });

      const winsByTeamBySanti = await matchesModel.find(
        { "outcome.playerThatWon": "Santi", "outcome.draw": false },
        "outcome.teamThatWon"
      );

      const teamsThatWonBySanti = winsByTeamBySanti
        .map((element) => element.outcome.teamThatWon)
        .reduce((acc, curr) => {
          return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
        }, {});

      const sortableBySanti = Object.entries(teamsThatWonBySanti)
        .sort(([, b], [, a]) => a - b)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

      const winsBySanti = await matchesModel.countDocuments({
        "outcome.playerThatWon": "Santi",
        "outcome.draw": false,
      });

      const losesBySanti = await matchesModel.countDocuments({
        $and: [
          { $or: [{ playerP1: "Santi" }, { playerP2: "Santi" }] },
          {
            $nor: [
              { "outcome.playerThatWon": "Santi" },
              { "outcome.draw": true },
            ],
          },
        ],
      });

      const drawsBySanti = amountOfMatchesBySanti - winsBySanti - losesBySanti;

      const averageWinsBySanti = winsBySanti / amountOfMatchesBySanti; // Promedio de victorias por partido

      const averageLosesBySanti = losesBySanti / amountOfMatchesBySanti; // Promedio de derrotas por partido

      const averageDrawsBySanti = 1 - averageWinsBySanti - averageLosesBySanti; // Promedio de empates por partido

      const averagePointsBySanti = (winsBySanti * 3) / amountOfMatchesBySanti; // Promedio de puntos por partido

      const amountOfMatchesByLucho = await matchesModel.countDocuments({
        $or: [{ playerP1: "Lucho" }, { playerP2: "Lucho" }],
      });

      const winsByTeamByLucho = await matchesModel.find(
        { "outcome.playerThatWon": "Lucho", "outcome.draw": false },
        "outcome.teamThatWon"
      );

      const teamsThatWonByLucho = winsByTeamByLucho
        .map((element) => element.outcome.teamThatWon)
        .reduce((acc, curr) => {
          return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
        }, {});

      const sortableByLucho = Object.entries(teamsThatWonByLucho)
        .sort(([, b], [, a]) => a - b)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

      const winsByLucho = await matchesModel.countDocuments({
        "outcome.playerThatWon": "Lucho",
        "outcome.draw": false,
      });

      const losesByLucho = await matchesModel.countDocuments({
        $and: [
          { $or: [{ playerP1: "Lucho" }, { playerP2: "Lucho" }] },
          {
            $nor: [
              { "outcome.playerThatWon": "Lucho" },
              { "outcome.draw": true },
            ],
          },
        ],
      });

      const drawsByLucho = amountOfMatchesByLucho - winsByLucho - losesByLucho;

      const averageWinsByLucho = winsByLucho / amountOfMatchesByLucho; // Promedio de victorias por partido

      const averageLosesByLucho = losesByLucho / amountOfMatchesByLucho; // Promedio de derrotas por partido

      const averageDrawsByLucho = 1 - averageWinsByLucho - averageLosesByLucho; // Promedio de empates por partido

      const averagePointsByLucho = (winsByLucho * 3) / amountOfMatchesByLucho; // Promedio de puntos por partido

      const orderedByScoringDif = await matchesModel
        .find(
          { "outcome.draw": false },
          "playerP1 scoreP1 teamP1 playerP2 scoreP2 teamP2 tournament"
        )
        .sort({
          "outcome.scoringDifference": -1,
          "outcome.scoreFromTeamThatWon": -1,
        })
        .limit(5);

      const totalMatchesForEachPlayer = [
        { player: "Leo", matches: amountOfMatchesByLeo },
        { player: "Max", matches: amountOfMatchesByMax },
        { player: "Nico", matches: amountOfMatchesByNico },
        { player: "Santi", matches: amountOfMatchesBySanti },
        { player: "Lucho", matches: amountOfMatchesByLucho },
      ];

      const orderedByMostWins = [
        { player: "Leo", wins: winsByLeo },
        { player: "Max", wins: winsByMax },
        { player: "Nico", wins: winsByNico },
        { player: "Santi", wins: winsBySanti },
        { player: "Lucho", wins: winsByLucho },
      ].sort((a, b) => (a.wins > b.wins ? -1 : 1));

      const orderedByMostDraws = [
        { player: "Leo", draws: drawsByLeo },
        { player: "Max", draws: drawsByMax },
        { player: "Nico", draws: drawsByNico },
        { player: "Santi", draws: drawsBySanti },
        { player: "Lucho", draws: drawsByLucho },
      ].sort((a, b) => (a.draws > b.draws ? -1 : 1));

      const orderedByMostLoses = [
        { player: "Leo", loses: losesByLeo },
        { player: "Max", loses: losesByMax },
        { player: "Nico", loses: losesByNico },
        { player: "Santi", loses: losesBySanti },
        { player: "Lucho", loses: losesByLucho },
      ].sort((a, b) => (a.loses > b.loses ? -1 : 1));

      const orderedByMostAverageWins = [
        { player: "Leo", averageWins: averageWinsByLeo },
        { player: "Max", averageWins: averageWinsByMax },
        { player: "Nico", averageWins: averageWinsByNico },
        { player: "Santi", averageWins: averageWinsBySanti },
        { player: "Lucho", averageWins: averageWinsByLucho },
      ].sort((a, b) => (a.averageWins > b.averageWins ? -1 : 1));

      const orderedByMostAverageDraws = [
        { player: "Leo", averageDraws: averageDrawsByLeo },
        { player: "Max", averageDraws: averageDrawsByMax },
        { player: "Nico", averageDraws: averageDrawsByNico },
        { player: "Santi", averageDraws: averageDrawsBySanti },
        { player: "Lucho", averageDraws: averageDrawsByLucho },
      ].sort((a, b) => (a.averageDraws > b.averageDraws ? -1 : 1));

      const orderedByMostAverageLoses = [
        { player: "Leo", averageLoses: averageLosesByLeo },
        { player: "Max", averageLoses: averageLosesByMax },
        { player: "Nico", averageLoses: averageLosesByNico },
        { player: "Santi", averageLoses: averageLosesBySanti },
        { player: "Lucho", averageLoses: averageLosesByLucho },
      ].sort((a, b) => (a.averageLoses > b.averageLoses ? -1 : 1));

      const orderedByMostAveragePoints = [
        { player: "Leo", averagePoints: averagePointsByLeo },
        { player: "Max", averagePoints: averagePointsByMax },
        { player: "Nico", averagePoints: averagePointsByNico },
        { player: "Santi", averagePoints: averagePointsBySanti },
        { player: "Lucho", averagePoints: averagePointsByLucho },
      ].sort((a, b) => (a.averagePoints > b.averagePoints ? -1 : 1));

      const teamThatWonTheMostByPlayer = [
        {
          player: "Leo",
          team: Object.keys(sortableByLeo)[0],
          victories: Object.values(sortableByLeo)[0],
        },
        {
          player: "Max",
          team: Object.keys(sortableByMax)[0],
          victories: Object.values(sortableByMax)[0],
        },
        {
          player: "Nico",
          team: Object.keys(sortableByNico)[0],
          victories: Object.values(sortableByNico)[0],
        },
        {
          player: "Santi",
          team: Object.keys(sortableBySanti)[0],
          victories: Object.values(sortableBySanti)[0],
        },
        {
          player: "Lucho",
          team: Object.keys(sortableByLucho)[0],
          victories: Object.values(sortableByLucho)[0],
        },
      ];

      res.render("records", {
        orderedByScoringDif,
        totalMatchesForEachPlayer,
        orderedByMostWins,
        orderedByMostDraws,
        orderedByMostLoses,
        orderedByMostAverageWins,
        orderedByMostAverageDraws,
        orderedByMostAverageLoses,
        orderedByMostAveragePoints,
        teamThatWonTheMostByPlayer,
      });
    } catch (err) {
      return res.status(500).send("Something went wrong!" + err);
    }
  }
});

app.get("/standings", async (req, res) => {
  try {
    const tournaments = await tournamentsModel.find(
      { ongoing: true },
      "name teams"
    );

    const standingsArray = [];

    let counter = 0;

    tournaments.forEach(async (tournament) => {
      const standings = [];

      let matches = await matchesModel
        .find(
          { "tournament.id": tournament.id },
          "teamP1 scoreP1 teamP2 scoreP2 outcome"
        )
        .sort({ _id: -1 });

      tournament.teams.forEach(async (team) => {
        let played = matches.filter(
          (element) =>
            element.teamP1 === team.team || element.teamP2 === team.team
        ).length;
        let wins = matches.filter(
          (element) => element.outcome.teamThatWon === team.team
        ).length;
        let draws = matches.filter(
          (element) =>
            (element.teamP1 === team.team || element.teamP2 === team.team) &&
            element.outcome.draw
        ).length;
        let losses = matches.filter(
          (element) => element.outcome.teamThatLost === team.team
        ).length;
        let goalsFor =
          matches
            .filter((element) => element.teamP1 === team.team)
            .reduce((acc, curr) => {
              return acc + curr.scoreP1;
            }, 0) +
          matches
            .filter((element) => element.teamP2 === team.team)
            .reduce((acc, curr) => {
              return acc + curr.scoreP2;
            }, 0);
        let goalsAgainst =
          matches
            .filter((element) => element.teamP1 === team.team)
            .reduce((acc, curr) => {
              return acc + curr.scoreP2;
            }, 0) +
          matches
            .filter((element) => element.teamP2 === team.team)
            .reduce((acc, curr) => {
              return acc + curr.scoreP1;
            }, 0);
        let scoringDifference = goalsFor - goalsAgainst;
        let points = wins * 3 + draws;

        let { id, player, logo, teamCode } = team;

        standings.push({
          id,
          team: team.team,
          player,
          logo,
          teamCode,
          played,
          wins,
          draws,
          losses,
          goalsFor,
          goalsAgainst,
          scoringDifference,
          points,
        });
      });

      let sortedStanding = standings.sort(function (a, b) {
        if (a.points > b.points) return -1;
        if (a.points < b.points) return 1;

        if (a.scoringDifference > b.scoringDifference) return -1;
        if (a.scoringDifference < b.scoringDifference) return 1;

        if (a.goalsFor > b.goalsFor) return -1;
        if (a.goalsFor < b.goalsFor) return 1;

        if (a.goalsAgainst > b.goalsAgainst) return 1;
        if (a.goalsAgainst < b.goalsAgainst) return -1;
      });

      standingsArray.push({
        name: tournament.name,
        tournamentId: tournament.id,
        sortedStanding,
      });

      counter++;

      if (counter === tournaments.length) {
        res.render("standings-id", { standingsArray });
      }
    });
  } catch (err) {
    return res.status(500).send("Something went wrong!" + err);
  }
});

// app.get("/standings/:id", async (req, res) => {

//   const idProvided = req.params.id;
//   // Chequeo mediante RegEx si, en potencia, el ID proporcionado es válido (en formato) //
//   try {
//     if (idProvided.match(/^[0-9a-fA-F]{24}$/)) { // Y si ingresan un id válido por formato pero NO coincide con uno de la BD? REVISAR - TESTEAR - Debería traer [] ?

//       const tournamentById = await tournamentsModel.findById(idProvided, "name players teams");

//       const standingsToBeSorted = tournamentById.teams;

//       const standings = standingsToBeSorted.sort(function (a, b) {

//         if (a.points > b.points) return -1;
//         if (a.points < b.points) return 1;

//         if (a.scoringDifference > b.scoringDifference) return -1;
//         if (a.scoringDifference < b.scoringDifference) return 1;

//         if (a.goalsFor > b.goalsFor) return -1;
//         if (a.goalsFor < b.goalsFor) return 1;

//         if (a.goalsAgainst > b.goalsAgainst) return 1;
//         if (a.goalsAgainst < b.goalsAgainst) return -1;

//       });

//       res.render("standings-id", { tournamentById, standings });
//     }
//     else {
//       res.render("./errors/tournaments-id-error", { idProvided });
//       return;
//     }
//   } catch (err) {
//     return res.status(400).send("Something went wrong!" + err); // MANEJO DE ERRORES: UTILIZAR UN IF DONDE, SI COINCIDE CON UN ERROR PREVISTO, RENDERIZO UNA VISTA ADECUADA //
//   }
// });

app.get("/create-tournament", (req, res) => {
  res.render("create-tournament", {});
});

app.post("/create-tournament", async (req, res) => {
  try {
    const { tournamentName, format, origin } = req.body;

    console.log(req.body);

    const arrayFromValues = Object.values(req.body);

    const filteredArrayFromValues = arrayFromValues.filter(
      (element) =>
        element !== tournamentName && element !== format && element !== origin
    ); // Creo un array que solo tenga jugadores y equipos

    const humanPlayers = [];
    const teams = [];
    let infoFromApi;
    let response;
    let newTeam;
    let counter = 0;

    filteredArrayFromValues.forEach(async (element, index) => {
      if (
        element === "Leo" ||
        element === "Lucho" ||
        element === "Max" ||
        element === "Nico" ||
        element === "Santi"
      ) {
        humanPlayers.push(element);
        counter++;
        console.log(counter);
      } else {
        console.log("response");
        infoFromApi = await require(`./public/teams/${
          element.split("|")[1]
        }-teams.json`);

        // console.log(infoFromApi.response);

        response = infoFromApi.response;

        // console.log(response);

        newTeam = response
          .filter((filtered) => filtered.team.id == element.split("|")[0])
          .map(({ team: { id, name, code, logo } }) => {
            return {
              id,
              team: name,
              teamCode: code,
              countryCode: element.split("|")[1],
              logo,
              played: 0,
              wins: 0,
              draws: 0,
              losses: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              scoringDifference: 0,
              points: 0,
            };
          })[0];

        console.log(newTeam);

        teams.push(newTeam);

        counter++;
        console.log(counter);
      }

      if (counter === filteredArrayFromValues.length) {
        const tournament = {
          name: tournamentName,
          players: humanPlayers,
          format,
          origin,
          teams,
          fixtureStatus: false,
          ongoing: true, // TO DO: I may use a PUT request to inform that a tournament has finished. //
        };

        await tournamentsModel.create(tournament);
        res.redirect("/lottery-tournament-selection");
      }
    });
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

app.get("/face-to-face", async (req, res) => {
  try {
    const tournamentId = req.query.id;

    const allTournaments = await tournamentsModel.find({}, "id name status");

    const array = [];
    let finalMatchups = [];

    if (tournamentId) {
      const allMatches = await matchesModel.find(
        { "tournament.id": tournamentId },
        "playerP1 teamP1 scoreP1 playerP2 teamP2 scoreP2"
      );

      if (allMatches.length === 0)
        res.render("./errors/face-to-face-error", { tournamentId });

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
          await matchesModel.find({
            "tournament.id": tournamentId,
            $or: [
              { $and: [{ playerP1: element.p1 }, { rivalOfP1: element.p2 }] },
              { $and: [{ playerP1: element.p2 }, { rivalOfP1: element.p1 }] },
            ],
          })
        ); // ESTE LLAMADO NO DEBERÍA CAMBIARLO POR UN FILTER? ESTA INFO YA LA TENGO, ES INNECESARIA UNA NUEVA LLAMADA A LA BD! //

        itemsProcessed++;

        if (itemsProcessed === allMatchups.length) {
          const workedMatchups = allMatchups.map((element, index) => {
            return {
              matchup: `${array[index][0]?.playerP1} (J1) vs ${array[index][0]?.rivalOfP1} (J2)`,
              matches: array[index],
              wonByP1: array[index].reduce(
                (acc, cur) =>
                  cur.outcome.playerThatWon === array[index][0].playerP1
                    ? ++acc
                    : acc,
                0
              ),
              wonByP2: array[index].reduce(
                (acc, cur) =>
                  cur.outcome.playerThatWon === array[index][0].playerP2
                    ? ++acc
                    : acc,
                0
              ),
              draws: array[index].reduce(
                (acc, cur) => (cur.outcome.draw ? ++acc : acc),
                0
              ),
              scoreByP1:
                array[index]
                  .filter(
                    (element) => element.playerP1 === array[index][0].playerP1
                  )
                  .reduce((acc, cur) => acc + cur.scoreP1, 0) +
                array[index]
                  .filter(
                    (element) => element.playerP1 === array[index][0].playerP2
                  )
                  .reduce((acc, cur) => acc + cur.scoreP2, 0), // Para calcular, filtro por posición y sumo ambas posibilidades.

              scoreByP2:
                array[index]
                  .filter(
                    (element) => element.playerP2 === array[index][0].playerP2
                  )
                  .reduce((acc, cur) => acc + cur.scoreP2, 0) +
                array[index]
                  .filter(
                    (element) => element.playerP2 === array[index][0].playerP1
                  )
                  .reduce((acc, cur) => acc + cur.scoreP1, 0),
            };
          });

          const finalMatchups = workedMatchups.filter((element) => {
            return element.matchup !== "undefined (J1) vs undefined (J2)";
          });

          res.render("face-to-face", {
            finalMatchups,
            allMatches,
            allTournaments,
          });
        }
      });
    } else {
      const allMatches = await matchesModel.find(
        {},
        "playerP1 teamP1 scoreP1 playerP2 teamP2 scoreP2"
      );

      if (allMatches.length === 0) {
        res.render("face-to-face", {
          finalMatchups,
          allMatches,
          allTournaments,
        });
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
          await matchesModel.find({
            $or: [
              { $and: [{ playerP1: element.p1 }, { rivalOfP1: element.p2 }] },
              { $and: [{ playerP1: element.p2 }, { rivalOfP1: element.p1 }] },
            ],
          })
        ); // ESTE LLAMADO NO DEBERÍA CAMBIARLO POR UN FILTER? ESTA INFO YA LA TENGO, ES INNECESARIA UNA NUEVA LLAMADA A LA BD! //
        itemsProcessed++;
        if (itemsProcessed === allMatchups.length) {
          const workedMatchups = allMatchups.map((element, index) => ({
            matchup: `${array[index][0]?.playerP1} (J1) vs ${array[index][0]?.rivalOfP1} (J2)`,
            matches: array[index],
            wonByP1: array[index].reduce(
              (acc, cur) =>
                cur.outcome.playerThatWon === array[index][0].playerP1
                  ? ++acc
                  : acc,
              0
            ),
            wonByP2: array[index].reduce(
              (acc, cur) =>
                cur.outcome.playerThatWon === array[index][0].playerP2
                  ? ++acc
                  : acc,
              0
            ),
            draws: array[index].reduce(
              (acc, cur) => (cur.outcome.draw ? ++acc : acc),
              0
            ),
            scoreByP1:
              array[index]
                .filter(
                  (element) => element.playerP1 === array[index][0].playerP1
                )
                .reduce((acc, cur) => acc + cur.scoreP1, 0) +
              array[index]
                .filter(
                  (element) => element.playerP1 === array[index][0].playerP2
                )
                .reduce((acc, cur) => acc + cur.scoreP2, 0), // Para calcular, filtro por posición y sumo ambas posibilidades.

            scoreByP2:
              array[index]
                .filter(
                  (element) => element.playerP2 === array[index][0].playerP2
                )
                .reduce((acc, cur) => acc + cur.scoreP2, 0) +
              array[index]
                .filter(
                  (element) => element.playerP2 === array[index][0].playerP1
                )
                .reduce((acc, cur) => acc + cur.scoreP1, 0),
          }));

          const finalMatchups = workedMatchups.filter((element) => {
            return element.matchup !== "undefined (J1) vs undefined (J2)";
          });

          res.render("face-to-face", {
            finalMatchups,
            allMatches,
            allTournaments,
          });
        }
      });
    }
  } catch (err) {
    return res.status(500).send(err);
  }

  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

app.get("/upload-game", async (req, res) => {
  const idProvided = false;
  try {
    const tournamentsFromBD = await tournamentsModel.find({ ongoing: true }); // Solo traigo los torneos que se encuentren en curso.
    if (!tournamentsFromBD.length) {
      res.render("./errors/upload-game-error", { idProvided });
      return;
    }
    res.render("tournament-selection", { tournamentsFromBD });
  } catch (err) {
    res.status(500).send("Something went wrong" + err);
  }
});

app.post("/upload-game", (req, res) => {
  // POST O GET?
  const selectedTournamentId = req.body.selection; // I must use the select "name" property;
  res.redirect(`/upload-game/${selectedTournamentId}`);
});

app.get("/upload-game/:id", async (req, res) => {
  const idProvided = req.params.id;

  // Chequeo mediante RegEx si, en potencia, el ID proporcionado es válido (en formato) //

  try {
    if (idProvided.match(/^[0-9a-fA-F]{24}$/)) {
      const tournamentById = await tournamentsModel.findById(idProvided);
      res.render("upload-game", { tournamentById });
    } else {
      res.render("./errors/upload-game-error", { idProvided });
      return;
    }
  } catch (err) {
    res.status(500).send("Something went wrongggg" + err);
  }
});

app.post("/upload-game/:id", async (req, res) => {
  try {
    const tournamentId = req.params.id;

    const { id, name, format, origin, teams, fixture } =
      await tournamentsModel.findById(
        tournamentId,
        "name format origin teams fixture"
      );

    let {
      playerP1,
      teamP1,
      scoreP1,
      penaltyScoreP1,
      playerP2,
      teamP2,
      scoreP2,
      penaltyScoreP2,
    } = req.body;

    let rivalOfP1 = playerP2;
    let rivalOfP2 = playerP1;
    let outcome;

    if (scoreP1 - scoreP2 !== 0) {
      scoreP1 > scoreP2
        ? (outcome = {
            playerThatWon: playerP1,
            teamThatWon: teamP1,
            scoreFromTeamThatWon: scoreP1,
            playerThatLost: playerP2,
            teamThatLost: teamP2,
            scoreFromTeamThatLost: scoreP2,
            draw: false,
            penalties: false,
            scoringDifference: Math.abs(scoreP1 - scoreP2), // Es indistinto el orden, pues calculo valor absoluto.
          })
        : (outcome = {
            playerThatWon: playerP2,
            teamThatWon: teamP2,
            scoreFromTeamThatWon: scoreP2,
            playerThatLost: playerP1,
            teamThatLost: teamP1,
            scoreFromTeamThatLost: scoreP1,
            draw: false,
            penalties: false,
            scoringDifference: Math.abs(scoreP1 - scoreP2), // Es indistinto el orden, pues calculo valor absoluto.
          });
    } else if (scoreP1 - scoreP2 === 0 && penaltyScoreP1 && penaltyScoreP2) {
      // Empate, y hubo penales
      penaltyScoreP1 > penaltyScoreP2
        ? (outcome = {
            playerThatWon: playerP1,
            teamThatWon: teamP1,
            scoreFromTeamThatWon: penaltyScoreP1,
            playerThatLost: playerP2,
            teamThatLost: teamP2,
            scoreFromTeamThatLost: penaltyScoreP2,
            draw: true,
            penalties: true,
            scoringDifference: 0,
          })
        : (outcome = {
            playerThatWon: playerP2,
            teamThatWon: teamP2,
            scoreFromTeamThatWon: penaltyScoreP2,
            playerThatLost: playerP1,
            teamThatLost: teamP1,
            scoreFromTeamThatLost: penaltyScoreP1,
            draw: true,
            penalties: true,
            scoringDifference: 0,
          });
    } else {
      // Empate, pero no hubo penales!
      outcome = {
        playerThatWon: "none",
        teamThatWon: "none",
        scoreFromTeamThatWon: "none",
        playerThatLost: "none",
        teamThatLost: "none",
        scoreFromTeamThatLost: "none",
        draw: true,
        penalties: false,
        scoringDifference: 0,
      };
    }

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
      tournament: {
        name,
        id,
        format,
        origin,
      },
    };

    if (!match.outcome.draw) {
      // Para actualizar las rachas y la tabla, SI NO EMPATAN

      // ACTUALIZO TABLA DE POSICIONES //

      // const indexOfWinningTeam = teams.findIndex(
      //   (element) => element.team === match.outcome.teamThatWon
      // );

      // const updatedWinnerPlayed = Number(teams[indexOfWinningTeam].played) + 1;
      // const updatedWinnerWins = Number(teams[indexOfWinningTeam].wins) + 1;
      // const updatedWinnerGoalsFor =
      //   Number(teams[indexOfWinningTeam].goalsFor) +
      //   Number(match.outcome.scoreFromTeamThatWon);
      // const updatedWinnerGoalsAgainst =
      //   Number(teams[indexOfWinningTeam].goalsAgainst) +
      //   Number(match.outcome.scoreFromTeamThatLost);
      // const updatedWinnerScoringDifference =
      //   Number(teams[indexOfWinningTeam].scoringDifference) +
      //   Number(match.outcome.scoringDifference);
      // const updatedWinnerPoints = Number(teams[indexOfWinningTeam].points) + 3;

      // await tournamentsModel.updateOne(
      //   { _id: tournamentId, "teams.team": match.outcome.teamThatWon },
      //   {
      //     $set: {
      //       "teams.$.played": updatedWinnerPlayed,
      //       "teams.$.wins": updatedWinnerWins,
      //       "teams.$.goalsFor": updatedWinnerGoalsFor,
      //       "teams.$.goalsAgainst": updatedWinnerGoalsAgainst,
      //       "teams.$.scoringDifference": updatedWinnerScoringDifference,
      //       "teams.$.points": updatedWinnerPoints,
      //     },
      //   }
      // );

      // const indexOfLosingTeam = teams.findIndex(
      //   (element) => element.team === match.outcome.teamThatLost
      // );

      // const updatedLoserPlayed = Number(teams[indexOfLosingTeam].played) + 1;
      // const updatedLoserLosses = Number(teams[indexOfLosingTeam].losses) + 1;
      // const updatedLoserGoalsFor =
      //   Number(teams[indexOfLosingTeam].goalsFor) +
      //   Number(match.outcome.scoreFromTeamThatLost);
      // const updatedLoserGoalsAgainst =
      //   Number(teams[indexOfLosingTeam].goalsAgainst) +
      //   Number(match.outcome.scoreFromTeamThatWon);
      // const updatedLoserScoringDifference =
      //   Number(teams[indexOfLosingTeam].scoringDifference) -
      //   Number(match.outcome.scoringDifference);

      // await tournamentsModel.updateOne(
      //   { _id: tournamentId, "teams.team": match.outcome.teamThatLost },
      //   {
      //     $set: {
      //       "teams.$.played": updatedLoserPlayed,
      //       "teams.$.losses": updatedLoserLosses,
      //       "teams.$.goalsFor": updatedLoserGoalsFor,
      //       "teams.$.goalsAgainst": updatedLoserGoalsAgainst,
      //       "teams.$.scoringDifference": updatedLoserScoringDifference,
      //     },
      //   }
      // );

      // CREO EL PARTIDO Y LO SUBO A LA BD, TAMBIÉN OBTENGO SU ID //

      const createdMatch = await matchesModel.create(match);

      const matchId = createdMatch.id;

      // ACTUALIZO EL FIXTURE //

      let index = fixture.findIndex((element) => {
        return (
          element.teamP1 === match.outcome.teamThatWon &&
          element.teamP2 === match.outcome.teamThatLost
        );
      });

      if (index !== -1) {
        await tournamentsModel.updateOne(
          {
            _id: tournamentId,
            fixture: {
              $elemMatch: {
                teamP1: match.outcome.teamThatWon,
                teamP2: match.outcome.teamThatLost,
              },
            },
          },
          {
            $set: {
              "fixture.$.scoreP1": Number(match.outcome.scoreFromTeamThatWon),
              "fixture.$.scoreP2": Number(match.outcome.scoreFromTeamThatLost),
              "fixture.$.matchId": matchId,
            },
          }
        );
      }

      if (index === -1) {
        await tournamentsModel.updateOne(
          {
            _id: tournamentId,
            fixture: {
              $elemMatch: {
                teamP1: match.outcome.teamThatLost,
                teamP2: match.outcome.teamThatWon,
              },
            },
          },
          {
            $set: {
              "fixture.$.scoreP1": Number(match.outcome.scoreFromTeamThatLost),
              "fixture.$.scoreP2": Number(match.outcome.scoreFromTeamThatWon),
              "fixture.$.matchId": matchId,
            },
          }
        );
      }

      // ACTUALIZO RACHAS //

      let winner = await playersModel.findOne({
        name: match.outcome.playerThatWon,
      });
      let loser = await playersModel.findOne({
        name: match.outcome.playerThatLost,
      });

      winner.losingStreak = 0;
      winner.drawStreak = 0;
      winner.winningStreak++;

      if (winner.winningStreak > winner.longestWinningStreak) {
        winner.longestWinningStreak++;
      }

      loser.winningStreak = 0;
      loser.drawStreak = 0;
      loser.losingStreak++;

      if (loser.losingStreak > loser.longestLosingStreak) {
        loser.longestLosingStreak++;
      }

      await winner.save();
      await loser.save();
    }
    // SI EMPATAN //
    else {
      // TABLA DE POSICIONES //

      // const indexOfFirstTeam = teams.findIndex(
      //   (element) => element.team === teamP1
      // );

      // const updatedFirstPlayed = Number(teams[indexOfFirstTeam].played) + 1;
      // const updatedFirstDraws = Number(teams[indexOfFirstTeam].draws) + 1;
      // const updatedFirstGoalsFor =
      //   Number(teams[indexOfFirstTeam].goalsFor) + Number(scoreP1);
      // const updatedFirstGoalsAgainst =
      //   Number(teams[indexOfFirstTeam].goalsAgainst) + Number(scoreP2);
      // const updatedFirstPoints = Number(teams[indexOfFirstTeam].points) + 1;

      // await tournamentsModel.updateOne(
      //   { _id: tournamentId, "teams.team": teamP1 },
      //   {
      //     $set: {
      //       "teams.$.played": updatedFirstPlayed,
      //       "teams.$.draws": updatedFirstDraws,
      //       "teams.$.goalsFor": updatedFirstGoalsFor,
      //       "teams.$.goalsAgainst": updatedFirstGoalsAgainst,
      //       "teams.$.points": updatedFirstPoints,
      //     },
      //   }
      // );

      // const indexOfSecondTeam = teams.findIndex(
      //   (element) => element.team === teamP2
      // );

      // const updatedSecondPlayed = Number(teams[indexOfSecondTeam].played) + 1;
      // const updatedSecondDraws = Number(teams[indexOfSecondTeam].draws) + 1;
      // const updatedSecondGoalsFor =
      //   Number(teams[indexOfSecondTeam].goalsFor) + Number(scoreP2);
      // const updatedSecondGoalsAgainst =
      //   Number(teams[indexOfSecondTeam].goalsAgainst) + Number(scoreP1);
      // const updatedSecondPoints = Number(teams[indexOfSecondTeam].points) + 1;

      // await tournamentsModel.updateOne(
      //   { _id: tournamentId, "teams.team": teamP2 },
      //   {
      //     $set: {
      //       "teams.$.played": updatedSecondPlayed,
      //       "teams.$.draws": updatedSecondDraws,
      //       "teams.$.goalsFor": updatedSecondGoalsFor,
      //       "teams.$.goalsAgainst": updatedSecondGoalsAgainst,
      //       "teams.$.points": updatedSecondPoints,
      //     },
      //   }
      // );

      // CREO EL PARTIDO Y LO SUBO A LA BD, TAMBIÉN OBTENGO SU ID //

      const createdMatch = await matchesModel.create(match);

      const matchId = createdMatch.id;

      console.log(matchId);

      // ACTUALIZO EL FIXTURE //

      let index = fixture.findIndex((element) => {
        return element.teamP1 === teamP1 && element.teamP2 === teamP2;
      });

      if (index !== -1) {
        await tournamentsModel.updateOne(
          {
            _id: tournamentId,
            fixture: { $elemMatch: { teamP1: teamP1, teamP2: teamP2 } },
          },
          {
            $set: {
              "fixture.$.scoreP1": Number(scoreP1),
              "fixture.$.scoreP2": Number(scoreP2),
              "fixture.$.matchId": matchId,
            },
          }
        );
      }

      if (index === -1) {
        await tournamentsModel.updateOne(
          {
            _id: tournamentId,
            fixture: { $elemMatch: { teamP1: teamP2, teamP2: teamP1 } },
          },
          {
            $set: {
              "fixture.$.scoreP1": Number(scoreP2),
              "fixture.$.scoreP2": Number(scoreP1),
              "fixture.$.matchId": matchId,
            },
          }
        );
      }

      // ACTUALIZO RACHAS //

      let playerOne = await playersModel.findOne({ name: playerP1 });
      let playerTwo = await playersModel.findOne({ name: playerP2 });

      playerOne.winningStreak = 0;
      playerOne.losingStreak = 0;
      playerOne.drawStreak++;

      playerTwo.winningStreak = 0;
      playerTwo.losingStreak = 0;
      playerTwo.drawStreak++;

      if (playerOne.drawStreak > playerOne.longestDrawStreak) {
        playerOne.longestDrawStreak++;
      }

      if (playerTwo.drawStreak > playerTwo.longestDrawStreak) {
        playerTwo.longestDrawStreak++;
      }

      await playerOne.save();
      await playerTwo.save();
    }

    res.redirect(`/fixture/${tournamentId}`);
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = {};

      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });

      return res.status(400).send(errors);
    }
    res.status(500).send("Something went wrong" + err);
  }
});

app.post(
  "/update-game/:id/:matchId",
  methodOverride("_method"),
  async (req, res) => {
    try {
      const tournamentId = req.params.id;
      const matchId = req.params.matchId;

      let { teamP1, teamP2, scoreP1, scoreP2, playerP1, playerP2 } = req.body;

      // Actualizo face-to-face //

      const match = await matchesModel.findById(
        matchId,
        "teamP1 teamP2 outcome"
      );

      let outcome;

      if (scoreP1 - scoreP2 !== 0) {
        scoreP1 > scoreP2
          ? (outcome = {
              playerThatWon: playerP1,
              teamThatWon: teamP1,
              scoreFromTeamThatWon: Number(scoreP1),
              playerThatLost: playerP2,
              teamThatLost: teamP2,
              scoreFromTeamThatLost: Number(scoreP2),
              draw: false,
              penalties: false,
              scoringDifference: Math.abs(scoreP1 - scoreP2),
            })
          : (outcome = {
              playerThatWon: playerP2,
              teamThatWon: teamP2,
              scoreFromTeamThatWon: Number(scoreP2),
              playerThatLost: playerP1,
              teamThatLost: teamP1,
              scoreFromTeamThatLost: Number(scoreP1),
              draw: false,
              penalties: false,
              scoringDifference: Math.abs(scoreP1 - scoreP2),
            });
      } else {
        // Empate
        outcome = {
          playerThatWon: "none",
          teamThatWon: "none",
          scoreFromTeamThatWon: "none",
          playerThatLost: "none",
          teamThatLost: "none",
          scoreFromTeamThatLost: "none",
          draw: true,
          penalties: false,
          scoringDifference: 0,
        };
      }

      if (match) {
        match.teamP1 === teamP1
          ? await match.updateOne({ scoreP1, scoreP2, outcome })
          : await match.updateOne({
              scoreP1: scoreP2,
              scoreP2: scoreP1,
              outcome,
            });
      }

      // Actualizo fixture //

      await tournamentsModel.updateOne(
        {
          _id: tournamentId,
          fixture: {
            $elemMatch: {
              teamP1,
              teamP2,
            },
          },
        },
        {
          $set: {
            "fixture.$.scoreP1": Number(scoreP1),
            "fixture.$.scoreP2": Number(scoreP2),
          },
        }
      );

      res.redirect(`/fixture/${tournamentId}`);
    } catch (err) {
      if (err.name === "ValidationError") {
        const errors = {};

        Object.keys(err.errors).forEach((key) => {
          errors[key] = err.errors[key].message;
        });

        return res.status(400).send(errors);
      }
      res.status(500).send("Something went wrong" + err);
    }
  }
);

app.post(
  "/delete-game/:id/:matchId",
  methodOverride("_method"),
  async (req, res) => {
    try {
      const tournamentId = req.params.id;
      const matchId = req.params.matchId;

      await matchesModel.findByIdAndRemove(matchId); // Borro el partido de la colección face-to-face //

      // Actualizo fixture //

      await tournamentsModel.updateOne(
        {
          _id: tournamentId,
          fixture: {
            $elemMatch: {
              matchId,
            },
          },
        },
        {
          $unset: {
            "fixture.$.scoreP1": "",
            "fixture.$.scoreP2": "",
          },
        }
      );

      res.redirect(`/fixture/${tournamentId}`);
    } catch (err) {
      if (err.name === "ValidationError") {
        const errors = {};

        Object.keys(err.errors).forEach((key) => {
          errors[key] = err.errors[key].message;
        });

        return res.status(400).send(errors);
      }
      res.status(500).send("Something went wrong" + err);
    }
  }
);

app.get("/lottery-tournament-selection", async (req, res) => {
  try {
    const tournamentsFromBD = await tournamentsModel.find({ ongoing: true }); // Solo traigo los torneos que se encuentren en curso.
    if (!tournamentsFromBD.length) {
      res.render("./errors/lottery-error");
      return;
    }
    res.render("lottery-tournament-selection", { tournamentsFromBD });
  } catch (err) {
    res.status(500).send("Something went wrong" + err);
  }
});

app.post("/lottery-tournament-selection", async (req, res) => {
  try {
    const { tournament, players, teams } = req.body;
    if (tournament.match(/^[0-9a-fA-F]{24}$/)) {
      // const tournamentById = await tournamentsModel.findById(tournament);
      res.redirect(`/lottery/${tournament}?players=${players}&teams=${teams}`);
    }
  } catch (err) {
    res.status(500).send("Something went wrong" + err);
  }
});

app.get("/lottery/:id", async (req, res) => {
  const idProvided = req.params.id;
  const { players, teams } = req.query;
  try {
    const tournamentById = await tournamentsModel.findById(idProvided);
    if (!tournamentById) {
      res.render("./errors/tournaments-id-error", { idProvided });
      return;
    }
    res.render("lottery", { tournamentById, players, teams });
  } catch (err) {
    res.status(500).send("Something went wrong" + err);
  }
});

app.post("/lottery-assignment/:id", async (req, res) => {
  try {
    const { players, teams } = req.body;
    const tournamentId = req.params.id;
    const assignmentArray = [];

    const tournament = await tournamentsModel.findById(tournamentId, "teams");

    const teamsFromTournament = tournament.teams;

    teams.forEach(async (element, index) => {
      let { id, team, logo } = teamsFromTournament.filter(
        (filtered) => filtered.id == element.split("|")[0]
      )[0]; // Me quedo el único elemento de la lista

      let assignment = {
        id,
        player: players[index],
        team,
        logo,
      };

      assignmentArray.push(assignment);
    });

    // Actualizo "teams" dentro del torneo, para sumar la info de qué jugadores juegan con qué equipos. Es necesario para los standings //

    assignmentArray.forEach(async (assignment) => {
      let team = assignment.team;

      await tournamentsModel.updateOne(
        { _id: tournamentId, "teams.team": team },
        {
          $set: {
            "teams.$.player": assignment.player,
          },
        }
      );
    });

    const playerArray = await tournamentsModel.findById(
      tournamentId,
      "players"
    );

    const definitiveFixture = fixture(assignmentArray, playerArray.players); // GENERO EL FIXTURE

    await tournamentsModel.findByIdAndUpdate(tournamentId, {
      fixture: definitiveFixture,
      fixtureStatus: true,
    });

    res.redirect(`/fixture/${tournamentId}`);
  } catch (err) {
    res.status(500).send("Something went wrong" + err);
  }
});

// FUNCIÓN PARA GENERAR EL FIXTURE //

const fixture = (lotteryArray, playerArray) => {
  // Calcular cantidad de equipos por jugador: //
  const amountOfTeamsForEachPlayer = lotteryArray.length / playerArray.length;
  console.log(amountOfTeamsForEachPlayer);
  // Calcular cantidad de partidos totales por equipo: //
  const amountOfGamesForEachTeam =
    lotteryArray.length - amountOfTeamsForEachPlayer;
  console.log("partidos por equipo:" + amountOfGamesForEachTeam);
  // Calcular cantidad de partidos en total (del torneo): //
  const totalAmoutOfGames =
    (amountOfGamesForEachTeam * lotteryArray.length) / 2; // Dividido 2, porque en cada partido se involucran 2 equipos;
  console.log("cantidad de partidos total:" + totalAmoutOfGames);
  // Calcular cantidad de partidos por fecha: //
  const amountOfGamesByWeek = lotteryArray.length / 2;
  console.log("partidos por fecha:" + amountOfGamesByWeek);
  // Calcular cantidad de fechas: //
  const totalAmountOfWeeks = totalAmoutOfGames / amountOfGamesByWeek;
  console.log("cantidad de fechas total:" + totalAmountOfWeeks);

  // Declaro las constantes necesarias //

  const weeks = [];
  const matchesAlreadyPlayedInTotal = [];
  const matchesAlreadyPlayedByTeam = [];
  let teamHasPlayedThisWeek = [];
  let temporaryWeek = [];
  let limit = totalAmoutOfGames;
  let teamsThatHaveNotPlayedThisWeek = [...lotteryArray];

  const concertMatch = (randomTeamOne, randomTeamTwo) => {
    if (!randomTeamOne && !randomTeamTwo) {
      console.log("EL PARTIDO NO SERÁ CONCERTADO");
      // Pusheo la fecha como está //
      weeks.push(temporaryWeek);
      temporaryWeek = [];
      teamHasPlayedThisWeek = [];
      teamsThatHaveNotPlayedThisWeek = [...lotteryArray];
    } else {
      console.log(randomTeamOne, randomTeamTwo);
      // Resto un partido al total con el limit--: //
      limit--;
      // Le pusheo la suma los índices sorteados a matchesAlreadyPlayedInTotal: //
      matchesAlreadyPlayedInTotal.push(
        randomTeamOne.team + "vs" + randomTeamTwo.team,
        randomTeamTwo.team + "vs" + randomTeamOne.team
      );
      // Le pusheo los índices individuales sorteados a matchesAlreadyPlayedByTeam para cuantificar cuántos partidos viene jugando cada equipo: //
      matchesAlreadyPlayedByTeam.push(randomTeamOne.team, randomTeamTwo.team);
      // Le pusheo los índices individuales a teamHasPlayedThisWeek: //
      teamHasPlayedThisWeek.push(randomTeamOne.team, randomTeamTwo.team);
      // Averiguo el index de los equipos en teamsThatHaveNotPlayedThisWeek. Los elimino del array: //
      let firstIndex = teamsThatHaveNotPlayedThisWeek.indexOf(randomTeamOne);
      console.log(`Elimino ${randomTeamOne.team} en la posición ${firstIndex}`);
      console.log(
        `En la posición obtenida, se encuentra el equipo: ${teamsThatHaveNotPlayedThisWeek[firstIndex].team}`
      );
      teamsThatHaveNotPlayedThisWeek.splice(firstIndex, 1);
      let secondIndex = teamsThatHaveNotPlayedThisWeek.indexOf(randomTeamTwo);
      console.log(
        `Elimino ${randomTeamTwo.team} en la posición ${secondIndex}`
      );
      console.log(
        `En la posición obtenida, se encuentra el equipo: ${teamsThatHaveNotPlayedThisWeek[secondIndex].team}`
      );
      teamsThatHaveNotPlayedThisWeek.splice(secondIndex, 1);
      console.log("teamsThatHaveNotPlayedThisWeek:");
      console.log(teamsThatHaveNotPlayedThisWeek);
      // Creo un array que tendrá 2 objetos, cada array es un partido: //
      let modifiedGame = {
        playerP1: randomTeamOne.player,
        playerP2: randomTeamTwo.player,
        teamP1: randomTeamOne.team,
        teamP2: randomTeamTwo.team,
        teamIdP1: randomTeamOne.id,
        teamIdP2: randomTeamTwo.id,
        teamLogoP1: randomTeamOne.logo,
        teamLogoP2: randomTeamTwo.logo,
      };
      temporaryWeek.push(modifiedGame);
      // ÚLTIMO PARTIDO DE CADA FECHA //
      if (temporaryWeek.length === amountOfGamesByWeek) {
        console.log("CONCERTÉ EL ÚLTIMO PARTIDO DE LA FECHA");
        weeks.push(temporaryWeek);
        temporaryWeek = [];
        teamHasPlayedThisWeek = [];
        teamsThatHaveNotPlayedThisWeek = [...lotteryArray];
      }
      // ÚLTIMO PARTIDO ARREGLADO (LIMIT = 0): //
      if (limit === 0 && temporaryWeek.length != 0) {
        weeks.push(temporaryWeek);
      }
      // Chequeo si uno de los equipos sorteados ya jugó su máximo de partidos: //
      let firstCount = 0;
      let secondCount = 0;
      // Recorro el array matchesAlreadyPlayedByTeam y cuento la cantidad de partidos que jugó cada equipo: //
      matchesAlreadyPlayedByTeam.forEach((element) => {
        if (element === randomTeamOne.team) {
          firstCount++;
        }
        if (element === randomTeamTwo.team) {
          secondCount++;
        }
      });
      // Calculo cuáles son los índices de los equipos sorteados (para el paso que sigue): //
      let firstTeamIndex = lotteryArray.indexOf(randomTeamOne);
      // Si randomTeamOne alcanzó su máximo de partidos, lo elimino de lotteryArray (por performance): //
      firstCount === amountOfGamesForEachTeam
        ? lotteryArray.splice(firstTeamIndex, 1)
        : console.log(
            `El equipo ${randomTeamOne.team} aun tiene ${
              amountOfGamesForEachTeam - firstCount
            } partidos por jugar`
          );
      // Como pude haber borrado un elemento, recién ahora debo calcular el índice del randomTeamTwo //
      let secondTeamIndex = lotteryArray.indexOf(randomTeamTwo);
      // Si randomTeamTwo alcanzó su máximo de partidos, lo elimino de lotteryArray (por performance): //
      secondCount === amountOfGamesForEachTeam
        ? lotteryArray.splice(secondTeamIndex, 1)
        : console.log(
            `El equipo ${randomTeamTwo.team} aun tiene ${
              amountOfGamesForEachTeam - secondCount
            } partidos por jugar`
          );
      firstTeamIndex; // ¿NECESARIO? //
      secondTeamIndex; // ¿NECESARIO? //
    }
  };

  let maxLoops = 1000;

  while (limit > 0) {
    maxLoops--;
    console.log("maxLoops: " + maxLoops);
    if (maxLoops === 0) {
      break;
    }
    // Cuando queden pocos partidos por arreglar, que el pick sea nuevamente desde lotteryArray, y no desde teamsThatHaveNotPlayedThisWeek: //
    // if (limit < amountOfGamesByWeek) {
    //     teamsThatHaveNotPlayedThisWeek = [...lotteryArray]
    // }
    console.log("lotteryArray:");
    console.log(lotteryArray);
    console.log("limit:");
    console.log(limit);
    let firstRandomizedIndex;
    let secondRandomizedIndex;
    let randomTeamOne;
    let randomTeamTwo;
    console.log("temporaryWeek.length:");
    console.log(temporaryWeek.length);
    console.log("teamHasPlayedThisWeek: ");
    console.log(teamHasPlayedThisWeek);
    console.log("teamsThatHaveNotPlayedThisWeek: ");
    console.log(teamsThatHaveNotPlayedThisWeek);
    // Agrego la excepción de amountOfGamesByWeek > 4 así solo aplica para torneos grandes! //
    limit < 2 * amountOfGamesByWeek && amountOfGamesByWeek >= 4
      ? (teamsThatHaveNotPlayedThisWeek = [...lotteryArray])
      : console.log("AUN QUEDAN MUCHOS PARTIDOS");
    firstRandomizedIndex = Math.floor(
      Math.random() * teamsThatHaveNotPlayedThisWeek.length
    );
    secondRandomizedIndex = Math.floor(
      Math.random() * teamsThatHaveNotPlayedThisWeek.length
    );
    // Randomizo los equipos //
    randomTeamOne = teamsThatHaveNotPlayedThisWeek[firstRandomizedIndex];
    randomTeamTwo = teamsThatHaveNotPlayedThisWeek[secondRandomizedIndex];
    console.log("EQUIPOS SORTEADOS: ");
    console.log(randomTeamOne, randomTeamTwo);
    if (
      amountOfGamesByWeek >= 4 &&
      matchesAlreadyPlayedInTotal.some(
        (element) => element === randomTeamOne.team + "vs" + randomTeamTwo.team
      ) &&
      (temporaryWeek.length === amountOfGamesByWeek - 1 ||
        temporaryWeek.length === amountOfGamesByWeek - 2)
    ) {
      console.log("EL PARTIDO YA SE JUGÓ, PASO A LA SIGUIENTE FECHA");
      concertMatch(); // Los parámetros serán undefined //
    }
    if (
      teamsThatHaveNotPlayedThisWeek.length === 1 ||
      teamsThatHaveNotPlayedThisWeek.length === 3
    ) {
      // No podrá concertar partido porque solo hay una opción disponible!
      console.log(
        "NO PODRÉ CONCERTAR PORQUE SOLO HAY 1 O 3 EQUIPOS DISPONIBLES, PASO A LA SIGUIENTE FECHA"
      ); // Para torneos impares (15 equipos por ejemplo)
      concertMatch(); // Los parámetros serán undefined //
    }
    // Con evaluar solo element === randomTeamOne.team + "vs" + randomTeamTwo.team alcanza, porque si está una combinatoria, también está la inversa
    if (
      matchesAlreadyPlayedInTotal.some(
        (element) => element === randomTeamOne.team + "vs" + randomTeamTwo.team
      )
    ) {
      console.log("EL PARTIDO YA SE JUGÓ, REPITO EL WHILE");
      continue;
    }
    // Planteando equipos != en lo que sigue, me aseguro de que NO entre aquí si los random teams fueron los mismos (puede pasar y no es nada malo) //
    if (
      amountOfGamesByWeek > 4 &&
      randomTeamOne.player === randomTeamTwo.player &&
      randomTeamOne.team !== randomTeamTwo.team &&
      temporaryWeek.length > amountOfGamesByWeek - 3
    ) {
      console.log(randomTeamOne.player);
      console.log(randomTeamTwo.player);
      console.log(
        "EL PARTIDO ES ENTRE EQUIPOS DEL MISMO JUGADOR, PASO A LA SIGUIENTE FECHA"
      );
      concertMatch(); // Los parámetros serán undefined //
    }
    // Ahora debo contemplar el caso donde el último partido a agregar es entre equipos del mismo jugador: //
    if (randomTeamOne.player === randomTeamTwo.player) {
      console.log(
        "EL PARTIDO ES ENTRE EQUIPOS DEL MISMO JUGADOR, REPITO EL WHILE"
      );
      continue;
    }
    console.log("NINGUNO DE LOS EQUIPOS HABÍA JUGADO ENTRE SÍ");
    concertMatch(randomTeamOne, randomTeamTwo);
  }

  console.log("weeks:");
  console.log(weeks);
  console.log("matchesAlreadyPlayedInTotal: ");
  console.log(matchesAlreadyPlayedInTotal);
  // console.log("teamsThatHaveNotPlayedThisWeek: ");
  // console.log(teamsThatHaveNotPlayedThisWeek);

  const reducedWeeks = weeks.reduce((acc, curVal) => acc.concat(curVal), []);

  return reducedWeeks;
};

app.get("/fixture", async (req, res) => {
  try {
    const tournaments = await tournamentsModel.find({ ongoing: true }, "name");
    res.render("fixture", { tournaments });
  } catch (err) {
    return res.status(500).send("Something went wrong!" + err);
  }
});

app.get("/fixture/:id", async (req, res) => {
  const tournamentId = req.params.id;
  try {
    const tournamentById = await tournamentsModel.findById(tournamentId);
    if (!tournamentById) {
      res.render("./errors/tournaments-id-error", { idProvided });
      return;
    }
    res.render("fixture-id", { tournamentById });
  } catch (err) {
    res.status(500).send("Something went wrong" + err);
  }
});

app.get("/fixture/:tournamentId/:teamIdOrPlayerName", async (req, res) => {
  const { tournamentId, teamIdOrPlayerName } = req.params;
  try {
    const tournament = await tournamentsModel.findById(
      tournamentId,
      "name fixture"
    );
    if (!tournament) {
      res.render("./errors/tournaments-id-error", { tournamentId });
      return;
    }

    const tournamentName = tournament.name;

    if (isNaN(teamIdOrPlayerName)) {
      // El param es el playerName

      const playerName = teamIdOrPlayerName;

      const filteredFixtureFromTournament = tournament.fixture.filter(
        (element) => {
          return (
            element.playerP1 === playerName || element.playerP2 === playerName
          );
        }
      );

      console.log(filteredFixtureFromTournament);

      res.render("fixture-id-player", {
        tournamentName,
        playerName,
        tournamentId,
        filteredFixtureFromTournament,
      });
    } else {
      // El param es el teamId

      const teamId = teamIdOrPlayerName;

      const filteredFixtureFromTournament = tournament.fixture.filter(
        (element) => {
          return element.teamIdP1 == teamId || element.teamIdP2 == teamId;
        }
      );

      let teamName;

      if (filteredFixtureFromTournament[0].teamIdP1 == teamId) {
        teamName = filteredFixtureFromTournament[0].teamP1;
      } else {
        teamName = filteredFixtureFromTournament[0].teamP2;
      }

      res.render("fixture-id-team", {
        tournamentName,
        teamName,
        tournamentId,
        filteredFixtureFromTournament,
      });
    }
  } catch (err) {
    res.status(500).send("Something went wrong" + err);
  }
});

// app.get("/update", async (req, res) => {
//   const tournament = await tournamentsModel.findById("62c20e041a7df52274d0975b");

//   const fixtureFromTournament = tournament.fixture;

//   fixtureFromTournament.forEach(async (element) => {
//     if (element.teamP2 === "Fulham") {
//       element.codeTeamP2 = "FUL";
//     }
//     if (element.teamP2 === "Southampton") {
//       element.codeTeamP2 = "SOU";
//     }
//     if (element.teamP2 === "Arsenal") {
//       element.codeTeamP2 = "ARS";
//     }
//     if (element.teamP2 === "Everton") {
//       element.codeTeamP2 = "EVE";
//     }
//     if (element.teamP2 === "Leicester") {
//       element.codeTeamP2 = "LEI";
//     }
//     if (element.teamP2 === "West Ham") {
//       element.codeTeamP2 = "WES";
//     }
//     if (element.teamP2 === "Brighton") {
//       element.codeTeamP2 = "BRI";
//     }
//     if (element.teamP2 === "Brentford") {
//       element.codeTeamP2 = "BRE";
//     }
//     if (element.teamP2 === "Aston Villa") {
//       element.codeTeamP2 = "AST";
//     }
//     if (element.teamP2 === "Watford") {
//       element.codeTeamP2 = "WAT";
//     }
//     if (element.teamP2 === "Reading") {
//       element.codeTeamP2 = "REA";
//     }
//     if (element.teamP2 === "Preston") {
//       element.codeTeamP2 = "PRE";
//     }
//     if (element.teamP2 === "West Brom") {
//       element.codeTeamP2 = "WES";
//     }
//     if (element.teamP2 === "QPR") {
//       element.codeTeamP2 = "QPR";
//     }
//     if (element.teamP2 === "Coventry") {
//       element.codeTeamP2 = "COV";
//     }

//   });

//   await tournament.update({ fixture: fixtureFromTournament });

//   res.send({ fixtureFromTournament })

// });

// app.get("/update", async (req, res) => {
//   const tournament = await tournamentsModel.findById("62c20d1b1a7df52274d09758");

//   const teamsFromTournament = tournament.teams;

//   teamsFromTournament.forEach(async (element) => {
//     if (element.team === "Manchester United") {
//       element.code = "MUN";
//     }
//     if (element.team === "Newcastle") {
//       element.code = "NEW";
//     }
//     if (element.team === "Bournemouth") {
//       element.code = "BOU";
//     }
//     if (element.team === "Wolves") {
//       element.code = "WOL";
//     }
//     if (element.team === "Liverpool") {
//       element.code = "LIV";
//     }
//     if (element.team === "Tottenham") {
//       element.code = "TOT";
//     }
//     if (element.team === "Chelsea") {
//       element.code = "CHE";
//     }
//     if (element.team === "Manchester City") {
//       element.code = "MAC";
//     }
//     if (element.team === "Crystal Palace") {
//       element.code = "CRY";
//     }
//     if (element.team === "Leeds") {
//       element.code = "LEE";
//     }
//     if (element.team === "Nottingham Forest") {
//       element.code = "NOT";
//     }
//     if (element.team === "Burnley") {
//       element.code = "BUR";
//     }
//     if (element.team === "Sheffield Utd") {
//       element.code = "SHE";
//     }
//     if (element.team === "Blackburn") {
//       element.code = "BLA";
//     }
//     if (element.team === "Norwich") {
//       element.code = "NOR";
//     }

//   });

//   await tournament.update({ teams: teamsFromTournament });

//   res.send({ teamsFromTournament })

// });

/* -------------------- PORT -------------------- */

const PORT = process.env.PORT || "8080";

app.listen(PORT, (err) => {
  if (!err) console.log(`Servidor Express escuchando en el puerto ${PORT}`);
  else console.log(`Error al iniciar el servidor Express: ${err}`);
});
