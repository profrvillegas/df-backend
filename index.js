const express = require('express')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const mysql = require('mysql2')  // BD
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const port = 3000
// definir la conexion a MYSQL
const bd = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234567890',
    database: 'dreaming_flowers',
})
// conectar  mysql
bd.connect((err) => {
    if (err) {
        console.log("Error al conectarse a mysql" + err.stack)
        return;
    }
    console.log("Conectado a mysql")
})

// CREANDO NUESTRA PRIMERA RUTA
app.get('/patito', (req, res) => {
    res.send("Bienvenidos al servidor")
})

/**
 * @swagger
 * /florerias:
 *   get:
 *      summary: Listado de Florerias
 *      tags: [Florerias]
 *      responses:
 *          200:
 *              description: Muestra la lista de florerias
 */
app.get('/florerias', (req, res) => {
    bd.query('select * from florerias', (err, results) => {
        if (err) {
            console.log("error al ejecutar la consulta")
            return;
        }
        res.json(results)
    })
})

// BUSQUEDA DE FLORERIA POR ID

/**
 * @swagger
 * /florerias/{id}:
 *   get:
 *      summary: Detalle de Floreria
 *      tags: [Florerias] 
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Id de la floreria
 *            required: true
 *      responses:
 *          200:
 *              description: Muestra la lista de florerias
 */
app.get('/florerias/:id', (req, res) => {
    const idfloreria = parseInt(req.params.id)
    bd.query("SELECT * FROM florerias WHERE idfloreria=?", [idfloreria], (err, results) => {
        if (err) {
            res.status(400).send("error al obtener la floreria")
            return
        }
        res.json(results)
    })
})
// PROCESAR DATOS
/**
 * @swagger
 * components:
 *      schemas:
 *          Floreria:
 *             type: object
 *             required:
 *                  - nombre
 *                  - ubicacion
 *                  - telefono
 *             properties:
 *                  id:
 *                      type: integer
 *                      description: ID autoincrementable de la floreria
 *                  nombre:
 *                      type: string
 *                      description: Nombre de la floreria
 *                  ubicacion:
 *                      type: string
 *                      description: Lugar  de la floerira
 *                  telefono:
 *                      type: string
 *                      description: No.telefono de la floreria
 *             example:
 *                  nombre: "El giradsol de Benja"
 *                  ubicacion: "Av 125"
 *                  telefono: "1222345"
 */
/**
 * @swagger
 * tags:
 *      name: Florerias
 *      description: API del catálogo de florerias
 * /guardar:
 *  post:
 *      summary: Crear florerias 
 *      tags: [Florerias]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Floreria'
 *      responses:
 *          200: 
 *              description: Guardar nueva floreria
 *          400:
 *              description: Datos incompletos
 */
app.post('/guardar', (req, res) => {
    const { nombre, ubicacion, telefono } = req.body   // obtiene los datos que se pasadn como parametros
    if (!nombre || !ubicacion || !telefono) { // VALIDAR DATOS
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    bd.query("INSERT INTO florerias(nombre, ubicacion,telefono) VALUES(?,?,?)", [nombre, ubicacion, telefono],
        (err, result) => {
            if (err) {
                res.status(400).send("Error al crear una floreria")
                return;
            }
            res.status(201).send("Floreria creada")
        })
})

// EDITA FLORERIA


/**
 * @swagger 
 * /florerias/{id}:
 *  put:
 *      summary: Editar florerias 
 *      tags: [Florerias]
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Id de la floreria
 *            required: true
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Floreria'
 *      responses:
 *          200: 
 *              description: Guardar nueva floreria
 *          400:
 *              description: No se edita la floreria
 */
app.put('/florerias/:id', (req, res) => {
    const { nombre, ubicacion, telefono } = req.body   // obtiene los datos que se pasadn como parametros
    const idfloreria = parseInt(req.params.id)
    bd.query("UPDATE florerias SET nombre = ?, ubicacion = ?, telefono=?  WHERE idfloreria = ?", 
        [nombre, ubicacion, telefono, idfloreria],
        (err, result) => {
            if (err) {
                res.status(400).send("Error al editar una floreria")
                return;
            }
            res.send('Floreria actualizadas');
        });
});

// ELIMINAR FLORERIA
/**
 * @swagger
 * /florerias/{id}:
 *   delete:
 *      summary: Eliminacion de Floreria
 *      tags: [Florerias] 
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Id de la floreria
 *            required: true
 *      responses:
 *          200:
 *              description: Elimina una floreria
 */
app.delete('/florerias/:id', (req, res) => {
    const idfloreria = parseInt(req.params.id)
    bd.query('DELETE FROM florerias WHERE idfloreria = ?', [idfloreria], (err, result) => {
        if (err) {
            res.status(400).send("Error al eliminar una floreria")
            return;
        }
        res.send('Floreria eliminada correctamente');
    });
});


// CONFIGURAR SWAGGER PARA LA DOCUMENTACIÓN DE LAS API
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.1.0',
        info: {
            title: 'API de Dreaming Flowers',
            version: '1.0.0',
            description: 'APi de florerias'
        },
    },
    apis: ['*.js'],
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/apis-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// HACER DISPONIBLE SERVIDOR
app.listen(port, () => {
    console.log("Servidor iniciado")
})