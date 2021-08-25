"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productos_1 = __importDefault(require("../productos"));
/**
 * DATOS A MANIPULAR
 */
const router = express_1.default.Router();
const miProducto2 = new productos_1.default();
router.get('/productos/listar', (req, res) => {
    const data = miProducto2.readlist();
    if (data.length == 0) {
        res.json({
            msg: 'no hay productos cargados',
        });
    }
    res.json({
        data,
    });
});
router.get('/productos/listar/:id', (req, res) => {
    const id = req.params.id;
    const data = miProducto2.readbyid(id);
    if (!data) {
        res.json({
            msg: 'Error producto no encontrado',
        });
    }
    res.json({
        data,
    });
});
router.post('/productos/guardar', (req, res) => {
    const body = req.body;
    const producto = miProducto2.savedata(body);
    if (producto == 'error') {
        return res.status(400).json({
            msg: 'Necesito en el body title, price and thumbnail',
        });
    }
    res.json({
        producto,
    });
});
router.put('/productos/actualizar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const dato = req.body;
    const producto = miProducto2.update(dato, id);
    if (producto == 'error') {
        return res.status(400).json({
            msg: 'Necesito en el body title, price and thumbnail',
        });
    }
    if (producto == 'outOfRange') {
        return res.status(400).json({
            msg: 'indice fuera de rango',
        });
    }
    res.json({
        producto,
    });
});
router.delete('/productos/borrar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const producto = miProducto2.borrar(id);
    if (producto == 'outOfRange') {
        return res.status(400).json({
            msg: 'indice fuera de rango',
        });
    }
    res.json({
        producto,
    });
});
router.get('/productos/vista', (request, response) => {
    const datosDinamicos = {
        productos: miProducto2.readlist()
    };
    console.log(datosDinamicos);
    response.render('main', datosDinamicos);
});
exports.default = router;
