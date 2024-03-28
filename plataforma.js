const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a la base de datos MongoDB
mongoose.connect("mongodb://localhost:27017/plataforma");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexión a MongoDB:"));
db.once("open", () => {
    console.log("Conectado a la base de datos MongoDB de plataforma");
});

// Schema de modelo calificaciones
let califSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: [true, "Property is required"],
    },
    materiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Materia",
        required: [true, "Property is required"],
    },
    calificacion: {
        type: Number,
        required: [true, "Property is required"],
    },
});

// Schema de modelo calificaciones
const materiaSchema = new mongoose.Schema({

    materia: {
        type: String,
        required: [true, "Property is required"],
    },
});

// Schema de modelo usuarios
const usuarioSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Property is required"],
    },
    email: {
        type: String,
        required: [true, "Property is required"],
    },
    password: {
        type: String,
        required: [true, "Property is required"],
    },
    edad: {
        type: Number,
        required: [true, "Property is required"],
    }
});

// Define el modelo
const Calificacion = mongoose.model("Calificaciones", califSchema);
const Materia = mongoose.model("Materias", materiaSchema);
const Usuario = mongoose.model("Usuarios", usuarioSchema);

// Ruta GET calificaciones
app.get("/calificaciones", async (req, res) => {

    try {
        //Almacenamiento de array de objetos calificacion 
        const calificaciones = await Calificacion.find();
        // const usuarios = await Usuario.findById(req.params.userId);

        //Promesa que se deben resolver antes de continuar y construccion de nuevo array de objetos
        let nuevasCalif = await Promise.all(
            //Iterar sobre el array de calificaciones
            calificaciones.map(async (element) => {
                //Busqueda asincronica de info de usuario
                const userInfo = await Usuario.findById(element.userId);
                //Busqueda asincronica de info de materia
                const matInfo = await Materia.findById(element.materiaId);
                return {
                    userInfo,
                    calificacion: element.calificacion,
                    matInfo
                };
            })
        );
        //Se devuelve al cliente la respuesta con el array de objetos
        res.json(nuevasCalif);
    }
    //Captura y envio de posibble error 
    catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta POST de calificaciones
app.post("/crear-calificaciones", async (req, res) => {
    try {
        const { userId, materiaId, calificacion } = req.body;
        const nuevaCalificacion = new Calificacion({ userId, materiaId, calificacion });
        await nuevaCalificacion.save();
        res.status(201).json({ message: "Calificación creada exitosamente" });
    } catch (error) {
        console.error("Error al crear calificación:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// Ruta PUT de calificaciones
app.put("/editar-calificaciones/:id", async (req, res) => {
    try {
        const { userId, materiaId, calificacion } = req.body;
        await Calificacion.findByIdAndUpdate(req.params.id, { userId, materiaId, calificacion });
        res.json({ message: "Calificación actualizada exitosamente" });
    } catch (error) {
        console.error("Error al actualizar calificación:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Tura DELETE de calificaciones
app.delete("/eliminar-calificaciones/:id", async (req, res) => {
    try {
        await Calificacion.findByIdAndDelete(req.params.id);
        res.json({ message: "Calificación eliminada exitosamente" });
    } catch (error) {
        console.error("Error al eliminar calificación:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Inicia el servidor
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});