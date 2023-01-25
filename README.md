# Rome extension for Nova editor (https://nova.app)

Lightning fast javascript & typescript linting and formatting using Rome (https://rome.tools)

## Prerequisites

Rome itself is **not** packaged with the extension. You need to have it installed on your Mac. Please refer to [these](https://docs.rome.tools/guides/getting-started/) installation instructions.

## Configuration

### Path

By default, the extension will try to discover the Rome path in 2 ways:

1. Checking in the node_modules/.bin folder of your workspace
2. Globally by doing `typa -a rome`, which should return something like `rome is /opt/homebrew/bin/rome` depending on how you installed it. If this doesn't return the path to Rome, check your installation.

In case you have a custom installation, you can always specify the path in either the global or the workspace extension preferences. Workspace settings take precedence over the global settings.

### Format on save

By default the extension will not format on save. Enable the setting in global or workspace settings.

### Rome configuration

Rome configuration should be stored in a file called `rome.json` in the root of your workspace folder.
