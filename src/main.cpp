#include "AuthSystem.h"
#include "Clothing.h"
#include "Electronics.h"
#include "InventoryManager.h"

#include <iostream>
#include <limits>
#include <sstream>
#include <string>

namespace {

int promptInt(const std::string& message) {
    while (true) {
        std::cout << message;
        std::string input;
        std::getline(std::cin, input);

        std::stringstream stream(input);
        int value = 0;
        char leftover = '\0';
        if (stream >> value && !(stream >> leftover)) {
            return value;
        }

        std::cout << "Please enter a valid integer.\n";
    }
}

double promptDouble(const std::string& message) {
    while (true) {
        std::cout << message;
        std::string input;
        std::getline(std::cin, input);

        std::stringstream stream(input);
        double value = 0.0;
        char leftover = '\0';
        if (stream >> value && !(stream >> leftover)) {
            return value;
        }

        std::cout << "Please enter a valid number.\n";
    }
}

std::string promptString(const std::string& message) {
    std::cout << message;
    std::string value;
    std::getline(std::cin, value);
    return value;
}

void printMenu(Role role) {
    std::cout << "\n=============== MAIN MENU ===============\n";
    std::cout << "Logged in as: " << AuthSystem::roleToString(role) << '\n';
    std::cout << "1. View Dashboard\n";
    std::cout << "2. View Inventory\n";
    std::cout << "3. Add Product (Admin)\n";
    std::cout << "4. Remove Product (Admin)\n";
    std::cout << "5. Sell Product\n";
    std::cout << "6. Sort Inventory by Price\n";
    std::cout << "7. Sort Inventory by Quantity\n";
    std::cout << "8. Save and Exit\n";
}

void ensureAdmin(Role role) {
    if (!AuthSystem::isAdmin(role)) {
        throw UnauthorizedAccessException("Only admins can perform this action.");
    }
}

void ensureSeller(Role role) {
    if (!AuthSystem::canSell(role)) {
        throw UnauthorizedAccessException("Your role cannot sell products.");
    }
}

void handleAddProduct(InventoryManager& manager) {
    std::cout << "\nSelect Product Type\n";
    std::cout << "1. Electronics\n";
    std::cout << "2. Clothing\n";

    const int typeChoice = promptInt("Enter choice: ");
    const int id = promptInt("Enter product ID: ");
    const std::string name = promptString("Enter product name: ");
    const double price = promptDouble("Enter price: ");
    const int quantity = promptInt("Enter quantity: ");

    if (typeChoice == 1) {
        const int warrantyMonths = promptInt("Enter warranty in months: ");
        manager.addProduct(new Electronics(id, name, price, quantity, warrantyMonths));
    } else if (typeChoice == 2) {
        const std::string size = promptString("Enter clothing size: ");
        manager.addProduct(new Clothing(id, name, price, quantity, size));
    } else {
        throw InventoryException("Invalid product type selected.");
    }

    std::cout << "Product added successfully.\n";
}

void handleRemoveProduct(InventoryManager& manager) {
    const int productId = promptInt("Enter product ID to remove: ");
    manager.removeProduct(productId);
    std::cout << "Product removed successfully.\n";
}

void handleSellProduct(InventoryManager& manager) {
    const int productId = promptInt("Enter product ID to sell: ");
    const int quantitySold = promptInt("Enter quantity to sell: ");
    manager.sellProduct(productId, quantitySold);
    std::cout << "Sale completed successfully.\n";
}

void handleSortByPrice(InventoryManager& manager) {
    const int choice = promptInt("Sort by price: 1. Ascending  2. Descending : ");
    manager.sortByPrice(choice != 2);
    std::cout << "Inventory sorted by price.\n";
}

void handleSortByQuantity(InventoryManager& manager) {
    const int choice = promptInt("Sort by quantity: 1. Ascending  2. Descending : ");
    manager.sortByQuantity(choice != 2);
    std::cout << "Inventory sorted by quantity.\n";
}

} // namespace

int main() {
    InventoryManager manager("inventory_data.txt");
    AuthSystem authSystem;

    std::cout << "==========================================\n";
    std::cout << " Inventory Management System (OOP Project)\n";
    std::cout << "==========================================\n";
    std::cout << "Default credentials:\n";
    std::cout << "Admin   -> username: admin   password: admin123\n";
    std::cout << "Cashier -> username: cashier password: cash123\n\n";

    Role currentRole = Role::Unknown;
    while (currentRole == Role::Unknown) {
        try {
            const std::string username = promptString("Username: ");
            const std::string password = promptString("Password: ");
            currentRole = authSystem.login(username, password);
            std::cout << "Login successful. Welcome, " << AuthSystem::roleToString(currentRole) << ".\n";
        } catch (const UnauthorizedAccessException& exception) {
            std::cout << exception.what() << " Please try again.\n";
        }
    }

    bool running = true;
    while (running) {
        printMenu(currentRole);
        const int choice = promptInt("Enter your choice: ");

        try {
            switch (choice) {
                case 1:
                    manager.displayDashboard();
                    break;
                case 2:
                    manager.displayAllProducts();
                    break;
                case 3:
                    ensureAdmin(currentRole);
                    handleAddProduct(manager);
                    break;
                case 4:
                    ensureAdmin(currentRole);
                    handleRemoveProduct(manager);
                    break;
                case 5:
                    ensureSeller(currentRole);
                    handleSellProduct(manager);
                    break;
                case 6:
                    handleSortByPrice(manager);
                    break;
                case 7:
                    handleSortByQuantity(manager);
                    break;
                case 8:
                    manager.saveToFile();
                    running = false;
                    std::cout << "Inventory saved. Exiting application.\n";
                    break;
                default:
                    std::cout << "Invalid menu choice. Please try again.\n";
                    break;
            }
        } catch (const InventoryException& exception) {
            // Custom exceptions are handled here during user transactions.
            std::cout << "Operation failed: " << exception.what() << '\n';
        } catch (const std::exception& exception) {
            std::cout << "Unexpected error: " << exception.what() << '\n';
        }
    }

    return 0;
}
