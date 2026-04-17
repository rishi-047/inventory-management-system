#include "InventoryManager.h"

#include "Exceptions.h"

#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>

InventoryManager::InventoryManager(const std::string& storageFile) : storageFile(storageFile) {
    loadFromFile();
}

InventoryManager::~InventoryManager() {
    saveToFile();
    for (Product* product : inventory) {
        delete product;
    }
}

Product* InventoryManager::createProductFromRecord(const std::vector<std::string>& tokens) const {
    if (tokens.size() < 6) {
        throw InventoryException("Corrupted record found while loading inventory.");
    }

    const std::string& type = tokens[0];
    const int id = std::stoi(tokens[1]);
    const std::string& name = tokens[2];
    const double price = std::stod(tokens[3]);
    const int quantity = std::stoi(tokens[4]);
    const std::string& extra = tokens[5];

    if (type == "Electronics") {
        return new Electronics(id, name, price, quantity, std::stoi(extra));
    }
    if (type == "Clothing") {
        return new Clothing(id, name, price, quantity, extra);
    }

    throw InventoryException("Unknown product category in file: " + type);
}

std::vector<std::string> InventoryManager::split(const std::string& line, char delimiter) const {
    std::vector<std::string> tokens;
    std::stringstream stream(line);
    std::string token;

    while (std::getline(stream, token, delimiter)) {
        tokens.push_back(token);
    }

    return tokens;
}

void InventoryManager::addProduct(Product* product) {
    if (findProductById(product->getId()) != nullptr) {
        delete product;
        throw InventoryException("A product with this ID already exists.");
    }

    inventory.push_back(product);
    saveToFile();
}

void InventoryManager::removeProduct(int productId) {
    for (std::size_t index = 0; index < inventory.size(); ++index) {
        if (inventory[index]->getId() == productId) {
            delete inventory[index];
            inventory.erase(inventory.begin() + static_cast<long>(index));
            saveToFile();
            return;
        }
    }

    throw ProductNotFoundException("Product ID " + std::to_string(productId) + " was not found.");
}

void InventoryManager::sellProduct(int productId, int quantitySold) {
    Product* product = findProductById(productId);
    if (product == nullptr) {
        throw ProductNotFoundException("Product ID " + std::to_string(productId) + " was not found.");
    }

    product->decreaseQuantity(quantitySold);
    saveToFile();
}

Product* InventoryManager::findProductById(int productId) const {
    for (Product* product : inventory) {
        if (product->getId() == productId) {
            return product;
        }
    }
    return nullptr;
}

const std::vector<Product*>& InventoryManager::getInventory() const {
    return inventory;
}

void InventoryManager::displayAllProducts() const {
    if (inventory.empty()) {
        std::cout << "Inventory is currently empty.\n";
        return;
    }

    std::cout << "\n========== INVENTORY LIST ==========\n";
    for (const Product* product : inventory) {
        product->displayDetails();
    }
}

void InventoryManager::displayLowStockWarnings(int threshold) const {
    bool foundLowStock = false;
    std::cout << "\nLow Stock Warning Panel (threshold < " << threshold << ")\n";
    for (const Product* product : inventory) {
        if (product->getQuantity() < threshold) {
            std::cout << "- " << product->getName()
                      << " (ID: " << product->getId()
                      << ", Qty: " << product->getQuantity() << ")\n";
            foundLowStock = true;
        }
    }

    if (!foundLowStock) {
        std::cout << "All products are stocked safely.\n";
    }
}

void InventoryManager::displayDashboard() const {
    std::cout << "\n=============== DASHBOARD ===============\n";
    std::cout << "Total Unique Products : " << getTotalUniqueProducts() << '\n';
    std::cout << "Total Inventory Value : " << std::fixed << std::setprecision(2) << getTotalInventoryValue() << '\n';

    displayLowStockWarnings();

    std::vector<Product*> topItems = inventory;
    sortInventory(topItems, [](Product* left, Product* right) {
        return left->getQuantity() > right->getQuantity();
    });

    std::cout << "\nASCII Stock Level Chart (Top 5 Items)\n";
    if (topItems.empty()) {
        std::cout << "No items available to chart.\n";
        return;
    }

    const int topCount = static_cast<int>(std::min<std::size_t>(5, topItems.size()));
    int highestQuantity = topItems.front()->getQuantity();
    if (highestQuantity <= 0) {
        highestQuantity = 1;
    }

    for (int index = 0; index < topCount; ++index) {
        const Product* product = topItems[index];
        const int barLength = (product->getQuantity() * 25) / highestQuantity;
        std::cout << std::left << std::setw(18) << product->getName()
                  << " | " << std::string(barLength == 0 ? 1 : barLength, '=')
                  << " (" << product->getQuantity() << ")\n";
    }
}

int InventoryManager::getTotalUniqueProducts() const {
    return static_cast<int>(inventory.size());
}

double InventoryManager::getTotalInventoryValue() const {
    double totalValue = 0.0;
    for (const Product* product : inventory) {
        totalValue += product->getInventoryValue();
    }
    return totalValue;
}

void InventoryManager::sortByPrice(bool ascending) {
    sortInventory(inventory, [ascending](Product* left, Product* right) {
        return ascending ? left->getPrice() < right->getPrice() : left->getPrice() > right->getPrice();
    });
}

void InventoryManager::sortByQuantity(bool ascending) {
    sortInventory(inventory, [ascending](Product* left, Product* right) {
        return ascending ? left->getQuantity() < right->getQuantity() : left->getQuantity() > right->getQuantity();
    });
}

void InventoryManager::saveToFile() const {
    std::ofstream outputFile(storageFile);
    if (!outputFile.is_open()) {
        std::cerr << "Warning: could not save inventory to file.\n";
        return;
    }

    for (const Product* product : inventory) {
        outputFile << product->getCategory() << '|'
                   << product->getId() << '|'
                   << product->getName() << '|'
                   << product->getPrice() << '|'
                   << product->getQuantity() << '|'
                   << product->getExtraAttribute() << '\n';
    }
}

void InventoryManager::loadFromFile() {
    std::ifstream inputFile(storageFile);
    if (!inputFile.is_open()) {
        return;
    }

    std::string line;
    while (std::getline(inputFile, line)) {
        if (line.empty()) {
            continue;
        }

        try {
            inventory.push_back(createProductFromRecord(split(line, '|')));
        } catch (const std::exception& exception) {
            std::cerr << "Skipping invalid record: " << exception.what() << '\n';
        }
    }
}
