const RomeLint = require('./RomeLint.js');
const RomeFormat = require('./RomeFormat.js');
const notify = require('./notify.js');
const Config = require('./config.js');

let server = null;
let formatter = null;

exports.activate = async function () {
    try {
        /* registerOnChanged will call the callback with the current value before returning */
        await Config.registerOnChanged('be.aben.rome-path', async (value) => {
            if (!value) {
                value = await getRomePath();
                if(value === null) {
                    notify('rome-path-error', 'Rome path not found', "");
                    return;
                }
            }
            if (!server) {
                try {
                    server = new RomeLint(value);
                    formatter = new RomeFormat(value, false, false);
                } catch (err) {
                    notify('rome-exec-error', 'Rome executable error', err.message);
                    return;
                }
            } else {
                server.pathChanged(value);
                formatter.pathChanged(value);
            }
        });
        await Config.registerOnChanged('be.aben.rome-format-on-save', async (value) => {
            if(formatter) {
                formatter.onSave = !!value;
            }
        });

        nova.commands.register('formatDocument', async (obj) => {
            /* either a workspace or a text editor was passed */
            let editor = TextEditor.isTextEditor(obj) ? obj : obj.activeTextEditor;
            if (editor && formatter) {
                await formatter.format(editor);
            }
        });
    } catch (err) {
        console.log(err);
    }
};

exports.deactivate = function () {
    if (server) {
        server.stop();
    }
    Config.dispose();
};

function checkLocalPath() {
     return new Promise((res) => {
        /* Try to find local rome path in repo */
        const localPath = `${nova.workspace.path}/node_modules/.bin/rome`;
        try {
            const process = new Process('/usr/bin/env', {
                args: ['stat', localPath]
            })
            process.onDidExit((value) => {
                if(value) {
                    res(null);
                } else {
                    res(localPath)
                }
            });
            process.start();
   
        } catch(err) {
            res(null);
        }
    });
}

function checkGlobalPath() {
     return new Promise((res) => {
        /* Try to find global path */
        try {
            const process = new Process('/usr/bin/env', {
                args: ['type', '-a', 'rome'],
            });
            let result = null;
            process.onStdout((value) => {
                const m = value.match(/rome is (\S+)/);
                if (m?.length === 2) {
                    result = m[1];
                }
            });
            process.onDidExit((value) => {
                if (result !== null) {
                    res(result);
                } else {
                    res(null);
                }
            });
            process.start();
        } catch (err) {
            res(null);
        }
    });
}

async function getRomePath() {
    let path = await checkLocalPath();
    if(path !== null) {
        return path;
    }
    path = await checkGlobalPath();
    return path;
}

