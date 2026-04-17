#ifndef INVENTORYMANAGER_H
#define INVENTORYMANAGER_H

#include "Clothing.h"
#include "Electronics.h"
#include <algorithm>
#include <string>
#include <vector>

template <typename T>
void sortInventory(std::vector<Product*>& inventory, T comparator) {
    std::sort(inventory.begin(), inventory.end(), comparator);
}

class InventoryManager {
private:
    // Abstraction: this class hides inventory/file-management complexity.
    std::vector<Product*> inventory;
    std::string storageFile;

    Product* createProductFromRecord(const std::vector<std::string>& tokens) const;
    std::vector<std::string> split(const std::string& line, char delimiter) const;

public:
    explicit InventoryManager(const std::string& storageFile = "inventory_data.txt");
    ~InventoryManager();

    void addProduct(Product* product);
    void removeProduct(int productId);
    void sellProduct(int productId, int quantitySold);

    Product* findProductById(int productId) const;
    const std::vector<Product*>& getInventory() const;

    void displayAllProducts() const;
    void displayLowStockWarnings(int threshold = 5) const;
    void displayDashboard() const;

    int getTotalUniqueProducts() const;
    double getTotalInventoryValue() const;

    void sortByPrice(bool ascending = true);
    void sortByQuantity(bool ascending = true);

    void saveToFile() const;
    void loadFromFile();
};

#endif
