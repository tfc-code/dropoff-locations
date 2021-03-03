import server from './server';

let port = 8080;

if (parseInt(process.argv[2], 10) > 0) {
    port = Number(process.argv[2]);
}

server.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
});

function exitOnSignal(signal) {
    process.on(signal, function () {
        console.log('\ncaught ' + signal + ', exiting');
        process.exit(1);
    });
}

exitOnSignal('SIGINT');
exitOnSignal('SIGTERM');
