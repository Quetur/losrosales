const express = require('express');
const router = express.Router();
const AWS =require('aws-sdk');
const fs = require('fs');
const dotenv = require('dotenv')
require("dotenv").config();


const s3 =new AWS.S3({
  accessKeyId: process.env.S3_accessKeyId,
  secretAccessKey: process.env.S3_secretAccessKey
});

router.get('/', async (req, res) => {
    res.render('index');
});



module.exports = router;