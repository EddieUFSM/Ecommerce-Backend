const formidable = require('formidable')
const _ = require('lodash')
const fs = require('fs')
const Category = require('../models/category')
const Product = require('../models/product')
const {errorHandler} = require('../helpers/dbErrorHandler')

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

exports.read = (req, res) => {
    req.product.photo = undefined
    return res.json(req.product);
}

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