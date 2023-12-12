
const httpResponse = (res, statusCode, responseStatus, responseMessage, data) => {
    if (data !== 'undefined') {
        res.status(statusCode).send({
            status: responseStatus,
            message: responseMessage,
            data: data
        });
    } else {
        res.status(statusCode).send({
            status: responseStatus,
            message: responseMessage
        });
    }
}

module.exports = httpResponse;