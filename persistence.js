const redis = require("async-redis");
const client = redis.createClient();


const addMessage = (roomId, message) => {
    client.rpush(roomId, JSON.stringify(message));
};

const getMessagesFromRoom = async (roomId) => {
    let result= await client.lrange(roomId, 0, -1);
    let msgs=[];
    result.forEach((msg)=>{
        msgs.push(JSON.parse(msg));
    })
    return msgs;
}

const deleteRoom=(roomId)=>{
    client.del(roomId);
}


module.exports = { addMessage, getMessagesFromRoom,deleteRoom };
