// Modulos
const express = require("express");

const axios = require("axios");

const app = express();

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
  .then((db) => console.log("Base de datos Lista"))
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
  // console.log(req.body);

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
          });
          user.save();
        }
      });

      break;

    case "action_name":
      const name = query.parameters.name;

      User.findOne({ sesion: session }).then((user) => {
        if (user) {
          user.nombre = name;
          user.save();
        }
        console.log(user);
      });
      res.json({});
      break;

      case "action_city":
      const city = query.parameters.city;

      User.findOne({ sesion: session }).then((user) => {
        if (user) {
          user.ciudad = city;
          user.save();
        }
        console.log(user);
      });
      res.json({});
      break;

    case "action_country":
      const country = query.parameters.country;

      User.findOne({ sesion: session }).then((user) => {
        if (user) {
          user.pais = country;
          user.save();
        }
        console.log(user);
      });
      res.json({});
      break;

      case 'action_email':
        const re =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = query.parameters.email;

        const valid = re.test(email)

        if (valid == true) {
          User.findOne({ sesion: session }).then((user) => {
            if (user) {
              user.email = email;
              user.save();
            }
          });
          res.json({});
          console.log(valid);
          
        } else {
          res.json({
            fulfillmentText: "Por favor ingrese un mail valido e intente de nuevo"
          })
        }
      break;

      case 'retry_email':
        if (valid == true) {
          User.findOne({ sesion: session }).then((user) => {
            if (user) {
              user.email = email;
              user.save();
            }
          });
          res.json({});
          console.log(valid);
          
        }
      break;
  }
});

app.listen(8080);
