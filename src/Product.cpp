#include "Product.h"

#include "Exceptions.h"

#include <iomanip>

Product::Product(int id, const std::string& name, double price, int quantity) : id(id), name(name), price(0.0), quantity(0) {
    setPrice(price);
    setQuantity(quantity);
}

int Product::getId() const {
    return id;
}

const std::string& Product::getName() const {
    return name;
}

double Product::getPrice() const {
    return price;
}

int Product::getQuantity() const {
    return quantity;
}

void Product::setName(const std::string& updatedName) {
    name = updatedName;
}

void Product::setPrice(double updatedPrice) {
    if (updatedPrice < 0.0) {
        throw InvalidPriceException("Price cannot be negative.");
    }
    price = updatedPrice;
}

void Product::setQuantity(int updatedQuantity) {
    if (updatedQuantity < 0) {
        throw InvalidQuantityException("Quantity cannot be negative.");
    }
    quantity = updatedQuantity;
}

void Product::increaseQuantity(int amount) {
    if (amount < 0) {
        throw InvalidQuantityException("Increase amount cannot be negative.");
    }
    quantity += amount;
}

void Product::decreaseQuantity(int amount) {
    if (amount < 0) {
        throw InvalidQuantityException("Decrease amount cannot be negative.");
    }
    if (amount > quantity) {
        throw OutOfStockException("Not enough units available for product ID " + std::to_string(id) + ".");
    }
    quantity -= amount;
}

double Product::getInventoryValue() const {
    return price * quantity;
}

void Product::print(std::ostream& out) const {
    out << "ID: " << id
        << " | Name: " << name
        << " | Price: " << std::fixed << std::setprecision(2) << price
        << " | Quantity: " << quantity
        << " | Category: " << getCategory();
}

std::ostream& operator<<(std::ostream& out, const Product& product) {
    product.print(out);
    return out;
}
