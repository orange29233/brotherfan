const ExcelJS = require('exceljs');
const fs = require("fs");
const process = require('process');
const path = require('path')
var chalk = require('chalk')

module.exports = (filename) => {
    readExcel(filename)
}

function readExcel(){
    var workbook = new ExcelJS.Workbook();
    const filepath = path.join(process.cwd(), filename);
    workbook.xlsx.readFile(filepath).then(function(){
        var worksheet = workbook.getWorksheet(1);
        var colC = worksheet.getColumn(5);
        var colJ = worksheet.getColumn(11);
    });
}


function exprotExcel(){

}