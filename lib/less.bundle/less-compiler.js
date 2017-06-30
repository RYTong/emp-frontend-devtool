'use babel';

import path from 'path';
import fs from 'fs';
import readline from 'readline'
import path_filter from '../util/path-loader';
import EmpLessCompile from './less-compile';
import {$, $$} from 'atom-space-pen-views'
// import LessCompiler from ''

// let pre_compile = function (sLessFile) {
//     if (!fs.existsSync(sLessFile)){
//         atom.notifications.addError(filePath+" not exist", {dismissable: true});
//         return;
//     }
//
//     rl = readline.createInterface()
//
//
// }

let compile_all_cb = function (lLessFiles) {
    console.log(lLessFiles);
    var iFileLen = lLessFiles.length
    if (lLessFiles.length > 0){
        for(let i =0; i< iFileLen; i++){
            let oFile = lLessFiles[i];
            console.log(i+":", oFile);
            let sFileExt = path.extname(oFile.name).toLocaleLowerCase()
            if (sFileExt == ".less"){
                new EmpLessCompile(oFile.dir)
            }
        }
    }


}

export let compile_aless = function () {
    // console.log("----do compile all less");
    let getAllLessObj = function (){
        return new Promise(function(resolve, reject){
            try {
                path_filter.load_file_path_unignore("./", ["*.less"], resolve);
            } catch (e) {
                reject(e);
            };
        });
    }
    getAllLessObj().then((lLessFiles) => {
        // console.log(lLessFiles);
        compile_all_cb(lLessFiles)
    }).catch((error) => {
        console.error("An Error:", error);
    });

}

export let compile_sless = function () {
    console.log("----do compile single less");
    oTreeView = atom.workspace.getLeftDock().getPaneItems()[0];
    console.log(oTreeView);
    oSelectedEntry = oTreeView.selectedEntry();
    oSelectedEntry = oSelectedEntry ? oSelectedEntry:oTreeView.roots[0];
    sSelectedPath = oSelectedEntry.getPath()
    sSelectedPath = sSelectedPath ? sSelectedPath : ''
    console.log("sSelectedPath:",sSelectedPath);
    let sFileExt = path.extname(sSelectedPath).toLocaleLowerCase()
    if (sFileExt == ".less"){
        new EmpLessCompile(sSelectedPath);
    } else {
        atom.notifications.addError(sSelectedPath+" isn't a less file!", {dismissable: true});
    }
}


export let creat_less = function () {
    console.log("----do create less");

}

export let handle_saved_less_file = function () {
     oActiveEditor= atom.workspace.getActiveTextEditor();
     if (oActiveEditor){
         sFilePath = oActiveEditor.getURI();
         let sFileExt = path.extname(sFilePath).toLocaleLowerCase()
         if (sFileExt == ".less"){
             new EmpLessCompile(sFilePath);
         }
     }

}
