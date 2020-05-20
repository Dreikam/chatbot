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
  dni: String,
  email: String,
  sesion: String,
  fecha: String,
});

const User = mongoose.model("users", userSchema);

// Aqui empieza el codigo para traer usuarios
app.get("/", async (req, res) => {
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

    case "action_no":
      User.findOneAndRemove({ _id: id }).then(() => {
        console.log("se ha borrado el usuario correctamente");
      });

      res.json({});
      break;

      // apis
      case 'bitcoin':
        let bitcoinfinal = "";

        axios.get("http://api.coindesk.com/v1/bpi/currentprice.json").then(res => {
          let bitcoinUSD = res.data.bpi.USD.rate;

          

          // console.log(bitcoinUSD);
          
            axios.get("https://www.dolarsi.com/api/api.php?type=valoresprincipales").then(res => {              
              for (let i = 0; i < res.data.length; i++) {
                const USD = res.data[0].casa.compra;

                // divido la coma del precio dolar para evitar obtener un NaN
                const splitUSD = USD.split(",");
                // reemplazo las comas por puntos para evitar obtener un NaN
                const replacebitcoinUSD = bitcoinUSD.replace("," , ".");

                // divido los numeros en un array de 3 posiciones
                const splitbitcoinUSD = replacebitcoinUSD.split(".");
                // Unifico la posificion 0 y 1 para obtener el valor en dolar y dejar de lado el valor de los centavos
                const unified = splitbitcoinUSD[0] + splitbitcoinUSD[1];

                // convierto los string en numeros float
                const intUSD = parseFloat(splitUSD);
                const intbitcoinUSD = parseFloat(unified)
                // multiplico los numeros para obtener el valor de bitcoin en pesos argentinos
                bitcoinvalue = intUSD * intbitcoinUSD;
                
              }
              bitcoinfinal = `Una BitCoin vale $ ${bitcoinvalue} Pesos argentinos`;
              
              res.json({
                fulfillmentText: bitcoinfinal
              })
              

            })
        })
        
      break;

  }
});

app.listen(8080);
