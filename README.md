# Rome extension for Nova editor (https://nova.app)

Lightning fast javascript & typescript linting and formatting using Rome (https://rome.tools)

## Prerequisites

Rome itself is **not** packaged with the extension. You need to have it installed on your Mac. Please refer to [these](https://docs.rome.tools/guides/getting-started/) installation instructions.

## Configuration

### Path

By default, the extension will try to discover the global Rome path. If this doesn't work, open a terminal and type

```
type -a rome
```

which should return something like 

```
rome is /opt/homebrew/bin/rome
```
depending on your preferred installation method. If this doesn't return the path to Rome, check your installation.

In case you have a custom installation, you can always specify the path in either the global or the workspace extension preferences. Workspace settings take precedence over the global settings.

### Format on save

By default the extension will not format on save. Enable the setting in global or workspace settings.

