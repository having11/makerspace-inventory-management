const cors = require('cors');
const parser = require('body-parser');
var express = require('express');
const config = require('./config.js');
const cli_cmds = require('./cli_cmds.js');

var app = express();

app.use(parser.json({extended: true}));
app.use(cors());
app.options('*', cors());
app.use(require("./part.js"));
app.use(require("./category.js"));
app.use(require("./user.js"));
app.use(require("./storage_container.js"));
app.use(require("./bin.js"));
app.use(require("./cart.js"));
app.use(require("./checkout.js"));
app.use(require("./redirects.js"));

const argv = require('yargs')
    .command({
        command: 'add-admin <username>',
        aliases: ['aa', 'add-a'],
        desc: 'Add a user as an admin',
        builder: (yargs) => yargs.default('username', ' '),
        handler: (argv) => {
            cli_cmds.add_admin.add_admin(argv.username, (result_str) => {
                console.log(result_str);
                process.exit();
            });
        }
    })
    .command({
        command: 'remove-admin <username>',
        aliases: ['ra', 'remove-a'],
        desc: 'Remove a user from being an admin',
        builder: (yargs) => yargs.default('username', ' '),
        handler: (argv) => {
            cli_cmds.remove_admin.remove_admin(argv.username, (result_str) => {
                console.log(result_str);
                process.exit();
            });
        }
    })
    .command({
        command: 'list-admins',
        aliases: ['la', 'list-a'],
        desc: 'List all admins',
        handler: (argv) => {
            cli_cmds.list_admins.list_admins((result_str) => {
                console.log(result_str);
                process.exit();
            });
        }
    })
    .command({
        command: 'run',
        aliases: ['start'],
        desc: 'Run the webserver',
        handler: (argv) => {
            app.listen(config.server.port);
            console.log(`Now running on ${config.server.ip}:${config.server.port}`);
        }
    })
    .demandCommand()
    .help()
    .wrap(72)
    .argv;

