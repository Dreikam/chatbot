// Modulos
const express = require("express");

const axios = require("axios");

const app = express();

let date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

let hours = date.getHours();
let minutes = date.getMinutes();
let seconds = date.getSeconds();

const time = `${hours}:${minutes}:${seconds}`;

const today = `${day}-0${month}-${year}`;

const complete = time + " / " + today;

var id;

//console.log(complete);

app.use(express.json());

// // Conexion a la DB
const mongoose = require("mongoose");

const { NOTES_APP_MONGODB_HOST, NOTES_APP_MONGODB_DATABASE } = process.env;

const MONGODB_URI = `mongodb+srv://Dreikam:Disturbed14@dbxyz-njb3h.mongodb.net/test?retryWrites=true&w=majority`;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((db) => console.log("Base de datos conectada"))
  .catch((err) => console.error(err));
// // Fin del codigo de conexion

// Crear instancia usuario
const userSchema = mongoose.Schema({
  nombre: String,
  ciudad: String,
  pais: String,
  dni: Number,
  email: String,
  sesion: String,
  fecha: String,
});

const User = mongoose.model("users", userSchema);

// Aqui empieza el codigo para traer usuarios
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (e) {
    res.status(500).send("Error! No se pudo obtener los usuarios");
  }
});
// Finaliza el codigo de usuarios

//  Switch para respuestas en cada caso
app.post("/webhook", (req, res) => {
  const query = req.body.queryResult;
  const action = query.action;

  const session = req.body.session.split("/").pop();

  switch (action) {
    case "action_dni":
      const dni = query.parameters.dni;

      User.findOne({ dni: dni }).then((user) => {
        if (user) {
          res.json({
            fulfillmentText: `Bienvenido ${user.nombre}`,
          });
        } else {
          res.json({
            fulfillmentText:
              "No se encuentra registrado. Por favor ingrese su nombre",
          });
          const user = new User({
            nombre: "",
            ciudad: "",
            pais: "",
            email: "",
            dni: dni,
            sesion: session,
            fecha: complete,
          });
          user.save();
          id = user._id;
        }
      });

      break;

    case "action_name":
      const name = query.parameters.name;

      User.findOne({ _id: id }).then((user) => {
        user.nombre = name;
        user.save();
      });
      res.json({});
      break;

    case "action_city":
      const city = query.parameters.city;

      User.findOne({ _id: id }).then((user) => {
        user.ciudad = city;
        user.save();
      });
      res.json({});
      break;

    case "action_country":
      const country = query.parameters.country;

      User.findOne({ _id: id }).then((user) => {
        user.pais = country;
        user.save();
      });
      res.json({});
      break;

    case "action_email":
      const email = query.parameters.email;

      User.findOne({ _id: id }).then((user) => {
        user.email = email;
        user.save();

        res.json({
          fulfillmentText: `¿Son estos datos correctos?: Nombre: ${user.nombre} - Dni: ${user.dni} - Ciudad: ${user.ciudad} - Pais: ${user.pais} - Email: ${user.email}`,
        });
      });

      break;
  }
});

app.listen(8080);
