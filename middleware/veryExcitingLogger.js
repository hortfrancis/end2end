const morgan = require('morgan');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');

// Create a rotating write stream for logging into a file in a logs directory
const logDirectory = path.join(__dirname, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
});

const logger = morgan(function (tokens, req, res) {
    // Define the custom morgan token for showing data
    morgan.token('data', (req) => {
        const body = req.body;
        // Do not log sensitive data in production
        if (process.env.NODE_ENV === 'production' && body.password) {
            body.password = '******';
        }
        return JSON.stringify(body);
    });

    // Construct the log string with colored output
    return [
        chalk.hex('#34ace0').bold(tokens.method(req, res)),
        chalk.hex('#ffb142').bold(tokens.url(req, res)),
        chalk.hex('#ff5252').bold(tokens.status(req, res)),
        chalk.hex('#33d9b2').bold(tokens['response-time'](req, res) + ' ms'),
        chalk.hex('#f7f1e3').bold('data: ' + tokens.data(req, res)),
        chalk.yellow(tokens['remote-addr'](req, res)),
        chalk.hex('#2c2c54').bold('at ' + new Date().toLocaleTimeString()),
    ].join(' ');
}, { stream: process.stdout });

// Middleware function to use both morgan and additional logging
const advancedLogger = (req, res, next) => {
    // Use morgan for standard logging
    logger(req, res, next);

    // Add an event listener for the finish event of the response to log when the response is sent
    res.on('finish', () => {
        console.log(
            chalk.hex('#fffa65').bgHex('#2f3542').bold(`[RESPONSE SENT] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} ${res.statusMessage}; Duration: ${res.get('X-Response-Time')}ms`)
        );
    });

    // Add an event listener for the close event of the request to log when the request is closed prematurely
    req.on('close', () => {
        if (!res.finished) {
            console.log(
                chalk.hex('#ff4757').bgHex('#2f3542').bold(`[REQUEST CLOSED PREMATURELY] ${req.method} ${req.originalUrl}`)
            );
        }
    });

    // Record start time
    const startHrTime = process.hrtime();

    // Define a response-time calculation for logging
    res.on('finish', () => {
        const durationInMilliseconds = getDurationInMilliseconds(startHrTime);
        res.setHeader('X-Response-Time', durationInMilliseconds.toString());
    });

    next();
};

// Helper function to calculate duration in milliseconds
const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9; // convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return ((diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS).toFixed(2);
};

// Export the advanced logger middleware
module.exports = advancedLogger;
