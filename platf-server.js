const express = require("express");
const mongoose = require("mongoose");
const cors = require ('cors');
require("dotenv").config();

const app = express();
app.use(express.json());

app.use(cors());

const PORT = 4000;
app.listen(PORT, ()=>{
    console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexión a MongoDB: "));
db.once("open", ()=> {
    console.log("Conectado a la base de datos MongoDB de plaft-server");
});

//Definición del esquema del modelo
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
    password: String
});

const User = mongoose.model("User", UserSchema);

//Rutas registro ------------------------
app.get("/get-users", async (req, res)=>{
    try{
        const users = await User.find();
        res.json(users);
    }catch(error){
        console.error("Error al obtener usuarios: ", error);
        res.status(500).json({error: "Error interno del servidor"});
    }
});

app.post('/insert-users', async (req, res) => {
    try {
      const newUser = new User(req.body);
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/edit-user/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userUpdated = await User.findByIdAndUpdate(id, req.body, { new: true });
      res.json(userUpdated);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/delete-user/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await User.findByIdAndDelete(id);
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await User.findOne({ email });

      if (user && user.password === password) {

          res.status(200).json({ message: 'Inicio de sesión exitoso', user });
      } else {

          res.status(401).json({ error: 'Credenciales inválidas' });
      }
  } catch (error) {
      console.error('Error al intentar iniciar sesión:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
  }
});

