/**
 * Created by ibrahimnetto on 05/10/16.
 */

'use strict';

const crc = require('crc');

let utils = {};

utils.getNodeCommandBuffer = function (command, id) {
    let bufferCommand = command;
    let bufferId = id;

    bufferCommand = command.toString();
    bufferId = id.toString();

    if (bufferCommand.length < 2) {
        let length = bufferCommand.length;
        for (let i = 0; i < (2 - length); i++) {
            bufferCommand = '0' + bufferCommand;
        }
    }

    if (bufferId.length < 8) {
        let length = bufferId.length;
        for (let i = 0; i < (8 - length); i++) {
            bufferId = '0' + bufferId;
        }
    }

    let commandBuffer = Buffer.alloc(2, '0');
    commandBuffer.write(bufferCommand);

    let idBuffer = Buffer.alloc(8, '0');
    idBuffer.write(bufferId);

    let nodeCommandBuffer = Buffer.concat([commandBuffer, idBuffer]);

    return (nodeCommandBuffer);
};

utils.getDataInfoBuffer = function (buffer, id) {
    let bufferCommand = 0;
    let bufferId = id;
    let bufferLength = buffer.length;
    let bufferPackets = bufferLength / 64;

    // console.log('\nbufferId = ', bufferId);
    // console.log('bufferLength = ', bufferLength);
    // console.log('bufferPackets = ', bufferPackets);
    // console.log('(bufferLength / 64) = ', (buffer.length / 64));
    // console.log('Math.floor(bufferPackets) = ', Math.floor(bufferPackets));
    // console.log('(bufferLength % 64) = ', (buffer.length % 64), '\n');

    bufferPackets = Math.floor(bufferPackets);

    if (bufferLength % 64 !== 0) {
        bufferPackets++;
    }

    bufferCommand = bufferCommand.toString();
    bufferId = bufferId.toString();
    bufferLength = bufferLength.toString();
    bufferPackets = bufferPackets.toString();

    if (bufferCommand.length < 2) {
        let length = bufferCommand.length;
        for (let i = 0; i < (2 - length); i++) {
            bufferCommand = '0' + bufferCommand;
        }
    }

    if (bufferId.length < 8) {
        let length = bufferId.length;
        for (let i = 0; i < (8 - length); i++) {
            bufferId = '0' + bufferId;
        }
    }

    if (bufferLength.length < 8) {
        let length = bufferLength.length;
        for (let i = 0; i < (8 - length); i++) {
            bufferLength = '0' + bufferLength;
        }
    }

    if (bufferPackets.length < 8) {
        let length = bufferPackets.length;
        for (let i = 0; i < (8 - length); i++) {
            bufferPackets = '0' + bufferPackets;
        }
    }

    let commandBuffer = Buffer.alloc(2, '0');
    commandBuffer.write(bufferCommand);

    let idBuffer = Buffer.alloc(8, '0');
    idBuffer.write(bufferId);

    let lenghtBuffer = Buffer.alloc(8, '0');
    lenghtBuffer.write(bufferLength);

    let packetsBuffer = Buffer.alloc(8, '0');
    packetsBuffer.write(bufferPackets);

    let dataInfoBuffer = Buffer.concat([commandBuffer, idBuffer, lenghtBuffer, packetsBuffer]);

    return (dataInfoBuffer);
};

utils.getSequenceRequestBuffer = function (id, sequence) {
    let bufferCommand = 51;
    let bufferId = id;
    let bufferSequence = sequence;

    bufferCommand = bufferCommand.toString();
    bufferId = bufferId.toString();
    bufferSequence = bufferSequence.toString();

    if (bufferCommand.length < 2) {

        for (let i = 0; i < (2 - bufferCommand.length); i++) {
            bufferCommand = '0' + bufferCommand;
        }
    }

    if (bufferId.length < 8) {
        let length = bufferId.length;
        for (let i = 0; i < (8 - length); i++) {
            bufferId = '0' + bufferId;
        }
    }

    if (bufferSequence.length < 8) {
        let length = bufferSequence.length;
        for (let i = 0; i < (8 - length); i++) {
            bufferSequence = '0' + bufferSequence;
        }
    }

    let commandBuffer = Buffer.alloc(2, '0');
    commandBuffer.write(bufferCommand);

    let idBuffer = Buffer.alloc(8, '0');
    idBuffer.write(bufferId);

    let sequenceBuffer = Buffer.alloc(8, '0');
    sequenceBuffer.write(bufferSequence);

    let sequenceRequestBuffer = Buffer.concat([commandBuffer, idBuffer, sequenceBuffer]);

    return (sequenceRequestBuffer);
};

utils.getEndRequestBuffer = function (id) {
    let bufferCommand = 52;
    let bufferId = id;

    bufferCommand = bufferCommand.toString();
    bufferId = bufferId.toString();

    if (bufferCommand.length < 2) {
        for (let i = 0; i < (2 - bufferCommand.length); i++) {
            bufferCommand = '0' + bufferCommand;
        }
    }

    if (bufferId.length < 8) {
        let length = bufferId.length;
        for (let i = 0; i < (8 - length); i++) {
            bufferId = '0' + bufferId;
        }
    }

    let commandBuffer = Buffer.alloc(2, '0');
    commandBuffer.write(bufferCommand);

    let idBuffer = Buffer.alloc(8, '0');
    idBuffer.write(bufferId);

    let endRequestBuffer = Buffer.concat([commandBuffer, idBuffer]);

    return (endRequestBuffer);
};

utils.parseDataInfoBuffer = function (buffer) {
    var data = {};
    data.id = buffer.slice(2, 10).toString('utf8');
    data.bufferLength = buffer.slice(10, 18).toString('utf8');
    data.packets = buffer.slice(18, 26).toString('utf8');

    data.id = parseInt(data.id);
    data.bufferLength = parseInt(data.bufferLength);
    data.packets = parseInt(data.packets);

    return (data);
};

utils.parseSequenceRequestBuffer = function (buffer) {
    var data = {};
    data.id = buffer.slice(2, 10).toString('utf8');
    data.sequence = buffer.slice(10, 18).toString('utf8');

    data.id = parseInt(data.id);
    data.sequence = parseInt(data.sequence);

    return (data);
};

utils.parseEndRequestBuffer = function (buffer) {
    var data = {};
    data.id = buffer.slice(2, 10).toString('utf8');

    data.id = parseInt(data.id);

    return (data);
};

utils.prependPacketInfoBuffer = function (buffer, id, sequence) {
    let command = (1).toString();
    id = id.toString();
    sequence = sequence.toString();

    let commandBuffer = Buffer.alloc(2, '0');
    let idBuffer = Buffer.alloc(8, '0');
    let sequenceBuffer = Buffer.alloc(8, '0');

    if (command.length < 2) {
        let length = command.length;
        for (let i = 0; i < (2 - length); i++) {
            command = '0' + command;
        }
    }

    if (id.length < 8) {
        let length = id.length;
        for (let i = 0; i < (8 - length); i++) {
            id = '0' + id;
        }
    }

    if (sequence.length < 8) {
        let length = sequence.length;
        for (let i = 0; i < (8 - length); i++) {
            sequence = '0' + sequence;
        }
    }

    commandBuffer.write(command);
    idBuffer.write(id);
    sequenceBuffer.write(sequence);

    let checksumBuffer = utils.calculateChecksumBuffer(buffer);

    buffer = Buffer.concat([commandBuffer, idBuffer, sequenceBuffer, checksumBuffer, buffer]);

    return (buffer);
};

utils.calculateChecksumBuffer = function (buffer) {
    let data = buffer.toString('utf8');
    let checksum = crc.crc16(data);
    let checksumBuffer = Buffer.alloc(8, '0');

    checksum = checksum.toString();
    checksumBuffer.write(checksum);

    return (checksumBuffer);
};

utils.getBufferCommand = function (buffer) {
    let commandBuffer = buffer.slice(0, 2);
    let command = commandBuffer.toString('utf8');

    command = parseInt(command);

    return (command);
};

utils.getCommandBuffer = function (buffer) {
    let commandBuffer = buffer.slice(0, 2);

    return (commandBuffer);
};

utils.getBufferId = function (buffer) {
    let idBuffer = buffer.slice(2, 10);
    let id = idBuffer.toString('utf8');

    id = parseInt(id);

    return (id);
};

utils.getIdBuffer = function (buffer) {
    let idBuffer = buffer.slice(2, 10);

    return (idBuffer);
};

utils.getBufferSequence = function (buffer) {
    let sequenceBuffer = buffer.slice(10, 18);
    let sequence = sequenceBuffer.toString('utf8');

    sequence = parseInt(sequence);

    return (sequence);
};

utils.getSequenceBuffer = function (buffer) {
    let sequenceBuffer = buffer.slice(10, 18);

    return (sequenceBuffer);
};

utils.getBufferChecksum = function (buffer) {
    let checksumBuffer = buffer.slice(18, 26);
    let checksum = checksumBuffer.toString('utf8');

    checksum = parseInt(checksum);

    return (checksum);
};

utils.getChecksumBuffer = function (buffer) {
    let checksumBuffer = buffer.slice(18, 26);

    return (checksumBuffer);
};

utils.getBufferData = function (buffer) {
    let dataBuffer = buffer.slice(26, buffer.length);
    let data = dataBuffer.toString('utf8');

    return (data);
};

utils.getDataBuffer = function (buffer) {
    let dataBuffer = buffer.slice(26, buffer.length);

    return (dataBuffer);
};

utils.verifyBufferChecksum = function (buffer) {
    let checksumBuffer = utils.getChecksumBuffer(buffer);
    let dataBuffer = utils.getDataBuffer(buffer);
    let recalculatedChecksumBuffer = utils.calculateChecksumBuffer(dataBuffer);
    let result = checksumBuffer.compare(recalculatedChecksumBuffer);

    if (result === 0) {
        return (true);
    } else {
        return false;
    }
};

module.exports = utils;