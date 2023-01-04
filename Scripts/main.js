/*
 * TODO: better README + branding
 */

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
                try {
                    value = await getRomePath();
                } catch (err) {
                    notify('rome-path-error', 'Rome path not found', err.message);
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
            formatter.onSave = !!value;
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

function getRomePath() {
    return new Promise((res, rej) => {
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
                    rej("Didn't find path of the rome executable");
                }
            });
            process.start();
        } catch (err) {
            rej(`Error while trying to find the rome executable ${err.message}`);
        }
    });
}

