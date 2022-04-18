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

/* -------------------- SERVER -------------------- */

const express = require("express");
// const cookieParser = require("cookie-parser"); // Since version 1.5.0, the cookie-parser middleware no longer needs to be used for this module to work.
const session = require("express-session"); // login session require session support //

/* --------------- MONGO-SESSION (ATLAS) --------------- */

const MongoDBStore = require("connect-mongodb-session")(session);

// const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

/* -------------------- MIDDLEWARES -------------------- */

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
    failureRedirect: "./errors/login-error",
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

// OTHER ROUTES

// app.get("/api", isAuth, (req, res) => {

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
// })

app.get("/tournaments", async (req, res) => {
  try {
    const allTournaments = await tournamentsModel.find({}, "name");
    res.render("tournaments", { allTournaments });
  } catch (err) {
    return res.status(400).send(err);
  }
});

app.get("/tournaments/:id", async (req, res) => {
  const idProvided = req.params.id;
  try {
    const tournamentById = await tournamentsModel.findById(idProvided); // Mismo problema, si no existe la BD va al catch
    if (!tournamentById.length) {
      res.render("./errors/tournaments-id-error", { idProvided });
      return;
    }
    res.render("tournaments-id", { tournamentById });
  } catch (err) {
    return res.status(400).send("Something went wrong!!");
  }
});

app.get("/create-tournament", (req, res) => {
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

  // const oldMatchesArray = [];

  res.render("create-tournament", {});
});

app.post("/create-tournament", async (req, res) => {
  try {
    // console.log(req.body);

    const { tournamentName, format, origin } = req.body;

    const arrayFromValues = Object.values(req.body);

    const filteredArrayFromValues = arrayFromValues.filter(
      (element) =>
        element !== tournamentName && element !== format && element !== origin
    ); // Creo un array que solo tenga jugadores y equipos

    const humanPlayers = [];
    const teams = [];

    filteredArrayFromValues.forEach((element, index) => {
      if (
        element === "Leo" ||
        element === "Lucho" ||
        element === "Max" ||
        element === "Nico" ||
        element === "Santi"
      ) {
        humanPlayers.push(element);
      } else {
        teams.push(element);
      }
    });

    const tournament = {
      name: tournamentName,
      players: humanPlayers,
      format,
      origin,
      teams,
      status: "running", // TO DO: I may use a PUT request to inform that a tournament has finished. //
    };

    await tournamentsModel.create(tournament);
    res.status(200).send({ message: "Tournament's been successfully created" });
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

app.get("/face-to-face", async (req, res) => {
  try {
    const tournamentId = req.query.id;

    const allTournaments = await tournamentsModel.find({}, "id name status");

    const array = [];
    let finalMatchups = [];

    if (tournamentId) {
      // console.log("Entré por el lado de Tournament ID")

      const allMatches = await matchesModel.find(
        { "tournament.id": tournamentId },
        "playerP1 teamP1 scoreP1 playerP2 teamP2 scoreP2"
      );

      // console.log(allMatches);

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

      // console.log(allMatchups);

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
      // console.log("Entré por el lado de GLOBAL")

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

      // console.log(allMatches);

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
    return res.status(400).send(err);
  }

  console.log(`Ruta: ${req.url}, Método: ${req.method}`);
});

app.get("/upload-games", async (req, res) => {
  try {
    const tournamentsFromBD = await tournamentsModel.find({}, "name id");
    if (!tournamentsFromBD.length) {
      res.render("./errors/upload-games-error", {});
      return;
    }
    res.render("tournament-selection", { tournamentsFromBD });
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

app.post("/upload-games", (req, res) => {
  // POST O GET?
  const selectedTournamentId = req.body.selection; // I must use the select "name" property;
  res.redirect(`/upload-games/${selectedTournamentId}`);
});

app.get("/upload-games/:id", async (req, res) => {
  const idProvided = req.params.id;
  try {
    const tournamentById = await tournamentsModel.findById(idProvided); // SI NO ESTÁ CREADA LA COLECCIÓN, ENTRA AL CATCH
    if (tournamentById.length === 0) {
      // REVISAR, POR QUÉ NO PUEDE SER (!tournamentById.length)?
      res.render("./errors/upload-games-error", {});
      return;
    }
    res.render("upload-games", { tournamentById });
  } catch (err) {
    res.status(500).send("Something went wrongggg");
  }
});

app.post("/upload-games-from-tournament", async (req, res) => {
  try {
    let {
      playerP1,
      teamP1,
      scoreP1,
      playerP2,
      teamP2,
      scoreP2,
      tournamentName,
      tournamentId,
      format,
      origin,
    } = req.body;

    let rivalOfP1 = playerP2;
    let rivalOfP2 = playerP1;
    let outcome;

    if (scoreP1 - scoreP2 !== 0) {
      scoreP1 > scoreP2
        ? (outcome = {
            playerThatWon: playerP1,
            teamThatWon: teamP1,
            draw: false,
          })
        : (outcome = {
            playerThatWon: playerP2,
            teamThatWon: teamP2,
            draw: false,
          });
    }
    if (scoreP1 - scoreP2 !== 0) {
      scoreP1 > scoreP2
        ? (outcome = {
            playerThatWon: playerP1,
            teamThatWon: teamP1,
            draw: false,
          })
        : (outcome = {
            playerThatWon: playerP2,
            teamThatWon: teamP2,
            draw: false,
          });
    }
    if (scoreP1 - scoreP2 === 0) {
      outcome = { playerThatWon: "none", teamThatWon: "none", draw: true };
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
        name: tournamentName,
        id: tournamentId,
        format,
        origin,
      },
    };

    await matchesModel.create(match);

    res.redirect("/");
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
