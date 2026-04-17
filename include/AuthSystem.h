#ifndef AUTHSYSTEM_H
#define AUTHSYSTEM_H

#include "Exceptions.h"
#include <string>
#include <vector>

enum class Role {
    Admin,
    Cashier,
    Unknown
};

struct User {
    std::string username;
    std::string password;
    Role role;
};

class AuthSystem {
private:
    std::vector<User> users;

public:
    AuthSystem();

    Role login(const std::string& username, const std::string& password) const;
    static std::string roleToString(Role role);
    static bool isAdmin(Role role);
    static bool canSell(Role role);
};

#endif
