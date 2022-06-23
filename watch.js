const fs = require('fs');

const buttonPressesLogFile = './data.js';

console.log(`Watching for file changes on ${buttonPressesLogFile}`);

fs.watchFile(buttonPressesLogFile, (curr, prev) => {
    console.log(`${buttonPressesLogFile} file Changed ${new Date()}`);
    const {build} = require('./generateTemplates.js');
    build();
});

const {build} = require('./generateTemplates.js');
build();