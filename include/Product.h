#ifndef PRODUCT_H
#define PRODUCT_H

#include <iostream>
#include <string>

class Product {
private:
    // Encapsulation: core state is private and accessed through getters/setters.
    int id;
    std::string name;
    double price;
    int quantity;

public:
    Product(int id, const std::string& name, double price, int quantity);
    virtual ~Product() = default;

    int getId() const;
    const std::string& getName() const;
    double getPrice() const;
    int getQuantity() const;

    void setName(const std::string& name);
    void setPrice(double price);
    void setQuantity(int quantity);
    void increaseQuantity(int amount);
    void decreaseQuantity(int amount);

    double getInventoryValue() const;

    // Abstraction + Polymorphism: common interface for all product types.
    virtual std::string getCategory() const = 0;
    virtual std::string getExtraAttribute() const = 0;
    virtual void displayDetails() const = 0;
    virtual void print(std::ostream& out) const;
};

std::ostream& operator<<(std::ostream& out, const Product& product);

#endif
