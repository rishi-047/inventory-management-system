#include "AuthSystem.h"

AuthSystem::AuthSystem() {
    users.push_back({"admin", "admin123", Role::Admin});
    users.push_back({"cashier", "cash123", Role::Cashier});
}

Role AuthSystem::login(const std::string& username, const std::string& password) const {
    for (const User& user : users) {
        if (user.username == username && user.password == password) {
            return user.role;
        }
    }

    throw UnauthorizedAccessException("Invalid username or password.");
}

std::string AuthSystem::roleToString(Role role) {
    switch (role) {
        case Role::Admin:
            return "Admin";
        case Role::Cashier:
            return "Cashier";
        default:
            return "Unknown";
    }
}

bool AuthSystem::isAdmin(Role role) {
    return role == Role::Admin;
}

bool AuthSystem::canSell(Role role) {
    return role == Role::Admin || role == Role::Cashier;
}
