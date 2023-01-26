class RomeFormat {
    path = null;
    supportedSyntax = ['javascript', 'typescript'];
    onSave = false;
    fixOnSave = false;
    fixSuggestedOnSave = false;
    triggeredSaves = {};

    constructor(path, onSave, fixOnSave, fixSuggestedOnSave) {
        this.path = path;
        this.format = this.format.bind(this);
        this.onSave = onSave;

        this.listener = nova.workspace.onDidAddTextEditor((editor) => {
            /* This callback will also be called for every existing text editor upon initialisation */
            if (this.supportedSyntax.includes(editor.document.syntax)) {
                editor.onDidSave((editor) => {
                    if (this.onSave) {
                        this.format(editor);
                    }
                });
            }
        });
    }

    pathChanged(path) {
        this.path = path;
    }

    async format(editor) {
        if (this.triggeredSaves[editor.document.path]) {
            this.triggeredSaves[editor.document.path] = false;
            return;
        }
        const fmt = new Process(this.path, {
            args: ['format', '--stdin-file-path', editor.document.path],
            cwd: nova.workspace.path,
            stdio: 'pipe',
        });
        let output = '';
        let range = new Range(0, editor.document.length);
        let text = editor.getTextInRange(range);

        fmt.onStdout((data) => {
            output += data;
        });

        fmt.onStderr((error) => {
            console.log(error);
        });

        fmt.onDidExit((code) => {
            if (code === 0) {
                if (text !== output) {
                    editor.edit((edit) => edit.replace(range, output));
                    this.triggeredSaves[editor.document.path] = true;
                    editor.save();
                }
            } else {
                console.log('Format exited with code', code);
            }
        });
        fmt.start();
        const writer = fmt.stdin.getWriter();
        await writer.ready;
        await writer.write(text);
        writer.close();
    }
}

module.exports = RomeFormat;

