/**
 * 
 * 
 * 
 * 
 */

const formidable = require('formidable')
const _ = require('lodash')
const fs = require('fs')
const Category = require('../models/category')
const Product = require('../models/product')
const {errorHandler} = require('../helpers/dbErrorHandler')

/**
 * 
 * 
 * 
 */

exports.create = (req, res) => {
    let form = new formidable.IncomingForm()
    form.KeepExtnsions = true
    form.parse(req, (err, fields, files) => {
        if(err){
            return res.status(400).json({
                error: 'image could not be uploaded'
            })
        }

         //check for fields
         const {name, description, price, category, quantity, shipping} = fields

         if(!name || !description || !price || !category || !quantity || !shipping){
             return res.status(400).json({
                 error: "Todos os campos são requeridos"
             })
         }

        let product = new Product(fields)

        if(files.photo){
            console.log('Files Photo: ', files.photo)
            if(files.photo.size > 1000000){
                return res.status(400).json({
                    error: "imagem deve ter menos que 1 megabyte de tamanho"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if(err){
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(result);
        })
    })
}

/**
 * 
 * 
 * 
 */

exports.productById = (req, res, next, id) => {
    Product.findById(id).exec((err, product)=> {
        if(err || !product){
            return res.status(400).json({
                error:"Produto não encontrado"
            })
        }
        req.product = product
        next();
    })
}

/**
 * 
 * 
 * 
 */

exports.read = (req, res) => {
    req.product.photo = undefined
    return res.json(req.product);
}

/**
 * 
 * 
 * 
 */

exports.remove = (req, res) => {
    let product = req.product
    product.remove((err, deletedProduct)=>{
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json({
            message: "Produto deletado com sucesso"
        })
    })
}

/**
 * Notas(pt-br);
 * Modificação dos parâmetros dos produtos
 * Checando os parâmetros sobre seu preenchimento
 * Checando o tamanho da foto do produto
 * Decodificação e codificação do arquivo de imagem 
 * 
 * Notes
 * 
 */

exports.update = (req, res) => {
    let form = new formidable.IncomingForm()
    form.KeepExtnsions = true
    form.parse(req, (err, fields, files) => {
        if(err){
            return res.status(400).json({
                error: 'image could not be uploaded'
            })
        }
        
        //check for fields
        const {name, description, price, category, quantity, shipping} = fields

        if(!name || !description || !price || !category || !quantity || !shipping){
            return res.status(400).json({
                error: "Todos os campos são requeridos"
            })
        }

        let product = req.product
        product = _.extend(product, fields)

        //check size of photo
        if(files.photo){
            console.log('Files Photo: ', files.photo)
            if(files.photo.size > 1000000){
                return res.status(400).json({
                    error: "imagem deve ter menos que 1 megabyte de tamanho"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if(err){
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(result);
        })
    })
}

/**
 * Nota(pt-br);
 * Venda / Pedidos
 * Função para enviar todos os produtos por ordem crescente ou decrescente a partir de um parâmetro e com limite de retorno
 * 
 * Notes(en):
 * Sell / Arrival
 * by sell =/products?sortBy=sold&order=desc&limit=4
 * by arrival =/products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 * 
 * @param {[String]} req [query order | sortBy | limit]
 * @param {[String]} res [(err) status: 400 content: message; type: String extension: .json | (!err) status: 200; content: list of products ; type: Array of object; extension: .json ]
 * @retun {[.json]}    
 * 
 */

exports.list = (req,res) => {
    let order = req.query.order ? req.query.order: 'asc' // asc or desc
    let sortBy = req.query.sortBy ? req.query.sortBy: 'name'
    let limit = req.query.limit ? parseInt(req.query.limit): 6

    Product.find()
    .select("-photo")
    .populate('category')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products)=>{
        if(err) {
            return res.status(400).json({
                error: 'Produtos não encontrados'
            })
        }
        res.json(products)
    })
}

/**
 * 
 * it will find the products based on the req product category
 * other products that has the same category. will be returned
 * 
 * @param {[type]} req [description]
 * @param {[type]} res [description]
 * @retun {[.json]}     [description]
 * 
 */
exports.listRelated = (req,res) => {
    let limit = req.query.limit ? parseInt(req.query.limit): 6

    Product.find({_id: {$ne: req.product}, category: req.product.category})
    .limit(limit)
    .populate('category', '_id name')
    .exec((err, products) => {
        if(err) {
            return res.status(400).json({
                error: 'Produtos não encontrados'
            })
        }
        res.json(products)
    })

}

/**
 * 
 * 
 */

exports.listCategory = (req, res) =>{
    let limit = req.query.limit ? parseInt(req.query.limit): 6

    Product.distinct("category", {}, (err, categories) => {
        
        if(err) {
            return res.status(400).json({
                error: 'Categorias não encontradas'
            })
        }
        res.json(categories)
    })
    
}

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */
  
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
 
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "não foram encontrados produtos para esse filtro"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

exports.photo = (req, res, next) => {
    if(req.product.photo.data) {
        res.set('Content-type', req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next();
}

