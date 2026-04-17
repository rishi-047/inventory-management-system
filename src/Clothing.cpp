#include "Clothing.h"

#include <iostream>

Clothing::Clothing(int id, const std::string& name, double price, int quantity, const std::string& size)
    : Product(id, name, price, quantity), size(size) {}

const std::string& Clothing::getSize() const {
    return size;
}

void Clothing::setSize(const std::string& updatedSize) {
    size = updatedSize;
}

std::string Clothing::getCategory() const {
    return "Clothing";
}

std::string Clothing::getExtraAttribute() const {
    return size;
}

void Clothing::displayDetails() const {
    std::cout << *this << '\n';
}

void Clothing::print(std::ostream& out) const {
    Product::print(out);
    out << " | Size: " << size;
}
