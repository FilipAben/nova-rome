class RomeFormat {
    path = null;
    supportedSyntax = ['javascript', 'typescript'];
    onSave = false;
    fixOnSave = false;
    fixSuggestedOnSave = false;

    constructor(path, onSave, fixOnSave, fixSuggestedOnSave) {
        this.path = path;
        this.format = this.format.bind(this);
        this.onSave = onSave;

        this.listener = nova.workspace.onDidAddTextEditor((editor) => {
            if (!this.onSave) {
                return;
            }
            /* This callback will also be called for every existing text editor upon initialisation */
            if (this.supportedSyntax.includes(editor.document.syntax)) {
                editor.onDidSave(this.format);
            }
        });
    }

    pathChanged(path) {
        this.path = path;
    }

    async format(editor) {
        const fmt = new Process(this.path, {
            args: ['format', '--stdin-file-path', editor.document.path],
            stdio: 'pipe',
        });
        let output = '';
        let range = new Range(0, editor.document.length);

        fmt.onStdout((data) => {
            output += data;
        });

        fmt.onStderr((error) => {
            console.log(error);
        });

        fmt.onDidExit((code) => {
            if (code === 0) {
                editor.edit((edit) => edit.replace(range, output));
            } else {
                console.log('Format exited with code', code);
            }
        });
        fmt.start();
        let text = editor.getTextInRange(range);
        const writer = fmt.stdin.getWriter();
        await writer.ready;
        await writer.write(text);
        writer.close();
    }
}

module.exports = RomeFormat;

