const roleId = {
    ADMIN: 1,   // Admin id : 1
    USER: 2     // User id : 2
}

const statusId = {
    ACTIVE: 1,      // Active id: 1
    INACTIVE: 2     // Inactive id: 2
}

const isDeleted = {
    NOT_DELETED: 0,
    DELETED: 1
}

const contactAdmin = {
    EMAIL: 'admin@example.com'
}

module.exports = {
    roleId,
    statusId,
    isDeleted,
    contactAdmin
}

/* 



// Define enum for roleId
const enum RoleId {
    ADMIN = 1,   // Admin id: 1
    USER = 2     // User id: 2
}

// Define enum for statusId
const enum StatusId {
    ACTIVE = 1,      // Active id: 1
    INACTIVE = 2     // Inactive id: 2
}

// Define enum for isDeleted
const enum IsDeleted {
    NOT_DELETED = 0,
    DELETED = 1
}

module.exports = {
    RoleId,
    StatusId,
    IsDeleted
}


*/