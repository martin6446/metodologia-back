const users = [];

const addUser = (id, name, room) => {
    const existingUser = users.find(
        (user) => user.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (existingUser) return { error: "Username has already been taken" };
    if (!name || !room) return { error: "Username and room are required" };
    room.id=room.id+"";
    const user = { id, name, room };
    users.push(user);
    return { user };
};

const getUser = (id) => users.find((user) => user.id === id);

const deleteUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) return users.splice(index, 1)[0];
};

const getUsers = (roomId) => users.filter((user) => user.room.id === roomId);

const getAll=()=>users

module.exports = { addUser, getUser, deleteUser, getUsers, getAll };
