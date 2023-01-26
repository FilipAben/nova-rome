/* TODO:
 * Configuration change watching
 * Bundling + re-organising
 * Clear LSP configuration before setting new config
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
                value = await getRomePath();
                if (value === null) {
                    notify('rome-path-error', 'Rome path not found', '');
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
            if (formatter) {
                formatter.onSave = !!value;
            }
        });

        nova.commands.register('be.aben.rome.formatDocument', async (obj) => {
            /* either a workspace or a text editor was passed */
            let editor = TextEditor.isTextEditor(obj) ? obj : obj.activeTextEditor;
            if (editor && formatter) {
                await formatter.format(editor);
            }
        });
        nova.commands.register('be.aben.rome.restartLSP', async (obj) => {
            server?.restart();
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

async function getArch() {
    return new Promise((res) => {
        var process = new Process('/usr/bin/uname', { args: ['-m'] });
        process.onStdout((line) => {
            cpu = line.trim();
            res(cpu);
        });
        process.start();
    });
}

async function checkLocalPath() {
    const arch = await getArch();
    return new Promise((res) => {
        /* Try to find local rome path in repo */
        const localPath = `${nova.workspace.path}/node_modules/@rometools/cli-darwin-${arch}/rome`;
        try {
            const process = new Process('/usr/bin/env', {
                args: ['stat', localPath],
            });
            process.onDidExit((value) => {
                if (value) {
                    res(null);
                } else {
                    res(localPath);
                }
            });
            process.start();
        } catch (err) {
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
    if (path !== null) {
        return path;
    }
    path = await checkGlobalPath();
    return path;
}

