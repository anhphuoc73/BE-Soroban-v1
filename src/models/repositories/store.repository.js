const { ObjectId } = require("mongodb");
// const { dbMaster } = require("~/dbs/init.mongdb");

const getStoreById = async (id) => {
    return await dbMaster.getOne("store", {
        _id: new ObjectId(id),
    });
};

module.exports = {
    getStoreById,
};
