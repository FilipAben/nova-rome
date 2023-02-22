/* TODO:
 * Configuration change watching
 * Clear LSP configuration before setting new config
 * LSP gets confused after save
 * No way to automatically add imports through code actions?
 */

const RomeLint = require('./RomeLint.js');
const RomeFormat = require('./RomeFormat.js');
const notify = require('./notify.js');
const Config = require('./config.js');
const getRomePath = require('./path.js');

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

        await Config.registerOnChanged('be.aben.rome-enable-debug', async (value) => {
            if (server) {
                const restart = !!value !== server.debug;
                server.debug = !!value;
                restart && server.restart();
            }
            if (formatter) {
                formatter.debug = !!value;
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

